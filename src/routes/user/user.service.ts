import {
  CannotUpdateOrDeleteYourselfException,
  RoleNotFoundException,
  UserAlreadyExistsException
} from '@/routes/user/user.error'
import { CreateUserBodyType, UpdateUserBodyType } from '@/routes/user/user.model'
import { UserRepository } from '@/routes/user/user.repository'
import { RoleName } from '@/shared/constants/role.constant'
import { NotFoundRecordException } from '@/shared/error'
import {
  isForeignKeyConstraintPrismaError,
  isNotFoundPrismaError,
  isUniqueConstraintPrismaError
} from '@/shared/helper'
import { USER_MESSAGE } from '@/shared/messages/user.message'
import { PaginationQueryType } from '@/shared/models/request.model'
import { SharedRoleRepository } from '@/shared/repositories/shared-role.repository'
import { SharedUserRepository } from '@/shared/repositories/shared-user.repository'
import { HashingService } from '@/shared/services/hashing.service'
import { ForbiddenException, Injectable } from '@nestjs/common'

@Injectable()
export class UserService {
  constructor(
    private readonly userRepo: UserRepository,
    private hashingService: HashingService,
    private sharedUserRepository: SharedUserRepository,
    private sharedRoleRepository: SharedRoleRepository
  ) {}

  list(pagination: PaginationQueryType) {
    return this.userRepo.list(pagination)
  }

  async findById(id: number) {
    const user = await this.sharedUserRepository.findUniqueIncludeRolePermissions({
      id
    })
    if (!user) {
      throw NotFoundRecordException
    }
    return {
      data: user,
      message: USER_MESSAGE.GET_DETAIL_SUCCESS
    }
  }

  async create({
    data,
    createdById,
    createdByRoleName
  }: {
    data: CreateUserBodyType
    createdById: number
    createdByRoleName: string
  }) {
    try {
      // Chỉ có admin agent mới có quyền tạo user với role là admin
      await this.verifyRole({
        roleNameAgent: createdByRoleName,
        roleIdTarget: data.roleId
      })
      // Hash the password
      const hashedPassword = await this.hashingService.hash(data.password)

      const user = await this.userRepo.create({
        createdById,
        data: {
          ...data,
          password: hashedPassword
        }
      })
      return {
        data: user,
        message: USER_MESSAGE.CREATE_SUCCESS
      }
    } catch (error) {
      if (isForeignKeyConstraintPrismaError(error)) {
        throw RoleNotFoundException
      }

      if (isUniqueConstraintPrismaError(error)) {
        throw UserAlreadyExistsException
      }
      throw error
    }
  }

  /**
   * Function này kiểm tra xem người thực hiện có quyền tác động đến người khác không.
   * Vì chỉ có người thực hiện là admin role mới có quyền sau: Tạo admin user, update roleId thành admin, xóa admin user.
   * Còn nếu không phải admin thì không được phép tác động đến admin
   */
  private async verifyRole({ roleNameAgent, roleIdTarget }) {
    // Agent là admin thì cho phép
    if (roleNameAgent === RoleName.Admin) {
      return true
    } else {
      // Agent không phải admin thì roleIdTarget phải khác admin
      const adminRoleId = await this.sharedRoleRepository.getAdminRoleId()
      if (roleIdTarget === adminRoleId) {
        throw new ForbiddenException()
      }
      return true
    }
  }

  async update({
    id,
    data,
    updatedById,
    updatedByRoleName
  }: {
    id: number
    data: UpdateUserBodyType
    updatedById: number
    updatedByRoleName: string
  }) {
    try {
      // Không thể cập nhật chính mình
      this.verifyYourself({
        userAgentId: updatedById,
        userTargetId: id
      })

      // Lấy roleId ban đầu của người được update để kiểm tra xem liệu người update có quyền update không
      // Không dùng data.roleId vì dữ liệu này có thể bị cố tình truyền sai
      const roleIdTarget = await this.getRoleIdByUserId(id)
      await this.verifyRole({
        roleNameAgent: updatedByRoleName,
        roleIdTarget
      })

      const updatedUser = await this.sharedUserRepository.update(
        { id },
        {
          ...data,
          updatedById
        }
      )
      return {
        data: updatedUser,
        message: USER_MESSAGE.UPDATE_SUCCESS
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      if (isUniqueConstraintPrismaError(error)) {
        throw UserAlreadyExistsException
      }
      if (isForeignKeyConstraintPrismaError(error)) {
        throw RoleNotFoundException
      }
      throw error
    }
  }

  private async getRoleIdByUserId(userId: number) {
    const currentUser = await this.sharedUserRepository.findUnique({
      id: userId
    })
    if (!currentUser) {
      throw NotFoundRecordException
    }
    return currentUser.roleId
  }

  private verifyYourself({
    userAgentId,
    userTargetId
  }: {
    userAgentId: number
    userTargetId: number
  }) {
    if (userAgentId === userTargetId) {
      throw CannotUpdateOrDeleteYourselfException
    }
  }

  async delete({
    id,
    deletedById,
    deletedByRoleName
  }: {
    id: number
    deletedById: number
    deletedByRoleName: string
  }) {
    try {
      // Không thể xóa chính mình
      this.verifyYourself({
        userAgentId: deletedById,
        userTargetId: id
      })

      const roleIdTarget = await this.getRoleIdByUserId(id)
      await this.verifyRole({
        roleNameAgent: deletedByRoleName,
        roleIdTarget
      })

      await this.userRepo.delete({
        id,
        deletedById
      })
      return {
        message: USER_MESSAGE.DELETE_SUCCESS
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }
}
