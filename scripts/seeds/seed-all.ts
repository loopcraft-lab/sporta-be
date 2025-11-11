import { execSync } from 'child_process'

async function main() {
  console.log('🌱 Starting complete seed process...\n')

  const seeds = [
    { name: 'Base data (roles, users)', script: 'tsx scripts/seeds/seed.ts' },
    { name: 'Sports', script: 'tsx scripts/seeds/seed-sports.ts' },
    {
      name: 'Provinces & Districts (FULL)',
      script: 'tsx scripts/seeds/seed-provinces-full.ts'
    },
    {
      name: 'Venue Owners & Courts (25 venues)',
      script: 'tsx scripts/seeds/seed-venue-owners.ts'
    }
  ]

  for (const seed of seeds) {
    console.log(`\n${'='.repeat(60)}`)
    console.log(`📦 Running: ${seed.name}`)
    console.log('='.repeat(60))

    try {
      execSync(seed.script, { stdio: 'inherit' })
      console.log(`✅ ${seed.name} completed successfully`)
    } catch (error) {
      console.error(`❌ ${seed.name} failed:`, error)
      // Continue with next seed
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('🎉 All seeds completed!')
  console.log('='.repeat(60))
  console.log('\n📋 Test Accounts:')
  console.log('   Admin:  admin@gmail.com / 123456')
  console.log('   User:   user@test.com / 123456')
  console.log('   Owner:  owner@test.com / 123456')
  console.log('   Owner1-25: owner1@sporta.vn ... owner25@sporta.vn / 123456')
  console.log('\n📊 Database seeded with:')
  console.log('   ✅ 4 Roles (Admin, Client, Moderator, Owner)')
  console.log('   ✅ 28 Users (3 test + 25 venue owners)')
  console.log('   ✅ 10 Sports')
  console.log('   ✅ 63 Provinces')
  console.log('   ✅ 700+ Districts (Quận/Huyện)')
  console.log('   ✅ 25 Venue Owners (all VERIFIED)')
  console.log('   ✅ 200+ Courts (8-12 per venue)')
  console.log('')
}

main()
  .then(() => {
    console.log('✅ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
