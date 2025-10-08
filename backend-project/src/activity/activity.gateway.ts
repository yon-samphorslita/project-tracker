import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';

interface AdminSocket extends Socket {
  userRole?: string;
}

@WebSocketGateway({ namespace: 'activity', cors: true })
@Injectable()
export class ActivityGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private admins: AdminSocket[] = [];

  handleConnection(client: AdminSocket) {
    const { role } = client.handshake.auth || {};

    if (role === 'admin') {
      client.userRole = role;
      this.admins.push(client);
      console.log(`Admin connected: ${client.id}`);
    } else {
      client.disconnect(true); // non-admins cannot connect
    }
  }

  handleDisconnect(client: AdminSocket) {
    this.admins = this.admins.filter((c) => c.id !== client.id);
    console.log(`Admin disconnected: ${client.id}`);
  }

  // Send logs only to admin clients
  sendLog(log: any) {
    this.admins.forEach((admin) => {
      admin.emit('activityLog', log);
    });
  }
}
