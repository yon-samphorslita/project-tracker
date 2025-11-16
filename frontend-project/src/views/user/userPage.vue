<template>
  <UserLayout>
    <div class="container pb-[200px]">
      <!-- Permission check -->
      <div v-if="userRole !== 'admin'" class="text-sub-text text-center py-4">
        You do not have permission to view this page.
      </div>

      <div v-else class="flex flex-col gap-4">
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
          <Button label="+ New User" @click="openForm" />

          <Form
            v-if="!isEditing && !isUpdatingPassword"
            v-model:modelValue="showForm"
            formTitle="Create User"
            :fields="userFields"
            :initialData="editUserData"
            endpoint="users"
            @submitted="handleSubmit"
          />

          <EditForm
            v-if="isEditing && !isUpdatingPassword"
            v-model:modelValue="showForm"
            title="Edit User"
            :fields="activeUserFields"
            :initialData="editUserData"
            endpoint="users"
            @submitted="handleSubmit"
          />

          <!-- Password Update Modal -->
          <!-- <div
            v-if="isUpdatingPassword"
            class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <div class="bg-white rounded-lg p-6 w-full max-w-md">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold">Update Password</h3>
                <button @click="closePasswordModal" class="text-gray-400 hover:text-gray-600">
                  &times;
                </button>
              </div>

              <form @submit.prevent="handlePasswordUpdate">
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input
                      v-model="passwordData.newPassword"
                      type="password"
                      placeholder="Enter new password"
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password
                    </label>
                    <input
                      v-model="passwordData.confirmPassword"
                      type="password"
                      placeholder="Confirm new password"
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div v-if="passwordMismatch" class="text-red-500 text-sm">
                    Passwords do not match
                  </div>
                </div>

                <div class="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    @click="closePasswordModal"
                    class="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    :disabled="!passwordData.newPassword || !passwordData.confirmPassword"
                    class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          </div> -->

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
          <template #status="{ row }">
  <Status
  class="cursor-pointer"
    :active="row.active"
    editable
    @update:status="(newStatus) => updateUserStatus(row, newStatus)"
  />
</template>
          <template #actions="{ row }">
            <div class="flex justify-around">
              <router-link :to="`/user/${row.id}`">
                <View class="icon-theme w-6 h-6" />
              </router-link>
              <Edit class="icon-theme w-6 h-6" @click="editUser(row)" />
              <Key class="icon-theme w-6 h-6" @click="updateUserPassword(row)" />
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
import { ref, computed, onMounted, watch } from 'vue'
import UserLayout from '@/views/pageLayout.vue'
import Table from '@/components/charts/table.vue'
import Button from '@/components/common-used/button.vue'
import Form from '@/components/forms/form.vue'
import EditForm from '@/components/forms/editForm.vue'
import Search from '@/components/common-used/search.vue'
import Filter from '@/components/common-used/filter.vue'
import OverviewCard from '@/components/detail-cards/overviewCard.vue'
import PieChart from '@/components/charts/pieChart.vue'
import Edit from '@/assets/icons/edit.svg'
import Delete from '@/assets/icons/delete.svg'
import View from '@/assets/icons/view.svg'
import Key from '@/assets/icons/key.svg' 
import Status from '@/components/status.vue'
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
const isEditing = ref(false)

// Password Update State
const isUpdatingPassword = ref(false)
const selectedUserForPassword = ref(null)
const passwordData = ref({
  newPassword: '',
  confirmPassword: '',
})

// Computed
const userRole = computed(() => authStore.user?.role || 'user')
const passwordMismatch = computed(
  () =>
    passwordData.value.newPassword &&
    passwordData.value.confirmPassword &&
    passwordData.value.newPassword !== passwordData.value.confirmPassword,
)

const users = computed(() => userStore.users || [])
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
  { key: 'active', label: 'Status', slot: 'status' },
  { key: 'actions', label: 'Actions', slot: 'actions' },
]

// User form fields
const userFields = [
  { type: 'text', label: 'First Name', placeholder: 'Enter first name', model: 'first_name', required: true },
  { type: 'text', label: 'Last Name', placeholder: 'Enter last name', model: 'last_name', required: true },
  { type: 'email', label: 'Email', placeholder: 'Enter email', model: 'email', required: true },
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
  // {
  //   type: 'select',
  //   label: 'Status',
  //   model: 'active',
  //   options: [
  //     { id: true, name: 'Active' },
  //     { id: false, name: 'Inactive' },
  //   ],
  // },
]
async function updateUserStatus(row, newStatus) {
  try {
    const newActive = newStatus.toLowerCase() === 'active'

    await userStore.updateUser(row.id, { active: newActive })
    await userStore.fetchUsers()
  } catch (err) {
    console.error('Failed to update user status:', err)
  }
}

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
  isEditing.value = false
  isUpdatingPassword.value = false
  editUserData.value = null
  showForm.value = true
}

function editUser(row) {
  const user = users.value.find((u) => u.id === row.id)
  if (user) {
    isEditing.value = true
    isUpdatingPassword.value = false
    editUserData.value = { ...user, id: user.id }
    showForm.value = true
  }
}

// Password Update Methods
async function updateUserPassword(row) {
  const confirmed = confirm(
    `Are you sure you want to reset the password for "${row.name}" to the default password?`,
  )
  if (!confirmed) return

  try {
    // Call backend endpoint for reset
    await userStore.resetUserPassword(row.id)
    alert(`Password for "${row.name}" has been reset to the default successfully.`)
    await userStore.fetchUsers()
  } catch (err) {
    console.error('Failed to reset password:', err)
    alert('Failed to reset password. Please try again.')
  }
}

function closePasswordModal() {
  isUpdatingPassword.value = false
  selectedUserForPassword.value = null
  passwordData.value = {
    newPassword: '',
    confirmPassword: '',
  }
}

async function handlePasswordUpdate() {
  if (passwordMismatch.value) {
    alert('Passwords do not match!')
    return
  }

  if (!passwordData.value.newPassword) {
    alert('Please enter a new password')
    return
  }

  try {
    await userStore.updateUserPassword(
      selectedUserForPassword.value,
      passwordData.value.newPassword,
    )
    alert('Password updated successfully!')
    closePasswordModal()
  } catch (err) {
    console.error('Failed to update password:', err)
    alert('Failed to update password. Please try again.')
  }
}

const activeUserFields = computed(() => {
  if (isEditing.value) {
    return userFields.filter((field) => field.model !== 'password')
  }
  return userFields
})

async function deleteUser(row) {
  if (!confirm(`Are you sure you want to delete "${row.name}"?`)) return
  try {
    await userStore.deleteUser(row.id)
    await userStore.fetchUsers()
  } catch (err) {
    console.error('Failed to delete user:', err)
  }
}

async function handleSubmit(formUser) {
  try {
    if (isEditing.value && editUserData.value?.id) {
      await userStore.updateUser(editUserData.value.id, formUser)
    } else {
      await userStore.createUser(formUser)
    }
    await userStore.fetchUsers()
  } catch (err) {
    console.error('Error saving user:', err)
  } finally {
    showForm.value = false
    editUserData.value = null
    isEditing.value = false
  }
}

// Fetch data on mount
onMounted(async () => {
  await authStore.fetchProfile()
  if (authStore.user?.role === 'admin') {
    await userStore.fetchUsers()
  }
  isReady.value = true
})
</script>
