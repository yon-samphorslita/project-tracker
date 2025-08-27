<template>
    <div v-if="showForm" class="overlay">
        <div class="form-container">
            <div class="formTitle">{{ formTitle }}</div>

            <div v-for="field in fields" :key="field.label" class="form-group">
                <label :for="field.label">{{ field.label }}</label>

                <!-- Text input -->
                <input v-if="field.type === 'text'" 
                        :id="field.label" 
                        class="form-control"
                        :placeholder="field.placeholder"
                        v-model="formData[field.model]" 
                        required />

                <!-- Textarea -->
                <textarea v-else-if="field.type === 'textarea'" 
                            :id="field.label" 
                            class="form-control"
                            :placeholder="field.placeholder"
                            v-model="formData[field.model]">
                </textarea>

                <!-- Date -->
                <input v-else-if="field.type === 'date'" 
                        type="date" 
                        :id="field.label" 
                        class="form-control"
                        v-model="formData[field.model]"
                        required />

                <!-- Select -->
                <select v-else-if="field.type === 'select'" 
                        :id="field.label" 
                        class="form-control"
                        v-model="formData[field.model]">
                    <option disabled selected>Select {{ field.label }}</option>
                    <option v-for="option in field.options" :key="option.id" :value="option.id">
                    {{ option.name }}
                    </option>
                </select>

            </div>

            <div style="display: flex; justify-content: space-around; width: 100%; margin-top: 20px;">
                <button class="form-btn" style="background: red;" @click="cancel">Cancel</button>
                <button class="form-btn" style="background: blue;" @click="submitForm">Submit</button>
            </div>
        </div>
    </div>

</template>

<script setup>
    import { ref } from "vue";
    import { defineProps, reactive } from "vue";
    import axios from "axios";

    const props = defineProps({
        formTitle: { type: String, required: true },
        fields: { type: Array, required: true },
        endpoint: { type: String, required: true }
    });

    const formData = reactive({});
    const showForm = ref(true);

    function mapPayload() {
        if (props.endpoint === "projects") {
            return {
                p_name: formData.title,
                p_description: formData.description,
                status: formData.status || "not started",
                priority: formData.priority,
                start_date: formData.startDate || null,
                due_date: formData.dueDate || null
            };
        } else if (props.endpoint === "tasks") {
            return {
                t_name: formData.title,
                t_description: formData.description,
                t_status: formData.status || "not started",
                t_priority: formData.priority,
                start_date: formData.dueDate || null,
                due_date: formData.dueDate || null,
            };
        } else if (props.endpoint === "subtask") {
            return {
                name: formData.title,
            };
        }
    }


    // handle submit
    async function submitForm() {
        try {
            const payload = mapPayload();
            const token = localStorage.getItem('token') 
            const response = await axios.post(`http://localhost:3000/${props.endpoint}` , payload , {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
            console.log(`${props.formTitle} created:`, response.data);

            // reset form + close popup
            Object.keys(formData).forEach(key => formData[key] = "");
            showForm.value = false;

        } catch (error) {
            console.error("Error saving data:", error);
        }
    }

    // handle cancel
    function cancel() {
        Object.keys(formData).forEach(key => formData[key] = "");
        showForm.value = false;
        console.log("Form cancelled");
    }
</script>

<style>
.overlay{
  position: fixed;
  top: 0;
  left: 250px;
  width: calc(100vw - 250px);
  height: 100%;
  background: rgba(153, 153, 153, 0.2);
  backdrop-filter: blur(2px);  
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.form-container {
  background: white;
  padding: 40px;
  border-radius: 10px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0px 8px 20px rgba(0,0,0,0.2);
}

.formTitle{
  font-size: 24px;
  margin-bottom: 20px;
  color: #2c3e50;
  font-weight: 600;
}

.form-group {
  margin-bottom: 20px;
  width: 100%;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #34495e;
  font-weight: 500;
  width: 100%;
}

.form-control {
  width: 90%;
  padding: 14px 16px;
  border: 1px solid #dce1e6;
  border-radius: 10px;
  font-size: 16px;
  transition: all 0.3s;
}

textarea.form-control {
  min-height: 120px;
  resize: vertical;
}

.form-control:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}

.form-btn {
  padding: 15px 20px;
  border: none;
  border-radius: 5px;
  color: white;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}
</style>
