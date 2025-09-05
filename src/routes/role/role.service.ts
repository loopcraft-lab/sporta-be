import {
  ProhibitedActionOnBaseRoleException,
  RoleAlreadyExistsException
} from '@/routes/role/role.error'
import { CreateRoleBodyType, UpdateRoleBodyType } from '@/routes/role/role.model'
import { RoleRepository } from '@/routes/role/role.repository'
import { RoleName } from '@/shared/constants/role.constant'
import { NotFoundRecordException } from '@/shared/error'
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from '@/shared/helper'
import { ROLE_MESSAGE } from '@/shared/messages/role.message'
import { PaginationQueryType } from '@/shared/models/request.model'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable } from '@nestjs/common'
import { Cache } from 'cache-manager'

@Injectable()
export class RoleService {
  constructor(
    private readonly roleRepo: RoleRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async list(pagination: PaginationQueryType) {
    const data = await this.roleRepo.list(pagination)
    return data
  }

  async findById(id: number) {
    const role = await this.roleRepo.findById(id)
    if (!role) {
      throw NotFoundRecordException
    }
    return {
      data: role,
      message: ROLE_MESSAGE.GET_DETAIL_SUCCESS
    }
  }

  async create({ data, createdById }: { data: CreateRoleBodyType; createdById: number }) {
    try {
      const role = await this.roleRepo.create({
        createdById,
        data
      })
      return {
        data: role,
        message: ROLE_MESSAGE.CREATE_SUCCESS
      }
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw RoleAlreadyExistsException
      }
      throw error
    }
  }

  /**
   * Kiểm tra xem role có phải là 1 trong 3 role cơ bản không
   */
  private async verifyRole(roleId: number) {
    const role = await this.roleRepo.findById(roleId)
    if (!role) {
      throw NotFoundRecordException
    }
    const baseRoles: string[] = [
      RoleName.Admin,
      RoleName.Client,
      RoleName.Moderator,
      RoleName.Owner
    ]

    if (baseRoles.includes(role.name)) {
      throw ProhibitedActionOnBaseRoleException
    }
  }

  async update({
    id,
    data,
    updatedById
  }: {
    id: number
    data: UpdateRoleBodyType
    updatedById: number
  }) {
    try {
      await this.verifyRole(id)
      const updatedRole = await this.roleRepo.update({
        id,
        updatedById,
        data
      })
      await this.cacheManager.del(`role:${updatedRole.id}`) // Xóa cache của role đã cập nhật
      return {
        data: updatedRole,
        message: ROLE_MESSAGE.UPDATE_SUCCESS
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      if (isUniqueConstraintPrismaError(error)) {
        throw RoleAlreadyExistsException
      }
      throw error
    }
  }

  async delete({ id, deletedById }: { id: number; deletedById: number }) {
    try {
      await this.verifyRole(id)
      await this.roleRepo.delete({
        id,
        deletedById
      })
      await this.cacheManager.del(`role:${id}`) // Xóa cache của role đã xóa
      return {
        message: 'Delete successfully'
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }
}
