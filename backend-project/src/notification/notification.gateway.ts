// src/notifications/notifications.gateway.ts
import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationService } from './notification.service';
import { Notification as NotificationEntity } from './notification.entity';

@WebSocketGateway({
  cors: {
    origin: '*', // adjust for security
  },
})
export class NotificationsGateway {
  @WebSocketServer()
  server: Server;

  private users = new Map<string, string>();
  // constructor(private readonly notificationService: NotificationService) {}
  
  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.users.set(client.id, userId);
      console.log(`User connected: ${userId}, socketId: ${client.id}`);
    }
  }

  handleDisconnect(client: Socket) {
    this.users.delete(client.id);
    console.log('User disconnected');
  }

  // Send notification to a user (if connected)
  sendNotification(userId: string, notification: NotificationEntity) {
    //  Save in DB
    // const notification = await this.notificationService.create({
    //   userId: Number(userId),
    //   title: payload.title,
    //   message: payload.message,
    //   read_status: false,
    // });

    console.log(`Sending notification to user ${userId}: `, notification);
    
    // For simplicity, emit to a room named by userId
    this.users.forEach((uid, socketId) => {
      if (uid === userId) {
        this.server.to(socketId).emit('notification', notification );
      }
    });  

    // const socketId = this.users.get(userId);
    // if (socketId) {
    //   this.server.to(socketId).emit('notification', notification);
    // }
  }




}
