<template>
  <div class="flex border-b border-gray-300 w-[40%]">
    <div
      v-for="option in options"
      :key="option.name"
      class="flex-1 flex items-start justify-center flex-col cursor-pointer relative p-2"
      @click="setActive(option.name)"
    >
      <div class="flex items-center gap-2">
        <component
          :is="option.icon"
          :class="[
            'w-6 h-6 transition-colors duration-200',
            activeOption === option.name
              ? 'text-main-text opacity-100'
              : 'text-[var(--gray-text)] opacity-60 hover:opacity-80'
          ]"
        />

        <div
          :class="[
            'transition-colors duration-200',
            activeOption === option.name
              ? 'text-main-text opacity-100 font-bold'
              : 'text-[var(--gray-text)] opacity-80 hover:opacity-100'
          ]"
        >
          {{ option.name }}
        </div>
      </div>

      <div
        v-if="activeOption === option.name"
        class="absolute bottom-0 left-0 w-full h-[2px] bg-black-bg rounded-lg"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue'
import KanbanIcon from '@/assets/icons/kanban.svg'
import GanttIcon from '@/assets/icons/gantt.svg'
import TableIcon from '@/assets/icons/table.svg'

const props = defineProps({
  activeOption: {
    type: String,
    default: 'Kanban',
  },
})

const emit = defineEmits(['update:activeOption'])

const options = [
  { name: 'Kanban', icon: KanbanIcon },
  { name: 'Gantt', icon: GanttIcon },
  { name: 'Table', icon: TableIcon },
]

const activeOption = ref(props.activeOption)

watch(
  () => props.activeOption,
  (val) => (activeOption.value = val)
)

function setActive(name) {
  activeOption.value = name
  emit('update:activeOption', name)
}
</script>