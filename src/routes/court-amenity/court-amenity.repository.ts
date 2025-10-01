import { SerializeAll } from '@/shared/decorators/serialize.decorator'
import { NotFoundRecordException } from '@/shared/error'
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
    const court = await this.prisma.court.findFirst({
      where: { id: courtId, deletedAt: null }
    })
    if (!court) throw NotFoundRecordException
    const data = await this.prisma.courtAmenity.findMany({
      where: { courtId },
      orderBy: { id: 'asc' }
    })
    return { data, message: COURT_AMENITY_MESSAGE.LIST_SUCCESS } as any
  }

  async attach({
    courtId,
    amenityId
  }: AttachCourtAmenityBodyType): Promise<CourtAmenityType> {
    const [court, amenity] = await Promise.all([
      this.prisma.court.findFirst({ where: { id: courtId, deletedAt: null } }),
      this.prisma.amenity.findFirst({ where: { id: amenityId, deletedAt: null } })
    ])
    if (!court || !amenity) throw NotFoundRecordException
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
    const court = await this.prisma.court.findFirst({
      where: { id: courtId, deletedAt: null }
    })
    if (!court) throw NotFoundRecordException
    if (amenityIds.length) {
      const amenities = await this.prisma.amenity.findMany({
        where: { id: { in: amenityIds }, deletedAt: null }
      })
      if (amenities.length !== amenityIds.length) throw NotFoundRecordException
    }
    return this.prisma.$transaction(async (tx) => {
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
