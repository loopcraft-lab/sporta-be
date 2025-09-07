import { SportAlreadyExistsException } from '@/routes/sport/sport.error'
import { CreateSportBodyType, UpdateSportBodyType } from '@/routes/sport/sport.model'
import { SportRepository } from '@/routes/sport/sport.repository'
import { NotFoundRecordException } from '@/shared/error'
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from '@/shared/helper'
import { SPORT_MESSAGE } from '@/shared/messages/sport.message'
import { PaginationQueryType } from '@/shared/models/request.model'
import { Injectable } from '@nestjs/common'

@Injectable()
export class SportService {
  constructor(private readonly sportRepository: SportRepository) {}

  async list(pagination: PaginationQueryType) {
    const data = await this.sportRepository.list(pagination)
    return data
  }

  async findById(id: number) {
    const sport = await this.sportRepository.findById(id)
    if (!sport) {
      throw NotFoundRecordException
    }
    return {
      data: sport,
      message: SPORT_MESSAGE.DETAIL_SUCCESS
    }
  }

  async create({
    data,
    createdById
  }: {
    data: CreateSportBodyType
    createdById: number
  }) {
    try {
      const sport = await this.sportRepository.create({
        createdById,
        data
      })
      return {
        data: sport,
        message: SPORT_MESSAGE.CREATE_SUCCESS
      }
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw SportAlreadyExistsException
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
    data: UpdateSportBodyType
    updatedById: number
  }) {
    try {
      const sport = await this.sportRepository.update({
        id,
        updatedById,
        data
      })
      return {
        data: sport,
        message: SPORT_MESSAGE.UPDATE_SUCCESS
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      if (isUniqueConstraintPrismaError(error)) {
        throw SportAlreadyExistsException
      }
      throw error
    }
  }

  async delete({ id, deletedById }: { id: number; deletedById: number }) {
    try {
      await this.sportRepository.delete({
        id,
        deletedById
      })
      return {
        message: SPORT_MESSAGE.DELETE_SUCCESS
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }
}
