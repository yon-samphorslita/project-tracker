<template>
  <TaskLayout>
    <div v-if="isReady && task" class="container flex flex-col gap-6">
      <!-- Header -->
      <div class="flex justify-between items-start">
        <Back
          class="mr-4 w-8 h-8 text-[var(--graysvg-text)] opacity-80 hover:opacity-100 cursor-pointer"
          @click="goBack"
        />
        <div class="flex items-start gap-3 w-full justify-between ">
          <div class="flex items-start gap-3">
            <h1 class="flex text-2xl font-bold">{{ task.t_name }}</h1>
            <Edit
              v-if="userRole === 'admin' || userRole === 'project_manager'"
              class="icon-theme w-7 h-7 mr-2 cursor-pointer"
              @click="openEditTaskForm(task)"
            />
          </div>
         

          <Status :status="taskStatus" class="w-28 h-10 flex items-center justify-center" />
          <!-- <div class="flex flex-col items-center">
            <Button
              v-if="userRole === 'admin' || userRole === 'project_manager'"
              label="Edit Task"
              @click="openEditTaskForm(task)"
              class="ml-4 w-32 h-12"
            />
          </div> -->
          
          <EditForm
            v-model="showEditTaskForm"
            title="Edit Task"
            :fields="taskFields"
            :initialData="editTaskData"
            endpoint="tasks"
            @submitted="onTaskUpdated"
          />
          <!-- <Status :status="projectStatus" /> -->
        </div>
      </div>

      <!-- Description -->
      <p class="text-gray-600">{{ task?.t_description }}</p>

      <div class="flex">
        <div class="rounded-lg p-4 mt-0 ml-6 border border-gray-200 w-3/5 " >
          <div v-if="task?.subtasks && task.subtasks.length">
            <p class="font-semibold mb-2">Subtask List: </p>
            <div
              v-for="subtask in task.subtasks"
              :key="subtask.id"
              class="flex justify-between items-center bg-main-bg px-3 py-2 rounded-md border border-gray-200"
            >
              <span
                :class="[
                  'text-gray-text',
                  subtask.status === 'completed' ? 'line-through text-gray-400' : '',
                ]"
              >
                {{ subtask.name }}
              </span>

              <span v-if="subtask.status === 'completed'" class="text-green-600 font-semibold">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7L10 17l-5-5"/></svg>
              </span>
            </div>
          </div>
          <div v-else class="text-gray-600">No subtasks available.</div>
          <button class="mt-4 text-blue-600 cursor-pointer hover:underline ">See Activity Log</button>     
        </div>

        <div class="flex w-2/5 border rounded-xl p-4 mb-0 ml-6">
          <div class="flex flex-col gap-3 w-full">
            <div class="flex flex-col items-center gap-3 px-3 py-1 mb-4" >
              <img
                :src=assignee?.img_url               
                alt="profile"
                class="w-16 h-16 rounded-full border object-cover"
              />
              <span class="text-blue-800 font-medium text-sm truncate max-w-[100px]">
                {{ task?.user?.first_name }} {{ task?.user?.last_name }}  
              </span>
            </div>


            <div class="flex flex-col ">
              <p>Task Progress: </p>
              <ProgressBar :completed="completedSubtasks" :total="task?.subtasks.length" />
            </div>
            <div>Start Date: {{ formatDate(task?.start_date) }}</div>
            <div>Due Date: {{ formatDate(task?.due_date) }}</div>
            <div>
              <div>Recent Activity: </div>
              <ul v-if="assigneeActivity.length" class="list-disc pl-5 text-gray-600 space-y-1 max-h-40 overflow-auto">
                  <li v-for="act in assigneeActivity" :key="act.id">
                    {{ act.action }} - {{ formatDate(act.created_at) }}
                  </li>
                </ul>
                <p v-else class="text-gray-400">No recent activity.</p>
            </div>
            <!-- <div>Total Subtask: {{ task?.subtasks.length }}</div>
            <div>Completed Subtask: {{ completedSubtasks }}</div> -->
          </div>
            
        </div>
      </div>

      <div class="flex flex-col items-start gap-5 border rounded-lg p-4 mt-0 ml-6">
        <div class="text-xl font-semibold ">Related Information</div>
        <div class="flex flex-col gap-5 justify-between w-full mt-2">
          <div class="flex gap-2 justify-start items-center">
            <p class="font-semibold ">Project Name: </p> 
            {{ task?.project?.p_name }}
          </div>
          <div class="flex justify-between w-full ">
            <div class="flex gap-2 justify-start items-center">
              <p class="font-semibold ">Priority: </p> 
              <Status :priority="task?.project?.priority" />
            </div>
            <div class="flex gap-2 justify-start items-center">
              <p class="font-semibold ">Status: </p> 
              <Status :status="task?.project?.status" />
            </div>
          </div>
        </div>
        <div class="flex justify-between w-full ">
          <div class="flex gap-2 justify-start items-center">
            <p class="font-semibold ">Start Date: </p> 
            {{ formatDate(task?.project?.start_date) }}        
          </div>
          <div class="flex gap-2 justify-start items-center">
            <p class="font-semibold ">Due Date: </p> 
            {{ formatDate(task?.project?.due_date) }}        
          </div>
        </div>
        <div class="flex gap-2 justify-start items-start">
          <p class="font-semibold w-max">Project Manager: </p> 
          <div class="flex flex-wrap gap-2">
            <div
              v-for="pm in task?.project?.team?.pms"
              :key="pm.id"
              class="flex items-center gap-3 bg-blue-50 px-3 py-1 rounded-full border border-blue-100"
            >
              <img
                :src="pm.img_url || defaultProfile"
                alt="profile"
                class="w-8 h-8 rounded-full object-cover"
              />
              <span class="text-blue-800 font-medium text-sm truncate max-w-[100px]">
                {{ pm.first_name }} {{ pm.last_name }}
              </span>
            </div>
          </div>
        </div>
        <div class="flex gap-2 justify-start items-center">
          <p class="font-semibold">Task Assignee: </p> 
          <div class="flex flex-wrap gap-2">
            <div class="flex items-center gap-3 bg-blue-50 px-3 py-1 rounded-full border border-blue-100" >
              <img
                :src="defaultProfile"                
                alt="profile"
                class="w-8 h-8 rounded-full object-cover"
              />
              <span class="text-blue-800 font-medium text-sm truncate max-w-[100px]">
                {{ task?.user?.first_name }} {{ task?.user?.last_name }}  
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>

    <div v-else class="container text-gray-600">Loading Task details ...</div>
  </TaskLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import defaultProfile from '@/assets/profile_default.jpg'

// Components
import TaskLayout from '@/views/pageLayout.vue'
import Edit from '@/assets/icons/edit.svg'
import Back from '@/assets/icons/back.svg'
import Status from '@/components/status.vue'
import Form from '@/components/forms/form.vue'
import ProgressBar from '@/components/progressBar.vue'
import EditForm from '@/components/forms/editForm.vue'
import OverviewCard from '@/components/detail-cards/overviewCard.vue'
import PieChart from '@/components/charts/pieChart.vue'
import BarChart from '@/components/charts/barChart.vue'
import ProjectTaskViews from '@/components/taskView.vue'
import Button from '@/components/common-used/button.vue'

// Stores
import { useProjectStore } from '@/stores/project'
import { useTaskStore } from '@/stores/task'
import { useSubtaskStore } from '@/stores/subtask'
import { useAuthStore } from '@/stores/auth'
import { useTeamStore } from '@/stores/team'
import { sub } from 'date-fns'
import { useUserStore } from '@/stores/user'


const route = useRoute()
const router = useRouter()
const taskStore = useTaskStore()
const subtaskStore = useSubtaskStore()
const projectStore = useProjectStore()
const authStore = useAuthStore()
const userStore = useUserStore()
const teamStore = useTeamStore()

const taskId = useRoute().params.id

// onMounted(async () => {
//   const result = await taskStore.fetchTask(taskId)
//   task.value = result
//   assignee.value = result.user || null
//   console.log('Task Detail View - task:', task.value)
//   console.log('Task team Info:', task.value.project?.team?.pms)
//   console.log('Assignee image:', assignee.value?.img_url)

//   if (task.value.user?.id) {
//     assigneeActivity.value = await fetchUserActivity(assignee.value.id)
//     console.log('Assignee Activity:', assigneeActivity.value)
//   }

//   for (const task of taskStore.tasks) {
//     task.subtasks = await subtaskStore.fetchByTask(task.id)
//     console.log('Fetched subtasks for task', task.id, task.subtasks)
//   }
// })

const fetchTaskDetails = async () => {
  isReady.value = false 

  try {
    const result = await taskStore.fetchTask(taskId)
    task.value = result
    assignee.value = result.user || null
    console.log('Task Detail View - task:', task.value)

    // Fetch subtasks
    if (task.value) {
      task.value.subtasks = await subtaskStore.fetchByTask(task.value.id)
    }

    // Fetch assignee activity
    if (assignee.value?.id && task.value?.id) {
      const allActivities = await userStore.fetchUserById(assignee.value.id)
      
      console.log('All Activities for Assignee:', allActivities)
      const activitiesArray = Array.isArray(allActivities.activities)
        ? allActivities.activities
        : [];

        // console.log('Activities Array:', )

      assigneeActivity.value = activitiesArray.filter(
        (act) =>
          act.task?.id === task.id
          // (act.action && act.action.includes(task.value.t_name)) 
      );
      console.log('task id:', task.value.id)
      // assigneeActivity.value = allActivities.activities.filter(
      //   (act) =>
      //     act.taskId === task.value.id || 
      //     (act.action && act.action.includes(task.value.t_name)) 
      // )
      console.log('Filtered Assignee Activity:', assigneeActivity.value)
    }
  } catch (err) {
    console.error('Failed to fetch task details:', err)
  } finally {
    isReady.value = true
  }
}

onMounted(fetchTaskDetails)


// State
const task = ref(null)
const assignee = ref(null)
const tasksWithSubtasks = ref([])
const TeamMembers = ref([])
const editTaskData = ref(null)
const showEditTaskForm = ref(false)
const showSubtaskForm = ref(false)
const assigneeActivity = ref([])
const isReady = ref(false)

const userRole = computed(() => authStore.user?.role || 'user')

const goBack = () => {
  router.push('/task')
}

// Form Fields
const taskFields = computed(() => [
  {
    type: 'text',
    label: 'Task Name',
    model: 'title',
    placeholder: 'Enter task name',
    required: true,
  },
  {
    type: 'textarea',
    label: 'Description',
    model: 'description',
    placeholder: 'Enter description',
  },
  { type: 'datetime-local', label: 'Start Date', model: 'startDate', required: true },
  { type: 'datetime-local', label: 'Due Date', model: 'dueDate', required: true },
  {
    type: 'select',
    label: 'Assignee',
    options: TeamMembers.value,
    model: 'user',
    valueKey: 'id',
    labelKey: 'name',
  },
  {
    type: 'select',
    label: 'Priority',
    options: [
      { id: 'high', name: 'High' },
      { id: 'medium', name: 'Medium' },
      { id: 'low', name: 'Low' },
    ],
    model: 'priority',
  },
])

const subtaskFields = computed(() => [
  {
    type: 'text',
    label: 'Subtask Name',
    model: 'title',
    placeholder: 'Enter subtask name',
    required: true,
  }
])

// Table Columns
const tableColumns = computed(() => {
  const baseColumns = [
    { key: 'title', label: 'Task Name' },
    { key: 'description', label: 'Description' },
    { key: 'priority', label: 'Priority' },
    { key: 'status', label: 'Status' },
    { key: 'start_date', label: 'Start Date' },
    { key: 'due_date', label: 'Due Date' },
    { key: 'icon', label: 'Assignee' },
  ]

  // Only admin or project_manager see actions column
  if (userRole.value === 'admin' || userRole.value === 'project_manager') {
    baseColumns.push({ key: 'actions', label: 'Actions', slot: 'actions' })
  }

  return baseColumns
})

const taskStatus = ref(task.value?.t_status || '')
watch(task, (newVal) => (taskStatus.value = newVal?.t_status || ''))

// Computed properties for subtask stats
const totalSubtasks = computed(() => subtasks.value.length)
const completedSubtasks = computed(() => 
  task.value?.subtasks?.filter(s => s.status === 'completed').length
)

// Admin Stats
const totalTasks = computed(() => tasksWithSubtasks.value.length)
const completedTasks = computed(
  () => tasksWithSubtasks.value.filter((t) => t.status?.toLowerCase() === 'completed').length,
)
const overdueTasks = computed(
  () =>
    tasksWithSubtasks.value.filter(
      (t) => new Date(t.due_date) < new Date() && t.status?.toLowerCase() !== 'completed',
    ).length,
)
const progressPercent = computed(() =>
  totalSubtasks.value > 0 ? Math.round((completedSubtasks.value / totalSubtasks.value) * 100) : 0,
)

const percentage = computed(() =>
  props.total > 0 ? Math.round((props.completed / props.total) * 100) : 0,
)

const statusData = computed(() => {
  const summary = { 'Not Started': 0, 'In Progress': 0, Completed: 0 }
  tasksWithSubtasks.value.forEach((t) => {
    const s = (t.status || '').toLowerCase()
    if (s === 'not started') summary['Not Started']++
    else if (s === 'in progress') summary['In Progress']++
    else if (s === 'completed') summary['Completed']++
  })
  return Object.entries(summary).map(([type, value]) => ({ type, value }))
})

// Methods
async function fetchProjectTasks(projectId) {
  tasksWithSubtasks.value = []
  await taskStore.fetchTasksByProject(projectId)

  const visibleTasks = taskStore.tasks.filter((t) => {
    if (userRole.value === 'admin' || userRole.value === 'project_manager') return true
    return t.user?.id === authStore.user?.id
  })
  console.log('Visible Tasks:', visibleTasks)
  tasksWithSubtasks.value = await Promise.all(
    visibleTasks.map(async (task) => {
      const subtasksData = await subtaskStore.fetchByTask(task.id)
      const subtasks = Array.isArray(subtasksData)
        ? subtasksData
        : subtasksData
          ? Object.values(subtasksData)
          : []
      const canEditTask =
        userRole.value === 'admin' ||
        (userRole.value === 'project_manager' &&
          TeamMembers.value.some((m) => m.id === task.user?.id))
      return {
        id: task.id,
        title: task.t_name,
        description: task.t_description,
        priority: task.t_priority || 'none',
        status: task.t_status || 'Not Started',
        start_date: task.start_date,
        due_date: task.due_date,
        icon: task.user?.img_url || null,
        user: task.user || authStore.user,
        canEdit: canEditTask, // PM/admin task CRUD

        subtasks: subtasks.map((st) => ({
          name: st.name,
          start: new Date(st.start_date || task.start_date),
          end: new Date(st.due_date || task.due_date),
          status: st.status,
          color: st.status === 'completed' ? '#8BD3B7' : '#FFD966',
          icon: st.user_avatar || null,
          canEdit:
            userRole.value === 'admin' || // Admin can CRUD anything
            (userRole.value === 'member' && st.user_id === authStore.user?.id), // Member can CRUD own subtasks
        })),
      }
    }),
  )
}

async function fetchProjectTeamMembers(teamId) {
  const team = teamStore.teams.find((t) => t.id === Number(teamId))
  if (!team) return
  TeamMembers.value = [
    ...(team.mainMembers || []).map((mm) => ({
      id: mm.id,
      name: `${mm.first_name} ${mm.last_name}`,
    })),
    ...(team.members || []).map((m) => ({ id: m.id, name: `${m.first_name} ${m.last_name}` })),
  ]
}

// async function handleTaskCreated(taskData) {
//   const payload = {
//     t_name: taskData.title,
//     t_description: taskData.description,
//     t_priority: taskData.priority,
//     t_status: taskData.status || 'Not Started',
//     start_date: taskData.startDate,
//     due_date: taskData.dueDate,
//     projectId: project.value.id,
//     userId: taskData.user?.id || null,
//   }
//   await taskStore.createTask(payload)
//   await fetchProjectTasks(project.value.id)
//   showTaskForm.value = false
// }

async function openEditTaskForm(task) {
  const projectId = task.project?.id
  if (projectId) {
    const fullProject = await projectStore.fetchProjectById(projectId)

    if (fullProject.team?.id) {
      await fetchProjectTeamMembers(fullProject.team.id)
    }
  }
  editTaskData.value = {
    id: task.id,
    title: task.t_name,                
    description: task.t_description,   
    startDate: task.start_date,         
    dueDate: task.due_date,             
    user: task.user?.id ,
    priority: task.t_priority           
  }

  console.log('Edit Task Data:', editTaskData.value)
  showEditTaskForm.value = true
}

async function handleSubtaskCreated(subtaskData) {
  const payload = {
    name: subtaskData.title,    
    status: subtaskData.status || 'not started', 
    taskId: task.value.id,       
  }

  await subtaskStore.createSubtask(payload)
  task.value.subtasks = await subtaskStore.fetchByTask(task.value.id)
  showSubtaskForm.value = false
}


async function onTaskUpdated(taskData) {
  if (!taskData?.id) return
  const payload = {
    t_name: taskData.title,
    t_description: taskData.description,
    t_priority: taskData.priority,
    t_status: taskData.status,
    start_date: taskData.startDate,
    due_date: taskData.dueDate,
    userId: taskData.user?.id || null,
  }
  await taskStore.updateTask(taskData.id, payload)
  await fetchProjectTasks(project.value.id)
}

function openAddSubtaskForm() {
  editSubtaskData.value = {
    taskId: task.value.id,
    title: '',
    description: '',
    startDate: task.value.start_date,
    dueDate: task.value.due_date,
    priority: 'medium',
    user: null
  }
  showSubtaskForm.value = true
}

async function addSubtask(taskId) {
  const name = prompt('Enter new subtask name:')
  if (!name) return
  const newSubtask = await subtaskStore.createSubtask({ name, taskId })
  console.log('Created subtask:', newSubtask)
  const task = taskStore.tasks.find((t) => t.id === taskId)
  if (task) {
    const subtasks = await subtaskStore.fetchByTask(taskId)
    if (!task.subtasks) task.subtasks = [] // initialize if undefined
    task.subtasks.splice(0, task.subtasks.length, ...subtasks)
  }
}

// async function editSubtask(taskId, subtaskId, currentName: string) {
//   const newName = prompt('Edit subtask name:', currentName)
//   if (!newName || newName.trim() === '') return

//   await subtaskStore.updateSubtask(subtaskId, { name: newName })

//   const task = taskStore.tasks.find((t) => t.id === taskId)
//   if (task) {
//     task.subtasks = await subtaskStore.fetchByTask(taskId)
//   }
// }

async function deleteSubtask(subtaskId) {
  if (!confirm('Are you sure you want to delete this subtask?')) return

  await subtaskStore.deleteSubtask(subtaskId)

  const task = taskStore.tasks.find((t) => t.subtasks?.some((s) => s.id === subtaskId))
  if (task) {
    task.subtasks = await subtaskStore.fetchByTask(task.id)
  }
}

// async function updateSubtaskStatus(subtask: any, taskId) {
//   if (!taskId) {
//     console.warn('updateSubtaskStatus called with undefined taskId', subtask)
//     return
//   }

//   const newStatus = subtask.status === 'completed' ? 'not started' : 'completed'
//   const updated = await subtaskStore.updateSubtask(subtask.id, { status: newStatus })
//   if (updated) {
//     const task = taskStore.tasks.find((t) => t.id === taskId)
//     if (task && task.subtasks) {
//       const s = task.subtasks.find((st: any) => st.id === subtask.id)
//       if (s) s.status = updated.status
//     }
//   }
// }

function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-GB')
}

async function fetchUserActivity(userId) {
  try {
    const activities = await userStore.fetchUserActivities(userId)
    return activities 
  } catch (err) {
    console.error('Failed to fetch user activity:', err)
    return []
  }
}


</script>
