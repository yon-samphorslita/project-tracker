<template>
  <UserLayout>
    <div class="container">
      <!-- Permission check -->
      <div v-if="userRole !== 'admin'" class="text-sub-text text-center py-4">
        You do not have permission to view this page.
      </div>

      <div v-else class="flex flex-col gap-4">
        <!-- <h1 class="text-2xl font-bold">User Management</h1> -->

        <!-- Overview & PieChart -->
        <div class="flex w-full justify-between gap-4">
          <div class="grid grid-cols-2 gap-4 flex-1">
            <OverviewCard title="Total Users" :value="totalUsers" />
            <OverviewCard title="Admin Users" :value="adminUsers" />
            <OverviewCard title="Active Users" :value="activeUsers" />
            <OverviewCard title="Inactive Users" :value="inactiveUsers" />
          </div>
          <PieChart :data="roleData" :height="280" class="w-[600px]" />
        </div>

        <!-- Actions -->
        <div class="flex justify-between items-center w-full">
          <Button
            label="+ New User"
            btn-color="var(--blue-bg)"
            btntext="var(--black-text)"
            @click="openForm"
          />

          <Form
            v-model:modelValue="showForm"
            formTitle="User"
            :fields="userFields"
            :initialData="editUserData"
            endpoint="auth/user"
            @submitted="handleSubmit"
          />

          <div class="flex gap-4 items-center">
            <Search v-model:query="searchQuery" />
            <Filter
              class="min-w-fit"
              title="Sort / Filter"
              :options="sortOptions"
              @select="applySort"
            />
          </div>
        </div>

        <!-- Users Table -->
        <Table v-if="isReady" :data="filteredUsers" :columns="tableColumns">
          <template #actions="{ row }">
            <div class="flex gap-2">
              <router-link :to="`/user/${row.id}`">
                <View class="icon-theme w-6 h-6" />
              </router-link>
              <Edit class="icon-theme w-6 h-6" @click="editUser(row)" />
              <Delete class="icon-theme w-6 h-6" @click="deleteUser(row)" />
            </div>
          </template>
        </Table>

        <div v-if="isReady && filteredUsers.length === 0" class="text-center py-4 text-sub-text">
          No users found.
        </div>
      </div>
    </div>
  </UserLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import UserLayout from '@/views/pageLayout.vue'
import Table from '@/components/charts/table.vue'
import Button from '@/components/common-used/button.vue'
import Form from '@/components/forms/form.vue'
import Search from '@/components/common-used/search.vue'
import Filter from '@/components/common-used/filter.vue'
import OverviewCard from '@/components/detail-cards/overviewCard.vue'
import PieChart from '@/components/charts/pieChart.vue'
import Edit from '@/assets/icons/edit.svg'
import Delete from '@/assets/icons/delete.svg'
import View from '@/assets/icons/view.svg'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user'

const authStore = useAuthStore()
const userStore = useUserStore()

// State
const isReady = ref(false)
const showForm = ref(false)
const editUserData = ref(null)
const searchQuery = ref('')
const sortOption = ref('role-all')
const showViewModal = ref(false)
const viewUserData = ref(null)

// Computed
const userRole = computed(() => authStore.user?.role || 'user')

const users = computed(() => authStore.users || [])
const roleLabels = {
  admin: 'Admin',
  member: 'Team Member',
  project_manager: 'Project Manager',
}

// Map users for table display
const mappedUsers = computed(() =>
  users.value.map((u) => ({
    id: u.id,
    name: `${u.first_name} ${u.last_name}`,
    email: u.email,
    role: roleLabels[u.role] || u.role,
    active: Boolean(u.active),
    first_name: u.first_name,
    last_name: u.last_name,
  })),
)

// Overview stats
const totalUsers = computed(() => mappedUsers.value.length)
const adminUsers = computed(() => mappedUsers.value.filter((u) => u.role === 'Admin').length)
const activeUsers = computed(() => mappedUsers.value.filter((u) => u.active).length)
const inactiveUsers = computed(() => totalUsers.value - activeUsers.value)

// Pie chart data
const roleData = computed(() => {
  const counts = {}
  mappedUsers.value.forEach((u) => (counts[u.role] = (counts[u.role] || 0) + 1))
  return Object.entries(counts).map(([type, value]) => ({ type, value }))
})

// Table columns
const tableColumns = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
  { key: 'active', label: 'Status' },
  { key: 'actions', label: 'Actions', slot: 'actions' },
]

// User form fields
const userFields = [
  { type: 'text', label: 'First Name', placeholder: 'Enter first name', model: 'first_name' },
  { type: 'text', label: 'Last Name', placeholder: 'Enter last name', model: 'last_name' },
  { type: 'email', label: 'Email', placeholder: 'Enter email', model: 'email' },
  { type: 'password', label: 'Password', placeholder: 'Enter password', model: 'password' },
  {
    type: 'select',
    label: 'Role',
    model: 'role',
    options: [
      { id: 'admin', name: 'Admin' },
      { id: 'member', name: 'Member' },
      { id: 'project_manager', name: 'Project Manager' },
    ],
  },
  {
    type: 'select',
    label: 'Status',
    model: 'active',
    options: [
      { id: true, name: 'Active' },
      { id: false, name: 'Inactive' },
    ],
  },
]

// Sort / Filter options
const sortOptions = [
  { value: 'name-asc', label: 'Name (A → Z)' },
  { value: 'name-desc', label: 'Name (Z → A)' },
  { value: 'role-admin', label: 'Role: Admin' },
  { value: 'role-member', label: 'Role: Member' },
  { value: 'role-all', label: 'All Roles' },
]

// Computed filtered users
const filteredUsers = computed(() => {
  let result = mappedUsers.value

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q),
    )
  }

  switch (sortOption.value) {
    case 'name-asc':
      result = [...result].sort((a, b) => a.name.localeCompare(b.name))
      break
    case 'name-desc':
      result = [...result].sort((a, b) => b.name.localeCompare(a.name))
      break
    case 'role-admin':
      result = result.filter((u) => u.role === 'Admin')
      break
    case 'role-member':
      result = result.filter((u) => u.role === 'Team Member')
      break
  }

  return result
})

// Methods
function applySort(option) {
  sortOption.value = typeof option === 'string' ? option : option.value
}

function openForm() {
  editUserData.value = null
  showForm.value = true
}

function editUser(row) {
  const user = users.value.find((u) => u.id === row.id)
  if (user) {
    editUserData.value = { ...user, id: user.id }
    showForm.value = true
  }
}

async function deleteUser(row) {
  if (!confirm(`Are you sure you want to delete "${row.name}"?`)) return
  try {
    await userStore.deleteUser(row.id)
    await authStore.fetchAllUsers()
  } catch (err) {
    console.error('Failed to delete user:', err)
  }
}

async function handleSubmit(formUser) {
  try {
    if (editUserData.value?.id) {
      await authStore.updateUser({ id: editUserData.value.id, ...formUser })
    }
    await authStore.fetchAllUsers()
  } catch (err) {
    console.error('Error saving user:', err)
  } finally {
    showForm.value = false
    editUserData.value = null
  }
}

// Fetch data on mount
onMounted(async () => {
  if (!authStore.user) await authStore.fetchProfile()
  if (userRole.value === 'admin') await authStore.fetchAllUsers()
  isReady.value = true
})
</script>
