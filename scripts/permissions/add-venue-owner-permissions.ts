import { HTTPMethod, PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Adding venue owner permissions...')

  // 1. Tìm ADMIN role
  const adminRole = await prisma.role.findFirst({
    where: { name: 'ADMIN' }
  })

  if (!adminRole) {
    console.error('❌ ADMIN role not found!')
    return
  }

  console.log(`✅ Found ADMIN role with ID: ${adminRole.id}`)

  // 2. Danh sách permissions cần thêm
  const permissions = [
    {
      name: 'Approve Venue Owner',
      path: '/venue-owner/:id/approve',
      method: HTTPMethod.PATCH,
      module: 'VENUE_OWNER',
      description: 'Permission to approve or reject venue owner registration'
    },
    {
      name: 'List Venue Owners',
      path: '/venue-owner',
      method: HTTPMethod.GET,
      module: 'VENUE_OWNER',
      description: 'Permission to list all venue owners'
    },
    {
      name: 'Get Venue Owner Detail',
      path: '/venue-owner/:id',
      method: HTTPMethod.GET,
      module: 'VENUE_OWNER',
      description: 'Permission to view venue owner details'
    },
    {
      name: 'Update Venue Owner',
      path: '/venue-owner/:id',
      method: HTTPMethod.PUT,
      module: 'VENUE_OWNER',
      description: 'Permission to update venue owner'
    },
    {
      name: 'Delete Venue Owner',
      path: '/venue-owner/:id',
      method: HTTPMethod.DELETE,
      module: 'VENUE_OWNER',
      description: 'Permission to delete venue owner'
    }
  ]

  for (const perm of permissions) {
    // Check if permission already exists
    const existing = await prisma.permission.findFirst({
      where: {
        path: perm.path,
        method: perm.method,
        deletedAt: null
      }
    })

    if (existing) {
      console.log(`⚠️  Permission already exists: ${perm.name}`)

      // Check if ADMIN already has this permission
      const hasPermission = await prisma.role.findFirst({
        where: {
          id: adminRole.id,
          permissions: {
            some: {
              id: existing.id
            }
          }
        }
      })

      if (!hasPermission) {
        // Connect permission to ADMIN role
        await prisma.role.update({
          where: { id: adminRole.id },
          data: {
            permissions: {
              connect: { id: existing.id }
            }
          }
        })
        console.log(`✅ Connected to ADMIN: ${perm.name}`)
      } else {
        console.log(`✓  Already connected to ADMIN: ${perm.name}`)
      }
      continue
    }

    // Create new permission and connect to ADMIN
    const created = await prisma.permission.create({
      data: {
        name: perm.name,
        path: perm.path,
        method: perm.method,
        module: perm.module,
        description: perm.description,
        roles: {
          connect: { id: adminRole.id }
        }
      }
    })
    console.log(`✅ Created & connected: ${created.name}`)
  }

  console.log('\n🎉 All permissions processed successfully!')
  console.log('📋 Summary:')

  // Show all ADMIN permissions
  const adminWithPermissions = await prisma.role.findUnique({
    where: { id: adminRole.id },
    include: {
      permissions: {
        where: { deletedAt: null },
        orderBy: { module: 'asc' }
      }
    }
  })

  console.log(`\n👤 ADMIN Role (ID: ${adminRole.id})`)
  console.log(`📝 Total Permissions: ${adminWithPermissions?.permissions.length}`)
  console.log('\n📚 Venue Owner Permissions:')

  adminWithPermissions?.permissions
    .filter((p) => p.module === 'VENUE_OWNER')
    .forEach((p) => {
      console.log(`   - ${p.method} ${p.path} → ${p.name}`)
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
