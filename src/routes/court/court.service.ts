import { NotFoundRecordException } from '@/shared/error'
import { isNotFoundPrismaError } from '@/shared/helper'
import { COURT_MESSAGE } from '@/shared/messages/court.message'
import { PaginationQueryType } from '@/shared/models/request.model'
import { Injectable } from '@nestjs/common'
import {
  CourtListQueryType,
  CreateCourtBodyType,
  GetCourtDetailResType,
  GetCourtsResType,
  UpdateCourtBodyType
} from './court.model'
import { CourtRepository } from './court.repository'

@Injectable()
export class CourtService {
  constructor(private readonly repository: CourtRepository) {}

  async list(
    pagination: PaginationQueryType,
    filter?: CourtListQueryType
  ): Promise<GetCourtsResType> {
    return this.repository.list(pagination, filter)
  }

  async detail(id: number): Promise<GetCourtDetailResType> {
    const record = await this.repository.findById(id)
    if (!record) throw NotFoundRecordException
    return { data: record, message: COURT_MESSAGE.DETAIL_SUCCESS } as any
  }

  async create(
    data: CreateCourtBodyType,
    userId: number | null
  ): Promise<GetCourtDetailResType> {
    const record = await this.repository.create({
      data,
      createdById: (userId ?? undefined) as unknown as number
    })
    return { data: record, message: COURT_MESSAGE.CREATE_SUCCESS } as any
  }

  async update(
    id: number,
    data: UpdateCourtBodyType,
    userId: number
  ): Promise<GetCourtDetailResType> {
    try {
      const record = await this.repository.update({ id, data, updatedById: userId })
      return { data: record, message: COURT_MESSAGE.UPDATE_SUCCESS } as any
    } catch (error) {
      if (isNotFoundPrismaError(error)) throw NotFoundRecordException
      throw error
    }
  }

  async delete(id: number, userId: number): Promise<GetCourtDetailResType> {
    try {
      const record = await this.repository.delete({ id, deletedById: userId })
      return { data: record, message: COURT_MESSAGE.DELETE_SUCCESS } as any
    } catch (error) {
      if (isNotFoundPrismaError(error)) throw NotFoundRecordException
      throw error
    }
  }
}
