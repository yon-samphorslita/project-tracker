<template>
    <div class="w-[400px] md:w-96 h-auto flex-shrink-0 overflow-y-auto top-[170px] rounded-md shadow-lg bg-[#C6E7FF] p-4">
        
        <div class="sticky top-0 flex justify-between items-center my-5 bg-[#C6E7FF] z-10">
        
            <!-- kanban header  -->
            <div class="flex gap-2 items-center">
                <div class="w-2 h-8 rounded-r-md" :style="{'background': statusColor}"></div>
                <div class="text-gray-800 text-base md:text-lg font-medium">
                    {{ kanbanTaskStatus }}
                </div>
            </div>

            <div class="flex items-center gap-2 md:gap-3">
                <div class="w-5 h-5 flex justify-center items-center rounded-full text-white text-xs" 
                    :style="{'background': statusColor}"
                >
                    {{ kanbanTaskNum }}
                </div>
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24"><path fill="currentColor" d="M5 10c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2m14 0c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2m-7 0c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2"/></svg>
            </div>
        </div>

        <!-- tasks  -->
        <div class="w-full h-[70vh] overflow-y-auto space-y-5">
            <div  v-for="kanban in kanbantasks" class="bg-white border border-black rounded-md shadow-md p-3 flex flex-col space-y-2">
                <!-- task header  -->
                <div class="flex justify-between items-center">
                    <div class="font-medium text-gray-800 truncate"> 
                        {{ kanban.taskname }} 
                    </div> 
                    <div class="flex justify-between w-12 md:w-14 gap-1 md:gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M20.71 7.04c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.37-.39-1.02-.39-1.41 0l-1.84 1.83l3.75 3.75M3 17.25V21h3.75L17.81 9.93l-3.75-3.75z"/></svg>
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M12 3c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2m0 14c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2m0-7c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2"/></svg>
                    </div>
                </div>

                <!-- task description  -->
                <div  class="text-gray-500 text-sm">
                    {{ kanban.description }}
                </div>

                <!-- task footer  -->
                <div class="flex justify-between items-center">
                    <div class="px-2 py-1 rounded-md text-sm" :style="{'background': getPriorityColors(kanban.taskpriority).background, 'color': getPriorityColors(kanban.taskpriority).color}">
                        {{ kanban.taskpriority }} 
                    </div>
                    <div class=" w-8 h-8 rounded-full overflow-hidden">
                        <img :src="kanban.user" alt="Profile Image" class="object-cover w-full h-full">
                    </div>
                </div>
                <hr class="my-1 border-gray-300">
                <div class="flex items-center text-sm text-gray-700">
                    <div class="font-semibold mr-2">Due: </div>
                    <div>2 Mar,2025</div>
                </div>
            </div>
        </div>
      </div>
    <!-- </div> -->
  <!-- </div> -->
</template>

<script setup>
import { computed } from 'vue'
// import { defineProps } from 'vue';
const props = defineProps({
  kanbantasks: {
    type: Array,
    required: true,
  },
  kanbanTaskStatus: {
    type: String,
    required: true,
  },
  kanbanTaskNum: {
    type: Number,
    required: true,
  },
})

const statusColor = computed(() => {
  switch (props.kanbanTaskStatus.toLowerCase()) {
    case 'not started':
      return 'red'
    case 'in progress':
      return 'orange'
    case 'completed':
      return 'green'
    default:
      return '#9E9E9E'
  }
})

const getPriorityColors = (priority) => {
  priority = priority.toLowerCase()
  switch (priority) {
    case 'high':
      return { background: 'lightgreen', color: 'green' }
    case 'medium':
      return { background: 'yellow', color: 'darkorange' }
    case 'low':
      return { background: 'pink', color: 'red' }
    default:
      return { background: 'lightgrey', color: 'black' }
  }
}
</script>

<style>
</style>
