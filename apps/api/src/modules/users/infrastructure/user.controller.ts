// apps/api/src/modules/users/infrastructure/user.controller.ts
import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser, Roles } from '../../../shared/decorators';
import { JwtAuthGuard, RolesGuard, TenantGuard } from '../../../shared/guards';
import { JwtPayload } from '../../../shared/types/jwt-payload.type';
import { UserService } from '../application/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly user: UserService) {}

  @Get()
  @Roles('CLINIC_ADMIN')
  @ApiOperation({ summary: 'List clinic staff users (admin only)' })
  @ApiQuery({ name: 'clinicId', required: true })
  @ApiResponse({ status: 200, description: 'Array of users with their clinic roles' })
  async listByClinic(@Query('clinicId') clinicId: string, @CurrentUser() user: JwtPayload) {
    return this.user.getByClinicIdTenantScoped(clinicId, user.clinicId, user.isSuperAdmin);
  }

  @Get(':userId')
  @UseGuards(TenantGuard)
  @Roles('CLINIC_ADMIN')
  @ApiOperation({ summary: 'Get a single staff user' })
  @ApiResponse({ status: 200, description: 'User with clinic role info' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getById(@Param('userId') userId: string, @CurrentUser() user: JwtPayload) {
    return this.user.getByIdTenantScoped(userId, user.clinicId, user.isSuperAdmin);
  }

  @Post()
  @Roles('CLINIC_ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a staff user and assign a clinic role',
    description: 'Creates the User row and a ClinicUser row with the specified role.',
  })
  @ApiResponse({ status: 201, description: 'User created and assigned to clinic' })
  @ApiResponse({ status: 409, description: 'Email or phone already in use' })
  async create(@Body() dto: CreateUserDto, @CurrentUser() user: JwtPayload) {
    if (!user.isSuperAdmin && user.clinicId !== dto.clinicId) {
      throw new ForbiddenException('Clinic mismatch');
    }
    return this.user.create(dto);
  }

  @Patch(':userId')
  @UseGuards(TenantGuard)
  @Roles('CLINIC_ADMIN')
  @ApiOperation({ summary: 'Update a staff user (name, phone, role)' })
  @ApiResponse({ status: 200, description: 'Updated user' })
  async update(
    @Param('userId') userId: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.user.getByIdTenantScoped(userId, user.clinicId, user.isSuperAdmin);
    return this.user.update(userId, dto);
  }

  @Delete(':userId')
  @UseGuards(TenantGuard)
  @Roles('CLINIC_ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a staff user from the clinic' })
  @ApiResponse({ status: 204, description: 'User removed' })
  async delete(@Param('userId') userId: string, @CurrentUser() user: JwtPayload) {
    await this.user.getByIdTenantScoped(userId, user.clinicId, user.isSuperAdmin);
    return this.user.delete(userId);
  }
}
