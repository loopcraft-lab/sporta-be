import { PrismaClient, SportStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🏃 Seeding sports...')

  const sports = [
    {
      name: 'Bóng đá',
      description: 'Môn thể thao vua',
      status: SportStatus.ACTIVE
    },
    {
      name: 'Cầu lông',
      description: 'Cầu lông - Badminton',
      status: SportStatus.ACTIVE
    },
    {
      name: 'Bóng rổ',
      description: 'Basketball',
      status: SportStatus.ACTIVE
    },
    {
      name: 'Bóng chuyền',
      description: 'Volleyball',
      status: SportStatus.ACTIVE
    },
    {
      name: 'Tennis',
      description: 'Tennis court',
      status: SportStatus.ACTIVE
    },
    {
      name: 'Pickleball',
      description: 'Pickleball - môn thể thao mới',
      status: SportStatus.ACTIVE
    },
    {
      name: 'Bóng bàn',
      description: 'Table Tennis - Ping Pong',
      status: SportStatus.ACTIVE
    },
    {
      name: 'Bơi lội',
      description: 'Swimming pool',
      status: SportStatus.ACTIVE
    },
    {
      name: 'Gym / Fitness',
      description: 'Phòng gym',
      status: SportStatus.ACTIVE
    },
    {
      name: 'Yoga',
      description: 'Yoga studio',
      status: SportStatus.ACTIVE
    }
  ]

  for (const sport of sports) {
    const existing = await prisma.sport.findFirst({
      where: { name: sport.name, deletedAt: null }
    })

    if (existing) {
      console.log(`⚠️  Sport already exists: ${sport.name}`)
      continue
    }

    const created = await prisma.sport.create({
      data: {
        name: sport.name,
        description: sport.description,
        status: sport.status
      }
    })

    console.log(`✅ Created sport: ${created.name}`)
  }

  console.log('\n🎉 Sports seeding completed!')

  // Show all sports
  const allSports = await prisma.sport.findMany({
    where: { deletedAt: null, status: SportStatus.ACTIVE }
  })

  console.log(`\n📊 Total active sports: ${allSports.length}`)
  allSports.forEach((sport) => {
    console.log(`   - ${sport.name}`)
  })
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
