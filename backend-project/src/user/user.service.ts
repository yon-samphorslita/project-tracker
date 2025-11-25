import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { ActivityService } from 'src/activity/activity.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly activityService: ActivityService,
  ) {}

  async createUser(
    createUserDto: CreateUserDto,
    performedById: number,
  ): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email.trim().toLowerCase() },
    });

    if (existingUser) throw new ConflictException('Email already exists');

    const user = this.userRepository.create({ ...createUserDto });
    await this.userRepository.save(user);

    await this.activityService.logAction(
      performedById,
      `Created user "${user.first_name} ${user.last_name}" (email: ${user.email}, role: ${user.role})`,
    );

    return user;
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({ relations: ['team'] });
  }

  async findOne(id: number, includePassword = false): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: [
        'team',
        'pmTeams',
        'secondaryTeams',
        'projects',
        'tasks',
        'activities',
        'notifications',
      ],
      // select: includePassword
      //   ? [
      //       'id',
      //       'email',
      //       'role',
      //       'first_name',
      //       'last_name',
      //       'img_url',
      //       'active',
      //       'password',
      //       'password_changed',
      //       'otp_code',
      //       'otp_expiry',
      //     ]
      //   : [
      //       'id',
      //       'email',
      //       'role',
      //       'first_name',
      //       'last_name',
      //       'img_url',
      //       'active',
      //     ],
    });
  }

  async update(
    userId: number,
    updateUserDto: UpdateUserDto,
    performedById: number,
  ): Promise<User | null> {
    if (!userId) return null;

    const existingUser = await this.findOne(userId);
    if (!existingUser) throw new NotFoundException('User not found');

    // Convert to plain object & remove undefined values
    const fieldsToUpdate = { ...updateUserDto };
    Object.keys(fieldsToUpdate).forEach((key) => {
      if (fieldsToUpdate[key] === undefined) delete fieldsToUpdate[key];
    });

    // Remove forbidden relational fields
    const forbiddenRelations = [
      'projects',
      'tasks',
      'events',
      'notifications',
      'activities',
      'team',
      'pmTeams',
      'secondaryTeams',
    ];

    forbiddenRelations.forEach((field) => {
      if (field in fieldsToUpdate) delete fieldsToUpdate[field];
    });

    if (Object.keys(fieldsToUpdate).length === 0) return existingUser;

    // Track changed fields
    const changes: string[] = [];
    for (const [key, newValue] of Object.entries(fieldsToUpdate)) {
      const oldValue = (existingUser as any)[key];
      if (oldValue !== newValue) {
        changes.push(`${key} changed from "${oldValue}" to "${newValue}"`);
      }
    }

    // Perform update safely
    await this.userRepository.update(userId, fieldsToUpdate);
    const updatedUser = await this.findOne(userId);

    // Log activity
    if (updatedUser && changes.length > 0) {
      await this.activityService.logAction(
        performedById,
        `Updated user "${updatedUser.first_name} ${updatedUser.last_name}": ${changes.join(', ')}`,
      );
    }

    return updatedUser;
  }

  async delete(id: number, performedById: number): Promise<void> {
    const user = await this.findOne(id);
    if (!user) throw new NotFoundException('User not found');

    await this.userRepository.softDelete(id);

    await this.activityService.logAction(
      performedById,
      `Deleted user "${user.first_name} ${user.last_name}" (email: ${user.email})`,
    );
  }

  async getUserTeams(userId: number) {
    return this.userRepository.findOne({
      where: { id: userId },
      relations: ['team', 'secondaryTeams'],
    });
  }

  async resetPassword(userId: number, performedById: number): Promise<User> {
    const user = await this.findOne(userId, true);
    if (!user) throw new NotFoundException('User not found');

    user.password_changed = false;

    const savedUser = await this.userRepository.save(user);

    await this.activityService.logAction(
      performedById,
      `Admin reset password for user "${savedUser.first_name} ${savedUser.last_name}"`,
    );

    return savedUser;
  }
}
