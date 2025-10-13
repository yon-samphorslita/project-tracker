import axios from 'axios'
import { defineStore } from 'pinia'
import { io } from 'socket.io-client'

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: [],
    socket: null,
    userId: null,
    notificationsEnabled: localStorage.getItem('notificationsEnabled') === 'true' || false,
    notificationHandler: null,
  }),

  actions: {
    async connect(userId) {
      this.userId = userId

      if (this.socket) this.socket.disconnect()
      this.socket = io('http://localhost:3000', { query: { userId } })

      this.socket.on('connect', () => console.log('Connected as ', userId))
      this.notificationHandler = (payload) => {
        console.log('Notification received:', payload)
        this.notifications.unshift(payload)
      }
      if (this.notificationsEnabled) {
        this.socket.on('notification', this.notificationHandler)
      }

      await this.fetchNotifications()
    },

    toggleNotifications(enabled) {
      this.notificationsEnabled = enabled
      localStorage.setItem('notificationsEnabled', String(enabled))

      if (!enabled && this.socket) {
        console.log('Notifications turned OFF')
        this.socket.off('notification')
      } else if (enabled && this.socket && this.userId) {
        console.log('Notifications turned ON')
        this.socket.on('notification', (payload) => {
          if (!payload.deleted_at && !this.notifications.find((n) => n.id === payload.id)) {
            this.notifications.unshift(payload)
          }
        })
      }
    },

    async fetchNotifications() {
      if (!this.userId) return

      const res = await axios.get(`http://localhost:3000/notifications/user/${this.userId}`)

      this.notifications = res.data.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
    },

    async fetchUnreadNotifications() {
      if (!this.userId) return

      const res = await axios.get(`http://localhost:3000/notifications/user/${this.userId}/unread`)

      this.notifications = res.data.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
    },

    async fetchReadNotifications() {
      if (!this.userId) return

      const res = await axios.get(`http://localhost:3000/notifications/user/${this.userId}/read`)

      this.notifications = res.data.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
    },

    async markAsRead(id) {
      await axios.patch(`http://localhost:3000/notifications/${id}/read`)
      this.notifications = this.notifications.map((n) =>
        n.id === id ? { ...n, read_status: true } : n,
      )
    },

    async markAllAsRead() {
      if (!this.userId) return
      await axios.patch(`http://localhost:3000/notifications/user/${this.userId}/read-all`)
      this.notifications = this.notifications.map((n) => ({ ...n, read_status: true }))
    },

    async softDeleteAll() {
      if (!this.userId) return
      await axios.delete(`http://localhost:3000/notifications/user/${this.userId}/all`)
      this.notifications = []
    },

    async softDeleteOne(id) {
      await axios.delete(`http://localhost:3000/notifications/${id}`)
      this.notifications = this.notifications.filter((n) => n.id !== id)
    },
  },
})
