import {
  CreateProvinceBodyType,
  GetProvincesResType,
  ProvinceType,
  ProvinceWithWardsType,
  UpdateProvinceBodyType
} from '@/routes/location/models/province.model'
import {
  BulkImportLocationBodyType,
  LocationSearchItemType,
  LocationSearchQueryType
} from '@/routes/location/models/search.model'
import {
  CreateWardBodyType,
  GetWardsByProvinceResType,
  GetWardsResType,
  UpdateWardBodyType,
  WardType,
  WardWithProvinceType
} from '@/routes/location/models/ward.model'
import { SerializeAll } from '@/shared/decorators/serialize.decorator'
import { LOCATION_MESSAGE } from '@/shared/messages/location.message'
import { PaginationQueryType } from '@/shared/models/request.model'
import { PrismaService } from '@/shared/services/prisma.service'
import { Injectable } from '@nestjs/common'

@Injectable()
@SerializeAll()
export class LocationRepository {
  constructor(private readonly prismaService: PrismaService) {}

  // ==================== PROVINCE METHODS ====================

  async listProvinces(pagination: PaginationQueryType): Promise<GetProvincesResType> {
    const skip = (pagination.page - 1) * pagination.limit
    const take = pagination.limit

    const [totalItems, data] = await Promise.all([
      this.prismaService.province.count({
        where: { deletedAt: null }
      }),
      this.prismaService.province.findMany({
        where: { deletedAt: null },
        orderBy: { name: 'asc' },
        skip,
        take
      })
    ])

    return {
      data,
      meta: {
        totalItems,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(totalItems / pagination.limit)
      },
      message: LOCATION_MESSAGE.PROVINCE_LIST_SUCCESS
    } as any
  }

  findProvinceById(id: number): Promise<ProvinceType | null> {
    return this.prismaService.province.findUnique({
      where: { id, deletedAt: null }
    }) as any
  }

  findProvinceByIdWithWards(id: number): Promise<ProvinceWithWardsType | null> {
    return this.prismaService.province
      .findUnique({
        where: { id, deletedAt: null },
        include: {
          Ward: {
            where: { deletedAt: null },
            orderBy: { name: 'asc' },
            select: { id: true, name: true, code: true }
          }
        }
      })
      .then((result) => {
        if (!result) return null
        return {
          ...result,
          wards: result.Ward
        }
      }) as any
  }

  findProvinceByCode(code: string): Promise<ProvinceType | null> {
    return this.prismaService.province.findFirst({
      where: { code, deletedAt: null }
    }) as any
  }

  createProvince({
    createdById,
    data
  }: {
    createdById: number | null
    data: CreateProvinceBodyType
  }): Promise<ProvinceType> {
    return this.prismaService.province.create({
      data: { ...data, createdById }
    }) as any
  }

  updateProvince({
    id,
    updatedById,
    data
  }: {
    id: number
    updatedById: number
    data: UpdateProvinceBodyType
  }): Promise<ProvinceType> {
    return this.prismaService.province.update({
      where: { id, deletedAt: null },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.code && { code: data.code }),
        updatedById
      }
    }) as any
  }

  deleteProvince(
    {
      id,
      deletedById
    }: {
      id: number
      deletedById: number
    },
    isHard?: boolean
  ): Promise<ProvinceType> {
    return (
      isHard
        ? this.prismaService.province.delete({ where: { id } })
        : this.prismaService.province.update({
            where: { id, deletedAt: null },
            data: { deletedAt: new Date(), deletedById }
          })
    ) as any
  }

  // ==================== WARD METHODS ====================

  async listWards(pagination: PaginationQueryType): Promise<GetWardsResType> {
    const skip = (pagination.page - 1) * pagination.limit
    const take = pagination.limit

    const [totalItems, data] = await Promise.all([
      this.prismaService.ward.count({
        where: { deletedAt: null }
      }),
      this.prismaService.ward.findMany({
        where: { deletedAt: null },
        include: {
          province: {
            select: { id: true, name: true, code: true }
          }
        },
        orderBy: { name: 'asc' },
        skip,
        take
      })
    ])

    return {
      data,
      meta: {
        totalItems,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(totalItems / pagination.limit)
      },
      message: LOCATION_MESSAGE.WARD_LIST_SUCCESS
    } as any
  }

  async listWardsByProvinceId(provinceId: number): Promise<GetWardsByProvinceResType> {
    const data = await this.prismaService.ward.findMany({
      where: { provinceId, deletedAt: null },
      orderBy: { name: 'asc' }
    })
    return {
      data,
      message: LOCATION_MESSAGE.WARD_LIST_BY_PROVINCE_SUCCESS
    } as any
  }

  findWardById(id: number): Promise<WardWithProvinceType | null> {
    return this.prismaService.ward.findUnique({
      where: { id, deletedAt: null },
      include: {
        province: {
          select: { id: true, name: true, code: true }
        }
      }
    }) as any
  }

  findWardByCode(code: string, provinceId?: number): Promise<WardType | null> {
    return this.prismaService.ward.findFirst({
      where: {
        code,
        deletedAt: null,
        ...(provinceId && { provinceId })
      }
    }) as any
  }

  createWard({
    createdById,
    data
  }: {
    createdById: number | null
    data: CreateWardBodyType
  }): Promise<WardType> {
    return this.prismaService.ward.create({
      data: { ...data, createdById }
    }) as any
  }

  updateWard({
    id,
    updatedById,
    data
  }: {
    id: number
    updatedById: number
    data: UpdateWardBodyType
  }): Promise<WardType> {
    return this.prismaService.ward.update({
      where: { id, deletedAt: null },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.code && { code: data.code }),
        ...(data.provinceId && { provinceId: data.provinceId }),
        updatedById
      }
    }) as any
  }

  deleteWard(
    {
      id,
      deletedById
    }: {
      id: number
      deletedById: number
    },
    isHard?: boolean
  ): Promise<WardType> {
    return (
      isHard
        ? this.prismaService.ward.delete({ where: { id } })
        : this.prismaService.ward.update({
            where: { id, deletedAt: null },
            data: { deletedAt: new Date(), deletedById }
          })
    ) as any
  }

  // ==================== SEARCH METHODS ====================

  async searchLocations({
    q,
    type,
    limit
  }: LocationSearchQueryType): Promise<LocationSearchItemType[]> {
    const results: LocationSearchItemType[] = []

    // Search provinces
    if (type === 'all' || type === 'province') {
      const provinces = await this.prismaService.province.findMany({
        where: {
          deletedAt: null,
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { code: { contains: q, mode: 'insensitive' } }
          ]
        },
        take: limit,
        orderBy: { name: 'asc' }
      })

      provinces.forEach((province) => {
        results.push({
          id: province.id,
          name: province.name,
          code: province.code,
          type: 'province',
          fullPath: province.name
        })
      })
    }

    // Search wards
    if (type === 'all' || type === 'ward') {
      const wards = await this.prismaService.ward.findMany({
        where: {
          deletedAt: null,
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { code: { contains: q, mode: 'insensitive' } }
          ]
        },
        include: {
          province: {
            select: { id: true, name: true, code: true }
          }
        },
        take: limit,
        orderBy: { name: 'asc' }
      })

      wards.forEach((ward) => {
        results.push({
          id: ward.id,
          name: ward.name,
          code: ward.code,
          type: 'ward',
          fullPath: `${ward.name}, ${ward.province.name}`,
          provinceId: ward.province.id
        })
      })
    }

    // Sort by relevance (exact matches first, then partial matches)
    return results
      .sort((a, b) => {
        const aExact = a.name.toLowerCase() === q.toLowerCase()
        const bExact = b.name.toLowerCase() === q.toLowerCase()
        if (aExact && !bExact) return -1
        if (!aExact && bExact) return 1
        return a.name.localeCompare(b.name)
      })
      .slice(0, limit)
  }

  // ==================== BULK IMPORT METHODS ====================

  async bulkImportLocations({
    data,
    createdById
  }: {
    data: BulkImportLocationBodyType
    createdById: number
  }) {
    const result = {
      provinces: { created: 0, skipped: 0 },
      wards: { created: 0, skipped: 0 }
    }

    // Import provinces first
    for (const provinceData of data.provinces) {
      try {
        const existing = await this.findProvinceByCode(provinceData.code)
        if (existing) {
          result.provinces.skipped++
          continue
        }

        await this.createProvince({
          createdById,
          data: provinceData
        })
        result.provinces.created++
      } catch (error) {
        result.provinces.skipped++
      }
    }

    // Import wards
    for (const wardData of data.wards) {
      try {
        const province = await this.findProvinceByCode(wardData.provinceCode)
        if (!province || !province.id) {
          result.wards.skipped++
          continue
        }

        const existing = await this.findWardByCode(wardData.code, province.id)
        if (existing) {
          result.wards.skipped++
          continue
        }

        await this.createWard({
          createdById,
          data: {
            name: wardData.name,
            code: wardData.code,
            provinceId: province.id
          }
        })
        result.wards.created++
      } catch (error) {
        result.wards.skipped++
      }
    }

    return result
  }
}
