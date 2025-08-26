import { PrismaService } from '@/shared/services/prisma.service'
import { Injectable } from '@nestjs/common'

@Injectable()
export class RoleRepository {
  constructor(private readonly prismaService: PrismaService) {}
}
