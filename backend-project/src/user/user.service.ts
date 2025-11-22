import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { ActivityService } from 'src/activity/activity.service';

@Injectable()
export class UserService {
  // private readonly DEFAULT_PASSWORD = 'PMS@123';

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
  if (existingUser) {
    throw new ConflictException('Email already exists');
  }
    // const hashedPassword = await bcrypt.hash(
    //   this.DEFAULT_PASSWORD, 10
    // );
    const user = this.userRepository.create({
      ...createUserDto,
      // password: hashedPassword,
      // password_changed: false
    });
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
        // 'team',
        // 'pmTeams',
        // 'secondaryTeams',
        // 'projects',
        // 'tasks',
        'activities',
        // 'notifications',
      ],
      select: includePassword
        ? [
            'id',
            'email',
            'role',
            'first_name',
            'last_name',
            'img_url',
            'active',
            'password',
            'password_changed',
            'otp_code',
            'otp_expiry',
          ]
        : [
            'id',
            'email',
            'role',
            'first_name',
            'last_name',
            'img_url',
            'active',
          ],
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

  // Remove undefined values
  const fieldsToUpdate = { ...updateUserDto };
  Object.keys(fieldsToUpdate).forEach((key) => {
    if (fieldsToUpdate[key] === undefined) delete fieldsToUpdate[key];
  });

  if (Object.keys(fieldsToUpdate).length === 0) return existingUser;

  // Track changes
  const changes: string[] = [];
  for (const [key, newValue] of Object.entries(fieldsToUpdate)) {
    const oldValue = (existingUser as any)[key];
    if (oldValue !== newValue) {
      changes.push(`${key} changed from "${oldValue}" to "${newValue}"`);
    }
  }

  await this.userRepository.update(userId, fieldsToUpdate);
  const updatedUser = await this.findOne(userId);

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

async resetPassword(
  userId: number,
  performedById: number,
): Promise<User> {
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
