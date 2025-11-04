import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding comprehensive OWNER permissions...')

  // 1. Get OWNER role
  const ownerRole = await prisma.role.findFirst({
    where: { name: 'OWNER', deletedAt: null }
  })

  if (!ownerRole) {
    console.error('❌ OWNER role not found!')
    return
  }

  console.log(`✅ Found OWNER role (id: ${ownerRole.id})`)

  // 2. Define ALL permissions that OWNER needs
  const permissions = [
    // ============ VENUE OWNER ============
    {
      name: 'List Venue Owners',
      path: '/venue-owner',
      method: 'GET' as const,
      module: 'venue-owner',
      description: 'List all venue owners'
    },
    {
      name: 'Get My Venue Owner',
      path: '/venue-owner/me',
      method: 'GET' as const,
      module: 'venue-owner',
      description: 'Get current user venue owner info'
    },
    {
      name: 'Get Venue Owner By ID',
      path: '/venue-owner/:id',
      method: 'GET' as const,
      module: 'venue-owner',
      description: 'Get venue owner by ID'
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

    // ============ COURT ============
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
    },

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

    // ============ VENUE IMAGE ============
    {
      name: 'Upload Venue Images',
      path: '/venue-image',
      method: 'POST' as const,
      module: 'venue-image',
      description: 'Upload venue images'
    },
    {
      name: 'Delete Venue Image',
      path: '/venue-image/:id',
      method: 'DELETE' as const,
      module: 'venue-image',
      description: 'Delete venue image'
    },

    // ============ SPORT ============
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

    // ============ AMENITY ============
    {
      name: 'List Amenities',
      path: '/amenity',
      method: 'GET' as const,
      module: 'amenity',
      description: 'List all amenities'
    },

    // ============ LOCATION ============
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
    },

    // ============ MEDIA ============
    {
      name: 'Upload Media',
      path: '/media/upload',
      method: 'POST' as const,
      module: 'media',
      description: 'Upload media files'
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
      // Check if already connected to OWNER role
      const hasOwnerRole = existing.roles.some((r) => r.id === ownerRole.id)

      if (!hasOwnerRole) {
        // Connect to OWNER role
        await prisma.permission.update({
          where: { id: existing.id },
          data: {
            roles: {
              connect: { id: ownerRole.id }
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
            connect: { id: ownerRole.id }
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
