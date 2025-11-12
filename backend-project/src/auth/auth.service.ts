import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';
import { EmailService } from 'src/mail/email.service';
import { UpdateOtpDto } from 'src/user/dto/update-otp.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthService {
  private blacklistedTokens = new Set<string>();

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userService.findOneByEmail(email, true);

    if (!user) return null;

    if (!user.active) {
      throw new UnauthorizedException(
        'Your account is inactive. Please contact the administrator.',
      );
    }

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) return null;

    return user;
  }

  async login(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return { accessToken: await this.jwtService.signAsync(payload) };
  }

  async logout(token: string) {
    this.blacklistedTokens.add(token);
    return true;
  }

  async generateOtp(email: string): Promise<string> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new NotFoundException('User not found');

    const otp = String(Math.floor(100000 + Math.random() * 900000)); // 6-digit
    const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await this.userRepository.update(user.id, {
      otp_code: otp,
      otp_expiry: expiry,
    });

    await this.emailService.sendOtp(email, otp);
    console.log(`Generated OTP for ${email}: ${otp}`);

    return otp;
  }

  async verifyOtp(email: string, otp: string): Promise<boolean> {
    const user = await this.userService.findOneByEmail(email, true);
    if (!user || !user.otp_code || !user.otp_expiry) return false;

    const now = new Date();
    return user.otp_code === otp && now < new Date(user.otp_expiry);
  }
}
