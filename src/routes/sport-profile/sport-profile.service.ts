import {
  CreateSportProfileBodyType,
  UpdateSportProfileBodyType
} from '@/routes/sport-profile/sport-profile.model'
import { SportProfileRepository } from '@/routes/sport-profile/sport-profile.repository'
import { SportAlreadyExistsException } from '@/routes/sport/sport.error'
import { NotFoundRecordException } from '@/shared/error'
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from '@/shared/helper'
import { SPORT_PROFILE_MESSAGE } from '@/shared/messages/sport.message'
import { PaginationQueryType } from '@/shared/models/request.model'
import { Injectable } from '@nestjs/common'

@Injectable()
export class SportProfileService {
  constructor(private readonly sportProfileRepository: SportProfileRepository) {}

  async list(pagination: PaginationQueryType) {
    const data = await this.sportProfileRepository.list(pagination)
    return data
  }

  async findById(id: number) {
    const sport = await this.sportProfileRepository.findById(id)
    if (!sport) {
      throw NotFoundRecordException
    }
    return {
      data: sport,
      message: SPORT_PROFILE_MESSAGE.DETAIL_SUCCESS
    }
  }

  async create({ data }: { data: CreateSportProfileBodyType }) {
    try {
      const sport = await this.sportProfileRepository.create({
        data
      })
      return {
        data: sport,
        message: SPORT_PROFILE_MESSAGE.CREATE_SUCCESS
      }
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw SportAlreadyExistsException
      }
      throw error
    }
  }

  async update({ id, data }: { id: number; data: UpdateSportProfileBodyType }) {
    try {
      const sport = await this.sportProfileRepository.update({
        id,
        data
      })
      return {
        data: sport,
        message: SPORT_PROFILE_MESSAGE.UPDATE_SUCCESS
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

  async delete({ id }: { id: number }) {
    try {
      await this.sportProfileRepository.delete({
        id
      })
      return {
        message: SPORT_PROFILE_MESSAGE.DELETE_SUCCESS
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }
}
