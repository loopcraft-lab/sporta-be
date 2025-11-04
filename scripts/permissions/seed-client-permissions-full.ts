import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding CLIENT permissions...')

  // 1. Get CLIENT role
  const clientRole = await prisma.role.findFirst({
    where: { name: 'CLIENT', deletedAt: null }
  })

  if (!clientRole) {
    console.error('❌ CLIENT role not found!')
    return
  }

  console.log(`✅ Found CLIENT role (id: ${clientRole.id})`)

  // 2. Define permissions for CLIENT
  const permissions = [
    // ============ BOOKING ============
    {
      name: 'Get My Bookings',
      path: '/booking/my-bookings',
      method: 'GET' as const,
      module: 'booking',
      description: 'Get current user bookings'
    },
    {
      name: 'Get Booking By ID',
      path: '/booking/:id',
      method: 'GET' as const,
      module: 'booking',
      description: 'Get booking by ID'
    },
    {
      name: 'Check Availability',
      path: '/booking/availability',
      method: 'GET' as const,
      module: 'booking',
      description: 'Check court availability'
    },
    {
      name: 'Create Booking',
      path: '/booking',
      method: 'POST' as const,
      module: 'booking',
      description: 'Create new booking'
    },
    {
      name: 'Cancel Booking',
      path: '/booking/:id',
      method: 'DELETE' as const,
      module: 'booking',
      description: 'Cancel booking'
    },
    {
      name: 'Check Payment Status',
      path: '/booking/:id/check-payment',
      method: 'POST' as const,
      module: 'booking',
      description: 'Check payment status'
    },

    // ============ VENUE & COURT (Read-only) ============
    {
      name: 'List Venue Owners',
      path: '/venue-owner',
      method: 'GET' as const,
      module: 'venue-owner',
      description: 'List all venue owners'
    },
    {
      name: 'Get Venue Owner By ID',
      path: '/venue-owner/:id',
      method: 'GET' as const,
      module: 'venue-owner',
      description: 'Get venue owner by ID'
    },
    {
      name: 'List Courts',
      path: '/court',
      method: 'GET' as const,
      module: 'court',
      description: 'List all courts'
    },
    {
      name: 'Get Court By ID',
      path: '/court/:id',
      method: 'GET' as const,
      module: 'court',
      description: 'Get court by ID'
    },

    // ============ SPORT & AMENITY (Read-only) ============
    {
      name: 'List Sports',
      path: '/sport',
      method: 'GET' as const,
      module: 'sport',
      description: 'List all sports'
    },
    {
      name: 'Get Sport By ID',
      path: '/sport/:id',
      method: 'GET' as const,
      module: 'sport',
      description: 'Get sport by ID'
    },
    {
      name: 'List Amenities',
      path: '/amenity',
      method: 'GET' as const,
      module: 'amenity',
      description: 'List all amenities'
    },

    // ============ LOCATION (Read-only) ============
    {
      name: 'List Provinces',
      path: '/location/provinces',
      method: 'GET' as const,
      module: 'location',
      description: 'List all provinces'
    },
    {
      name: 'List Wards',
      path: '/location/wards',
      method: 'GET' as const,
      module: 'location',
      description: 'List wards by province'
    }
  ]

  // 3. Create/update permissions
  let createdCount = 0
  let updatedCount = 0

  for (const perm of permissions) {
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
      // Check if already connected to CLIENT role
      const hasClientRole = existing.roles.some((r) => r.id === clientRole.id)

      if (!hasClientRole) {
        // Connect to CLIENT role
        await prisma.permission.update({
          where: { id: existing.id },
          data: {
            roles: {
              connect: { id: clientRole.id }
            }
          }
        })
        updatedCount++
        console.log(`✅ Connected: ${perm.name} (${perm.method} ${perm.path})`)
      } else {
        console.log(`⏭️  Already exists: ${perm.name}`)
      }
    } else {
      // Create new permission and connect to role
      await prisma.permission.create({
        data: {
          ...perm,
          roles: {
            connect: { id: clientRole.id }
          }
        }
      })
      createdCount++
      console.log(`✅ Created: ${perm.name} (${perm.method} ${perm.path})`)
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('🎉 Seeding completed!')
  console.log(`📊 Created: ${createdCount} permissions`)
  console.log(`🔗 Connected: ${updatedCount} existing permissions`)
  console.log('='.repeat(60))
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
