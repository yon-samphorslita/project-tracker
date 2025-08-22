<template>
  <div class="flex border-b border-gray-300 w-[40%]">
    <div
      v-for="option in options"
      :key="option.name"
      class="flex-1 flex items-start justify-center flex-col cursor-pointer relative p-2"
      @click="setActive(option.name)"
    >
      <div class="flex items-start gap-2">
        <img
          :src="option.icon"
          :alt="option.name + ' Icon'"
          :class="activeOption === option.name ? 'opacity-100' : 'opacity-60'"
          class="w-6 h-6"
        />
        <div
          :class="
            activeOption === option.name ? 'opacity-100 text-black' : 'opacity-80 text-gray-600'
          "
        >
          {{ option.name }}
        </div>
      </div>

      <div
        v-if="activeOption === option.name"
        class="absolute bottom-0 left-0 w-full h-[2px] bg-black rounded-lg"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue'
import kanbanIcon from '@/assets/icons/kanban.svg'
import ganttIcon from '@/assets/icons/gantt.svg'
import tableIcon from '@/assets/icons/table.svg'

const props = defineProps({
  activeOption: {
    type: String,
    default: 'Kanban',
  },
})
const emit = defineEmits(['update:activeOption'])

const options = [
  { name: 'Kanban', icon: kanbanIcon },
  { name: 'Gantt', icon: ganttIcon },
  { name: 'Table', icon: tableIcon },
]

const activeOption = ref(props.activeOption)

// Watch prop changes from parent
watch(
  () => props.activeOption,
  (val) => (activeOption.value = val),
)

// Handle tab click
function setActive(name) {
  activeOption.value = name
  emit('update:activeOption', name)
}
</script>
