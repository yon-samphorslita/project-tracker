<template>
  <ProjectLayout>
    <div class="container flex flex-col gap-4">
      <div class="flex font-semibold text-2xl">All Projects</div>

      <!-- Header with search & filter -->
      <div class="flex justify-between items-center w-full">
        <Button
          label="+ Create New Project"
          btn-color="#C6E7FF"
          btntext="black"
          @click="openForm"
        />
        <Form formTitle="Create Project" :fields="projectFields" endpoint="projects" />
        <div class="flex gap-4 items-center">
          <search />
          <Filter
            class="min-w-fit"
            title="Sort by"
            :options="[
              { value: 'priority-High', label: 'Priority (High → Low)' },
              { value: 'priority-Low', label: 'Priority (Low → High)' },
              { value: 'due-soonest', label: 'Due (Soonest first)' },
              { value: 'due-latest', label: 'Due (Latest first)' },
            ]"
            @select="applySort"
          />
        </div>
      </div>

      <!-- Project Cards -->
      <div class="flex flex-col gap-4">
        <ProjectCard
          v-for="project in projectStore.projects"
          :key="project.id"
          :name="project.p_name"
          :detail="project.p_description"
          :startdate="formatDate(project.start_date)"
          :enddate="formatDate(project.due_date)"
          :status="project.status"
          :project="project"
        />
      </div>
    </div>
  </ProjectLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ProjectLayout from './projectLayout.vue'
import search from '@/components/search.vue'
import Filter from '@/components/filter.vue'
import ProjectCard from '@/components/projectCard.vue'
import { useProjectStore } from '@/stores/project'
import Button from '@/components/button.vue'
import Form from '@/components/form.vue'
const projectStore = useProjectStore()
const showForm = ref(false)
function openForm() {
  showForm.value = true
}
const Teams = [
  { id: 1, name: 'Team A' },
  { id: 2, name: 'Team B' },
  { id: 3, name: 'Team C' },
]
const projectFields = [
  { type: 'text', label: 'Project Title', placeholder: 'Enter project title', model: 'title' },
  {
    type: 'textarea',
    label: 'Description',
    placeholder: 'Enter description',
    model: 'description',
  },
  { type: 'select', label: 'Assignee', options: Teams, model: 'assignee' },
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

onMounted(() => {
  projectStore.fetchProjects()
})

function applySort(option) {
  console.log('Selected sort option:', option)
  // implement sorting logic here if needed
}

function formatDate(dateStr) {
  if (!dateStr) return 'TBD'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>
