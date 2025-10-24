<template>
  <div class="flex flex-col gap-4">
    <!-- Header -->
    <div class="grid grid-cols-[3fr_2fr_1fr_1fr_1fr_auto] font-semibold border-b-2 pb-3 bg-white text-lg">
      <div class="pl-4">Task</div>
      <!-- <div class="flex justify-center">Description</div> -->
      <div class="flex justify-center">Project</div>
      <div class="flex justify-center">Due</div>
      <div class="flex justify-center">Priority</div>
      <!-- <div class="flex justify-center">Status</div> -->
      <div class="flex justify-center">Action</div>
      <div class="mx-5"></div>
    </div>

    <!-- Task Rows -->
    <div
      class="border rounded-lg"
      v-for="item in props.tasks"
      :key="item.id"
    >
      <div
        class="group grid grid-cols-[3fr_2fr_1fr_1fr_1fr_auto] items-center px-4 py-3 border-grey-200 hover:bg-grey-50 transition"
        @click="toggleExpand(item.id)"
      >
        <div class=" truncate ">{{ item.t_name }}</div>
        <!-- <div class=" line-clamp-2"> {{ item.t_description }}</div> -->
        <div class=" truncate flex justify-center ">{{ item.project?.p_name }}</div>
        <div class="flex justify-center">{{ formatDate(item.due_date) }}</div>

        <!-- Priority -->
        <div class="flex justify-center">
          <span
            :class="[
              'px-2 py-1 rounded  w-auto inline-block',
              item.t_priority === 'high' ? ' w-auto bg-red- text-red-600' :
              item.t_priority === 'medium' ? 'bg-yellow- text-yellow-600' :
              'bg-green- text-green-600'
            ]"
          >
            {{ item.t_priority }}
          </span>
        </div>

        <!-- Status -->
        <!-- <div class="flex justify-center">
          <span
            :class="[
              'px-2 py-1 rounded font-medium ',
              item.status === 'Completed' ? 'bg-green-100 text-green-600' :
              item.status === 'In Progress' ? 'bg-blue-100 text-blue-600' :
              'bg-gray-100 text-gray-600'
            ]"
          >
            {{ item.status }}
          </span>
        </div> -->


        <!-- Action Buttons  -->
        <div class="flex justify-around gap-2 bg-red-">
          <div v-if="item.t_status === 'not started'">
            <button
              class="px-3 py-1 border border-blue-500 rounded-lg bg-blue-100 text-blue-700 
                    hover:bg-blue-500 hover:text-white cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md"
              @click.stop="startTask(item.id)"
            >
              Start
            </button>
            
          </div>
          <div v-else-if="item.t_status === 'in progress'">
            <button
              class="px-3 py-1 border border-green-500 rounded-lg bg-green-100 text-green-700 
                    hover:bg-green-500 hover:text-white cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md"
              @click.stop="finishTask(item.id)"
            >
              Finish
            </button>

          </div>

          <div v-else-if="item.t_status === 'completed'">
            <div class="px-3 py-1 text-sm rounded-full bg-green-50 text-green-600 hover:bg-green-100" >
              Completed
            </div>

          </div>
          
        </div>

        <!-- More icon  -->
        <div class="flex justify-end items-center gap-2 text-gray-400 hover:text-gray-600 cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 16 16"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"><path d="M4 8h.01v.01H4z"/>
              <path d="M4.5 8a.5.5 0 1 1-1 0a.5.5 0 0 1 1 0M8 8h.01v.01H8z"/>
              <path d="M8.5 8a.5.5 0 1 1-1 0a.5.5 0 0 1 1 0m3.49 0H12v.01h-.01z"/>
              <path d="M12.49 8a.5.5 0 1 1-1 0a.5.5 0 0 1 1 0"/></g>
          </svg>
        </div>
          <!-- Task Description -->
          <div v-if="expandedTask.includes(item.id)" class="col-span-6 mt-3 border-t">
            <div v-if="item.t_description" class="my-3 pl-4">
              <h4 class="font-semibold mb-1">Description:</h4>
              <p class="text-gray-600  ">
                {{ item.t_description }}
              </p>
            </div>
          </div>
        
      </div>


      
      <!-- Subtask dropdown  -->
      <transition name="fade">
        <div
          v-if="expandedTask.includes(item.id)"
          class="col-span-6 bg-gray-50 rounded-lg p-4 mt-0 m-6 border border-gray-200"
        >
          <div class="flex flex-col gap-2">
            <div v-if="item.subtasks && item.subtasks.length">
       
              <div v-for="subtask in item.subtasks" :key="subtask.id" class="flex justify-between items-center bg-white px-3 py-2 rounded-md border border-gray-200">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    :checked="subtask.status === 'completed'"
                      class="accent-green-600"
                    @change.stop="updateSubtaskStatus(subtask, item.id)"
                  />
                  <span :class="['text-gray-700', subtask.status === 'completed' ? 'line-through text-gray-400' : '']">
                    {{ subtask.name }}
                  </span>
                </label>

                <div class="flex gap-2 text-gray-400 hover:text-gray-600">
                  <!-- Pass subtask.id here -->
                  <!-- <button @click.stop="editSubtask(subtask.id)" > -->
                  <button @click.stop="editSubtask(item.id, subtask.id, subtask.name)">

                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M6.414 15.89L16.556 5.748l-1.414-1.414L5 14.476v1.414zm.829 2H3v-4.243L14.435 2.212a1 1 0 0 1 1.414 0l2.829 2.829a1 1 0 0 1 0 1.414zM3 19.89h18v2H3z"/>
                    </svg>
                  </button>
                  <button @click.stop="deleteSubtask(subtask.id)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6zM19 4h-3.5l-1-1h-5l-1 1H5v2h14z"/>
                    </svg>
                  </button>
                </div>
              </div>

              
            </div>

            <button
              class="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium self-start"
              @click.stop="addSubtask(item.id)"
            >
              + Add Subtask
            </button>

          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSubtaskStore } from '@/stores/subtask';
import { useTaskStore } from '@/stores/task';
import { defineProps, defineEmits, ref, computed, onMounted } from 'vue'


const taskStore = useTaskStore()
const subtaskStore = useSubtaskStore()

const tasks = computed(() => taskStore.tasks)
const props = defineProps<{ tasks: any[] }>()
const emit = defineEmits(['edit-task', 'delete-task', 'update-status'])
const localTasks = ref([...props.tasks]) // make reactive copy
const expandedTask = ref<number[]>([])

async function toggleExpand(id: number) {
  if (expandedTask.value.includes(id)) {
    expandedTask.value = expandedTask.value.filter((t) => t !== id)
  } else {
    expandedTask.value.push(id)
  }

  // Fetch subtasks for this task
  const task = localTasks.value.find((t) => t.id === id)
  if (task) {
    task.subtasks = await subtaskStore.fetchByTask(id)
  }
}


function formatDate(dateStr: string) {
  if (!dateStr) return '-'
  const dueDate = new Date(dateStr)
  const now = new Date()

  const sameYear = dueDate.getFullYear() === now.getFullYear()

  // Format options
  const options: Intl.DateTimeFormatOptions = sameYear
    ? { day: 'numeric', month: 'short' } // e.g. "6 Oct"
    : { day: 'numeric', month: 'short', year: 'numeric' } // e.g. "1 Feb 2026"

  return dueDate.toLocaleDateString('en-GB', options)
}

async function startTask(taskId: number) {
  // emit('update-status', taskId, 'in progress')
  const updated = await taskStore.updateTask(taskId, { t_status: 'in progress' })
  if (updated) {
    // Update local task object for reactivity
    const task = localTasks.value.find(t => t.id === taskId)
    if (task) task.t_status = 'in progress'
  }

}

async function finishTask(taskId: number) {
  // emit('update-status', taskId, 'completed')
  const updated = await taskStore.updateTask(taskId, { t_status: 'completed' })
  if (updated) {
    const task = localTasks.value.find(t => t.id === taskId)
    if (task) task.t_status = 'completed'
  }
} 

async function addSubtask(taskId: number) {
  const name = prompt('Enter new subtask name:')
  if (!name) return
  const newSubtask = await subtaskStore.createSubtask({ name, taskId })
  console.log('Created subtask:', newSubtask)
  const task = localTasks.value.find(t => t.id === taskId)
  if (task) {
    const subtasks = await subtaskStore.fetchByTask(taskId)
    if (!task.subtasks) task.subtasks = [] // initialize if undefined
    task.subtasks.splice(0, task.subtasks.length, ...subtasks)
  }
}

async function editSubtask(taskId: number, subtaskId: number, currentName: string) {
  const newName = prompt('Edit subtask name:', currentName)
  if (!newName || newName.trim() === '') return

  await subtaskStore.updateSubtask(subtaskId, { name: newName })

  const task = localTasks.value.find(t => t.id === taskId)
  if (task) {
    task.subtasks = await subtaskStore.fetchByTask(taskId)
  }
}

async function deleteSubtask(subtaskId: number) {
  if (!confirm('Are you sure you want to delete this subtask?')) return

  await subtaskStore.deleteSubtask(subtaskId)

  const task = localTasks.value.find(t => t.subtasks?.some(s => s.id === subtaskId))
  if (task) {
    task.subtasks = await subtaskStore.fetchByTask(task.id)
  }}

async function updateSubtaskStatus(subtask: any, taskId: number) {
  if (!taskId) {
    console.warn('updateSubtaskStatus called with undefined taskId', subtask)
    return
  }

  const newStatus = subtask.status === 'completed' ? 'not started' : 'completed'
  const updated = await subtaskStore.updateSubtask(subtask.id, { status: newStatus })
  if (updated) {
    const task = localTasks.value.find(t => t.id === taskId)
    if (task && task.subtasks) {
      const s = task.subtasks.find((st: any) => st.id === subtask.id)
      if (s) s.status = updated.status
    }
  }
}

onMounted(async() => {
  await taskStore.fetchTasks()
  localTasks.value = taskStore.tasks.map(t => ({ ...t }))

  for (const task of localTasks.value) {
    task.subtasks = await subtaskStore.fetchByTask(task.id)
    console.log('Fetched subtasks for task', task.id, task.subtasks)
  }

})

</script>
