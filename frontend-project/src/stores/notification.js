import axios from 'axios'
import { defineStore } from 'pinia'
import { io } from 'socket.io-client'
import { useAuthStore } from './auth'

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: [],
    socket: null,
    userId: null,
    notificationsEnabled: localStorage.getItem('notificationsEnabled') === 'true' || false,
    notificationHandler: null,
  }),

  actions: {
    getAxiosInstance() {
      const authStore = useAuthStore()
      return axios.create({
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      })
    },

    async connect(userId) {
      this.userId = userId
      if (!this.notificationsEnabled) {
        return
      }
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
        this.socket.disconnect()
      } else if (enabled) {
        console.log('Notifications turned ON')
        this.connect(this.userId)
      }
    },
    disconnect() {
      if (this.socket) {
        this.socket.off('notification')
        this.socket.disconnect()
        console.log('Socket disconnected')
      }
    },
    async fetchNotifications() {
      if (!this.userId) return
      const axiosInstance = this.getAxiosInstance()
      const res = await axiosInstance.get(`http://localhost:3000/notifications/user/${this.userId}`)

      this.notifications = res.data.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
    },

    async fetchUnreadNotifications() {
      if (!this.userId) return
      const axiosInstance = this.getAxiosInstance()
      const res = await axiosInstance.get(
        `http://localhost:3000/notifications/user/${this.userId}/unread`,
      )

      this.notifications = res.data.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
    },

    async fetchReadNotifications() {
      if (!this.userId) return
      const axiosInstance = this.getAxiosInstance()
      const res = await axiosInstance.get(
        `http://localhost:3000/notifications/user/${this.userId}/read`,
      )

      this.notifications = res.data.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
    },

    async markAsRead(id) {
      const axiosInstance = this.getAxiosInstance()
      await axiosInstance.patch(`http://localhost:3000/notifications/${id}/read`)
      this.notifications = this.notifications.map((n) =>
        n.id === id ? { ...n, read_status: true } : n,
      )
    },

    // async markAsRead(id) {
    //   // await axios.patch(`http://localhost:3000/notifications/${id}/read`)
    //   // this.notifications = this.notifications.map((n) =>
    //   //   n.id === id ? { ...n, read_status: true } : n,
    //   // )
    //   // const axiosInstance = store.getAxiosInstance()
    //   await axiosInstance.patch(`http://localhost:3000/notifications/${id}`, { read_status: true })
    //   store.notifications = store.notifications.map((notif) =>
    //     notif.id === id ? { ...notif, read_status: true } : notif,
    //   )
    // },

    async markAllAsRead() {
      if (!this.userId) return

      const axiosInstance = this.getAxiosInstance()
      await axiosInstance.patch(`http://localhost:3000/notifications/user/${this.userId}/read-all`)
      this.notifications = this.notifications.map((n) => ({ ...n, read_status: true }))
    },

    async softDeleteAll() {
      if (!this.userId) return

      const axiosInstance = this.getAxiosInstance()
      await axiosInstance.delete(`http://localhost:3000/notifications/user/${this.userId}/all`)
      this.notifications = []
    },

    async softDeleteOne(id) {
      const axiosInstance = this.getAxiosInstance()
      await axiosInstance.delete(`http://localhost:3000/notifications/${id}`)
      this.notifications = this.notifications.filter((n) => n.id !== id)
    },
  },
})
