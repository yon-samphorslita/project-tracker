<style scoped>

</style>

<template>
  <sidebar :items="menuItems"/>
  <Header />
  <search />
  <div style="left:300px; position: fixed; top: 170px;  display: flex; gap: 60px; padding: 20px;">
    <kanaban 
      :kanbantasks="Notstarted"
      :kanbanTaskNum="Notstarted.length"
      kanbanTaskStatus="Not started"  
    />
    <kanaban 
      :kanbantasks="Completed"
      :kanbanTaskNum="Completed.length"
      kanbanTaskStatus="In Progress"  
    />
    <kanaban 
      :kanbantasks="Completed"
      :kanbanTaskNum="Completed.length"
      kanbanTaskStatus="Completed"  
    />

  </div>
  <RouterView />
</template>


<script setup>
  import { RouterView } from 'vue-router';
  import sidebar from '@/components/sidebar.vue';
  import Header from '@/components/header.vue';
  import search from '@/components/search.vue';
  import kanaban from '@/components/kanban.vue';
  import profileimg from '@/assets/profile.jpg';

const menuItems = [
  {
    name: 'dashboard',
    label: 'Dashboard',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M3 12a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1zm0 8a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1zm10 0a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1zm1-17a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1z"/></svg>`
  },
  {
    name: 'projects',
    label: 'Projects',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256"><path fill="currentColor" d="M104 128v8a12 12 0 0 1-24 0v-8a12 12 0 0 1 24 0m24-16a12 12 0 0 0-12 12v12a12 12 0 0 0 24 0v-12a12 12 0 0 0-12-12m36-4a12 12 0 0 0-12 12v16a12 12 0 0 0 24 0v-16a12 12 0 0 0-12-12m56-16.4V164h4a12 12 0 0 1 0 24h-84v23.22a24 24 0 1 1-24 0V188H32a12 12 0 0 1 0-24h4V91.6A20 20 0 0 1 20 72V48a20 20 0 0 1 20-20h176a20 20 0 0 1 20 20v24a20 20 0 0 1-16 19.6M44 68h168V52H44Zm152 96V92H60v72Z"/></svg>`
  }
]

const Notstarted = [
  {
    taskname: 'Develop Landing Page',
    description: 'Build and style the homepage layout with a modern design.',
    taskpriority: 'High',
    user: profileimg,
  },
  {
    taskname: 'Implement Authentication',
    description: 'Set up user registration and login functionality.',
    taskpriority: 'Medium',
    user: profileimg
  },
  {
    taskname: 'Create API Endpoints',
    description: 'Develop RESTful APIs for data retrieval and manipulation.',
    taskpriority: 'Low',
    user: profileimg
  },
  {
    taskname: 'Create API Endpoints',
    description: 'Develop RESTful APIs for data retrieval and manipulation.',
    taskpriority: 'Low',
    user: profileimg
  }
]

const Completed = [
  {
    taskname: "Design UI Mockups",
    description: "Create Figma wireframes for the new dashboard.",
    taskpriority: "High",
    user: profileimg,
  },
  {
    taskname: "Redesign Notification System",
    description: "Update the notification center to include: read/unread status, grouping by project, and customizable alert sounds. Ensure mobile/desktop consistency.",
    taskpriority: "Medium",
    user: profileimg,
  },
  {
    taskname: "Write Project Proposal",
    description: "Draft a proposal for client approval.",
    taskpriority: "Low",
    user: profileimg,
  },
]
</script>
