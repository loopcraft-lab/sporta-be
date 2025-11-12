import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Updating VenueOwners with provinceId and wardId...\n')

  // Find HCM province
  const hcm = await prisma.province.findFirst({
    where: {
      OR: [{ name: { contains: 'Hồ Chí Minh' } }, { code: '79' }],
      deletedAt: null
    }
  })

  if (!hcm) {
    console.log('❌ Cannot find TP.HCM province')
    return
  }

  console.log(`✅ Found province: ${hcm.name} (id: ${hcm.id})`)

  // Find a ward in HCM
  const ward = await prisma.ward.findFirst({
    where: {
      provinceId: hcm.id,
      deletedAt: null
    }
  })

  if (!ward) {
    console.log('❌ No wards found for HCM. Please run fix-seed-hcm-wards.ts first!')
    return
  }

  console.log(`✅ Found ward: ${ward.name} (id: ${ward.id})\n`)

  // Check venues without provinceId
  const venuesWithoutLocation = await prisma.venueOwner.count({
    where: {
      OR: [{ provinceId: null }, { wardId: null }],
      deletedAt: null
    }
  })

  console.log(`📊 Venues without location: ${venuesWithoutLocation}`)

  if (venuesWithoutLocation === 0) {
    console.log('✅ All venues already have location data!')
    return
  }

  // Update all venues without provinceId/wardId
  const result = await prisma.venueOwner.updateMany({
    where: {
      OR: [{ provinceId: null }, { wardId: null }],
      deletedAt: null
    },
    data: {
      provinceId: hcm.id,
      wardId: ward.id
    }
  })

  console.log(`\n✅ Updated ${result.count} venues with:`)
  console.log(`   - provinceId: ${hcm.id} (${hcm.name})`)
  console.log(`   - wardId: ${ward.id} (${ward.name})`)

  // Verify
  const venuesWithLocation = await prisma.venueOwner.count({
    where: {
      provinceId: hcm.id,
      wardId: ward.id,
      deletedAt: null
    }
  })

  console.log(`\n📍 Total venues in ${hcm.name} - ${ward.name}: ${venuesWithLocation}`)
  console.log('\n🎉 Done! You can now test filters at http://localhost:3000/venues\n')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
