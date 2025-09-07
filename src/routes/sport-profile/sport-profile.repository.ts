import {
  CreateSportProfileBodyType,
  GetSportProfilesResType,
  SportProfileType,
  UpdateSportProfileBodyType
} from '@/routes/sport-profile/sport-profile.model'
import { SerializeAll } from '@/shared/decorators/serialize.decorator'
import { SPORT_PROFILE_MESSAGE } from '@/shared/messages/sport.message'
import { PaginationQueryType } from '@/shared/models/request.model'
import { PrismaService } from '@/shared/services/prisma.service'
import { Injectable } from '@nestjs/common'

@Injectable()
@SerializeAll()
export class SportProfileRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async list(pagination: PaginationQueryType): Promise<GetSportProfilesResType> {
    const skip = (pagination.page - 1) * pagination.limit
    const take = pagination.limit
    const [totalItems, data] = await Promise.all([
      this.prismaService.sportProfile.count(),
      this.prismaService.sportProfile.findMany({
        skip,
        take
      })
    ])
    return {
      data,
      meta: {
        totalItems,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(totalItems / pagination.limit)
      },
      message: SPORT_PROFILE_MESSAGE.LIST_SUCCESS
    } as any
  }

  findById(id: number): Promise<SportProfileType | null> {
    return this.prismaService.sportProfile.findUnique({
      where: {
        id
      }
    }) as any
  }

  create({ data }: { data: CreateSportProfileBodyType }): Promise<SportProfileType> {
    return this.prismaService.sportProfile.create({
      data
    }) as any
  }
  update({
    id,
    data
  }: {
    id: number
    data: UpdateSportProfileBodyType
  }): Promise<SportProfileType & { roles: { id: number }[] }> {
    return this.prismaService.sportProfile.update({
      where: {
        id
      },
      data: {
        ...data
      }
    }) as any
  }

  delete({ id }: { id: number }) {
    return this.prismaService.sportProfile.delete({
      where: {
        id
      }
    }) as any
  }
}
