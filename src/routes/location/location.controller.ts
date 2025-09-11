import {
  CreateDistrictBodyDTO,
  GetDistrictDetailResDTO,
  GetDistrictsByProvinceResDTO,
  GetDistrictsResDTO,
  GetDistrictWithWardsResDTO,
  UpdateDistrictBodyDTO
} from '@/routes/location/dtos/district.dto'
import {
  GetDistrictsByProvinceParamsDTO,
  GetWardsByDistrictParamsDTO
} from '@/routes/location/dtos/params.dto'
import {
  CreateProvinceBodyDTO,
  GetProvinceDetailResDTO,
  GetProvincesResDTO,
  GetProvinceWithDistrictsResDTO,
  UpdateProvinceBodyDTO
} from '@/routes/location/dtos/province.dto'
import {
  BulkImportLocationBodyDTO,
  BulkImportLocationResDTO,
  GetLocationSearchResDTO,
  LocationSearchQueryDTO
} from '@/routes/location/dtos/search.dto'
import {
  CreateWardBodyDTO,
  GetWardDetailResDTO,
  GetWardsByDistrictResDTO,
  GetWardsResDTO,
  UpdateWardBodyDTO
} from '@/routes/location/dtos/ward.dto'
import { LocationService } from '@/routes/location/location.service'
import { ActiveUser } from '@/shared/decorators/active-user.decorator'
import { IsPublic } from '@/shared/decorators/auth.decorator'
import { GetByIdParamsDTO, PaginationQueryDTO } from '@/shared/dtos/request.dto'
import { MessageResDTO } from '@/shared/dtos/response.dto'
import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { ZodResponse } from 'nestjs-zod'

@ApiTags('Location')
@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  // ==================== PUBLIC APIS ====================

  @Get('search')
  @IsPublic()
  @ZodResponse({ type: GetLocationSearchResDTO })
  search(@Query() query: LocationSearchQueryDTO) {
    return this.locationService.searchLocations(query)
  }

  @Get('provinces')
  @IsPublic()
  @ZodResponse({ type: GetProvincesResDTO })
  getProvinces(@Query() query: PaginationQueryDTO) {
    return this.locationService.listProvinces({
      page: query.page,
      limit: query.limit
    })
  }

  @Get('provinces/:provinceId/districts')
  @IsPublic()
  @ZodResponse({ type: GetDistrictsByProvinceResDTO })
  getDistrictsByProvince(@Param() params: GetDistrictsByProvinceParamsDTO) {
    return this.locationService.listDistrictsByProvinceId(params.provinceId)
  }

  @Get('districts/:districtId/wards')
  @IsPublic()
  @ZodResponse({ type: GetWardsByDistrictResDTO })
  getWardsByDistrict(@Param() params: GetWardsByDistrictParamsDTO) {
    return this.locationService.listWardsByDistrictId(params.districtId)
  }

  @Get('provinces/:id/full')
  @IsPublic()
  @ZodResponse({ type: GetProvinceWithDistrictsResDTO })
  getProvinceWithDistricts(@Param() params: GetByIdParamsDTO) {
    return this.locationService.findProvinceByIdWithDistricts(params.id)
  }

  @Get('districts/:id/full')
  @IsPublic()
  @ZodResponse({ type: GetDistrictWithWardsResDTO })
  getDistrictWithWards(@Param() params: GetByIdParamsDTO) {
    return this.locationService.findDistrictByIdWithWards(params.id)
  }

  // ==================== ADMIN APIS - PROVINCES ====================

  @Get('admin/provinces')
  @ApiBearerAuth()
  @ZodResponse({ type: GetProvincesResDTO })
  getProvincesAdmin(@Query() query: PaginationQueryDTO) {
    return this.locationService.listProvinces({
      page: query.page,
      limit: query.limit
    })
  }

  @Get('admin/provinces/:id')
  @ApiBearerAuth()
  @ZodResponse({ type: GetProvinceDetailResDTO })
  getProvinceById(@Param() params: GetByIdParamsDTO) {
    return this.locationService.findProvinceById(params.id)
  }

  @Post('admin/provinces')
  @ApiBearerAuth()
  @ZodResponse({ type: GetProvinceDetailResDTO })
  createProvince(
    @Body() body: CreateProvinceBodyDTO,
    @ActiveUser('userId') userId: number
  ) {
    return this.locationService.createProvince({
      data: body,
      createdById: userId
    })
  }

  @Put('admin/provinces/:id')
  @ApiBearerAuth()
  @ZodResponse({ type: GetProvinceDetailResDTO })
  updateProvince(
    @Body() body: UpdateProvinceBodyDTO,
    @Param() params: GetByIdParamsDTO,
    @ActiveUser('userId') userId: number
  ) {
    return this.locationService.updateProvince({
      data: body,
      id: params.id,
      updatedById: userId
    })
  }

  @Delete('admin/provinces/:id')
  @ApiBearerAuth()
  @ZodResponse({ type: MessageResDTO })
  deleteProvince(
    @Param() params: GetByIdParamsDTO,
    @ActiveUser('userId') userId: number
  ) {
    return this.locationService.deleteProvince({
      id: params.id,
      deletedById: userId
    })
  }

  // ==================== ADMIN APIS - DISTRICTS ====================

  @Get('admin/districts')
  @ApiBearerAuth()
  @ZodResponse({ type: GetDistrictsResDTO })
  getDistrictsAdmin(@Query() query: PaginationQueryDTO) {
    return this.locationService.listDistricts({
      page: query.page,
      limit: query.limit
    })
  }

  @Get('admin/districts/:id')
  @ApiBearerAuth()
  @ZodResponse({ type: GetDistrictDetailResDTO })
  getDistrictById(@Param() params: GetByIdParamsDTO) {
    return this.locationService.findDistrictById(params.id)
  }

  @Post('admin/districts')
  @ApiBearerAuth()
  @ZodResponse({ type: GetDistrictDetailResDTO })
  createDistrict(
    @Body() body: CreateDistrictBodyDTO,
    @ActiveUser('userId') userId: number
  ) {
    return this.locationService.createDistrict({
      data: body,
      createdById: userId
    })
  }

  @Put('admin/districts/:id')
  @ApiBearerAuth()
  @ZodResponse({ type: GetDistrictDetailResDTO })
  updateDistrict(
    @Body() body: UpdateDistrictBodyDTO,
    @Param() params: GetByIdParamsDTO,
    @ActiveUser('userId') userId: number
  ) {
    return this.locationService.updateDistrict({
      data: body,
      id: params.id,
      updatedById: userId
    })
  }

  @Delete('admin/districts/:id')
  @ApiBearerAuth()
  @ZodResponse({ type: MessageResDTO })
  deleteDistrict(
    @Param() params: GetByIdParamsDTO,
    @ActiveUser('userId') userId: number
  ) {
    return this.locationService.deleteDistrict({
      id: params.id,
      deletedById: userId
    })
  }

  // ==================== ADMIN APIS - WARDS ====================

  @Get('admin/wards')
  @ApiBearerAuth()
  @ZodResponse({ type: GetWardsResDTO })
  getWardsAdmin(@Query() query: PaginationQueryDTO) {
    return this.locationService.listWards({
      page: query.page,
      limit: query.limit
    })
  }

  @Get('admin/wards/:id')
  @ApiBearerAuth()
  @ZodResponse({ type: GetWardDetailResDTO })
  getWardById(@Param() params: GetByIdParamsDTO) {
    return this.locationService.findWardById(params.id)
  }

  @Post('admin/wards')
  @ApiBearerAuth()
  @ZodResponse({ type: GetWardDetailResDTO })
  createWard(@Body() body: CreateWardBodyDTO, @ActiveUser('userId') userId: number) {
    return this.locationService.createWard({
      data: body,
      createdById: userId
    })
  }

  @Put('admin/wards/:id')
  @ApiBearerAuth()
  @ZodResponse({ type: GetWardDetailResDTO })
  updateWard(
    @Body() body: UpdateWardBodyDTO,
    @Param() params: GetByIdParamsDTO,
    @ActiveUser('userId') userId: number
  ) {
    return this.locationService.updateWard({
      data: body,
      id: params.id,
      updatedById: userId
    })
  }

  @Delete('admin/wards/:id')
  @ApiBearerAuth()
  @ZodResponse({ type: MessageResDTO })
  deleteWard(@Param() params: GetByIdParamsDTO, @ActiveUser('userId') userId: number) {
    return this.locationService.deleteWard({
      id: params.id,
      deletedById: userId
    })
  }

  // ==================== BULK OPERATIONS ====================

  @Post('admin/bulk-import')
  @ApiBearerAuth()
  @ZodResponse({ type: BulkImportLocationResDTO })
  bulkImport(
    @Body() body: BulkImportLocationBodyDTO,
    @ActiveUser('userId') userId: number
  ) {
    return this.locationService.bulkImport({
      data: body,
      createdById: userId
    })
  }
}
