import { SerializeAll } from '@/shared/decorators/serialize.decorator'
import { COURT_AMENITY_MESSAGE } from '@/shared/messages/court-amenity.message'
import { PrismaService } from '@/shared/services/prisma.service'
import { Injectable } from '@nestjs/common'
import {
  AttachCourtAmenityBodyType,
  BulkSetCourtAmenitiesBodyType,
  CourtAmenityType,
  GetCourtAmenitiesResType
} from './court-amenity.model'

@Injectable()
@SerializeAll()
export class CourtAmenityRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(courtId: number): Promise<GetCourtAmenitiesResType> {
    const data = await this.prisma.courtAmenity.findMany({
      where: { courtId },
      orderBy: { id: 'asc' }
    })
    return { data, message: COURT_AMENITY_MESSAGE.LIST_SUCCESS } as any
  }

  attach({ courtId, amenityId }: AttachCourtAmenityBodyType): Promise<CourtAmenityType> {
    return this.prisma.courtAmenity.create({
      data: { courtId, amenityId }
    }) as any
  }

  detach({ courtId, amenityId }: AttachCourtAmenityBodyType) {
    return this.prisma.courtAmenity.delete({
      where: {
        courtId_amenityId: { courtId, amenityId }
      }
    }) as any
  }

  async bulkSet({ courtId, amenityIds }: BulkSetCourtAmenitiesBodyType) {
    return this.prisma.$transaction(async (tx) => {
      // Delete those not in amenityIds
      await tx.courtAmenity.deleteMany({
        where: {
          courtId,
          amenityId: { notIn: amenityIds.length ? amenityIds : [0] }
        }
      })
      if (amenityIds.length) {
        await tx.courtAmenity.createMany({
          data: amenityIds.map((amenityId) => ({ courtId, amenityId })),
          skipDuplicates: true
        })
      }
      const data = await tx.courtAmenity.findMany({
        where: { courtId },
        orderBy: { id: 'asc' }
      })
      return { data, message: COURT_AMENITY_MESSAGE.BULK_SET_SUCCESS } as any
    })
  }
}
