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
  projectId: { type: Number, required: false }, // optional
  teamId: { type: Number, required: false }, // optional
  eventData: Object, // optional admin summary data
})

const canvasRef = ref(null)
let chartInstance = null

const taskStore = useTaskStore()
const teamStore = useTeamStore()

const chartData = ref({ labels: [], totalData: [], completedData: [] })

// Task / Team Workload
const fetchTeamWorkload = async () => {
  if (props.teamId) {
    // Specific team workload
    const team = await teamStore.fetchTeam(props.teamId)
    if (!team) return
    const members = [...(team.members || []), ...(team.mainMembers || [])]

    const tasks = taskStore.tasks.filter((t) => t.project?.id === props.projectId)
    const workload = {}

    members.forEach((member) => {
      const name = `${member.first_name} ${member.last_name}`
      workload[name] = { total: 0, completed: 0 }
    })

    tasks.forEach((task) => {
      const user = task.user || task.assigned_to || null
      const name =
        user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : null
      if (name && workload[name]) {
        workload[name].total += 1
        if ((task.t_status || task.status || '').toLowerCase() === 'completed') {
          workload[name].completed += 1
        }
      }
    })

    const labels = [],
      totalData = [],
      completedData = []
    Object.entries(workload).forEach(([name, { total, completed }]) => {
      labels.push(name)
      totalData.push(total)
      completedData.push(completed)
    })

    chartData.value = { labels, totalData, completedData }
    renderTaskChart()
  } else {
    // Aggregate all teams
    await teamStore.fetchTeams()
    const teams = teamStore.teams || []

    const labels = [],
      totalData = [],
      completedData = []

    for (const team of teams) {
      labels.push(team.name || `Team ${team.id}`)
      const members = [...(team.members || []), ...(team.mainMembers || [])]

      const tasks = taskStore.tasks.filter((t) =>
        members.some((m) => t.user?.id === m.id || t.assigned_to?.id === m.id),
      )

      totalData.push(tasks.length)
      completedData.push(
        tasks.filter((t) =>
          ['completed', 'done', 'finished'].includes((t.t_status || t.status || '').toLowerCase()),
        ).length,
      )
    }

    chartData.value = { labels, totalData, completedData }
    renderTaskChart()
  }
}

// Chart Rendering
const styles = getComputedStyle(document.documentElement)
const getColor = (index) => styles.getPropertyValue(`--random-color-${index}`).trim()
const randomColors = [1, 2, 3, 4, 5, 6].sort(() => Math.random() - 0.5)

const renderTaskChart = () => {
  if (!canvasRef.value) return
  if (chartInstance) chartInstance.destroy()

  const { labels, totalData, completedData } = chartData.value

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
        x: {
          stacked: true,
          title: { display: true, text: props.teamId ? 'Team Members' : 'Teams' },
        },
        y: { stacked: true, beginAtZero: true, title: { display: true, text: 'Tasks' } },
      },
    },
  })
}

const renderEventChart = () => {
  if (!canvasRef.value) return
  if (chartInstance) chartInstance.destroy()

  const { labels = [], data = [] } = props.eventData || {}

  chartInstance = new Chart(canvasRef.value, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Event Count',
          data,
          backgroundColor: getColor(randomColors[3]),
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: true, position: 'bottom' } },
      scales: {
        x: { title: { display: true, text: 'Users' } },
        y: { beginAtZero: true, title: { display: true, text: 'Event Count' } },
      },
    },
  })
}

// Watchers
watch(
  [() => taskStore.tasks, () => props.eventData],
  () => {
    props.eventData ? renderEventChart() : fetchTeamWorkload()
  },
  { deep: true },
)

watch(() => [props.projectId, props.teamId], fetchTeamWorkload)

// Lifecycle
onMounted(() => {
  props.eventData ? renderEventChart() : fetchTeamWorkload()
})

onBeforeUnmount(() => {
  if (chartInstance) chartInstance.destroy()
})
</script>
