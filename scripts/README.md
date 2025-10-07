# Scripts Organization

## 📁 Structure

```
scripts/
├── sql/                          # SQL files
│   ├── Province.sql             # Tỉnh/Thành phố data
│   ├── Ward.sql                 # Quận/Huyện data  
│   └── add-owner-permissions.sql # SQL insert permissions
│
├── seeds/                        # Data seeding scripts
│   ├── index.ts                 # Main seed entry
│   └── seed.ts                  # Seed implementation
│
└── permissions/                  # Permission management
    ├── add-venue-owner-permissions.ts    # Add venue owner permissions
    ├── create-permissions.ts             # Create all permissions
    └── seed-owner-permissions.ts         # Seed owner permissions

```

## 🚀 Usage

### SQL Scripts
```bash
# Import location data
psql -U your_user -d your_db -f scripts/sql/Province.sql
psql -U your_user -d your_db -f scripts/sql/Ward.sql

# Or use prisma studio to import
```

### Seed Scripts
```bash
# Run main seed
pnpm seed

# Or specific seed
pnpm tsx scripts/seeds/seed.ts
```

### Permission Scripts
```bash
# Add venue owner permissions (run once)
pnpm tsx scripts/permissions/add-venue-owner-permissions.ts

# Create all permissions
pnpm tsx scripts/permissions/create-permissions.ts

# Seed owner permissions
pnpm tsx scripts/permissions/seed-owner-permissions.ts
```

## 📝 Notes

- SQL files: Static data imports
- Seeds: Dynamic data generation
- Permissions: Role & permission setup

## ⚠️ Important

Run permission scripts **ONCE** only after:
1. Database migration complete
2. ADMIN role exists
3. Clean database state
