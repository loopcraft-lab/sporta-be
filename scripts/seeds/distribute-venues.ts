import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Distributing venues across different wards in HCM...\n')

  // Find HCM
  const hcm = await prisma.province.findFirst({
    where: {
      OR: [{ name: { contains: 'Hồ Chí Minh' } }, { code: '79' }]
    }
  })

  if (!hcm) {
    console.log('❌ Cannot find HCM')
    return
  }

  console.log(`✅ Found: ${hcm.name} (id: ${hcm.id})\n`)

  // Get all wards in HCM
  const wards = await prisma.ward.findMany({
    where: {
      provinceId: hcm.id,
      deletedAt: null
    },
    orderBy: { id: 'asc' }
  })

  console.log(`📍 Found ${wards.length} wards in HCM\n`)

  // Get all venues
  const venues = await prisma.venueOwner.findMany({
    where: {
      provinceId: hcm.id,
      deletedAt: null
    },
    orderBy: { id: 'asc' }
  })

  console.log(`🏟️  Found ${venues.length} venues to distribute\n`)

  if (venues.length === 0) {
    console.log('❌ No venues to update')
    return
  }

  // Distribute venues evenly across wards
  let updated = 0
  for (let i = 0; i < venues.length; i++) {
    const venue = venues[i]
    const ward = wards[i % wards.length] // Round-robin distribution

    await prisma.venueOwner.update({
      where: { id: venue.id },
      data: { wardId: ward.id }
    })

    console.log(`✅ ${venue.name} → ${ward.name}`)
    updated++
  }

  console.log(`\n${'='.repeat(60)}`)
  console.log(`✅ Updated ${updated} venues`)
  console.log(`${'='.repeat(60)}`)

  // Show distribution summary
  console.log(`\n📊 Distribution summary:`)

  const distribution = await prisma.$queryRaw<
    Array<{
      wardId: number
      count: bigint
    }>
  >`
    SELECT "wardId", COUNT(*) as count
    FROM "VenueOwner"
    WHERE "provinceId" = ${hcm.id} AND "deletedAt" IS NULL
    GROUP BY "wardId"
    ORDER BY "wardId"
  `

  for (const dist of distribution) {
    const ward = await prisma.ward.findUnique({ where: { id: dist.wardId } })
    console.log(`   ${ward?.name}: ${dist.count} venues`)
  }

  console.log(`\n🎉 Done! Now you can filter by any ward and see venues!\n`)
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
