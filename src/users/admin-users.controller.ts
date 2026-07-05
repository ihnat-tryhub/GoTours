import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserResponseDto } from '../common/dto/user-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { ListUsersResponseDto } from './dto/list-users-response.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UsersService } from './users.service';

@ApiTags('admin users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOkResponse({ type: ListUsersResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @ApiForbiddenResponse({ description: 'Admin role is required.' })
  listUsers(@Query() query: ListUsersQueryDto): Promise<ListUsersResponseDto> {
    return this.usersService.listUsers(query);
  }

  @Patch(':id/role')
  @ApiOkResponse({ type: UserResponseDto })
  @ApiBadRequestResponse({ description: 'Admins cannot change their own role.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @ApiForbiddenResponse({ description: 'Admin role is required.' })
  @ApiNotFoundResponse({ description: 'User not found.' })
  updateUserRole(
    @CurrentUser('id') actorUserId: string,
    @Param('id', new ParseUUIDPipe()) targetUserId: string,
    @Body() dto: UpdateUserRoleDto,
  ): Promise<UserResponseDto> {
    return this.usersService.updateUserRole(actorUserId, targetUserId, dto.role);
  }

  @Patch(':id/deactivate')
  @ApiOkResponse({ type: UserResponseDto })
  @ApiBadRequestResponse({ description: 'Admins cannot deactivate their own account.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @ApiForbiddenResponse({ description: 'Admin role is required.' })
  @ApiNotFoundResponse({ description: 'User not found.' })
  deactivateUser(
    @CurrentUser('id') actorUserId: string,
    @Param('id', new ParseUUIDPipe()) targetUserId: string,
  ): Promise<UserResponseDto> {
    return this.usersService.deactivateUser(actorUserId, targetUserId);
  }
}
