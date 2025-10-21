import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Adding BOOKING permissions to CLIENT role...\n')

  // 1. Find CLIENT role
  const clientRole = await prisma.role.findFirst({
    where: { name: 'CLIENT', deletedAt: null }
  })

  if (!clientRole) {
    console.error('❌ CLIENT role not found!')
    return
  }

  // 2. Find all BOOKING permissions
  const bookingPermissions = await prisma.permission.findMany({
    where: {
      module: 'BOOKING',
      deletedAt: null
    }
  })

  if (bookingPermissions.length === 0) {
    console.log('⚠️  No BOOKING permissions found. Running permissions script first...')
    return
  }

  console.log(`📋 Found ${bookingPermissions.length} BOOKING permissions:`)
  bookingPermissions.forEach((p) => {
    console.log(`   - ${p.method} ${p.path}`)
  })

  // 3. Get current permissions of CLIENT role
  const roleWithPermissions = await prisma.role.findUnique({
    where: { id: clientRole.id },
    include: { permissions: true }
  })

  const currentPermissionIds = roleWithPermissions!.permissions.map((p) => p.id)
  const bookingPermissionIds = bookingPermissions.map((p) => p.id)

  // 4. Merge permissions (avoid duplicates)
  const allPermissionIds = Array.from(
    new Set([...currentPermissionIds, ...bookingPermissionIds])
  )

  // 5. Update CLIENT role with new permissions
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
    `➕ Added: ${allPermissionIds.length - currentPermissionIds.length} new permissions`
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
