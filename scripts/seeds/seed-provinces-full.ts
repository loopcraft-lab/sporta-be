import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// API công khai: https://provinces.open-api.vn/api/
const API_BASE = 'https://provinces.open-api.vn/api'

interface ProvinceAPI {
  code: number
  name: string
  name_en: string
  full_name: string
  full_name_en: string
  code_name: string
  districts?: DistrictAPI[]
}

interface DistrictAPI {
  code: number
  name: string
  name_en: string
  full_name: string
  full_name_en: string
  code_name: string
  province_code: number
  wards?: WardAPI[]
}

interface WardAPI {
  code: number
  name: string
  name_en: string
  full_name: string
  full_name_en: string
  code_name: string
  district_code: number
}

async function main() {
  console.log('🏙️  Seeding FULL Vietnam provinces and districts from API...\n')

  try {
    // Fetch all provinces with districts (depth=2)
    console.log('📥 Fetching data from provinces.open-api.vn...')
    const response = await fetch(`${API_BASE}/p/?depth=2`)

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`)
    }

    const provinces: ProvinceAPI[] = await response.json()

    console.log(`✅ Fetched ${provinces.length} provinces from API\n`)

    let createdProvinces = 0
    let skippedProvinces = 0
    let createdWards = 0
    let skippedWards = 0

    for (const provinceData of provinces) {
      // Check if province exists
      const existingProvince = await prisma.province.findFirst({
        where: { code: String(provinceData.code), deletedAt: null }
      })

      let province
      if (existingProvince) {
        console.log(`⏭️  Province exists: ${provinceData.name}`)
        province = existingProvince
        skippedProvinces++
      } else {
        // Create province
        province = await prisma.province.create({
          data: {
            name: provinceData.name,
            code: String(provinceData.code)
          }
        })
        createdProvinces++
        console.log(`✅ Created province: ${province.name}`)
      }

      // Create districts as wards
      if (provinceData.districts && provinceData.districts.length > 0) {
        let provinceWardCount = 0
        let provinceSkippedCount = 0

        for (const district of provinceData.districts) {
          const wardCode = String(district.code)

          const existingWard = await prisma.ward.findFirst({
            where: { code: wardCode, deletedAt: null }
          })

          if (!existingWard) {
            await prisma.ward.create({
              data: {
                name: district.name,
                code: wardCode,
                provinceId: province.id
              }
            })
            createdWards++
            provinceWardCount++
          } else {
            provinceSkippedCount++
            skippedWards++
          }
        }

        if (provinceWardCount > 0) {
          console.log(`   ↳ Created ${provinceWardCount} districts`)
        }
        if (provinceSkippedCount > 0) {
          console.log(`   ↳ Skipped ${provinceSkippedCount} existing districts`)
        }
      }
    }

    console.log('\n' + '='.repeat(60))
    console.log('🎉 FULL Vietnam location data seeding completed!')
    console.log('='.repeat(60))
    console.log(`\n📊 Summary:`)
    console.log(`   Provinces: ${createdProvinces} created, ${skippedProvinces} skipped`)
    console.log(`   Districts: ${createdWards} created, ${skippedWards} skipped`)

    // Show final counts
    const totalProvinces = await prisma.province.count({ where: { deletedAt: null } })
    const totalWards = await prisma.ward.count({ where: { deletedAt: null } })

    console.log(`\n📍 Database totals:`)
    console.log(`   Total provinces: ${totalProvinces}`)
    console.log(`   Total districts/wards: ${totalWards}`)
    console.log('')
  } catch (error) {
    console.error('❌ Error fetching data from API:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('❌ Fatal error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
