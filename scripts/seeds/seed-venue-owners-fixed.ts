import { HashingService } from '@/shared/services/hashing.service'
import { PrismaService } from '@/shared/services/prisma.service'
import { CourtStatus, VenueOwnerVerificationType } from '@prisma/client'

const prisma = new PrismaService()
const hashingService = new HashingService()

// Template names cho venue owners
const VENUE_TEMPLATES = [
  {
    prefix: 'Sân thể thao',
    suffix: [
      'Minh Anh',
      'Hoàng Gia',
      'Thành Công',
      'Phát Đạt',
      'Vũ Tuấn',
      'Hải Đăng',
      'Anh Tuấn',
      'Đức Trí'
    ]
  },
  {
    prefix: 'Trung tâm thể thao',
    suffix: ['Rạng Đông', 'Bình Minh', 'Thắng Lợi', 'Hòa Bình', 'Quang Trung', 'Lê Lợi']
  },
  {
    prefix: 'CLB Thể thao',
    suffix: ['Sao Vàng', 'Ánh Dương', 'Thiên Phúc', 'Hưng Thịnh', 'Phương Nam']
  },
  {
    prefix: 'Sân vận động',
    suffix: ['Thanh Niên', 'Thiên Trường', 'Mỹ Đình', 'Gò Đậu', 'Thống Nhất']
  }
]

// Court names theo sport
const COURT_NAMES_BY_SPORT: Record<string, string[]> = {
  'Cầu lông': [
    'Sân A',
    'Sân B',
    'Sân C',
    'Sân 1',
    'Sân 2',
    'Sân VIP',
    'Sân Standard',
    'Sân Premium'
  ],
  'Bóng đá': [
    'Sân 5 người A',
    'Sân 5 người B',
    'Sân 7 người',
    'Sân 11 người',
    'Sân mini'
  ],
  Tennis: ['Court 1', 'Court 2', 'Court 3', 'VIP Court', 'Center Court'],
  'Bóng rổ': ['Sân A', 'Sân B', 'Sân ngoài trời', 'Sân trong nhà', 'Sân thi đấu'],
  Pickleball: ['Court 1', 'Court 2', 'Court 3', 'Court 4', 'Court A', 'Court B'],
  'Bóng chuyền': ['Sân A', 'Sân B', 'Sân thi đấu', 'Sân luyện tập'],
  'Bóng bàn': ['Bàn 1', 'Bàn 2', 'Bàn 3', 'Bàn VIP', 'Bàn thi đấu'],
  'Bơi lội': ['Bể chính', 'Bể phụ', 'Bể VIP', 'Bể tập luyện'],
  'Gym / Fitness': [
    'Phòng Cardio',
    'Phòng Weight',
    'Phòng tập lớn',
    'Studio nhỏ',
    'Phòng Group Exercise'
  ],
  Yoga: ['Studio A', 'Studio B', 'Phòng Hot Yoga', 'Phòng VIP', 'Phòng tập nhóm']
}

// Price ranges theo sport (VNĐ/giờ)
const PRICE_RANGES: Record<string, { min: number; max: number }> = {
  'Cầu lông': { min: 50000, max: 150000 },
  'Bóng đá': { min: 200000, max: 800000 },
  Tennis: { min: 100000, max: 300000 },
  'Bóng rổ': { min: 150000, max: 400000 },
  Pickleball: { min: 80000, max: 200000 },
  'Bóng chuyền': { min: 100000, max: 250000 },
  'Bóng bàn': { min: 30000, max: 80000 },
  'Bơi lội': { min: 50000, max: 150000 },
  'Gym / Fitness': { min: 80000, max: 200000 },
  Yoga: { min: 100000, max: 250000 }
}

// Helper functions
function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function getRandomPrice(sport: string): number {
  const range = PRICE_RANGES[sport] || { min: 50000, max: 150000 }
  const price = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min
  return Math.round(price / 10000) * 10000
}

function generatePhoneNumber(): string {
  const prefixes = [
    '090',
    '091',
    '092',
    '093',
    '094',
    '096',
    '097',
    '098',
    '099',
    '086',
    '088'
  ]
  const prefix = getRandomElement(prefixes)
  const numbers = Math.floor(Math.random() * 10000000)
    .toString()
    .padStart(7, '0')
  return prefix + numbers
}

function generateBusinessLicense(): string {
  return `${Math.floor(Math.random() * 10000000000)}`
}

function generateVenueName(): string {
  const template = getRandomElement(VENUE_TEMPLATES)
  const suffix = getRandomElement(template.suffix)
  return `${template.prefix} ${suffix}`
}

function getCourtName(sport: string, index: number): string {
  const names = COURT_NAMES_BY_SPORT[sport] || ['Sân A', 'Sân B', 'Sân C']
  return names[index % names.length]
}

async function main() {
  console.log('🏟️  Starting FIXED venue owners seed...\n')

  // Get roles
  const ownerRole = await prisma.role.findFirstOrThrow({
    where: { name: 'OWNER' }
  })
  const adminUser = await prisma.user.findFirstOrThrow({
    where: { email: 'admin@gmail.com' }
  })

  // Get all sports
  const sports = await prisma.sport.findMany({
    where: { deletedAt: null, status: 'ACTIVE' }
  })

  // ✅ FETCH REAL PROVINCES & WARDS FROM DATABASE
  console.log('📍 Fetching provinces and wards from database...')
  const provinces = await prisma.province.findMany({
    where: { deletedAt: null },
    include: {
      Ward: {
        where: { deletedAt: null }
      }
    }
  })

  // Filter provinces that have wards
  const provincesWithWards = provinces.filter((p) => p.Ward.length > 0)

  console.log(
    `✅ Found ${provinces.length} provinces, ${provincesWithWards.length} have wards`
  )
  console.log(`📊 Found ${sports.length} sports`)
  console.log('🌍 Creating 50 venue owners across Vietnam...\n')

  let totalCourts = 0
  const hashedPassword = await hashingService.hash('123456')

  // Create 50 venue owners
  for (let i = 0; i < 50; i++) {
    // ✅ Pick random province that has wards
    const province = getRandomElement(provincesWithWards)

    // ✅ Pick random ward in that province
    const ward = getRandomElement(province.Ward)

    const venueName = generateVenueName()
    const email = `owner${i + 1}@sporta.vn`

    console.log(`\n[${i + 1}/50] Creating: ${venueName}`)
    console.log(`   Location: ${ward.name}, ${province.name}`)
    console.log(`   provinceId: ${province.id}, wardId: ${ward.id}`)
    console.log(`   Email: ${email}`)

    // Check if user exists
    let user = await prisma.user.findFirst({
      where: { email }
    })

    // Create user if not exists
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: venueName,
          phoneNumber: generatePhoneNumber(),
          roleId: ownerRole.id
        }
      })
      console.log(`   ✅ Created user: ${email}`)
    } else {
      console.log(`   ⏭️  User exists: ${email}`)
    }

    // Check if venue owner exists
    let venueOwner = await prisma.venueOwner.findFirst({
      where: { userId: user.id }
    })

    // ✅ Create venue owner WITH provinceId and wardId!
    if (!venueOwner) {
      venueOwner = await prisma.venueOwner.create({
        data: {
          userId: user.id,
          name: venueName,
          license: generateBusinessLicense(),
          bankName: getRandomElement([
            'Vietcombank',
            'Techcombank',
            'BIDV',
            'VietinBank',
            'ACB',
            'MBBank'
          ]),
          bankNumber: Math.floor(Math.random() * 100000000000).toString(),
          // ✅ Address matches ward and province!
          address: `${Math.floor(Math.random() * 500) + 1} đường ${getRandomElement(['Nguyễn Trãi', 'Lê Lợi', 'Trần Hưng Đạo', 'Hai Bà Trưng', 'Lý Thái Tổ', 'Võ Văn Tần'])}, ${ward.name}, ${province.name}`,
          // ✅ SET CORRECT IDs!
          provinceId: province.id,
          wardId: ward.id,
          verified: VenueOwnerVerificationType.VERIFIED,
          approvedById: adminUser.id,
          createdById: adminUser.id
        }
      })
      console.log(`   ✅ Created venue owner with CORRECT provinceId/wardId`)
    } else {
      console.log(`   ⏭️  Venue owner exists`)
      // Update existing venue with correct location
      await prisma.venueOwner.update({
        where: { id: venueOwner.id },
        data: {
          provinceId: province.id,
          wardId: ward.id,
          address: `${Math.floor(Math.random() * 500) + 1} đường ${getRandomElement(['Nguyễn Trãi', 'Lê Lợi', 'Trần Hưng Đạo', 'Hai Bà Trưng', 'Lý Thái Tổ', 'Võ Văn Tần'])}, ${ward.name}, ${province.name}`
        }
      })
      console.log(`   ✅ Updated existing venue with CORRECT provinceId/wardId`)
    }

    // Randomly select 2-3 sports for this venue
    const numSports = Math.floor(Math.random() * 2) + 2
    const selectedSports = sports.sort(() => 0.5 - Math.random()).slice(0, numSports)

    console.log(`   🎾 Creating courts for ${numSports} sports:`)

    let venueCourtCount = 0

    // Create courts for each selected sport
    for (const sport of selectedSports) {
      const numCourts = Math.floor(Math.random() * 4) + 2

      for (let j = 0; j < numCourts; j++) {
        const courtName = getCourtName(sport.name, j)

        const existingCourt = await prisma.court.findFirst({
          where: {
            venueOwnerId: venueOwner.id,
            sportId: sport.id,
            name: courtName,
            deletedAt: null
          }
        })

        if (existingCourt) {
          console.log(`      ⏭️  Court exists: ${courtName} (${sport.name})`)
          continue
        }

        const isIndoor = Math.random() > 0.3

        await prisma.court.create({
          data: {
            venueOwnerId: venueOwner.id,
            sportId: sport.id,
            name: courtName,
            description: `${courtName} - ${sport.name} chất lượng cao, ${isIndoor ? 'trong nhà' : 'ngoài trời'}`,
            capacity: Math.floor(Math.random() * 20) + 10,
            surface: getRandomElement([
              'Gỗ',
              'Nhựa',
              'Cỏ nhân tạo',
              'Cỏ tự nhiên',
              'Bê tông',
              'Sàn chuyên dụng'
            ]),
            indoor: isIndoor,
            status: CourtStatus.ACTIVE,
            pricePerHour: getRandomPrice(sport.name),
            openingTime: getRandomElement(['06:00', '07:00', '08:00']),
            closingTime: getRandomElement(['21:00', '22:00', '23:00']),
            createdById: adminUser.id
          }
        })

        venueCourtCount++
        totalCourts++
      }

      console.log(`      ✅ ${numCourts} courts for ${sport.name}`)
    }

    console.log(`   📊 Total courts for this venue: ${venueCourtCount}`)
  }

  console.log('\n' + '='.repeat(60))
  console.log('🎉 FIXED Venue owners seed completed!')
  console.log('='.repeat(60))
  console.log(`\n📊 Summary:`)
  console.log(`   ✅ 50 venue owners created (all VERIFIED)`)
  console.log(`   ✅ ${totalCourts} courts created`)
  console.log(
    `   ✅ Distributed across ${provincesWithWards.length} provinces with wards`
  )
  console.log(`   ✅ ALL venues have CORRECT provinceId & wardId matching address!`)
  console.log(`\n🔑 Test Accounts (all password: 123456):`)
  console.log(`   owner1@sporta.vn, owner2@sporta.vn, ... owner50@sporta.vn`)
  console.log(`\n💡 All venue owners are already VERIFIED by admin!`)
  console.log(`   Filters should work perfectly now!\n`)
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
