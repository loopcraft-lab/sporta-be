import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Updating venues to Huyện Hóc Môn...\n')

  const hcm = await prisma.province.findFirst({
    where: {
      OR: [{ name: { contains: 'Hồ Chí Minh' } }, { code: '79' }]
    }
  })

  if (!hcm) {
    console.log('❌ Cannot find HCM')
    return
  }

  // Find Huyện Hóc Môn (id: 21)
  const hocMon = await prisma.ward.findFirst({
    where: {
      provinceId: hcm.id,
      name: { contains: 'Hóc Môn' }
    }
  })

  if (!hocMon) {
    console.log('❌ Cannot find Huyện Hóc Môn')
    return
  }

  console.log(`✅ Found: ${hocMon.name} (id: ${hocMon.id})`)
  console.log(`Updating all venues to wardId=${hocMon.id}...\n`)

  const result = await prisma.venueOwner.updateMany({
    where: {
      provinceId: hcm.id,
      deletedAt: null
    },
    data: {
      wardId: hocMon.id
    }
  })

  console.log(`✅ Updated ${result.count} venues`)
  console.log(`\n💡 Now filter by:`)
  console.log(`   provinceId=${hcm.id}`)
  console.log(`   wardId=${hocMon.id} (${hocMon.name})`)
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
