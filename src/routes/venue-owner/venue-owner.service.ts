import { NotFoundRecordException } from '@/shared/error'
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from '@/shared/helper'
import { VENUE_OWNER_MESSAGE } from '@/shared/messages/venue-owner.message'
import { PaginationQueryType } from '@/shared/models/request.model'
import { Injectable } from '@nestjs/common'
import { VenueOwnerAlreadyExistsException } from './venue-owner.error'
import {
  ApproveVenueOwnerBodyType,
  CreateVenueOwnerBodyType,
  UpdateVenueOwnerBodyType
} from './venue-owner.model'
import { VenueOwnerRepository } from './venue-owner.repository'

@Injectable()
export class VenueOwnerService {
  constructor(private readonly venueOwnerRepository: VenueOwnerRepository) {}

  list(pagination: PaginationQueryType) {
    return this.venueOwnerRepository.list(pagination)
  }

  async findById(id: number) {
    const vo = await this.venueOwnerRepository.findById(id)
    if (!vo) throw NotFoundRecordException
    return { data: vo, message: VENUE_OWNER_MESSAGE.DETAIL_SUCCESS }
  }

  async create({
    data,
    createdById
  }: {
    data: CreateVenueOwnerBodyType
    createdById: number
  }) {
    try {
      const vo = await this.venueOwnerRepository.create({ data, createdById })
      return { data: vo, message: VENUE_OWNER_MESSAGE.CREATE_SUCCESS }
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw VenueOwnerAlreadyExistsException
      }
      throw error
    }
  }

  async update({
    id,
    data,
    updatedById
  }: {
    id: number
    data: UpdateVenueOwnerBodyType
    updatedById: number
  }) {
    try {
      const vo = await this.venueOwnerRepository.update({ id, data, updatedById })
      return { data: vo, message: VENUE_OWNER_MESSAGE.UPDATE_SUCCESS }
    } catch (error) {
      if (isNotFoundPrismaError(error)) throw NotFoundRecordException
      if (isUniqueConstraintPrismaError(error)) throw VenueOwnerAlreadyExistsException
      throw error
    }
  }

  async approve({
    id,
    body,
    approvedById
  }: {
    id: number
    body: ApproveVenueOwnerBodyType
    approvedById: number
  }) {
    try {
      const vo = await this.venueOwnerRepository.approve({ id, body, approvedById })
      return {
        data: vo,
        message: body.approve
          ? VENUE_OWNER_MESSAGE.APPROVE_SUCCESS
          : VENUE_OWNER_MESSAGE.REJECT_SUCCESS
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) throw NotFoundRecordException
      throw error
    }
  }

  async delete({ id, deletedById }: { id: number; deletedById: number }) {
    try {
      await this.venueOwnerRepository.delete({ id, deletedById })
      return { message: VENUE_OWNER_MESSAGE.DELETE_SUCCESS }
    } catch (error) {
      if (isNotFoundPrismaError(error)) throw NotFoundRecordException
      throw error
    }
  }
}
