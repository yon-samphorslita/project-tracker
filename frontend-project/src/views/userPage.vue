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
                :options="[
                  { value: 'name-asc', label: 'Name (A → Z)' },
                  { value: 'name-desc', label: 'Name (Z → A)' },
                  { value: 'role-admin', label: 'Role: Admin' },
                  { value: 'role-member', label: 'Role: Member' },
                  { value: 'role-all', label: 'All Roles' },
                ]"
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
        </div>

        <div v-if="isReady && filteredUsers.length === 0" class="text-center py-4 text-gray-500">
          No users found.
        </div>
      </div>
    </div>
  </UserLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import UserLayout from './userLayout.vue'
import Table from '@/components/table.vue'
import Button from '@/components/button.vue'
import Form from '@/components/form.vue'
import Search from '@/components/search.vue'
import Filter from '@/components/filter.vue'
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
    options: [
      { id: 'admin', name: 'Admin' },
      { id: 'member', name: 'Member' },
      { id: 'project_manager', name: 'Project Manager' },
    ],
    model: 'role',
  },
  {
    type: 'select',
    label: 'Status',
    options: [
      { id: true, name: 'Active' },
      { id: false, name: 'Inactive' },
    ],
    model: 'active',
  },
]

onMounted(async () => {
  if (!authStore.user) await authStore.fetchProfile()
  if (userRole.value === 'admin') await userStore.fetchUsers()
  isReady.value = true
})

const users = computed(() => userStore.users || [])

const roleLabels = {
  admin: 'Admin',
  member: 'Team Member',
  project_manager: 'Project Manager',
}

const mappedUsers = computed(() =>
  users.value.map((u) => ({
    id: u.id,
    name: `${u.first_name} ${u.last_name}`,
    email: u.email,
    role: roleLabels[u.role] || u.role,
    role_raw: u.role,
    active: Boolean(u.active),
    first_name: u.first_name,
    last_name: u.last_name,
  })),
)

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
      result = result.filter((u) => u.role === 'admin')
      break
    case 'role-member':
      result = result.filter((u) => u.role === 'member')
      break
    case 'role-all':
    default:
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
    editUserData.value = { ...user }
    showForm.value = true
  }
}

async function deleteUser(row) {
  const user = users.value.find((u) => u.id === row.id)
  if (user && confirm(`Are you sure you want to delete "${user.first_name} ${user.last_name}"?`)) {
    await userStore.deleteUser(user.id)
  }
}
function handleSubmit(createdUser) {
  if (!createdUser) return

  const index = userStore.users.findIndex(u => u.id === createdUser.id)
  if (index !== -1) {
    userStore.users[index] = createdUser
  } else {
    userStore.users.push(createdUser)
  }

  showForm.value = false
}

</script>
