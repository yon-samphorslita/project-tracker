import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

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
    return this.userRepository.find();
  }

  // Find user by ID
  async findOne(id: number): Promise<User | null> {
    return this.userRepository.findOneBy({ id });
  }

  // Update user (supports partial updates)
  async update(
    userId: number,
    updateUserDto: UpdateUserDto,
  ): Promise<User | null> {
    if (!userId) return null;

    // Remove undefined fields (optional updates)
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
    await this.userRepository.delete(id);
  }

  // Find user by email, optionally include password
  async findOneByEmail(
    email: string,
    includePassword = false,
  ): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      select: includePassword
        ? ['id', 'email', 'role', 'password']
        : ['id', 'email', 'role'],
    });
  }
}
