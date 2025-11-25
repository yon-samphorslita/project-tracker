import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from './notification.entity';
import { User } from 'src/user/user.entity';
import { NotificationsGateway } from './notification.gateway';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    private readonly notificationsGateway: NotificationsGateway,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async create(
    createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    const user = await this.userRepo.findOne({
      where: { id: createNotificationDto.userId },
    });
    if (!user)
      throw new Error(`User with ID ${createNotificationDto.userId} not found`);

    const notification = this.notificationRepository.create({
      title: createNotificationDto.title,
      message: createNotificationDto.message,
      read_status: createNotificationDto.read_status ?? false,
      link: createNotificationDto.link,
      user: { id: createNotificationDto.userId } as User,
    });

    const saved = await this.notificationRepository.save(notification);
    this.notificationsGateway.sendNotification(String(user.id), saved);
    return saved;
    // return this.notificationRepository.save(notification);
  }

  // notify multiple users
  async notifyUsers(
    userIds: number[],
    title: string,
    message: string,
    link: string,
  ) {
    const users = await this.userRepo.findBy({ id: In(userIds) });
    if (!users.length) return;

    const notifications = users.map((u) =>
      this.notificationRepository.create({
        title,
        message,
        link,
        read_status: false,
        user: { id: u.id } as User,
      }),
    );

    const saved = await this.notificationRepository.save(notifications);
    saved.forEach((n) =>
      this.notificationsGateway.sendNotification(String(n.user.id), n),
    );
    return saved;
    // return this.notificationRepository.save(notifications);
  }

  // fetch all notifications
  async findByUser(userId: number): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { user: { id: userId } },
      order: { created_at: 'DESC' }, // newest first
    });
  }

  async findUnreadByUser(userId: number): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { user: { id: userId }, read_status: false },
      order: { id: 'DESC' },
    });
  }

  async findReadByUser(userId: number): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { user: { id: userId }, read_status: true },
      order: { id: 'DESC' },
    });
  }

  async markAsRead(id: number): Promise<Notification> {
    const notification = await this.findOne(id);
    if (!notification) {
      throw new NotFoundException(`Notification with id ${id} not found`);
    }
    notification.read_status = true;
    return this.notificationRepository.save(notification);
  }

  async markAllAsRead(userId: number): Promise<void> {
    await this.notificationRepository.update(
      { user: { id: userId }, read_status: false },
      { read_status: true },
    );
  }

  async findAll(): Promise<Notification[]> {
    return this.notificationRepository.find();
  }

  async findOne(id: number): Promise<Notification | null> {
    return this.notificationRepository.findOne({ where: { id } });
  }

  async update(
    id: number,
    updateNotificationDto: UpdateNotificationDto,
  ): Promise<Notification | null> {
    await this.notificationRepository.update(id, updateNotificationDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const result = await this.notificationRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Notification with id ${id} not found`);
    }
  }

  // Soft delete all notifications for a user
  async softDeleteAll(userId: number): Promise<void> {
    await this.notificationRepository.softDelete({ user: { id: userId } });
  }

  // Soft delete a single notification
  async softDeleteOne(id: number): Promise<void> {
    await this.notificationRepository.softDelete(id);
  }
}
