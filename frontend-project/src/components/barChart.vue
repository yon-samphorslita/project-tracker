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
  teamId: { type: Number, required: true },
})

const canvasRef = ref(null)
let chartInstance = null

const taskStore = useTaskStore()
const teamStore = useTeamStore()
const teamWorkloadData = ref([])
const teamMembers = ref([])

const fetchTeamWorkload = async () => {
  // 1️⃣ Fetch team members
  const team = await teamStore.fetchTeam(props.teamId)
  if (!team) return
  teamMembers.value = [...(team.members || []), ...(team.pms || [])]

  // 2️⃣ Fetch project tasks
  await taskStore.fetchTasksByProject(props.projectId)
  const tasks = taskStore.tasks.filter((t) => t.project?.id === props.projectId)

  // 3️⃣ Initialize workload structure
  const workload = {}
  teamMembers.value.forEach((member) => {
    const name = `${member.first_name} ${member.last_name}`
    workload[name] = { total: 0, completed: 0 }
  })

  // 4️⃣ Count tasks per assigned member
  tasks.forEach((task) => {
    // adapt to your actual task structure
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

  // 5️⃣ Prepare chart data
  const totalData = []
  const completedData = []
  const labels = []

  Object.entries(workload).forEach(([name, { total, completed }]) => {
    labels.push(name)
    totalData.push(total)
    completedData.push(completed)
  })

  teamWorkloadData.value = { labels, totalData, completedData }

  renderChart()
}

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
          backgroundColor: '#8BD3B7',
          borderRadius: 4,
        },
        {
          label: 'Total Tasks',
          data: totalData,
          backgroundColor: '#C6E7FF',
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true, position: 'bottom' },
      },
      // scales: {
      //   x: { title: { display: true, text: 'Team Members' } },
      //   y: {
      //     beginAtZero: true,
      //     title: { display: true, text: 'Tasks' },
      //     ticks: { stepSize: 1 },
      //   },
      // },
      scales: {
        x: { stacked: true, title: { display: true, text: 'Team Members' } },
        y: { stacked: true, beginAtZero: true, title: { display: true, text: 'Tasks' } },
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
