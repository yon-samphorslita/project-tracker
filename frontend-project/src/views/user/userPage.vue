<template>
  <UserLayout>
    <div class="container">
      <div v-if="userRole !== 'admin'" class="text-sub-text text-center py-4">
        You do not have permission to view this page.
      </div>

      <div v-else class="flex flex-col gap-8">
        <!-- Overview & Charts -->
        <div class="flex flex-col w-full justify-between gap-8">
          <div class="grid grid-cols-4 gap-8">
            <OverviewCard title="Total Users" :value="totalUsers" />
            <OverviewCard title="Admin Users" :value="adminUsers" />
            <OverviewCard title="Active Users" :value="activeUsers" />
            <OverviewCard title="Inactive Users" :value="inactiveUsers" />
          </div>

          <div class="flex gap-8 justify-between">
            <PieChart :data="roleData" :height="280" :title="'User Roles'" />
            <PieChart :data="activityData" :height="280" :title="'Active vs Inactive Users'" />
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-between items-center w-full">
          <Button label="+ Create New User" @click="openForm" />

          <Form
            v-if="!isEditing"
            v-model:modelValue="showForm"
            formTitle="Create User"
            :fields="userFields"
            :initialData="editUserData"
            endpoint="users"
            @submitted="handleSubmit"
          />

          <EditForm
            v-if="isEditing"
            v-model:modelValue="showForm"
            title="Edit User"
            :fields="userFields"
            :initialData="editUserData"
            endpoint="users"
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
          <template #status="{ row }">
            <Status
              class="cursor-pointer"
              :active="row.active"
              :editable="true"
              @update:status="(newActive) => updateUserStatus(row, newActive)"
            />
          </template>
          <template #actions="{ row }">
            <div class="flex justify-around">
              <router-link :to="`/user/${row.id}`">
                <View class="icon-theme w-6 h-6" />
              </router-link>
              <Edit class="icon-theme w-6 h-6" @click="editUser(row)" />
              <Key class="icon-theme w-6 h-6" @click="resetUserPassword(row)" />
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
import PieChart from '@/components/charts/pieChart.vue'
import BarChart from '@/components/charts/barChart.vue' // New bar chart
import Button from '@/components/common-used/button.vue'
import Form from '@/components/forms/form.vue'
import EditForm from '@/components/forms/editForm.vue'
import Search from '@/components/common-used/search.vue'
import Filter from '@/components/common-used/filter.vue'
import OverviewCard from '@/components/detail-cards/overviewCard.vue'
import Edit from '@/assets/icons/edit.svg'
import Delete from '@/assets/icons/delete.svg'
import View from '@/assets/icons/view.svg'
import Key from '@/assets/icons/key.svg'
import Status from '@/components/status.vue'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user'

const authStore = useAuthStore()
const userStore = useUserStore()

const isReady = ref(false)
const showForm = ref(false)
const editUserData = ref(null)
const searchQuery = ref('')
const sortOption = ref('role-all')
const isEditing = ref(false)

const userRole = computed(() => authStore.user?.role || 'user')
const users = computed(() => userStore.users || [])
const roleLabels = { admin: 'Admin', member: 'Team Member', project_manager: 'Project Manager' }

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

const totalUsers = computed(() => mappedUsers.value.length)
const adminUsers = computed(() => mappedUsers.value.filter((u) => u.role === 'Admin').length)
const activeUsers = computed(() => mappedUsers.value.filter((u) => u.active).length)
const inactiveUsers = computed(() => totalUsers.value - activeUsers.value)

const roleData = computed(() => {
  const counts = {}
  mappedUsers.value.forEach((u) => (counts[u.role] = (counts[u.role] || 0) + 1))
  return Object.entries(counts).map(([type, value]) => ({ type, value }))
})

// New bar chart: Active vs Inactive users
const activityData = computed(() => [
  { type: 'Active', value: activeUsers.value },
  { type: 'Inactive', value: inactiveUsers.value },
])

const tableColumns = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
  { key: 'active', label: 'Status', slot: 'status' },
  { key: 'actions', label: 'Actions', slot: 'actions' },
]

const userFields = [
  { type: 'text', label: 'First Name', model: 'first_name', required: true },
  { type: 'text', label: 'Last Name', model: 'last_name', required: true },
  { type: 'email', label: 'Email', model: 'email', required: true },
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
]

async function updateUserStatus(row, newActive) {
  try {
    await userStore.updateUser(row.id, { active: newActive })
    await userStore.fetchUsers()
  } catch (err) {
    console.error(err)
  }
}

const sortOptions = [
  { value: 'name-asc', label: 'Name (A → Z)' },
  { value: 'name-desc', label: 'Name (Z → A)' },
  { value: 'role-admin', label: 'Role: Admin' },
  { value: 'role-member', label: 'Role: Member' },
  { value: 'role-all', label: 'All Roles' },
]

const filteredUsers = computed(() => {
  let result = mappedUsers.value.sort((a, b) => {
    const order = { Admin: 1, 'Project Manager': 2, 'Team Member': 3 }
    return (order[a.role] || 3) - (order[b.role] || 3)
  })

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
      result.sort((a, b) => a.name.localeCompare(b.name))
      break
    case 'name-desc':
      result.sort((a, b) => b.name.localeCompare(a.name))
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
  isEditing.value = false
  editUserData.value = null
  showForm.value = true
}
function editUser(row) {
  const u = users.value.find((u) => u.id === row.id)
  if (u) {
    isEditing.value = true
    editUserData.value = { ...u, id: u.id }
    showForm.value = true
  }
}
async function resetUserPassword(row) {
  if (!confirm(`Reset password for "${row.name}"?`)) return
  await userStore.resetUserPassword(row.id)
  await userStore.fetchUsers()
}
async function deleteUser(row) {
  if (!confirm(`Delete "${row.name}"?`)) return
  await userStore.deleteUser(row.id)
  await userStore.fetchUsers()
}
async function handleSubmit(formUser) {
  if (isEditing.value && editUserData.value?.id)
    await userStore.updateUser(editUserData.value.id, formUser)
  else await userStore.createUser(formUser)
  await userStore.fetchUsers()
  showForm.value = false
  editUserData.value = null
  isEditing.value = false
}

onMounted(async () => {
  await authStore.fetchProfile()
  if (authStore.user?.role === 'admin') await userStore.fetchUsers()
  isReady.value = true
})
</script>
