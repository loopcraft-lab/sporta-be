import { HTTPMethod, PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Quick fix: Adding BOOKING permissions to CLIENT role...\n')

  // 1. Tìm CLIENT role
  const clientRole = await prisma.role.findFirst({
    where: { name: 'CLIENT', deletedAt: null }
  })

  if (!clientRole) {
    console.error('❌ CLIENT role not found!')
    process.exit(1)
  }

  console.log(`✅ Found CLIENT role (ID: ${clientRole.id})`)

  // 2. Tạo BOOKING permissions thủ công nếu chưa có
  const bookingPermissions = [
    {
      path: '/booking/availability',
      method: HTTPMethod.GET,
      name: 'GET /booking/availability',
      module: 'BOOKING'
    },
    {
      path: '/booking',
      method: HTTPMethod.POST,
      name: 'POST /booking',
      module: 'BOOKING'
    },
    {
      path: '/booking/my-bookings',
      method: HTTPMethod.GET,
      name: 'GET /booking/my-bookings',
      module: 'BOOKING'
    },
    {
      path: '/booking/:id',
      method: HTTPMethod.GET,
      name: 'GET /booking/:id',
      module: 'BOOKING'
    },
    {
      path: '/booking/:id',
      method: HTTPMethod.DELETE,
      name: 'DELETE /booking/:id',
      module: 'BOOKING'
    }
  ]

  console.log(
    `\n📝 Creating/updating ${bookingPermissions.length} BOOKING permissions...`
  )

  const createdPermissions: Array<{ id: number }> = []

  for (const perm of bookingPermissions) {
    const existing = await prisma.permission.findFirst({
      where: {
        path: perm.path,
        method: perm.method,
        deletedAt: null
      }
    })

    if (existing) {
      console.log(`   ✓ ${perm.method} ${perm.path} (already exists)`)
      createdPermissions.push({ id: existing.id })
    } else {
      const created = await prisma.permission.create({
        data: perm
      })
      console.log(`   + ${perm.method} ${perm.path} (created)`)
      createdPermissions.push({ id: created.id })
    }
  }

  // 3. Get current CLIENT permissions
  const roleWithPermissions = await prisma.role.findUnique({
    where: { id: clientRole.id },
    include: { permissions: true }
  })

  const currentPermissionIds = roleWithPermissions!.permissions.map((p) => p.id)
  const bookingPermissionIds = createdPermissions.map((p) => p.id)

  // 4. Merge permissions
  const allPermissionIds = Array.from(
    new Set([...currentPermissionIds, ...bookingPermissionIds])
  )

  // 5. Update CLIENT role
  await prisma.role.update({
    where: { id: clientRole.id },
    data: {
      permissions: {
        set: allPermissionIds.map((id) => ({ id }))
      }
    }
  })

  console.log('\n✅ Successfully added BOOKING permissions to CLIENT role!')
  console.log(
    `📊 Total permissions: ${currentPermissionIds.length} → ${allPermissionIds.length}`
  )
  console.log(
    `➕ Added: ${allPermissionIds.length - currentPermissionIds.length} new permissions\n`
  )
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
