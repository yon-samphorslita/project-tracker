<template>
  <div>
    <button @click="selectRole('project_manager')">Join as Project Manager</button>
    <button @click="selectRole('member')">Join as Team Member</button>
    <RouterView />
  </div>
</template>

<script setup>
import { RouterView, useRouter } from 'vue-router'
const router = useRouter()

function selectRole(role) {
  localStorage.setItem('role', role) // store selected role
  router.push('/signup')
}
</script>
<style>
body {
  margin: 0;
}
</style>
