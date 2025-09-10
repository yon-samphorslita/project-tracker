<style scoped></style>

<template>
  <sidebar :items="menuItems" />

  <div class="fixed top-[120px] left-[300px] w-[calc(100vw-300px)]">
    <Header />
    <Button 
      label="Create New Project" 
      />

    <!-- <notification/> -->

    <search />


    <div style="w-full">

    </div>
    <Form 
      formTitle="Create Project" 
      :fields="projectFields" 
      endpoint="projects" />

    <Form 
      formTitle="Create Task" 
      :fields="taskFields" 
      endpoint="tasks" />

    <Form 
      formTitle="Create Subtask" 
      :fields="subtaskFields" 
      endpoint="subtask" /> 
    <div class="fixed top-52 w-[calc(100vw-300px)] h-[calc(100vh-200px)] overflow-y-auto flex flex-col items-center xl:flex-row xl:justify-around xl:w-[calc(100vw-300px)] space-y-5">
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
  </div>


  <RouterView />
</template>

<script setup>
  import { RouterView } from 'vue-router';
  import sidebar from '@/components/sidebar.vue';
  import Header from '@/components/header.vue';
  import Button from '@/components/button.vue';
  import search from '@/components/search.vue';
  import Form from '@/components/form.vue';
  import kanaban from '@/components/kanban.vue';
  import notification from '@/components/notification.vue';
  import profileimg from '@/assets/profile.jpg';
  import { ref } from 'vue';

  const showForm = ref(false);

const Teams = [
  { id: 1, name: 'Team A' },
  { id: 2, name: 'Team B' },
  { id: 3, name: 'Team C' },
]

const Members = [
  { id: 1, name: 'Anna' },
  { id: 2, name: 'Ken' },
  { id: 3, name: 'Jane' },
]

const projectFields = [
  { type: 'text', label: 'Project Title', placeholder: 'Enter project title', model: 'title' },
  {
    type: 'textarea',
    label: 'Description',
    placeholder: 'Enter description',
    model: 'description',
  },
  { type: 'select', label: 'Assignee', options: Teams, model: 'assignee' },
  {
    type: 'select',
    label: 'Priority',
    options: [
      { id: 'high', name: 'High' },
      { id: 'medium', name: 'Medium' },
      { id: 'low', name: 'Low' },
    ],
    model: 'priority',
  },
  { type: 'date', label: 'Start Date', model: 'startDate' },
  { type: 'date', label: 'Due Date', model: 'dueDate' },
]

const taskFields = [
  { type: 'text', label: 'Task Title', placeholder: 'Enter task title', model: 'title' },
  {
    type: 'textarea',
    label: 'Description',
    placeholder: 'Enter description',
    model: 'description',
  },
  { type: 'select', label: 'Assignee', options: Members, model: 'assignee' },
  {
    type: 'select',
    label: 'Priority',
    options: [
      { id: 'high', name: 'High' },
      { id: 'medium', name: 'Medium' },
      { id: 'low', name: 'Low' },
    ],
    model: 'priority',
  },
  { type: 'date', label: 'Start Date', model: 'startDate' },
  { type: 'date', label: 'Due Date', model: 'dueDate' },
]

const subtaskFields = [
  { type: 'text', label: 'Subtask Title', placeholder: 'Enter subtask title', model: 'title' },
]

const menuItems = [
  {
    name: 'dashboard',
    label: 'Dashboard',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M3 12a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1zm0 8a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1zm10 0a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1zm1-17a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1z"/></svg>`,
  },
  {
    name: 'projects',
    label: 'Projects',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256"><path fill="currentColor" d="M104 128v8a12 12 0 0 1-24 0v-8a12 12 0 0 1 24 0m24-16a12 12 0 0 0-12 12v12a12 12 0 0 0 24 0v-12a12 12 0 0 0-12-12m36-4a12 12 0 0 0-12 12v16a12 12 0 0 0 24 0v-16a12 12 0 0 0-12-12m56-16.4V164h4a12 12 0 0 1 0 24h-84v23.22a24 24 0 1 1-24 0V188H32a12 12 0 0 1 0-24h4V91.6A20 20 0 0 1 20 72V48a20 20 0 0 1 20-20h176a20 20 0 0 1 20 20v24a20 20 0 0 1-16 19.6M44 68h168V52H44Zm152 96V92H60v72Z"/></svg>`,
  },
  {
    name: 'tasks',
    label: 'Tasks',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" fill-rule="evenodd"><path d="m12.594 23.258l-.012.002l-.071.035l-.02.004l-.014-.004l-.071-.036q-.016-.004-.024.006l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.016-.018m.264-.113l-.014.002l-.184.093l-.01.01l-.003.011l.018.43l.005.012l.008.008l.201.092q.019.005.029-.008l.004-.014l-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.003-.011l.018-.43l-.003-.012l-.01-.01z"/><path fill="currentColor" d="M7.416 3A5 5 0 0 0 7 5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2c0-.711-.148-1.388-.416-2H18a2 2 0 0 1 2 2v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM12 14H9a1 1 0 1 0 0 2h3a1 1 0 1 0 0-2m3-4H9a1 1 0 0 0-.117 1.993L9 12h6a1 1 0 1 0 0-2m-3-8a3 3 0 0 1 2.236 1c.428.478.704 1.093.755 1.772L15 5H9c0-.725.257-1.39.685-1.908L9.764 3c.55-.614 1.348-1 2.236-1"/></g></svg>`,
  },
  {
    name: 'teams',
    label: 'Teams',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 20 20"><path fill="currentColor" d="M12.5 4.5a2.5 2.5 0 1 1-5 0a2.5 2.5 0 0 1 5 0m5 .5a2 2 0 1 1-4 0a2 2 0 0 1 4 0m-13 2a2 2 0 1 0 0-4a2 2 0 0 0 0 4M6 9.25C6 8.56 6.56 8 7.25 8h5.5c.69 0 1.25.56 1.25 1.25V14a4 4 0 0 1-8 0zm-1 0c0-.463.14-.892.379-1.25H3.25C2.56 8 2 8.56 2 9.25V13a3 3 0 0 0 3.404 2.973A5 5 0 0 1 5 14zM15 14c0 .7-.144 1.368-.404 1.973Q14.794 16 15 16a3 3 0 0 0 3-3V9.25C18 8.56 17.44 8 16.75 8h-2.129c.24.358.379.787.379 1.25z"/></svg>`,
  },
  {
    name: 'calendar',
    label: 'Calendar',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M7.75 2.5a.75.75 0 0 0-1.5 0v1.58c-1.44.115-2.384.397-3.078 1.092c-.695.694-.977 1.639-1.093 3.078h19.842c-.116-1.44-.398-2.384-1.093-3.078c-.694-.695-1.639-.977-3.078-1.093V2.5a.75.75 0 0 0-1.5 0v1.513C15.585 4 14.839 4 14 4h-4c-.839 0-1.585 0-2.25.013z"/><path fill="currentColor" fill-rule="evenodd" d="M2 12c0-.839 0-1.585.013-2.25h19.974C22 10.415 22 11.161 22 12v2c0 3.771 0 5.657-1.172 6.828S17.771 22 14 22h-4c-3.771 0-5.657 0-6.828-1.172S2 17.771 2 14zm15 2a1 1 0 1 0 0-2a1 1 0 0 0 0 2m0 4a1 1 0 1 0 0-2a1 1 0 0 0 0 2m-4-5a1 1 0 1 1-2 0a1 1 0 0 1 2 0m0 4a1 1 0 1 1-2 0a1 1 0 0 1 2 0m-6-3a1 1 0 1 0 0-2a1 1 0 0 0 0 2m0 4a1 1 0 1 0 0-2a1 1 0 0 0 0 2" clip-rule="evenodd"/></svg>`,
  },
]

const Notstarted = [
  {
    taskname: 'Design Homepage Layout',
    description: 'Build and style the homepage layout with a modern design.',
    taskpriority: 'High',
    user: profileimg,
  },
  {
    taskname: 'Implement Authentication',
    description: 'Set up user registration and login functionality.',
    taskpriority: 'Medium',
    user: profileimg,
  },
  {
    taskname: 'Create API Endpoints',
    description: 'Develop RESTful APIs for data retrieval and manipulation.',
    taskpriority: 'Low',
    user: profileimg,
  },
  {
    taskname: 'Create API Endpoints',
    description: 'Develop RESTful APIs for data retrieval and manipulation.',
    taskpriority: 'Low',
    user: profileimg,
  },
]

const Completed = [
  {
    taskname: 'Design UI Mockups',
    description: 'Create Figma wireframes for the new dashboard.',
    taskpriority: 'High',
    user: profileimg,
  },
  {
    taskname: 'Redesign Notification System',
    description:
      'Update the notification center to include: read/unread status, grouping by project, and customizable alert sounds. Ensure mobile/desktop consistency.',
    taskpriority: 'Medium',
    user: profileimg,
  },
  {
    taskname: 'Write Project Proposal',
    description: 'Draft a proposal for client approval.',
    taskpriority: 'Low',
    user: profileimg,
  },
]
</script>
