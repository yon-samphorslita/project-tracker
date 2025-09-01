<template>
  <div v-if="showForm" 
       class="fixed top-0 left-[250px] w-[calc(100vw-250px)] h-full 
              bg-[rgba(153,153,153,0.2)] backdrop-blur-sm 
              flex items-center justify-center z-[1000]">
    <div class="bg-white p-10 rounded-lg w-[400px] max-w-[90%] shadow-xl">
      <div class="text-2xl mb-5 text-[#2c3e50] font-semibold">
        {{ formTitle }}
      </div>

      <div v-for="field in fields" :key="field.label" class="mb-5 w-full">
        <label :for="field.label" class="block mb-2 text-[#34495e] font-medium">
          {{ field.label }}
        </label>

        <!-- Text input -->
        <input v-if="field.type === 'text'"
               :id="field.label"
               class="w-[90%] px-4 py-3 border border-gray-300 rounded-lg text-base transition duration-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
               :placeholder="field.placeholder"
               v-model="formData[field.model]"
               required />

        <!-- Textarea -->
        <textarea v-else-if="field.type === 'textarea'"
                  :id="field.label"
                  class="w-[90%] px-4 py-3 border border-gray-300 rounded-lg text-base transition duration-300 min-h-[120px] resize-y focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  :placeholder="field.placeholder"
                  v-model="formData[field.model]">
        </textarea>

        <!-- Date -->
        <input v-else-if="field.type === 'date'"
               type="date"
               :id="field.label"
               class="w-[90%] px-4 py-3 border border-gray-300 rounded-lg text-base transition duration-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
               v-model="formData[field.model]"
               required />

        <!-- Select -->
        <select v-else-if="field.type === 'select'"
                :id="field.label"
                class="w-[90%] px-4 py-3 border border-gray-300 rounded-lg text-base transition duration-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                v-model="formData[field.model]">
          <option disabled selected>Select {{ field.label }}</option>
          <option v-for="option in field.options" :key="option.id" :value="option.id">
            {{ option.name }}
          </option>
        </select>
      </div>

      <!-- Buttons -->
      <div class="flex justify-around w-full mt-5">
        <button class="px-5 py-3 rounded text-white text-base cursor-pointer transition-colors bg-red-500 hover:bg-red-600"
                @click="cancel">Cancel</button>
        <button class="px-5 py-3 rounded text-white text-base cursor-pointer transition-colors bg-blue-500 hover:bg-blue-600"
                @click="submitForm">Submit</button>
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
            const response = await axios.post(`http://localhost:3000/${props.endpoint}`, payload);
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
</style>
