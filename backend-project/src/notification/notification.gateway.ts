// src/notifications/notifications.gateway.ts
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
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

  sendNotification(userId: string, notification: NotificationEntity) {
    console.log(`Sending notification to user ${userId}: `, notification);

    this.users.forEach((uid, socketId) => {
      if (uid === userId) {
        this.server.to(socketId).emit('notification', notification);
      }
    });
  }
}
