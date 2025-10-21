import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🏙️  Seeding provinces and wards...')

  // Danh sách 63 tỉnh thành Việt Nam
  const provinces = [
    { name: 'Hà Nội', code: 'HN' },
    { name: 'Hồ Chí Minh', code: 'HCM' },
    { name: 'Đà Nẵng', code: 'DN' },
    { name: 'Hải Phòng', code: 'HP' },
    { name: 'Cần Thơ', code: 'CT' },
    { name: 'An Giang', code: 'AG' },
    { name: 'Bà Rịa - Vũng Tàu', code: 'BRVT' },
    { name: 'Bạc Liêu', code: 'BL' },
    { name: 'Bắc Giang', code: 'BG' },
    { name: 'Bắc Kạn', code: 'BK' },
    { name: 'Bắc Ninh', code: 'BN' },
    { name: 'Bến Tre', code: 'BT' },
    { name: 'Bình Dương', code: 'BD' },
    { name: 'Bình Định', code: 'BDH' },
    { name: 'Bình Phước', code: 'BP' },
    { name: 'Bình Thuận', code: 'BTH' },
    { name: 'Cà Mau', code: 'CM' },
    { name: 'Cao Bằng', code: 'CB' },
    { name: 'Đắk Lắk', code: 'DL' },
    { name: 'Đắk Nông', code: 'DNO' },
    { name: 'Điện Biên', code: 'DB' },
    { name: 'Đồng Nai', code: 'DNA' },
    { name: 'Đồng Tháp', code: 'DT' },
    { name: 'Gia Lai', code: 'GL' },
    { name: 'Hà Giang', code: 'HG' },
    { name: 'Hà Nam', code: 'HNA' },
    { name: 'Hà Tĩnh', code: 'HTI' },
    { name: 'Hải Dương', code: 'HD' },
    { name: 'Hậu Giang', code: 'HGI' },
    { name: 'Hòa Bình', code: 'HB' },
    { name: 'Hưng Yên', code: 'HY' },
    { name: 'Khánh Hòa', code: 'KH' },
    { name: 'Kiên Giang', code: 'KG' },
    { name: 'Kon Tum', code: 'KT' },
    { name: 'Lai Châu', code: 'LC' },
    { name: 'Lâm Đồng', code: 'LD' },
    { name: 'Lạng Sơn', code: 'LS' },
    { name: 'Lào Cai', code: 'LCA' },
    { name: 'Long An', code: 'LA' },
    { name: 'Nam Định', code: 'ND' },
    { name: 'Nghệ An', code: 'NA' },
    { name: 'Ninh Bình', code: 'NB' },
    { name: 'Ninh Thuận', code: 'NT' },
    { name: 'Phú Thọ', code: 'PT' },
    { name: 'Phú Yên', code: 'PY' },
    { name: 'Quảng Bình', code: 'QB' },
    { name: 'Quảng Nam', code: 'QNA' },
    { name: 'Quảng Ngãi', code: 'QNG' },
    { name: 'Quảng Ninh', code: 'QNI' },
    { name: 'Quảng Trị', code: 'QT' },
    { name: 'Sóc Trăng', code: 'ST' },
    { name: 'Sơn La', code: 'SL' },
    { name: 'Tây Ninh', code: 'TN' },
    { name: 'Thái Bình', code: 'TB' },
    { name: 'Thái Nguyên', code: 'TNG' },
    { name: 'Thanh Hóa', code: 'TH' },
    { name: 'Thừa Thiên Huế', code: 'TTH' },
    { name: 'Tiền Giang', code: 'TG' },
    { name: 'Trà Vinh', code: 'TV' },
    { name: 'Tuyên Quang', code: 'TQ' },
    { name: 'Vĩnh Long', code: 'VL' },
    { name: 'Vĩnh Phúc', code: 'VP' },
    { name: 'Yên Bái', code: 'YB' }
  ]

  // Sample wards cho một số tỉnh lớn
  const wardsByProvince: Record<string, string[]> = {
    HCM: [
      'Quận 1',
      'Quận 2',
      'Quận 3',
      'Quận 4',
      'Quận 5',
      'Quận 6',
      'Quận 7',
      'Quận 8',
      'Quận 9',
      'Quận 10',
      'Quận 11',
      'Quận 12',
      'Bình Thạnh',
      'Phú Nhuận',
      'Tân Bình',
      'Tân Phú',
      'Gò Vấp',
      'Bình Tân',
      'Thủ Đức',
      'Hóc Môn',
      'Củ Chi',
      'Bình Chánh',
      'Nhà Bè',
      'Cần Giờ'
    ],
    HN: [
      'Ba Đình',
      'Hoàn Kiếm',
      'Hai Bà Trưng',
      'Đống Đa',
      'Tây Hồ',
      'Cầu Giấy',
      'Thanh Xuân',
      'Hoàng Mai',
      'Long Biên',
      'Hà Đông',
      'Nam Từ Liêm',
      'Bắc Từ Liêm',
      'Sơn Tây',
      'Đông Anh',
      'Gia Lâm',
      'Sóc Sơn',
      'Mê Linh',
      'Ba Vì',
      'Phúc Thọ',
      'Đan Phượng',
      'Hoài Đức',
      'Quốc Oai',
      'Thạch Thất',
      'Chương Mỹ',
      'Thanh Oai',
      'Thường Tín',
      'Phú Xuyên',
      'Ứng Hòa',
      'Mỹ Đức'
    ],
    DN: [
      'Hải Châu',
      'Thanh Khê',
      'Sơn Trà',
      'Ngũ Hành Sơn',
      'Liên Chiểu',
      'Cẩm Lệ',
      'Hòa Vang',
      'Hoàng Sa'
    ],
    HP: [
      'Hồng Bàng',
      'Ngô Quyền',
      'Lê Chân',
      'Hải An',
      'Kiến An',
      'Đồ Sơn',
      'Dương Kinh',
      'Thuỷ Nguyên',
      'An Dương',
      'An Lão',
      'Kiến Thuỵ',
      'Tiên Lãng',
      'Vĩnh Bảo',
      'Cát Hải',
      'Bạch Long Vĩ'
    ],
    CT: [
      'Ninh Kiều',
      'Ô Môn',
      'Bình Thuỷ',
      'Cái Răng',
      'Thốt Nốt',
      'Vĩnh Thạnh',
      'Cờ Đỏ',
      'Phong Điền',
      'Thới Lai'
    ]
  }

  let createdProvinces = 0
  let createdWards = 0

  for (const province of provinces) {
    // Check if province exists
    const existingProvince = await prisma.province.findFirst({
      where: { code: province.code, deletedAt: null }
    })

    if (existingProvince) {
      console.log(`⚠️  Province already exists: ${province.name}`)
      continue
    }

    // Create province
    const createdProvince = await prisma.province.create({
      data: {
        name: province.name,
        code: province.code
      }
    })

    createdProvinces++
    console.log(`✅ Created province: ${createdProvince.name}`)

    // Create wards if available
    const wards = wardsByProvince[province.code]
    if (wards) {
      for (let i = 0; i < wards.length; i++) {
        const ward = wards[i]
        const wardCode = `${province.code}-${String(i + 1).padStart(3, '0')}`

        const existingWard = await prisma.ward.findFirst({
          where: { code: wardCode, deletedAt: null }
        })

        if (!existingWard) {
          await prisma.ward.create({
            data: {
              name: ward,
              code: wardCode,
              provinceId: createdProvince.id
            }
          })
          createdWards++
        }
      }
      console.log(`   ↳ Created ${wards.length} wards for ${province.name}`)
    }
  }

  console.log('\n🎉 Provinces and wards seeding completed!')
  console.log(`📊 Created ${createdProvinces} provinces`)
  console.log(`📊 Created ${createdWards} wards`)

  // Show summary
  const totalProvinces = await prisma.province.count({ where: { deletedAt: null } })
  const totalWards = await prisma.ward.count({ where: { deletedAt: null } })

  console.log(`\n📍 Total provinces in DB: ${totalProvinces}`)
  console.log(`📍 Total wards in DB: ${totalWards}`)
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
