import {
  ProvinceAlreadyExistsException,
  ProvinceNotFoundException,
  WardAlreadyExistsException,
  WardNotFoundException
} from '@/routes/location/location.error'
import { LocationRepository } from '@/routes/location/location.repository'
import {
  CreateProvinceBodyType,
  UpdateProvinceBodyType
} from '@/routes/location/models/province.model'
import {
  BulkImportLocationBodyType,
  LocationSearchQueryType
} from '@/routes/location/models/search.model'
import {
  CreateWardBodyType,
  UpdateWardBodyType
} from '@/routes/location/models/ward.model'
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from '@/shared/helper'
import { LOCATION_MESSAGE } from '@/shared/messages/location.message'
import { PaginationQueryType } from '@/shared/models/request.model'
import { Injectable } from '@nestjs/common'

@Injectable()
export class LocationService {
  constructor(private readonly locationRepository: LocationRepository) {}

  // ==================== PROVINCE METHODS ====================

  async listProvinces(pagination: PaginationQueryType) {
    return this.locationRepository.listProvinces(pagination)
  }

  async findProvinceById(id: number) {
    const province = await this.locationRepository.findProvinceById(id)
    if (!province) {
      throw ProvinceNotFoundException
    }
    return {
      data: province,
      message: LOCATION_MESSAGE.PROVINCE_DETAIL_SUCCESS
    }
  }

  async findProvinceByIdWithWards(id: number) {
    const province = await this.locationRepository.findProvinceByIdWithWards(id)
    if (!province) {
      throw ProvinceNotFoundException
    }
    return {
      data: province,
      message: LOCATION_MESSAGE.PROVINCE_WITH_WARDS_SUCCESS
    }
  }

  async createProvince({
    data,
    createdById
  }: {
    data: CreateProvinceBodyType
    createdById: number
  }) {
    try {
      const province = await this.locationRepository.createProvince({
        createdById,
        data
      })
      return {
        data: province,
        message: LOCATION_MESSAGE.PROVINCE_CREATE_SUCCESS
      }
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw ProvinceAlreadyExistsException
      }
      throw error
    }
  }

  async updateProvince({
    id,
    data,
    updatedById
  }: {
    id: number
    data: UpdateProvinceBodyType
    updatedById: number
  }) {
    try {
      const province = await this.locationRepository.updateProvince({
        id,
        updatedById,
        data
      })
      return {
        data: province,
        message: LOCATION_MESSAGE.PROVINCE_UPDATE_SUCCESS
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw ProvinceNotFoundException
      }
      if (isUniqueConstraintPrismaError(error)) {
        throw ProvinceAlreadyExistsException
      }
      throw error
    }
  }

  async deleteProvince({ id, deletedById }: { id: number; deletedById: number }) {
    try {
      await this.locationRepository.deleteProvince({
        id,
        deletedById
      })
      return {
        message: LOCATION_MESSAGE.PROVINCE_DELETE_SUCCESS
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw ProvinceNotFoundException
      }
      throw error
    }
  }

  // ==================== WARD METHODS ====================

  async listWards(pagination: PaginationQueryType) {
    return this.locationRepository.listWards(pagination)
  }

  async listWardsByProvinceId(provinceId: number) {
    return this.locationRepository.listWardsByProvinceId(provinceId)
  }

  async findWardById(id: number) {
    const ward = await this.locationRepository.findWardById(id)
    if (!ward) {
      throw WardNotFoundException
    }
    return {
      data: ward,
      message: LOCATION_MESSAGE.WARD_DETAIL_SUCCESS
    }
  }

  async createWard({
    data,
    createdById
  }: {
    data: CreateWardBodyType
    createdById: number
  }) {
    try {
      const ward = await this.locationRepository.createWard({
        createdById,
        data
      })
      return {
        data: ward,
        message: LOCATION_MESSAGE.WARD_CREATE_SUCCESS
      }
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw WardAlreadyExistsException
      }
      throw error
    }
  }

  async updateWard({
    id,
    data,
    updatedById
  }: {
    id: number
    data: UpdateWardBodyType
    updatedById: number
  }) {
    try {
      const ward = await this.locationRepository.updateWard({
        id,
        updatedById,
        data
      })
      return {
        data: ward,
        message: LOCATION_MESSAGE.WARD_UPDATE_SUCCESS
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw WardNotFoundException
      }
      if (isUniqueConstraintPrismaError(error)) {
        throw WardAlreadyExistsException
      }
      throw error
    }
  }

  async deleteWard({ id, deletedById }: { id: number; deletedById: number }) {
    try {
      await this.locationRepository.deleteWard({
        id,
        deletedById
      })
      return {
        message: LOCATION_MESSAGE.WARD_DELETE_SUCCESS
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw WardNotFoundException
      }
      throw error
    }
  }

  // ==================== SEARCH METHODS ====================

  async searchLocations(query: LocationSearchQueryType) {
    const data = await this.locationRepository.searchLocations(query)
    return {
      data,
      meta: {
        total: data.length,
        query: query.q,
        type: query.type
      },
      message: LOCATION_MESSAGE.SEARCH_SUCCESS
    }
  }

  // ==================== BULK IMPORT ====================

  async bulkImport({
    data,
    createdById
  }: {
    data: BulkImportLocationBodyType
    createdById: number
  }) {
    const result = await this.locationRepository.bulkImportLocations({
      data,
      createdById
    })

    return {
      data: result,
      message: LOCATION_MESSAGE.BULK_IMPORT_SUCCESS
    }
  }
}
