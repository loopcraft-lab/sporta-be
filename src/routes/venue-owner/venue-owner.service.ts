import { NotFoundRecordException } from '@/shared/error'
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from '@/shared/helper'
import { VENUE_OWNER_MESSAGE } from '@/shared/messages/venue-owner.message'
import { PaginationQueryType } from '@/shared/models/request.model'
import { Injectable } from '@nestjs/common'
import { VenueOwnerAlreadyExistsException } from './venue-owner.error'
import {
  ApproveVenueOwnerBodyType,
  CreateVenueOwnerBodyType,
  UpdateVenueOwnerBodyType,
  VenueOwnerListQueryType
} from './venue-owner.model'
import { VenueOwnerRepository } from './venue-owner.repository'

@Injectable()
export class VenueOwnerService {
  constructor(private readonly venueOwnerRepository: VenueOwnerRepository) {}

  list(pagination: PaginationQueryType, filter?: VenueOwnerListQueryType) {
    return this.venueOwnerRepository.list(pagination, filter)
  }

  async findById(id: number) {
    const vo = await this.venueOwnerRepository.findById(id)
    if (!vo) throw NotFoundRecordException
    return { data: vo, message: VENUE_OWNER_MESSAGE.DETAIL_SUCCESS }
  }

  async findByUserId(userId: number) {
    const vo = await this.venueOwnerRepository.findByUserId(userId)
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
      // FIX: Kiểm tra xem venue owner hiện tại có status là REJECTED không
      const currentVenueOwner = await this.venueOwnerRepository.findById(id)
      if (!currentVenueOwner) throw NotFoundRecordException

      // Nếu đang REJECTED và owner update lại thông tin → Tự động chuyển về PENDING
      const shouldResetToPending = currentVenueOwner.verified === 'REJECTED'

      const vo = await this.venueOwnerRepository.update({
        id,
        data,
        updatedById,
        resetToPending: shouldResetToPending
      })

      return {
        data: vo,
        message: shouldResetToPending
          ? 'Đã gửi đăng ký lại! Vui lòng đợi admin xét duyệt.'
          : VENUE_OWNER_MESSAGE.UPDATE_SUCCESS
      }
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
