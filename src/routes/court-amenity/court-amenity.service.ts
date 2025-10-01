import { NotFoundRecordException } from '@/shared/error'
import { isNotFoundPrismaError } from '@/shared/helper'
import { COURT_AMENITY_MESSAGE } from '@/shared/messages/court-amenity.message'
import { Injectable } from '@nestjs/common'
import {
  AttachCourtAmenityBodyType,
  BulkSetCourtAmenitiesBodyType
} from './court-amenity.model'
import { CourtAmenityRepository } from './court-amenity.repository'

@Injectable()
export class CourtAmenityService {
  constructor(private readonly repo: CourtAmenityRepository) {}

  list(courtId: number) {
    return this.repo.list(courtId)
  }

  async attach(body: AttachCourtAmenityBodyType) {
    try {
      const record = await this.repo.attach(body)
      return { data: record, message: COURT_AMENITY_MESSAGE.ATTACH_SUCCESS }
    } catch (e) {
      console.log(e)
      throw e
    }
  }

  async detach(body: AttachCourtAmenityBodyType) {
    try {
      await this.repo.detach(body)
      return { message: COURT_AMENITY_MESSAGE.DETACH_SUCCESS }
    } catch (e) {
      if (isNotFoundPrismaError(e)) throw NotFoundRecordException
      throw e
    }
  }

  async bulkSet(body: BulkSetCourtAmenitiesBodyType) {
    return this.repo.bulkSet(body)
  }
}
