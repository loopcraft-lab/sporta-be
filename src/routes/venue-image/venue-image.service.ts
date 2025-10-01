import { NotFoundRecordException } from '@/shared/error'
import { isNotFoundPrismaError } from '@/shared/helper'
import { VENUE_IMAGE_MESSAGE } from '@/shared/messages/venue-image.message'
import { PaginationQueryType } from '@/shared/models/request.model'
import { Injectable } from '@nestjs/common'
import {
  CreateVenueImageBodyType,
  ReorderVenueImagesBodyType,
  UpdateVenueImageBodyType
} from './venue-image.model'
import { VenueImageRepository } from './venue-image.repository'

@Injectable()
export class VenueImageService {
  constructor(private readonly repo: VenueImageRepository) {}

  list(pagination: PaginationQueryType, filter?: { courtId?: number }) {
    return this.repo.list(pagination, filter)
  }

  async findById(id: number) {
    const img = await this.repo.findById(id)
    if (!img) throw NotFoundRecordException
    return { data: img, message: VENUE_IMAGE_MESSAGE.DETAIL_SUCCESS }
  }

  async create({
    data,
    createdById
  }: {
    data: CreateVenueImageBodyType
    createdById: number
  }) {
    const img = await this.repo.create({ data, createdById })
    return { data: img, message: VENUE_IMAGE_MESSAGE.CREATE_SUCCESS }
  }

  async update({
    id,
    data,
    updatedById
  }: {
    id: number
    data: UpdateVenueImageBodyType
    updatedById: number
  }) {
    try {
      const img = await this.repo.update({ id, data, updatedById })
      return { data: img, message: VENUE_IMAGE_MESSAGE.UPDATE_SUCCESS }
    } catch (e) {
      if (isNotFoundPrismaError(e)) throw NotFoundRecordException
      throw e
    }
  }

  async reorder({
    data,
    updatedById
  }: {
    data: ReorderVenueImagesBodyType
    updatedById: number
  }) {
    await this.repo.reorder({ items: data.items, updatedById })
    return { message: VENUE_IMAGE_MESSAGE.REORDER_SUCCESS }
  }

  async delete({ id, deletedById }: { id: number; deletedById: number }) {
    try {
      await this.repo.delete({ id, deletedById })
      return { message: VENUE_IMAGE_MESSAGE.DELETE_SUCCESS }
    } catch (e) {
      if (isNotFoundPrismaError(e)) throw NotFoundRecordException
      throw e
    }
  }
}
