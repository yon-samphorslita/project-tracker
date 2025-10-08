import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // Create a new user
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create({ ...createUserDto });
    return this.userRepository.save(user);
  }

  // Find all users
  async findAll(): Promise<User[]> {
    return this.userRepository.find({relations: ['team']});
  }

  // Find user by ID
  async findOne(id: number, includePassword = false): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
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

  // Update user (supports partial updates)
  async update(
    userId: number,
    updateUserDto: UpdateUserDto & any,
  ): Promise<User | null> {
    if (!userId) return null;

    const fieldsToUpdate = { ...updateUserDto };
    Object.keys(fieldsToUpdate).forEach(
      (key) => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key],
    );

    if (Object.keys(fieldsToUpdate).length === 0) {
      return this.findOne(userId);
    }

    await this.userRepository.update(userId, fieldsToUpdate);
    return this.findOne(userId);
  }

  // Delete user
  async delete(id: number): Promise<void> {
    await this.userRepository.softDelete(id);
  }

  // Find user by email, optionally include password
  async findOneByEmail(
    email: string,
    includePassword = false,
  ): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      select: includePassword
        ? [
            'id',
            'email',
            'role',
            'password',
            'first_name',
            'last_name',
            'img_url',
            'active',
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

  // Update password and optionally mark password_changed
  async updatePassword(
    userId: number,
    newPassword: string,
    markChanged = true,
  ): Promise<User> {
    const user = await this.findOne(userId, true);
    if (!user) throw new NotFoundException('User not found');

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    if (markChanged) user.password_changed = true;

    return this.userRepository.save(user);
  }
}
