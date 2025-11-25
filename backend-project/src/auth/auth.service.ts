import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ActivityService } from 'src/activity/activity.service';
import { EmailService } from 'src/mail/email.service';
import { UpdateOtpDto } from 'src/user/dto/update-otp.dto';

@Injectable()
export class AuthService {
  private blacklistedTokens = new Set<string>();

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly activityService: ActivityService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.findOneByEmail(email);
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

  isTokenBlacklisted(token: string): boolean {
    return this.blacklistedTokens.has(token);
  }

  async generateOtp(email: string): Promise<string> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new NotFoundException('User not found');

    const otp = String(Math.floor(100000 + Math.random() * 900000)); // 6-digit
    const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    const updateOtpDto: UpdateOtpDto = { otp_code: otp, otp_expiry: expiry };
    await this.userRepository.update(user.id, updateOtpDto);

    await this.emailService.sendOtp(email, otp);
    console.log(`Generated OTP for ${email}: ${otp}`);

    return otp;
  }

  async verifyOtp(email: string, otp: string): Promise<boolean> {
    const user = await this.findOneByEmail(email);
    if (!user || !user.otp_code || !user.otp_expiry) return false;

    return user.otp_code === otp && new Date() < user.otp_expiry;
  }

  async updatePassword(
    userId: number,
    oldPassword: string,
    newPassword: string,
  ): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const passwordValid = await bcrypt.compare(oldPassword, user.password);
    if (!passwordValid)
      throw new UnauthorizedException('Old password is incorrect');

    user.password = newPassword;
    user.password_changed = true;
    const savedUser = await this.userRepository.save(user);

    await this.activityService.logAction(
      userId,
      `User "${user.first_name} ${user.last_name}" updated their own password`,
    );
    return savedUser;
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      select: [
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
      ],
    });
  }

  async updatePasswordByEmail(
    email: string,
    newPassword: string,
  ): Promise<User> {
    const user = await this.findOneByEmail(email);
    if (!user) throw new NotFoundException('User not found');

    user.password = newPassword;
    user.password_changed = true;
    await this.userRepository.save(user);

    await this.activityService.logAction(
      user.id,
      `Reset password via email for user "${user.first_name} ${user.last_name}"`,
    );
    return user;
  }
}
