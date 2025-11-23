<template>
  <UserLayout>
    <div v-if="authStore.user.role === 'admin'" class="container mx-auto min-h-[600px]">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center mb-8 gap-4">
        <Back
          class="mr-4 w-8 h-8 text-[var(--graysvg-text)] opacity-80 hover:opacity-100 cursor-pointer"
          @click="goBack"
        />
        <h1 class="text-2xl font-bold text-[var(--darkgray-bg)]">User Details</h1>
      </div>

      <!-- Loading -->
      <div v-if="!isReady" class="text-center py-12 text-[var(--sub-text)] text-lg">
        Loading user data...
      </div>

      <!-- User Details -->
      <div v-else class="bg-main-bg rounded-lg shadow-lg p-8 space-y-8 max-h-[600px] overflow-auto">
        <!-- Profile Section -->
        <div class="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-4">
          <img
            v-if="userData.img_url"
            :src="userData.img_url"
            alt="Profile"
            class="w-28 h-28 rounded-full object-cover border-2 border-[var(--gray-bg)] shadow-sm"
          />
          <div class="flex-1">
            <h2 class="text-2xl font-semibold text-[var(--darkgray-bg)] mb-2">
              {{ userData.first_name }} {{ userData.last_name }}
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[var(--gray-text)]">
              <p><span class="font-medium">Email:</span> {{ userData.email || 'N/A' }}</p>
              <p><span class="font-medium">Role:</span> {{ formatRole(userData.role) }}</p>
              <p>
                <span class="font-medium">Status: </span>
                <Status :status="userData.active ? 'Active' : 'Inactive'" />
              </p>
            </div>
          </div>
        </div>

        <!-- Tabs Section -->
        <div class="flex flex-col flex-1 overflow-hidden">
          <!-- Tab Buttons -->
          <div class="flex gap-4 border-b mb-4 flex-shrink-0 overflow-x-auto">
            <button
              v-for="tab in visibleTabs"
              :key="tab"
              @click="activeTab = tab"
              :class="[
                'px-4 py-2 font-medium whitespace-nowrap transition',
                activeTab === tab
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-[var(--sub-text)] hover:text-[var(--gray-text)]',
              ]"
            >
              {{ tab }}
            </button>
          </div>

          <!-- Tab Content -->
          <div class="overflow-auto flex-1 space-y-6 pr-2">
            <!-- Example Teams Tab -->
            <section v-if="activeTab === 'Teams'" class="space-y-4">
              <div v-if="userData.team">
                <h3 class="text-lg font-semibold text-[var(--gray-text)]">Main Team</h3>
                <p class="text-[var(--gray-text)]">{{ userData.team.name }}</p>
              </div>
              <div v-if="userData.pmTeams?.length">
                <h3 class="text-lg font-semibold text-[var(--gray-text)]">Project Manager Teams</h3>
                <ul class="list-disc pl-5 text-[var(--gray-text)]">
                  <li v-for="team in userData.pmTeams" :key="team.id">{{ team.name }}</li>
                </ul>
              </div>
              <div v-if="userData.secondaryTeams?.length">
                <h3 class="text-lg font-semibold text-[var(--gray-text)]">Secondary Teams</h3>
                <ul class="list-disc pl-5 text-[var(--gray-text)]">
                  <li v-for="team in userData.secondaryTeams" :key="team.id">{{ team.name }}</li>
                </ul>
              </div>
            </section>

            <!-- Projects -->
            <section v-if="activeTab === 'Projects'">
              <ul
                v-if="userData.projects?.length"
                class="list-disc pl-5 text-[var(--gray-text)] space-y-1"
              >
                <li v-for="project in userData.projects" :key="project.id">{{ project.p_name }}</li>
              </ul>
              <p v-else class="text-sub-text">No projects assigned.</p>
            </section>

            <!-- Tasks -->
            <section v-if="activeTab === 'Tasks'">
              <ul
                v-if="userData.tasks?.length"
                class="list-disc pl-5 text-[var(--gray-text)] space-y-1"
              >
                <li v-for="task in userData.tasks" :key="task.id">
                  {{ task.t_name }} - {{ task.t_status }}
                </li>
              </ul>
              <p v-else class="text-sub-text">No tasks assigned.</p>
            </section>

            <!-- Activity -->
            <section v-if="activeTab === 'Activity'">
              <ul
                v-if="userData.activities?.length"
                class="list-disc pl-5 text-[var(--gray-text)] space-y-1"
              >
                <li v-for="act in userData.activities" :key="act.id">
                  {{ act.action }} - {{ formatDate(act.createdAt) }}
                </li>
              </ul>
              <p v-else class="text-sub-text">No recent activity.</p>
            </section>

            <!-- Notifications -->
            <section v-if="activeTab === 'Notifications'">
              <ul
                v-if="userData.notifications?.length"
                class="list-disc pl-5 text-[var(--gray-text)] space-y-1"
              >
                <li v-for="note in userData.notifications" :key="note.id">
                  {{ note.message }} - {{ formatDate(note.created_at) }}
                </li>
              </ul>
              <p v-else class="text-sub-text">No notifications.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  </UserLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useAuthStore } from '@/stores/auth'
import UserLayout from '@/views/pageLayout.vue'
import Status from '@/components/status.vue'
import Back from '@/assets/icons/back.svg'
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const authStore = useAuthStore()
const userData = ref(null)
const isReady = ref(false)
const activeTab = ref('Teams')
const tabs = ['Teams', 'Projects', 'Tasks', 'Activity', 'Notifications']

const goBack = () => {
  router.push({ name: 'Users' })
}
const formatRole = (role) => {
  switch (role) {
    case 'admin':
      return 'Admin'
    case 'project_manager':
      return 'Project Manager'
    default:
      return 'Team Member'
  }
}

const formatDate = (dateStr) => (dateStr ? new Date(dateStr).toLocaleString() : 'N/A')

// Compute visible tabs depending on role
const visibleTabs = computed(() => {
  if (!userData.value) return tabs
  return userData.value.role === 'admin' ? tabs.filter((tab) => tab !== 'Teams') : tabs
})

const fetchUser = async () => {
  const userId = route.params.id
  try {
    const user = await userStore.fetchUserById(userId)
    userData.value = user

    // If the current active tab is Teams but it's admin, switch to first visible tab
    if (user.role === 'admin' && activeTab.value === 'Teams') {
      activeTab.value = visibleTabs.value[0]
    }
  } catch (err) {
    console.error('Failed to fetch user:', err)
  } finally {
    isReady.value = true
  }
}

onMounted(fetchUser)
</script>
