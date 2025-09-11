// import { defineStore } from 'pinia';
// import { io, Socket } from 'socket.io-client';

// export const useNotificationStore = defineStore('notification', {
//   state: () => ({
//     socket: null as Socket | null,
//     notifications: [] as string[],
//   }),
//   actions: {
//     connect(userId: string) {
//       this.socket = io('http://localhost:3000', { query: { userId } });

//       this.socket.on('connect', () => {
//         console.log('Connected as User', userId);
//       });

//       this.socket.on('notification', (data: { message: string }) => {
//         this.notifications.push(data.message);
//         console.log('Notification received:', data);

//       });
//     },
//   },
// });

import axios from 'axios';
import { defineStore } from 'pinia';
import { io, Socket } from 'socket.io-client';

export interface NotificationPayload {
  id?: number;          // from DB
  title: string;
  message: string;
  read_status?: boolean;
  created_at?: string;
}

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: [] as NotificationPayload[],
    socket: null as Socket | null,
    userId: null as string | null,
  }),
  actions: {
    async connect(userId: string) {
      this.userId = userId;

      if (this.socket) this.socket.disconnect();
      this.socket = io('http://localhost:3000', { query: { userId } });

      this.socket.on('connect', () => console.log('Connected as ', userId));
      this.socket.on('notification', (payload: NotificationPayload) => {
        console.log('Notification received:', payload);
        this.notifications.unshift( payload );
      });

      await this.fetchUnreadNotifications();
    },
    
    async fetchUnreadNotifications() {
      if (!this.userId) return;

      const res = await axios.get<NotificationPayload[]>(
        `http://localhost:3000/notifications/user/${this.userId}/unread`,
      );

      this.notifications = [
        ...res.data,
        ...this.notifications,
      ].sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime());
    },

    async markAsRead(id: number) {
      await axios.patch(`http://localhost:3000/notifications/${id}/read`);
      this.notifications = this.notifications.map(n =>
        n.id === id ? { ...n, read_status: true } : n
      );
    },

    async markAllAsRead() {
      if (!this.userId) return;
      await axios.patch(`http://localhost:3000/notifications/user/${this.userId}/read-all`);
      this.notifications = this.notifications.map(n => ({ ...n, read_status: true }));
    },
  },
});
