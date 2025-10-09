import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

// Vietnam Provinces Public API
const PROVINCES_API = 'https://provinces.open-api.vn/api'

async function fetchProvinces() {
  const response = await fetch(`${PROVINCES_API}/p/`)
  return response.json()
}

async function fetchProvinceWithDistricts(provinceCode: number) {
  const response = await fetch(`${PROVINCES_API}/p/${provinceCode}?depth=2`)
  return response.json()
}

async function main() {
  console.log('🌱 Starting full database seed...\n')

  // Hash password
  const passwordHash = await bcrypt.hash('123456', 10)

  // 1. Create Roles
  console.log('📝 Creating roles...')

  let adminRole = await prisma.role.findFirst({ where: { name: 'ADMIN' } })
  if (!adminRole) {
    adminRole = await prisma.role.create({
      data: {
        name: 'ADMIN',
        description: 'Administrator with full access'
      }
    })
  }

  let ownerRole = await prisma.role.findFirst({ where: { name: 'OWNER' } })
  if (!ownerRole) {
    ownerRole = await prisma.role.create({
      data: {
        name: 'OWNER',
        description: 'Venue owner who can manage venues and courts'
      }
    })
  }

  let clientRole = await prisma.role.findFirst({ where: { name: 'CLIENT' } })
  if (!clientRole) {
    clientRole = await prisma.role.create({
      data: {
        name: 'CLIENT',
        description: 'Regular user who can book courts'
      }
    })
  }

  console.log('✅ Roles created\n')

  // 2. Create Users
  console.log('👥 Creating users...')

  let adminUser = await prisma.user.findFirst({ where: { email: 'admin@gmail.com' } })
  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        email: 'admin@gmail.com',
        name: 'Admin',
        password: passwordHash,
        phoneNumber: '0123456789',
        roleId: adminRole.id
      }
    })
  }

  let owner1 = await prisma.user.findFirst({ where: { email: 'owner1@test.com' } })
  if (!owner1) {
    owner1 = await prisma.user.create({
      data: {
        email: 'owner1@test.com',
        name: 'Nguyễn Văn A',
        password: passwordHash,
        phoneNumber: '0901234567',
        roleId: ownerRole.id
      }
    })
  }

  let owner2 = await prisma.user.findFirst({ where: { email: 'owner2@test.com' } })
  if (!owner2) {
    owner2 = await prisma.user.create({
      data: {
        email: 'owner2@test.com',
        name: 'Trần Thị B',
        password: passwordHash,
        phoneNumber: '0912345678',
        roleId: ownerRole.id
      }
    })
  }

  let client1 = await prisma.user.findFirst({ where: { email: 'user1@test.com' } })
  if (!client1) {
    client1 = await prisma.user.create({
      data: {
        email: 'user1@test.com',
        name: 'Lê Văn C',
        password: passwordHash,
        phoneNumber: '0923456789',
        roleId: clientRole.id
      }
    })
  }

  console.log('✅ Users created\n')

  // 3. Create Sports
  console.log('⚽ Creating sports...')
  const sportNames = [
    { name: 'Bóng đá', description: 'Football/Soccer' },
    { name: 'Cầu lông', description: 'Badminton' },
    { name: 'Bóng rổ', description: 'Basketball' },
    { name: 'Bóng chuyền', description: 'Volleyball' },
    { name: 'Tennis', description: 'Tennis' },
    { name: 'Bóng bàn', description: 'Table Tennis' },
    { name: 'Pickleball', description: 'Pickleball' },
    { name: 'Futsal', description: 'Indoor Football' }
  ]

  const sports: any[] = []
  for (const sport of sportNames) {
    let existingSport = await prisma.sport.findFirst({ where: { name: sport.name } })
    if (!existingSport) {
      existingSport = await prisma.sport.create({
        data: { ...sport, status: 'ACTIVE' }
      })
    }
    sports.push(existingSport)
  }

  console.log('✅ Sports created\n')

  // 4. Fetch and Create Provinces + Districts from Public API
  console.log('📍 Fetching provinces from public API...')

  try {
    const provincesData = await fetchProvinces()
    console.log(`Found ${provincesData.length} provinces\n`)

    let processedProvinces = 0
    let processedDistricts = 0

    for (const provData of provincesData) {
      // Check if province already exists
      let province = await prisma.province.findFirst({
        where: { code: String(provData.code) }
      })

      if (!province) {
        province = await prisma.province.create({
          data: {
            name: provData.name,
            code: String(provData.code)
          }
        })
        processedProvinces++
      }

      // Fetch districts for this province
      try {
        const provinceDetail = await fetchProvinceWithDistricts(provData.code)

        if (provinceDetail.districts && provinceDetail.districts.length > 0) {
          for (const district of provinceDetail.districts) {
            const wardCode = `${provData.code}_${district.code}`

            const existingWard = await prisma.ward.findFirst({
              where: { code: wardCode }
            })

            if (!existingWard) {
              await prisma.ward.create({
                data: {
                  name: district.name,
                  code: wardCode,
                  provinceId: province.id
                }
              })
              processedDistricts++
            }
          }
        }

        // Log progress every 10 provinces
        if (processedProvinces % 10 === 0) {
          console.log(
            `   Processed ${processedProvinces} provinces, ${processedDistricts} districts...`
          )
        }

        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100))
      } catch (error) {
        console.log(`   ⚠️  Warning: Could not fetch districts for ${provData.name}`)
      }
    }

    console.log(
      `✅ Created ${processedProvinces} provinces and ${processedDistricts} districts\n`
    )
  } catch (error) {
    console.error('❌ Failed to fetch from public API:', error)
    console.log('Falling back to manual province creation...\n')

    // Fallback: Create major provinces manually
    const fallbackProvinces = [
      { name: 'Hồ Chí Minh', code: '79' },
      { name: 'Hà Nội', code: '01' },
      { name: 'Đà Nẵng', code: '48' },
      { name: 'Cần Thơ', code: '92' },
      { name: 'Hải Phòng', code: '31' }
    ]

    for (const prov of fallbackProvinces) {
      const existing = await prisma.province.findFirst({ where: { code: prov.code } })
      if (!existing) {
        await prisma.province.create({ data: prov })
      }
    }
    console.log('✅ Created fallback provinces\n')
  }

  // 5. Create Amenities
  console.log('🛠️  Creating amenities...')
  const amenities = [
    { name: 'Bãi đỗ xe', description: 'Parking lot' },
    { name: 'Phòng thay đồ', description: 'Changing room' },
    { name: 'Nhà vệ sinh', description: 'Restroom' },
    { name: 'Wifi miễn phí', description: 'Free WiFi' },
    { name: 'Căn tin', description: 'Canteen' }
  ]

  for (const amenity of amenities) {
    const existing = await prisma.amenity.findFirst({ where: { name: amenity.name } })
    if (!existing) {
      await prisma.amenity.create({ data: { ...amenity, isActive: true } })
    }
  }

  console.log('✅ Amenities created\n')

  // 6. Create Venue Owners (using existing location data)
  console.log('🏟️  Creating venue owners...')

  const hcm = await prisma.province.findFirst({ where: { code: '79' } })
  const hocMonWard = await prisma.ward.findFirst({
    where: {
      provinceId: hcm?.id,
      name: { contains: 'Hóc Môn' }
    }
  })
  const q1Ward = await prisma.ward.findFirst({
    where: {
      provinceId: hcm?.id,
      name: { contains: 'Quận 1' }
    }
  })

  if (hcm && hocMonWard) {
    let venue1 = await prisma.venueOwner.findFirst({ where: { userId: owner1.id } })
    if (!venue1) {
      venue1 = await prisma.venueOwner.create({
        data: {
          userId: owner1.id,
          name: 'Sân thể thao Quận Hóc Môn',
          license: 'GP-2024-001',
          bankName: 'Vietcombank',
          bankNumber: '0113114115',
          address: '1/19 Hung Lan Ba Diem Hoc Mon TPHCM',
          provinceId: hcm.id,
          wardId: hocMonWard.id,
          images: [],
          verified: 'VERIFIED'
        }
      })

      // Create courts for venue1
      const badmintonSport = sports.find((s: any) => s.name === 'Cầu lông')
      const footballSport = sports.find((s: any) => s.name === 'Bóng đá')

      if (badmintonSport && footballSport) {
        await prisma.court.createMany({
          data: [
            {
              venueOwnerId: venue1.id,
              sportId: badmintonSport.id,
              name: 'Sân cầu lông số 1',
              description: 'Sân cầu lông tiêu chuẩn, sàn gỗ',
              capacity: 4,
              surface: 'Sàn gỗ',
              indoor: true,
              status: 'ACTIVE'
            },
            {
              venueOwnerId: venue1.id,
              sportId: badmintonSport.id,
              name: 'Sân cầu lông số 2',
              description: 'Sân cầu lông tiêu chuẩn, sàn gỗ',
              capacity: 4,
              surface: 'Sàn gỗ',
              indoor: true,
              status: 'ACTIVE'
            },
            {
              venueOwnerId: venue1.id,
              sportId: footballSport.id,
              name: 'Sân bóng đá mini',
              description: 'Sân bóng đá 5vs5, cỏ nhân tạo',
              capacity: 10,
              surface: 'Cỏ nhân tạo',
              indoor: false,
              status: 'ACTIVE'
            }
          ]
        })
      }
    }
  }

  if (hcm && q1Ward) {
    const venue2 = await prisma.venueOwner.findFirst({ where: { userId: owner2.id } })
    if (!venue2) {
      await prisma.venueOwner.create({
        data: {
          userId: owner2.id,
          name: 'Trung tâm thể thao Quận 1',
          license: 'GP-2024-002',
          bankName: 'Techcombank',
          bankNumber: '9876543210',
          address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
          provinceId: hcm.id,
          wardId: q1Ward.id,
          images: [],
          verified: 'PENDING'
        }
      })
    }
  }

  console.log('✅ Venue owners created\n')

  // Summary
  const counts = {
    roles: await prisma.role.count(),
    users: await prisma.user.count(),
    sports: await prisma.sport.count(),
    provinces: await prisma.province.count(),
    wards: await prisma.ward.count(),
    amenities: await prisma.amenity.count(),
    venueOwners: await prisma.venueOwner.count(),
    courts: await prisma.court.count()
  }

  console.log('============================================')
  console.log('✅ Full database seed completed! Summary:')
  console.log('============================================')
  console.log(`Roles:        ${counts.roles}`)
  console.log(`Users:        ${counts.users}`)
  console.log(`Sports:       ${counts.sports}`)
  console.log(`Provinces:    ${counts.provinces}`)
  console.log(`Districts:    ${counts.wards}`)
  console.log(`Amenities:    ${counts.amenities}`)
  console.log(`VenueOwners:  ${counts.venueOwners}`)
  console.log(`Courts:       ${counts.courts}`)
  console.log('============================================')
  console.log('Test Accounts (password: 123456):')
  console.log('============================================')
  console.log('Admin:  admin@gmail.com')
  console.log('Owner1: owner1@test.com')
  console.log('Owner2: owner2@test.com')
  console.log('Client: user1@test.com')
  console.log('============================================\n')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
