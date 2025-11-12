import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Checking venue locations...\n')

  // Get all venues - can't include province/ward as there's no relation
  const venues = await prisma.venueOwner.findMany({
    where: { deletedAt: null },
    take: 10
  })

  console.log(`📊 Found ${venues.length} venues:\n`)

  for (const v of venues) {
    // Manually fetch province and ward
    const province = v.provinceId
      ? await prisma.province.findUnique({
          where: { id: v.provinceId }
        })
      : null

    const ward = v.wardId
      ? await prisma.ward.findUnique({
          where: { id: v.wardId }
        })
      : null

    console.log(`${v.id}. ${v.name}`)
    console.log(`   Province: ${province?.name || 'NULL'} (id: ${v.provinceId})`)
    console.log(`   Ward: ${ward?.name || 'NULL'} (id: ${v.wardId})`)
    console.log('')
  }

  // Get counts by location
  const locationCounts = await prisma.$queryRaw<
    Array<{
      provinceId: number | null
      wardId: number | null
      count: bigint
    }>
  >`
    SELECT "provinceId", "wardId", COUNT(*) as count
    FROM "VenueOwner"
    WHERE "deletedAt" IS NULL
    GROUP BY "provinceId", "wardId"
  `

  console.log('\n📍 Venues by location:')
  for (const loc of locationCounts) {
    const province = loc.provinceId
      ? await prisma.province.findUnique({
          where: { id: loc.provinceId }
        })
      : null
    const ward = loc.wardId
      ? await prisma.ward.findUnique({
          where: { id: loc.wardId }
        })
      : null
    console.log(
      `   ${province?.name || 'NULL'} - ${ward?.name || 'NULL'}: ${loc.count} venues`
    )
  }

  // List all wards in HCM
  const hcm = await prisma.province.findFirst({
    where: {
      OR: [{ name: { contains: 'Hồ Chí Minh' } }, { code: '79' }]
    }
  })

  if (hcm) {
    console.log(`\n🏙️  All wards in ${hcm.name} (id: ${hcm.id}):`)
    const wards = await prisma.ward.findMany({
      where: { provinceId: hcm.id, deletedAt: null },
      orderBy: { id: 'asc' }
    })

    wards.forEach((w) => {
      console.log(`   id: ${w.id} - ${w.name}`)
    })

    console.log(`\n💡 To filter venues in ${hcm.name}, use:`)
    console.log(`   provinceId=${hcm.id}`)
    console.log(`   wardId=<one of the IDs above>`)
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
