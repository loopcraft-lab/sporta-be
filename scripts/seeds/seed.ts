import envConfig from '@/config/env.config'
import { RoleName } from '@/shared/constants/role.constant'
import { HashingService } from '@/shared/services/hashing.service'
import { PrismaService } from '@/shared/services/prisma.service'

const prisma = new PrismaService()
const hashingService = new HashingService()

const main = async () => {
  console.log('🌱 Starting seed...\n')

  // 1. Create Roles
  console.log('📝 Creating roles...')
  const existingRoles = await prisma.role.count()

  if (existingRoles === 0) {
    await prisma.role.createMany({
      data: [
        { name: RoleName.Admin, description: 'Administrator with full access' },
        { name: RoleName.Client, description: 'Regular user - can book venues' },
        { name: RoleName.Moderator, description: 'Moderator - can manage content' },
        { name: RoleName.Owner, description: 'Venue owner - can manage venues' }
      ]
    })
    console.log('✅ Created 4 roles\n')
  } else {
    console.log('⏭️  Roles already exist, skipping...\n')
  }

  // 2. Get role IDs
  const adminRole = await prisma.role.findFirstOrThrow({
    where: { name: RoleName.Admin }
  })
  const clientRole = await prisma.role.findFirstOrThrow({
    where: { name: RoleName.Client }
  })
  const ownerRole = await prisma.role.findFirstOrThrow({
    where: { name: RoleName.Owner }
  })

  // 3. Create Admin User
  console.log('👤 Creating admin user...')
  const existingAdmin = await prisma.user.findFirst({
    where: { email: envConfig.ADMIN_EMAIL }
  })

  if (!existingAdmin) {
    const hashedAdminPassword = await hashingService.hash(envConfig.ADMIN_PASSWORD)
    const admin = await prisma.user.create({
      data: {
        email: envConfig.ADMIN_EMAIL,
        password: hashedAdminPassword,
        name: envConfig.ADMIN_NAME,
        phoneNumber: envConfig.ADMIN_PHONE_NUMBER,
        roleId: adminRole.id
      }
    })
    console.log(`✅ Admin created: ${admin.email}`)
    console.log(`   Password: ${envConfig.ADMIN_PASSWORD}\n`)
  } else {
    console.log('⏭️  Admin already exists, skipping...\n')
  }

  // 4. Create Test Users
  console.log('👥 Creating test users...')

  const testUsers = [
    {
      email: 'user@test.com',
      password: '123456',
      name: 'Test User',
      phoneNumber: '0123456789',
      roleId: clientRole.id
    },
    {
      email: 'owner@test.com',
      password: '123456',
      name: 'Test Owner',
      phoneNumber: '0987654321',
      roleId: ownerRole.id
    }
  ]

  for (const userData of testUsers) {
    const existing = await prisma.user.findFirst({ where: { email: userData.email } })
    if (!existing) {
      const hashedPassword = await hashingService.hash(userData.password)
      await prisma.user.create({
        data: {
          ...userData,
          password: hashedPassword
        }
      })
      console.log(`✅ Created: ${userData.email} (password: ${userData.password})`)
    } else {
      console.log(`⏭️  ${userData.email} already exists`)
    }
  }

  console.log('\n🎉 Seed completed!\n')
  console.log('📋 Test Accounts:')
  console.log('   Admin:  admin@gmail.com / 123456')
  console.log('   User:   user@test.com / 123456')
  console.log('   Owner:  owner@test.com / 123456\n')
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
  .finally(async () => {
    await prisma.$disconnect()
  })
