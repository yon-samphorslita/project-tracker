<template>
    <div class="kanban-container">
        <div class="kanban-header">
            <div style="display: flex; gap: 10px;">
                <div class="kanban-header-tab" :style="{'background': statusColor}"></div>
                <div>{{ kanbanTaskStatus }}</div>
            </div>

            <div style="display: flex; align-items: center; gap: 10px; ">
                <div class="kanban-taskcount" :style="{'background': statusColor}">{{ kanbanTaskNum }}</div>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M5 10c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2m14 0c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2m-7 0c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2"/></svg>
            </div>
        </div>

        <!-- <button class="add-new-task">
            + New Task
        </button> -->

        <!-- <div class="kanban-new" id="new-task-form">
            <label for="taskname">Task Name</label>
            <input type="text" id="taskname" placeholder="Add a new task..." required>
            
            <label for="taskdesc">Task Description</label>
            <input type="text" id="taskdesc" placeholder="Add task description..." >
            
            <div style="display: flex; gap: 10px; width: 95%; margin: 10px 0px;">
                <label for="taskpriority">Task Priority</label>
                <select id="taskpriority"  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                </select>
            </div>

            <div style="display: flex; gap: 10px; width: 95%; margin: 10px 0px;">
                <label for="taskstatus">Task Priority</label>
                <select id="taskstatus"  >
                    <option value="High">Not Started</option>
                    <option value="Medium">In progress</option>
                    <option value="Low">Completed</option>
                </select>
            </div>

        </div> -->

        <div style="width: 100%; height: 70vh; overflow-y: auto;">
            <div  v-for="kanban in kanbantasks"  class="kanban-task">
                <div style="display: flex; justify-content: space-between; ">
                    <div> {{ kanban.taskname }} </div> 
                    <div style="width: 50px; display: flex; justify-content: space-between;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M20.71 7.04c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.37-.39-1.02-.39-1.41 0l-1.84 1.83l3.75 3.75M3 17.25V21h3.75L17.81 9.93l-3.75-3.75z"/></svg>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 3c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2m0 14c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2m0-7c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2"/></svg>
                    </div>
                </div>
                <div class="kanban-task-description">
                    {{ kanban.description }}
                </div>
                <div style="display: flex; justify-content: space-between; ">
                    <div class="kanban-task-priority" :style="{'background': getPriorityColors(kanban.taskpriority).background, 'color': getPriorityColors(kanban.taskpriority).color}">
                        {{ kanban.taskpriority }} 
                    </div>
                    <div class="kanban-task-responsible-user">
                        <img :src="kanban.user" alt="Profile Image">
                    </div>
                </div>
                <hr style="margin: 0%;">
                <div class="kanban-task-date">
                    <div style="font-weight: bold;">Due: </div>
                    <!-- <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="m4.579 8.495l-.593-1.026a1 1 0 0 0-1.732 1l1.75 3.031a1 1 0 0 0 1.366.366l3.031-1.75a1 1 0 0 0-1-1.732l-.774.447a7 7 0 1 1 1.16 7.981a1 1 0 0 0-1.452 1.376A9 9 0 1 0 12.87 3a9 9 0 0 0-8.292 5.495"/><path fill="currentColor" d="M12.87 7a1 1 0 0 1 1 1v3.586l1.707 1.707a1 1 0 0 1-1.414 1.414l-2-2A1 1 0 0 1 11.87 12V8a1 1 0 0 1 1-1"/></svg> -->
                    <div style="margin: 0px 5px;">2 Mar,2025</div>
                </div>
            </div>
        </div>

    </div>
</template>

<script setup>
import { computed } from 'vue';
// import { defineProps } from 'vue';
    const props = defineProps({
        kanbantasks: {
            type: Array,
            required: true
        },
        kanbanTaskStatus: {
            type: String,
            required: true
        },
        kanbanTaskNum: {
            type: Number,
            required: true
        }
    });

    const statusColor = computed(() => {
        switch(props.kanbanTaskStatus.toLowerCase()) {
            case 'not started':
                return 'red'; 
            case 'in progress':
                return 'orange'; 
            case 'completed':
                return 'green'; 
            default:
                return '#9E9E9E'; 
        }
    });

    const getPriorityColors = (priority) => {
        priority = priority.toLowerCase();
        switch(priority) {
            case 'high':
                return { background: 'lightgreen', color: 'green' };
            case 'medium':
                return { background: 'yellow', color: 'darkorange' }; 
            case 'low':
                return { background: 'pink', color: 'red' }; 
            default:
                return { background: 'lightgrey', color: 'black' }; 
        }
    };
</script>

<style>
.kanban-container {
    width: 400px;
    height: calc(100vh - 91px);
    /* max-height: 75vh; */
    overflow-x: hidden;
    overflow-y: auto;
    top: 170px;
    border-radius: 5px;
    box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.1);
    background-color: #C6E7FF; 
    padding: 15px;
    
}
.kanban-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px; 
    font-size: 1.2em; 
    color: #333; 
    margin: 20px auto ;
    position: sticky;
    background: #C6E7FF;
}
.kanban-header-tab {
    width: 7px;
    height: 30px;
    border-radius: 0px 5px 5px 0px; 
}
.kanban-taskcount{
    width: 20px;
    height: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 5px;
    border-radius: 15px;
    color: white;
    font-size: 12px;
}
.add-new-task{
    width: 100%;
    height: 40px;
    border: 1px dashed gray;
    border-radius: 5px;
    color: grey;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 30px auto ;
    position: sticky;
    background: #C6E7FF;
}
.kanban-new{    
    width: 375px;
    height: 400px;
    border-radius: 5px;
    color: grey;
    display: flex;
    flex-direction: column;
    /* justify-content: space-around; */
    align-items: start;
    margin: 30px auto ;
    position: sticky;
    background: white;
    padding: 10px;
}
.kanban-new label{
    width: 70%;
    font-size: smaller;
    margin: 10px 0px;
}
.kanban-new input, .kanban-new select{
    width: 90%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    margin-bottom: 10px;
    font-size: 14px;
    color: #333;
    background: #f9f9f9;
}
.kanban-task{
    max-width: 375px;
    border: 1px solid black;
    border-radius: 5px;
    box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.1);
    background: white;
    display: flex;
    flex-direction: column;
    padding: 10px;
    margin: 20px 0px;
}
.kanban-task-description{
    width: 90%;
    color: grey;
    font-size: smaller;
    margin: 20px 0px 20px 0px;
}
.kanban-task-priority{
    width: auto;
    padding: 5px;
    margin: 10px 0px;
    border-radius: 5px;
    font-size: smaller;
}
.kanban-task-responsible-user{
    width: 30px;
    height: 30px;
    border-radius: 50%;
    overflow: hidden;
    margin-right: 8px;
    align-self: center;
}
.kanban-task-responsible-user img{
    width: 100%;
    height: 100%;
    object-fit: cover;
}
.kanban-task-date{
    display: flex; 
    color: darkslategray; 
    font-size: smaller; 
    margin-top: 5px;
}
</style>