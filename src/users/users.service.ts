import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, User, UserRole } from '@prisma/client';

import { UserResponseDto } from '../common/dto/user-response.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { ListUsersResponseDto } from './dto/list-users-response.dto';
import { UpdateCurrentUserDto } from './dto/update-current-user.dto';

const userResponseSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

type UserResponseRecord = Prisma.UserGetPayload<{ select: typeof userResponseSelect }>;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getCurrentUser(userId: string): Promise<UserResponseDto> {
    return this.findActiveUserOrThrow(userId);
  }

  async updateCurrentUser(userId: string, dto: UpdateCurrentUserDto): Promise<UserResponseDto> {
    const data: Prisma.UserUpdateInput = {};

    if (dto.firstName !== undefined) {
      data.firstName = dto.firstName.trim();
    }

    if (dto.lastName !== undefined) {
      data.lastName = dto.lastName.trim();
    }

    if (dto.email !== undefined) {
      data.email = dto.email.trim().toLowerCase();
    }

    if (!Object.keys(data).length) {
      return this.findActiveUserOrThrow(userId);
    }

    try {
      const user = await this.prisma.user.update({
        where: { id: userId, isActive: true },
        data,
        select: userResponseSelect,
      });

      return this.toUserResponse(user);
    } catch (error) {
      this.handleUserWriteError(error);
    }
  }

  async listUsers(query: ListUsersQueryDto): Promise<ListUsersResponseDto> {
    const page = query.page;
    const limit = query.limit;
    const where = this.buildListUsersWhere(query);

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        select: userResponseSelect,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users.map((user) => this.toUserResponse(user)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateUserRole(
    actorUserId: string,
    targetUserId: string,
    role: UserRole,
  ): Promise<UserResponseDto> {
    if (actorUserId === targetUserId) {
      throw new BadRequestException('Admins cannot change their own role.');
    }

    await this.findUserOrThrow(targetUserId);

    const user = await this.prisma.user.update({
      where: { id: targetUserId },
      data: { role },
      select: userResponseSelect,
    });

    return this.toUserResponse(user);
  }

  async deactivateUser(actorUserId: string, targetUserId: string): Promise<UserResponseDto> {
    if (actorUserId === targetUserId) {
      throw new BadRequestException('Admins cannot deactivate their own account.');
    }

    await this.findUserOrThrow(targetUserId);

    const user = await this.prisma.user.update({
      where: { id: targetUserId },
      data: { isActive: false },
      select: userResponseSelect,
    });

    await this.prisma.refreshToken.updateMany({
      where: { userId: targetUserId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    return this.toUserResponse(user);
  }

  private async findActiveUserOrThrow(userId: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, isActive: true },
      select: userResponseSelect,
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return this.toUserResponse(user);
  }

  private async findUserOrThrow(userId: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return user;
  }

  private buildListUsersWhere(query: ListUsersQueryDto): Prisma.UserWhereInput {
    const where: Prisma.UserWhereInput = {};

    if (query.role) {
      where.role = query.role;
    }

    if (query.search?.trim()) {
      const search = query.search.trim();
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  private handleUserWriteError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException('Email is already registered.');
      }

      if (error.code === 'P2025') {
        throw new NotFoundException('User not found.');
      }
    }

    throw error;
  }

  private toUserResponse(user: UserResponseRecord): UserResponseDto {
    return user;
  }
}
