<template>
  <div class="border border-gray-700/80 rounded-md">
    <div class="p-6 flex flex-col gap-6">
      <!-- First Row -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-gray-300 rounded-full"></div>
          <div class="flex flex-col gap-1">
            <div class="text-lg font-semibold text-gray-900">
              {{ name || 'Project Name' }}
            </div>
            <div class="text-gray-600">
              {{ detail || 'Detail' }}
            </div>
          </div>
        </div>
        <Status :status="status || 'not started'" />
      </div>

      <!-- Dashed Line -->
      <div class="border-t border-dashed border-gray-700/80"></div>

      <!-- Second Row -->
      <div class="flex justify-between items-center px-2">
        <DescriptionLabel label="Start Date" :description="formatDate(startdate)" />
        <DescriptionLabel label="End Date" :description="formatDate(enddate)" />
        <DescriptionLabel label="Progress" :description="formatDate(startdate)" />
        <DescriptionLabel label="Members" :description="formatDate(startdate)" />
      </div>

      <!-- Dashed Line -->
      <div class="border-t border-dashed border-gray-700/80"></div>

      <!-- Description -->
      <div class="px-2 text-gray-700">
        Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has
        been the industry's standard dummy text ever since the 1500s, when an unknown printer took a
        galley of type and scrambled it to make a type specimen book. It has survived not only five
        centuries, but also the leap into electronic typesetting, remaining essentially unchanged.
      </div>
    </div>

    <!-- Button -->
    <button
      @click="goToProjectPage"
      class="w-full border-t border-gray-700/80 py-2 text-gray-700 hover:bg-gray-100 transition"
    >
      View details
    </button>
  </div>
</template>

<script setup>
import Status from './status.vue'
import DescriptionLabel from './descriptionLabel.vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  name: String,
  detail: String,
  task: Object,
  startdate: String,
  enddate: String,
  status: String,
  project: Object,
})

const router = useRouter()

function goToProjectPage() {
  router.push(`/project/${props.project.id}`)
}

// Format date to dd MMM, yyyy
function formatDate(dateStr) {
  if (!dateStr) return 'TBD'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
</script>
