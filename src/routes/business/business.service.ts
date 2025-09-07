import { BusinessAlreadyExistsException } from '@/routes/business/business.error'
import {
  CreateBusinessBodyType,
  UpdateBusinessBodyType
} from '@/routes/business/business.model'
import { BusinessRepository } from '@/routes/business/business.repository'
import { NotFoundRecordException } from '@/shared/error'
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from '@/shared/helper'
import { BUSINESS_MESSAGE } from '@/shared/messages/business.message'
import { PaginationQueryType } from '@/shared/models/request.model'
import { SharedRoleRepository } from '@/shared/repositories/shared-role.repository'
import { ForbiddenException, Injectable } from '@nestjs/common'

@Injectable()
export class BusinessService {
  constructor(
    private readonly businessRepository: BusinessRepository,
    private readonly sharedRole: SharedRoleRepository
  ) {}

  async list(pagination: PaginationQueryType) {
    const data = await this.businessRepository.list(pagination)
    return data
  }

  async findById(id: number) {
    const business = await this.businessRepository.findById(id)
    if (!business) {
      throw NotFoundRecordException
    }
    return {
      data: business,
      message: BUSINESS_MESSAGE.DETAIL_SUCCESS
    }
  }

  async create({
    data,
    createdById
  }: {
    data: CreateBusinessBodyType
    createdById: number
  }) {
    try {
      const ownerId = this.sharedRole.getOwnerRoleId()
      if ((await ownerId) !== createdById) {
        throw new ForbiddenException()
      }
      const business = await this.businessRepository.create({
        createdById,
        data
      })
      return {
        data: business,
        message: BUSINESS_MESSAGE.CREATE_SUCCESS
      }
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw BusinessAlreadyExistsException
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
    data: UpdateBusinessBodyType
    updatedById: number
  }) {
    try {
      const business = await this.businessRepository.update({
        id,
        updatedById,
        data
      })
      return {
        data: business,
        message: BUSINESS_MESSAGE.UPDATE_SUCCESS
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      if (isUniqueConstraintPrismaError(error)) {
        throw BusinessAlreadyExistsException
      }
      throw error
    }
  }

  async delete({ id, deletedById }: { id: number; deletedById: number }) {
    try {
      await this.businessRepository.delete({
        id,
        deletedById
      })
      return {
        message: BUSINESS_MESSAGE.DELETE_SUCCESS
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }
}
