<template>
  <ProjectLayout>
    <div class="container flex flex-col gap-4">
      <div class="flex font-semibold text-2xl">All Projects</div>

      <!-- Header with search & filter -->
      <div class="flex justify-between items-center w-full">
        <div class="flex font-semibold text-lg">All Projects</div>
        <div class="flex gap-4">
          <search />
          <Filter
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
import { onMounted } from 'vue'
import ProjectLayout from './projectLayout.vue'
import search from '@/components/search.vue'
import Filter from '@/components/filter.vue'
import ProjectCard from '@/components/projectCard.vue'
import { useProjectStore } from '@/stores/project'

const projectStore = useProjectStore()

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
