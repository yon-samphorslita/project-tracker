<template>
  <UserLayout>
    <div class="container p-4">
      <!-- Permission check -->
      <div v-if="userRole !== 'admin'" class="text-gray-500 text-center py-4">
        You do not have permission to view this page.
      </div>

      <div v-else>
        <div class="flex flex-col gap-4">
          <h1 class="text-2xl font-bold">User Management</h1>

          <!-- Overview + Pie -->
          <div class="flex w-full justify-between gap-4">
            <div class="grid grid-cols-2 gap-4 flex-1">
              <OverviewCard title="Total Users" :value="totalUsers" />
              <OverviewCard title="Active Users" :value="activeUsers" />
              <OverviewCard title="Inactive Users" :value="inactiveUsers" />
            </div>
            <!-- 👇 chart now shows users by role -->
            <PieChart :data="roleData" :height="280" class="w-[600px]" />
          </div>

          <!-- Actions -->
          <div class="flex justify-between items-center w-full">
            <Button label="+ New User" btn-color="#C6E7FF" btntext="black" @click="openForm" />

            <Form
              v-model:modelValue="showForm"
              formTitle="User"
              :fields="userFields"
              :initialData="editUserData"
              endpoint="auth/user"
              @submitted="handleSubmit"
            />

            <div class="flex gap-4 items-center">
              <Search @update="searchQuery = $event" />
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
                <img
                  src="../assets/icons/edit.svg"
                  alt="Edit"
                  class="cursor-pointer"
                  @click="editUser(row)"
                />
                <img
                  src="../assets/icons/delete.svg"
                  alt="Delete"
                  class="cursor-pointer"
                  @click="deleteUser(row)"
                />
              </div>
            </template>
          </Table>

          <div v-if="isReady && filteredUsers.length === 0" class="text-center py-4 text-gray-500">
            No users found.
          </div>
        </div>
      </div>
    </div>
  </UserLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import UserLayout from './pageLayout.vue'
import Table from '@/components/table.vue'
import Button from '@/components/button.vue'
import Form from '@/components/form.vue'
import Search from '@/components/search.vue'
import Filter from '@/components/filter.vue'
import OverviewCard from '@/components/overviewCard.vue'
import PieChart from '@/components/pieChart.vue'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user'

const authStore = useAuthStore()
const userStore = useUserStore()

const isReady = ref(false)
const showForm = ref(false)
const editUserData = ref(null)
const searchQuery = ref('')
const sortOption = ref('role-all')

const userRole = computed(() => authStore.user?.role || 'user')

const tableColumns = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
  { key: 'active', label: 'Status' },
  { key: 'actions', label: 'Actions', slot: 'actions' },
]

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

const sortOptions = [
  { value: 'name-asc', label: 'Name (A → Z)' },
  { value: 'name-desc', label: 'Name (Z → A)' },
  { value: 'role-admin', label: 'Role: Admin' },
  { value: 'role-member', label: 'Role: Member' },
  { value: 'role-all', label: 'All Roles' },
]

const roleLabels = {
  admin: 'Admin',
  member: 'Team Member',
  project_manager: 'Project Manager',
}

const users = computed(() => authStore.users || [])

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
const activeUsers = computed(() => mappedUsers.value.filter((u) => u.active).length)
const inactiveUsers = computed(() => totalUsers.value - activeUsers.value)

// Users by role (for chart)
const roleData = computed(() => {
  const counts = {}
  mappedUsers.value.forEach((u) => {
    counts[u.role] = (counts[u.role] || 0) + 1
  })
  return Object.entries(counts).map(([role, value]) => ({
    type: role,
    value,
  }))
})

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

onMounted(async () => {
  if (!authStore.user) await authStore.fetchProfile()
  if (userRole.value === 'admin') await authStore.fetchAllUsers()
  isReady.value = true
})
</script>
