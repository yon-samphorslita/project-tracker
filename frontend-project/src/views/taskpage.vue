<template>
    <TaskLayout>
        <div class="flex flex-col gap-4">

          <!-- Header (New team button , search, filter + Table header) -->
          <div class="flex flex-col gap-4 pt-5 bg-white">
            <div class="flex justify-between items-center">
              <Button
                label="+ New Team"
                btn-color="#C6E7FF"
                btntext="black"
                @click="showTaskForm = true"
              />
              <taskform 
                v-model:modelValue="showTaskForm"
                formTitle="Create Task" 
                :fields="taskFields" 
                endpoint="tasks"
              />

              <div class="flex gap-4 items-center">
                <Search @update="searchQuery = $event" />
                <Filter class="min-w-fit" title="Sort by" :options="sortOptions" @select="applySort" />
              </div>
            </div>

          </div>

          <div class="flex flex-col gap-3 border rounded-2xl p-4 bg-white h-full">
          <TaskCard :tasks="taskList" @edit-task="handleEdit" @delete-task="handleDelete" />
          </div>

        </div>
    </TaskLayout>
</template>

<script setup lang="ts">
import TaskCard from '@/components/taskCard.vue'
import TaskLayout from './pageLayout.vue'
import Button from '@/components/button.vue'
import Search from '@/components/search.vue'
import Filter from '@/components/filter.vue'
import taskform from '@/components/form.vue'
import { onMounted, ref } from 'vue'


// state 
const showTaskForm = ref(false)
const searchQuery = ref('')
const selectedSort = ref('')
const sortOptions = [
  { value: 'alphabetical-asc', label: 'Alphabetical Order (A → Z)' },
  { value: 'alphabetical-desc', label: 'Alphabetical Order (Z → A)' },
  { value: 'date-asc', label: 'Date Created (Oldest First)' },
  { value: 'date-desc', label: 'Date Created (Newest First)' },
]   

const taskFields = [
  { type: 'text', label: 'Task Title', placeholder: 'Enter task title', model: 'title' },
  {
    type: 'textarea',
    label: 'Description',
    placeholder: 'Enter description',
    model: 'description',
  },
  // { type: 'select', label: 'Assignee', options: Members, model: 'assignee' },
  //   { 
  //   type: 'select', 
  //   label: 'Assignee', 
  //   options: teamStore.teams.map(team => ({ 
  //       id: team.id, 
  //       name: team.name 
  //   })),
  //   model: 'team_id' 
  // },
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
  { type: 'date', label: 'Start Date', model: 'startDate' },
  { type: 'date', label: 'Due Date', model: 'dueDate' },
]

const taskList = ref([
  {
    id: 1,
    title: 'Design Login Page',
    projectname: 'Website Redesign',
    due_date: '2025-10-15',
    priority: 'High',
    status: 'Completed'
  },
  {
    id: 2,
    title: 'Design Figma',
    projectname: 'Website Redesign',
    due_date: '2025-10-15',
    priority: 'High',
    status: 'In Progress'
  },
  {
    id: 3,
    title: 'Fix API Endpoint',
    projectname: 'Backend Refactor',
    due_date: '2025-10-20',
    priority: 'Low',
    status: 'Not Started'
  },
  {
    id: 4,
    title: 'Deploy to Production',
    projectname: 'E-Commerce Platform',
    due_date: '2025-10-25',
    priority: 'Medium',
    status: 'In Progress'
  }
])


function handleEdit(id: number) {
  console.log('Edit task ID:', id)
}

function handleDelete(id: number) {
  console.log('Delete task ID:', id)
}

// Computed filtered & sorted Tasks
// const filteredSortedTasks = computed(() => {
//   let list = [...teams.value]
//   console.log('Teams:', list)

//   if (searchQuery.value) {
//     const q = searchQuery.value.toLowerCase()
//     list = list.filter(team => team.name.toLowerCase().includes(q))
//   }

//   if (selectedSort.value === 'alphabetical-asc') {
//     list.sort((a, b) => a.name.localeCompare(b.name))
//   } else if (selectedSort.value === 'alphabetical-desc') {
//     list.sort((a, b) => b.name.localeCompare(a.name))
//   }    

//   return list
// })

// Sorting
const applySort = (option) => {
  selectedSort.value = option
}

</script>