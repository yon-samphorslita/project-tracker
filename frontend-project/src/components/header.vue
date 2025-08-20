<template>
  <div class="header-container">
    <div class="header">
      <span class="header-label">{{ menu_item }}</span>
      <div class="header-wrapper">
        <!-- notification icon -->
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <g fill="none" stroke="currentColor" stroke-width="2.5">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M6 19v-9a6 6 0 0 1 6-6v0a6 6 0 0 1 6 6v9M6 19h12M6 19H4m14 0h2m-9 3h2"
            />
            <circle cx="12" cy="3" r="1" />
          </g>
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M11.95 18q.525 0 .888-.363t.362-.887t-.362-.888t-.888-.362t-.887.363t-.363.887t.363.888t.887.362m-.9-3.85h1.85q0-.825.188-1.3t1.062-1.3q.65-.65 1.025-1.238T15.55 8.9q0-1.4-1.025-2.15T12.1 6q-1.425 0-2.312.75T8.55 8.55l1.65.65q.125-.45.563-.975T12.1 7.7q.8 0 1.2.438t.4.962q0 .5-.3.938t-.75.812q-1.1.975-1.35 1.475t-.25 1.825M12 22q-2.075 0-3.9-.787t-3.175-2.138T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22"
          />
        </svg>

        <div class="header-profile">
          <div class="header-profile-image">
            <img :src="profile" alt="Profile Image" />
          </div>
          <div style="display: flex; flex-direction: column">
            <span style="font-size: small">{{ username }}</span>
            <span style="font-size: x-small; color: grey">{{ role }}</span>
          </div>
        </div>
      </div>
    </div>
    <hr style="margin: 0% 3%" />
  </div>
</template>

<script setup lang="ts">
import profileimg from '@/assets/profile.jpg'

defineProps({
  menu_item: {
    type: String,
    default: 'Dashboard',
  },
  username: {
    type: String,
    default: 'Megan Sea',
  },
  role: {
    type: String,
    default: 'Project Manager',
  },
  profile: {
    type: String,
    default: profileimg,
  },
})
</script>

<style>
.header-container {
  width: calc(100vw - 250px);
  height: 91px;
  position: fixed;
  top: 0;
  left: 250px;
  z-index: 1000;
}
.header {
  width: 80vw;
  height: 91px;
  display: flex;
  align-items: center;
  margin: 0px 50px;
}
.header-label {
  margin-left: 20px;
  color: #000;
  font-size: x-large;
  font-weight: bold;
}
.header-wrapper {
  display: flex;
  justify-content: end;
  align-items: center;
  width: 100%;
}
.header-wrapper svg {
  margin-right: 20px;
  cursor: pointer;
}
.header-profile {
  display: flex;
  align-items: center;
  border-radius: 20px;
  background: #c6e7ff;
  padding: 5px 10px;
  width: 130px;
}
.header-profile-image {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 10px;
}
.header-profile-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
