<template>
  <div>
    <canvas ref="canvasRef"></canvas>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, getCurrentInstance } from 'vue' // line changed: removed unused imports
import { Chart, registerables } from 'chart.js'
import { useTaskStore } from '@/stores/task'
import { useTeamStore } from '@/stores/team'

Chart.register(...registerables)

const props = defineProps({
  projectId: { type: Number, required: true },
  teamId: { type: Number, required: true },
})

const canvasRef = ref(null)
let chartInstance = null

const taskStore = useTaskStore()
const teamStore = useTeamStore()
const teamWorkloadData = ref([]) // no change
const teamMembers = ref([])

const fetchTeamWorkload = async () => {
  const team = await teamStore.fetchTeam(props.teamId)
  if (!team) return
  teamMembers.value = [...(team.members || []), ...(team.mainMembers || [])]

  const tasks = taskStore.tasks.filter((t) => t.project?.id === props.projectId)

  const workload = {}
  teamMembers.value.forEach((member) => {
    const name = `${member.first_name} ${member.last_name}`
    workload[name] = { total: 0, completed: 0 }
  })

  tasks.forEach((task) => {
    const user = task.user || task.assigned_to || null
    const memberName =
      user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : null

    if (memberName && workload[memberName]) {
      workload[memberName].total += 1
      if ((task.t_status || task.status || '').toLowerCase() === 'completed') {
        workload[memberName].completed += 1
      }
    }
  })

  const labels = []
  const totalData = []
  const completedData = []

  Object.entries(workload).forEach(([name, { total, completed }]) => {
    labels.push(name)
    totalData.push(total)
    completedData.push(completed)
  })

  teamWorkloadData.value = { labels, totalData, completedData }
  renderChart()
}

const styles = getComputedStyle(document.documentElement)
const getColor = (index) => styles.getPropertyValue(`--random-color-${index}`).trim()
const randomColors = [1, 2, 3, 4, 5, 6].sort(() => Math.random() - 0.5) // line changed: removed unused numbers if desired

const renderChart = () => {
  if (!canvasRef.value) return
  if (chartInstance) chartInstance.destroy()

  const { labels, totalData, completedData } = teamWorkloadData.value

  chartInstance = new Chart(canvasRef.value, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Completed Tasks',
          data: completedData,
          backgroundColor: getColor(randomColors[0]),
          borderRadius: 4,
        },
        {
          label: 'Total Tasks',
          data: totalData,
          backgroundColor: getColor(randomColors[1]),
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: true, position: 'bottom' } },
      scales: {
        x: { stacked: true, title: { display: true, text: 'Team Members' } },
        y: { stacked: true, beginAtZero: true, title: { display: true, text: 'Tasks' } },
      },
    },
  })
}

watch(
  () => taskStore.tasks,
  () => fetchTeamWorkload(),
  { deep: true },
)

watch(() => [props.projectId, props.teamId], fetchTeamWorkload)

onMounted(fetchTeamWorkload)
onBeforeUnmount(() => {
  if (chartInstance) chartInstance.destroy()
})
</script>
