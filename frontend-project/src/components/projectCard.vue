<template>
  <div class="container">
    <div class="project-card">
      <div class="first-row">
        <div class="title">
          <div class="img"></div>
          <div class="mini-col">
            <div class="project-name">{{ name || 'Project Name' }}</div>
            <div class="description">{{ detail || 'Detail' }}</div>
          </div>
        </div>
        <Status :status="task?.status || 'in progress'" />
      </div>

      <div class="dash-line"></div>

      <div class="second-row">
        <DescriptionLabel label="Start Date" :description="startdate || '20 Aug, 2025'" />
        <DescriptionLabel
          label="End Date"
          :description="enddate || '21 Aug, 2025'"
        /><DescriptionLabel
          label="Progress"
          :description="startdate || '20 Aug, 2025'"
        /><DescriptionLabel label="Members" :description="startdate || '20 Aug, 2025'" />
      </div>
      <div class="dash-line"></div>
      <div class="description third">
        Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has
        been the industry's standard dummy text ever since the 1500s, when an unknown printer took a
        galley of type and scrambled it to make a type specimen book. It has survived not only five
        centuries, but also the leap into electronic typesetting, remaining essentially unchanged.
      </div>
    </div>
    <button class="btn">View details</button>
  </div>
</template>

<script setup>
import Status from './status.vue'
import DescriptionLabel from './descriptionLabel.vue'

// Props
defineProps({
  name: String,
  detail: String,
  task: Object,
  startdate: String,
})
</script>

<style scoped>
.container {
  border: 1px solid rgba(56, 56, 56, 0.8);
  border-radius: 5px;
}

.project-card {
  padding: 24px 36px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.first-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
.title {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
}
.img {
  width: 50px;
  height: 50px;
  background-color: #ccc; /* Placeholder for image */
  border-radius: 50%;
}
.mini-col {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.project-name {
  font-size: 20px;
}
.description {
  color: rgba(30, 30, 30, 0.8);
}
.third {
  padding: 0px 10px;
}
.dash-line {
  border-top: 1px dashed rgba(56, 56, 56, 0.8);
}
.second-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0px 10px;
}
.btn {
  background-color: transparent;
  border: none;
  border-top: 1px solid rgba(56, 56, 56, 0.8);
  padding: 10px 0px;
}
</style>
