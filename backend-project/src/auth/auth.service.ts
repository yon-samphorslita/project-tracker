import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

@Injectable()
export class AuthService {
  private blacklistedTokens = new Set<string>(); // for demo, use Redis in production

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userService.findOneByEmail(email, true);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    return this.userService.createUser({
      ...createUserDto,
      password: hashedPassword,
    });
  }

  async login(user: User): Promise<{ accessToken: string }> {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload);
    return { accessToken };
  }

  async logout(token: string) {
    this.blacklistedTokens.add(token); // mark token as invalid
    return true;
  }

  isTokenBlacklisted(token: string): boolean {
    return this.blacklistedTokens.has(token);
  }

  async updateUserPassword(userId: number, newPassword: string): Promise<User> {
    return this.userService.updatePassword(userId, newPassword);
  }
}
