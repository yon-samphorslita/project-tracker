import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { randomInt } from 'crypto';
import { EmailService } from 'src/mail/email.service';

@Injectable()
export class AuthService {
  private blacklistedTokens = new Set<string>(); // for demo, use Redis in production

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
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
    return this.userService.createUser({ ...createUserDto, password: hashedPassword });
  }

  async login(user: User): Promise<{ accessToken: string }> {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload);
    return { accessToken };
  }

  async logout(token: string) {
    this.blacklistedTokens.add(token);
    return true;
  }

  isTokenBlacklisted(token: string): boolean {
    return this.blacklistedTokens.has(token);
  }

  async updateUserPassword(userId: number, newPassword: string, markChanged = true): Promise<User> {
    return this.userService.updatePassword(userId, newPassword, markChanged);
  }

  async generateOtp(userId: number): Promise<string> {
    const user = await this.userService.findOne(userId);
    if (!user) throw new Error('User not found');

    const otp = randomInt(100000, 999999).toString();
    const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 min expiry

    await this.userService.update(userId, { otp_code: otp, otp_expiry: expiry });
    await this.emailService.sendOtp(user.email, otp);

    return otp;
  }

  async verifyOtp(userId: number, otp: string): Promise<boolean> {
    const user = await this.userService.findOne(userId, true);

    if (!user || !user.otp_code || !user.otp_expiry) {
      return false;
    }

    const otpExpiry = new Date(user.otp_expiry);
    const now = new Date();

    if (String(user.otp_code).trim() === String(otp).trim() && otpExpiry.getTime() > now.getTime()) {
      await this.userService.update(userId, { otp_code: null, otp_expiry: null });
      return true;
    }

    return false;
  }
}
