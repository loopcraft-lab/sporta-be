import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Quick fix: Adding wards for TP.HCM...\n')

  // Find TP.HCM
  const hcm = await prisma.province.findFirst({
    where: {
      OR: [
        { name: { contains: 'Hồ Chí Minh' } },
        { name: { contains: 'HCM' } },
        { code: '79' }
      ],
      deletedAt: null
    }
  })

  if (!hcm) {
    console.log('❌ Cannot find TP.HCM province')
    console.log('Available provinces:')
    const provinces = await prisma.province.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true, code: true }
    })
    provinces.forEach((p) => console.log(`  - ${p.name} (id: ${p.id}, code: ${p.code})`))
    return
  }

  console.log(`✅ Found province: ${hcm.name} (id: ${hcm.id}, code: ${hcm.code})\n`)

  // HCM districts from official data
  const hcmDistricts = [
    { name: 'Quận 1', code: '760' },
    { name: 'Quận 2', code: '761' },
    { name: 'Quận 3', code: '762' },
    { name: 'Quận 4', code: '763' },
    { name: 'Quận 5', code: '764' },
    { name: 'Quận 6', code: '765' },
    { name: 'Quận 7', code: '766' },
    { name: 'Quận 8', code: '767' },
    { name: 'Quận 9', code: '768' },
    { name: 'Quận 10', code: '769' },
    { name: 'Quận 11', code: '770' },
    { name: 'Quận 12', code: '771' },
    { name: 'Quận Thủ Đức', code: '772' },
    { name: 'Quận Gò Vấp', code: '773' },
    { name: 'Quận Bình Thạnh', code: '774' },
    { name: 'Quận Tân Bình', code: '775' },
    { name: 'Quận Tân Phú', code: '776' },
    { name: 'Quận Phú Nhuận', code: '777' },
    { name: 'Quận Bình Tân', code: '778' },
    { name: 'Huyện Củ Chi', code: '783' },
    { name: 'Huyện Hóc Môn', code: '784' },
    { name: 'Huyện Bình Chánh', code: '785' },
    { name: 'Huyện Nhà Bè', code: '786' },
    { name: 'Huyện Cần Giờ', code: '787' }
  ]

  let created = 0
  let skipped = 0

  for (const district of hcmDistricts) {
    const existing = await prisma.ward.findFirst({
      where: { code: district.code, deletedAt: null }
    })

    if (!existing) {
      await prisma.ward.create({
        data: {
          name: district.name,
          code: district.code,
          provinceId: hcm.id
        }
      })
      created++
      console.log(`  ✅ Created: ${district.name}`)
    } else {
      skipped++
      console.log(`  ⏭️  Skipped: ${district.name} (already exists)`)
    }
  }

  console.log(`\n${'='.repeat(60)}`)
  console.log(`✅ Done! Created ${created} wards, skipped ${skipped}`)
  console.log(`${'='.repeat(60)}`)

  // Verify
  const totalWards = await prisma.ward.count({
    where: { provinceId: hcm.id, deletedAt: null }
  })

  console.log(`\n📍 Total wards for ${hcm.name}: ${totalWards}`)
  console.log(`\nℹ️  You can now use provinceId=${hcm.id} in your filters!\n`)
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
