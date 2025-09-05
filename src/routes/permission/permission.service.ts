import { PermissionAlreadyExistsException } from '@/routes/permission/permission.error'
import {
  CreatePermissionBodyType,
  UpdatePermissionBodyType
} from '@/routes/permission/permission.model'
import { PermissionRepository } from '@/routes/permission/permission.repository'
import { NotFoundRecordException } from '@/shared/error'
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from '@/shared/helper'
import { PERMISSION_MESSAGE } from '@/shared/messages/permission.message'
import { PaginationQueryType } from '@/shared/models/request.model'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable } from '@nestjs/common'
import { Cache } from 'cache-manager'

@Injectable()
export class PermissionService {
  constructor(
    private permissionRepo: PermissionRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async list(pagination: PaginationQueryType) {
    const data = await this.permissionRepo.list(pagination)
    return data
  }

  async findById(id: number) {
    const permission = await this.permissionRepo.findById(id)
    if (!permission) {
      throw NotFoundRecordException
    }
    return {
      data: permission,
      message: PERMISSION_MESSAGE.DETAIL_SUCCESS
    }
  }

  async create({
    data,
    createdById
  }: {
    data: CreatePermissionBodyType
    createdById: number
  }) {
    try {
      const permission = await this.permissionRepo.create({
        createdById,
        data
      })
      return {
        data: permission,
        message: PERMISSION_MESSAGE.CREATE_SUCCESS
      }
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw PermissionAlreadyExistsException
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
    data: UpdatePermissionBodyType
    updatedById: number
  }) {
    try {
      const permission = await this.permissionRepo.update({
        id,
        updatedById,
        data
      })
      const { roles } = permission
      await this.deleteCachedRole(roles)
      return {
        data: permission,
        message: PERMISSION_MESSAGE.UPDATE_SUCCESS
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      if (isUniqueConstraintPrismaError(error)) {
        throw PermissionAlreadyExistsException
      }
      throw error
    }
  }

  async delete({ id, deletedById }: { id: number; deletedById: number }) {
    try {
      const permission = await this.permissionRepo.delete({
        id,
        deletedById
      })
      const { roles } = permission
      await this.deleteCachedRole(roles)
      return {
        message: PERMISSION_MESSAGE.DELETE_SUCCESS
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }

  deleteCachedRole(roles: { id: number }[]) {
    return Promise.all(
      roles.map((role) => {
        const cacheKey = `role:${role.id}`
        return this.cacheManager.del(cacheKey)
      })
    )
  }
}
