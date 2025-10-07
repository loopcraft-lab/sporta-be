import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding OWNER permissions...')

  // 1. Get OWNER role
  const ownerRole = await prisma.role.findFirst({
    where: { name: 'OWNER', deletedAt: null }
  })

  if (!ownerRole) {
    console.error('❌ OWNER role not found!')
    return
  }

  console.log(`✅ Found OWNER role (id: ${ownerRole.id})`)

  // 2. Define permissions
  const permissions = [
    {
      name: 'Get My Venue Owner',
      path: '/venue-owner/me',
      method: 'GET' as const,
      module: 'venue-owner',
      description: 'Get current user venue owner info'
    },
    {
      name: 'Create Venue Owner',
      path: '/venue-owner',
      method: 'POST' as const,
      module: 'venue-owner',
      description: 'Create venue owner'
    },
    {
      name: 'Update Venue Owner',
      path: '/venue-owner/:id',
      method: 'PUT' as const,
      module: 'venue-owner',
      description: 'Update venue owner'
    },
    {
      name: 'Delete Venue Owner',
      path: '/venue-owner/:id',
      method: 'DELETE' as const,
      module: 'venue-owner',
      description: 'Delete venue owner'
    },
    {
      name: 'Create Court',
      path: '/court',
      method: 'POST' as const,
      module: 'court',
      description: 'Create new court'
    },
    {
      name: 'Update Court',
      path: '/court/:id',
      method: 'PUT' as const,
      module: 'court',
      description: 'Update court'
    },
    {
      name: 'Delete Court',
      path: '/court/:id',
      method: 'DELETE' as const,
      module: 'court',
      description: 'Delete court'
    }
  ]

  // 3. Create/update permissions
  for (const perm of permissions) {
    // Check if permission exists
    const existing = await prisma.permission.findFirst({
      where: {
        path: perm.path,
        method: perm.method,
        deletedAt: null
      }
    })

    if (existing) {
      // Update and connect to role
      await prisma.permission.update({
        where: { id: existing.id },
        data: {
          roles: {
            connect: { id: ownerRole.id }
          }
        }
      })
      console.log(`✅ Updated: ${perm.name} (${perm.method} ${perm.path})`)
    } else {
      // Create new permission and connect to role
      await prisma.permission.create({
        data: {
          ...perm,
          roles: {
            connect: { id: ownerRole.id }
          }
        }
      })
      console.log(`✅ Created: ${perm.name} (${perm.method} ${perm.path})`)
    }
  }

  console.log('\n🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
