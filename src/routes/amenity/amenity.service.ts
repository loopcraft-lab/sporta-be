import { NotFoundRecordException } from '@/shared/error'
import { isNotFoundPrismaError } from '@/shared/helper'
import { AMENITY_MESSAGE } from '@/shared/messages/amenity.message'
import { PaginationQueryType } from '@/shared/models/request.model'
import { Injectable } from '@nestjs/common'
import { CreateAmenityBodyType, UpdateAmenityBodyType } from './amenity.model'
import { AmenityRepository } from './amenity.repository'

@Injectable()
export class AmenityService {
  constructor(private readonly repo: AmenityRepository) {}

  list(pagination: PaginationQueryType) {
    return this.repo.list(pagination)
  }

  async findById(id: number) {
    const record = await this.repo.findById(id)
    if (!record) throw NotFoundRecordException
    return { data: record, message: AMENITY_MESSAGE.DETAIL_SUCCESS }
  }

  async create({
    data,
    createdById
  }: {
    data: CreateAmenityBodyType
    createdById: number
  }) {
    const record = await this.repo.create({ data, createdById })
    return { data: record, message: AMENITY_MESSAGE.CREATE_SUCCESS }
  }

  async update({
    id,
    data,
    updatedById
  }: {
    id: number
    data: UpdateAmenityBodyType
    updatedById: number
  }) {
    try {
      const record = await this.repo.update({ id, data, updatedById })
      return { data: record, message: AMENITY_MESSAGE.UPDATE_SUCCESS }
    } catch (e) {
      if (isNotFoundPrismaError(e)) throw NotFoundRecordException
      throw e
    }
  }

  async delete({ id, deletedById }: { id: number; deletedById: number }) {
    try {
      await this.repo.delete({ id, deletedById })
      return { message: AMENITY_MESSAGE.DELETE_SUCCESS }
    } catch (e) {
      if (isNotFoundPrismaError(e)) throw NotFoundRecordException
      throw e
    }
  }
}
