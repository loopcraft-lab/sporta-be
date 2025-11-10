import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding ALL PERMISSIONS for ALL ROLES...\n')

  // ============================================
  // 1. GET ALL ROLES
  // ============================================
  const [clientRole, ownerRole, adminRole] = await Promise.all([
    prisma.role.findFirst({ where: { name: 'CLIENT', deletedAt: null } }),
    prisma.role.findFirst({ where: { name: 'OWNER', deletedAt: null } }),
    prisma.role.findFirst({ where: { name: 'ADMIN', deletedAt: null } })
  ])

  if (!clientRole || !ownerRole || !adminRole) {
    console.error('❌ Some roles not found!')
    console.error({
      clientRole: !!clientRole,
      ownerRole: !!ownerRole,
      adminRole: !!adminRole
    })
    return
  }

  console.log('✅ Found all roles:')
  console.log(`   - CLIENT (id: ${clientRole.id})`)
  console.log(`   - OWNER (id: ${ownerRole.id})`)
  console.log(`   - ADMIN (id: ${adminRole.id})\n`)

  // ============================================
  // 2. DEFINE ALL PERMISSIONS
  // ============================================
  const allPermissions: Array<{
    name: string
    path: string
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
    module: string
    description: string
    roles: string[] // ['CLIENT', 'OWNER', 'ADMIN']
  }> = [
    // ============ BOOKING ============
    {
      name: 'Check Availability',
      path: '/booking/availability',
      method: 'GET',
      module: 'booking',
      description: 'Check court availability',
      roles: ['CLIENT', 'OWNER', 'ADMIN']
    },
    {
      name: 'Get My Bookings',
      path: '/booking/my-bookings',
      method: 'GET',
      module: 'booking',
      description: 'Get current user bookings',
      roles: ['CLIENT', 'OWNER']
    },
    {
      name: 'Get Booking By ID',
      path: '/booking/:id',
      method: 'GET',
      module: 'booking',
      description: 'Get booking by ID',
      roles: ['CLIENT', 'OWNER', 'ADMIN']
    },
    {
      name: 'Create Booking',
      path: '/booking',
      method: 'POST',
      module: 'booking',
      description: 'Create new booking',
      roles: ['CLIENT', 'OWNER'] // OWNER can also book courts
    },
    {
      name: 'Cancel Booking',
      path: '/booking/:id',
      method: 'DELETE',
      module: 'booking',
      description: 'Cancel booking',
      roles: ['CLIENT', 'OWNER', 'ADMIN']
    },
    {
      name: 'Check Payment Status',
      path: '/booking/:id/check-payment',
      method: 'POST',
      module: 'booking',
      description: 'Check payment status',
      roles: ['CLIENT', 'OWNER']
    },

    // ============ VENUE OWNER ============
    {
      name: 'List Venue Owners',
      path: '/venue-owner',
      method: 'GET',
      module: 'venue-owner',
      description: 'List all venue owners',
      roles: ['CLIENT', 'OWNER', 'ADMIN']
    },
    {
      name: 'Get My Venue Owner',
      path: '/venue-owner/me',
      method: 'GET',
      module: 'venue-owner',
      description: 'Get current user venue owner info',
      roles: ['OWNER', 'ADMIN']
    },
    {
      name: 'Get Venue Owner By ID',
      path: '/venue-owner/:id',
      method: 'GET',
      module: 'venue-owner',
      description: 'Get venue owner by ID',
      roles: ['CLIENT', 'OWNER', 'ADMIN']
    },
    {
      name: 'Create Venue Owner',
      path: '/venue-owner',
      method: 'POST',
      module: 'venue-owner',
      description: 'Create venue owner',
      roles: ['OWNER']
    },
    {
      name: 'Update Venue Owner',
      path: '/venue-owner/:id',
      method: 'PUT',
      module: 'venue-owner',
      description: 'Update venue owner',
      roles: ['OWNER', 'ADMIN']
    },
    {
      name: 'Delete Venue Owner',
      path: '/venue-owner/:id',
      method: 'DELETE',
      module: 'venue-owner',
      description: 'Delete venue owner',
      roles: ['ADMIN']
    },
    {
      name: 'Approve/Reject Venue Owner',
      path: '/venue-owner/:id/approve',
      method: 'PATCH',
      module: 'venue-owner',
      description: 'Approve or reject venue owner',
      roles: ['ADMIN']
    },

    // ============ COURT ============
    {
      name: 'List Courts',
      path: '/court',
      method: 'GET',
      module: 'court',
      description: 'List all courts',
      roles: ['CLIENT', 'OWNER', 'ADMIN']
    },
    {
      name: 'Get Court By ID',
      path: '/court/:id',
      method: 'GET',
      module: 'court',
      description: 'Get court by ID',
      roles: ['CLIENT', 'OWNER', 'ADMIN']
    },
    {
      name: 'Create Court',
      path: '/court',
      method: 'POST',
      module: 'court',
      description: 'Create new court',
      roles: ['OWNER', 'ADMIN']
    },
    {
      name: 'Update Court',
      path: '/court/:id',
      method: 'PUT',
      module: 'court',
      description: 'Update court',
      roles: ['OWNER', 'ADMIN']
    },
    {
      name: 'Delete Court',
      path: '/court/:id',
      method: 'DELETE',
      module: 'court',
      description: 'Delete court',
      roles: ['OWNER', 'ADMIN']
    },

    // ============ VENUE IMAGE ============
    {
      name: 'Upload Venue Images',
      path: '/venue-image',
      method: 'POST',
      module: 'venue-image',
      description: 'Upload venue images',
      roles: ['OWNER', 'ADMIN']
    },
    {
      name: 'Delete Venue Image',
      path: '/venue-image/:id',
      method: 'DELETE',
      module: 'venue-image',
      description: 'Delete venue image',
      roles: ['OWNER', 'ADMIN']
    },

    // ============ SPORT ============
    {
      name: 'List Sports',
      path: '/sport',
      method: 'GET',
      module: 'sport',
      description: 'List all sports',
      roles: ['CLIENT', 'OWNER', 'ADMIN']
    },
    {
      name: 'Get Sport By ID',
      path: '/sport/:id',
      method: 'GET',
      module: 'sport',
      description: 'Get sport by ID',
      roles: ['CLIENT', 'OWNER', 'ADMIN']
    },

    // ============ AMENITY ============
    {
      name: 'List Amenities',
      path: '/amenity',
      method: 'GET',
      module: 'amenity',
      description: 'List all amenities',
      roles: ['CLIENT', 'OWNER', 'ADMIN']
    },

    // ============ LOCATION ============
    {
      name: 'List Provinces',
      path: '/location/provinces',
      method: 'GET',
      module: 'location',
      description: 'List all provinces',
      roles: ['CLIENT', 'OWNER', 'ADMIN']
    },
    {
      name: 'List Wards',
      path: '/location/wards',
      method: 'GET',
      module: 'location',
      description: 'List wards by province',
      roles: ['CLIENT', 'OWNER', 'ADMIN']
    },

    // ============ MEDIA ============
    {
      name: 'Upload Media',
      path: '/media/upload',
      method: 'POST',
      module: 'media',
      description: 'Upload media files',
      roles: ['OWNER', 'ADMIN']
    },

    // ============ OWNER DASHBOARD ============
    {
      name: 'Get Owner Dashboard',
      path: '/venue-owner/my/dashboard',
      method: 'GET',
      module: 'venue-owner',
      description: 'Get venue owner dashboard stats',
      roles: ['OWNER']
    },
    {
      name: 'Get Court Calendar',
      path: '/venue-owner/my/courts/:courtId/calendar',
      method: 'GET',
      module: 'venue-owner',
      description: 'Get court calendar for owner',
      roles: ['OWNER']
    },
    {
      name: 'Get Owner Bookings',
      path: '/venue-owner/my/bookings',
      method: 'GET',
      module: 'venue-owner',
      description: 'Get all bookings for owner courts',
      roles: ['OWNER']
    },
    {
      name: 'Get Owner Analytics',
      path: '/venue-owner/my/analytics',
      method: 'GET',
      module: 'venue-owner',
      description: 'Get venue owner analytics',
      roles: ['OWNER']
    }
  ]

  // ============================================
  // 3. PROCESS ALL PERMISSIONS
  // ============================================
  const roleMap = {
    CLIENT: clientRole,
    OWNER: ownerRole,
    ADMIN: adminRole
  }

  let totalCreated = 0
  let totalConnected = 0
  let totalSkipped = 0

  console.log('🔄 Processing permissions...\n')

  for (const perm of allPermissions) {
    // Check if permission exists
    const existing = await prisma.permission.findFirst({
      where: {
        path: perm.path,
        method: perm.method,
        deletedAt: null
      },
      include: {
        roles: true
      }
    })

    if (existing) {
      // Connect missing roles
      const existingRoleIds = existing.roles.map((r) => r.id)
      const rolesToConnect = perm.roles
        .map((roleName) => roleMap[roleName as keyof typeof roleMap])
        .filter((role) => !existingRoleIds.includes(role.id))

      if (rolesToConnect.length > 0) {
        await prisma.permission.update({
          where: { id: existing.id },
          data: {
            roles: {
              connect: rolesToConnect.map((r) => ({ id: r.id }))
            }
          }
        })
        totalConnected += rolesToConnect.length
        console.log(
          `✅ Connected [${rolesToConnect.map((r) => r.name).join(', ')}]: ${perm.name}`
        )
      } else {
        totalSkipped++
        console.log(`⏭️  Already complete: ${perm.name}`)
      }
    } else {
      // Create new permission
      const rolesToConnect = perm.roles.map(
        (roleName) => roleMap[roleName as keyof typeof roleMap]
      )

      await prisma.permission.create({
        data: {
          name: perm.name,
          path: perm.path,
          method: perm.method,
          module: perm.module,
          description: perm.description,
          roles: {
            connect: rolesToConnect.map((r) => ({ id: r.id }))
          }
        }
      })
      totalCreated++
      console.log(`✅ Created for [${perm.roles.join(', ')}]: ${perm.name}`)
    }
  }

  // ============================================
  // 4. SUMMARY
  // ============================================
  console.log('\n' + '='.repeat(70))
  console.log('🎉 ALL PERMISSIONS SEEDED SUCCESSFULLY!')
  console.log('='.repeat(70))
  console.log(`📊 Total permissions: ${allPermissions.length}`)
  console.log(`✨ Created: ${totalCreated} new permissions`)
  console.log(`🔗 Connected: ${totalConnected} role links`)
  console.log(`⏭️  Skipped: ${totalSkipped} (already complete)`)
  console.log('='.repeat(70))
  console.log('\n✅ You can now restart your backend server!\n')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
