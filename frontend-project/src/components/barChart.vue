<template>
  <div>
    <canvas ref="canvasRef"></canvas>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { Chart, registerables } from 'chart.js'
import { useTaskStore } from '@/stores/task'
import { useTeamStore } from '@/stores/team'

Chart.register(...registerables)

const props = defineProps({
  projectId: { type: Number, required: true },
  teamId: { type: Number, required: true }, // add teamId to know which members to show
})

const canvasRef = ref(null)
let chartInstance = null

const taskStore = useTaskStore()
const teamStore = useTeamStore()
const teamWorkloadData = ref([])
const teamMembers = ref([])

const fetchTeamWorkload = async () => {
  // Fetch team members first
  const team = await teamStore.fetchTeam(props.teamId)
  if (!team) return
  teamMembers.value = [...(team.members || []), ...(team.pms || [])] // flatten PMs + members

  // Fetch tasks for this project
  await taskStore.fetchTasksByProject(props.projectId)
  const tasks = taskStore.tasks.filter((t) => t.project?.id === props.projectId)

  // Initialize workload for all members (0 tasks)
  const workload = {}
  teamMembers.value.forEach((member) => {
    const name = `${member.first_name} ${member.last_name}`
    workload[name] = 0
  })

  // Count tasks per assigned member
  tasks.forEach((task) => {
    const name =
      task.assigned_to?.first_name && task.assigned_to?.last_name
        ? `${task.assigned_to.first_name} ${task.assigned_to.last_name}`
        : null
    if (name && workload[name] !== undefined) {
      workload[name] += 1
    }
  })

  // Prepare data for chart
  teamWorkloadData.value = Object.entries(workload).map(([member, count]) => ({ member, count }))

  renderChart()
}

const renderChart = () => {
  if (!canvasRef.value) return

  const labels = teamWorkloadData.value.map((d) => d.member)
  const counts = teamWorkloadData.value.map((d) => d.count)

  if (chartInstance) chartInstance.destroy()

  chartInstance = new Chart(canvasRef.value, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Tasks Assigned',
          data: counts,
          backgroundColor: '#4F46E5',
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { title: { display: true, text: 'Assignee' } },
        y: { beginAtZero: true, title: { display: true, text: 'Tasks' }, ticks: { stepSize: 1 } },
      },
    },
  })
}

onMounted(fetchTeamWorkload)
watch(() => [props.projectId, props.teamId], fetchTeamWorkload)
onBeforeUnmount(() => {
  if (chartInstance) chartInstance.destroy()
})
</script>

<style scoped>
canvas {
  width: 100%;
  height: 100%;
}
</style>
