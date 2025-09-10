<template>
  <div class="w-[400px] max-h-[450px] rounded-lg shadow-lg border border-black bg-white ">
    <!-- Header -->
    <div class="font-bold w-full border-b-2 border-black p-4">Notifications</div>
    
    <!-- Tabs -->
    <div class="flex mb-3 border-b-2 border-grey-600 pt-4 pb-0 mx-4 space-x-3">
        <div class="border-b-2 border-black pb-2">All notifications</div>
        <div class="pb-2">Unread</div>
    </div>

    <!-- Notification list -->
    <div class="overflow-scroll w-full max-h-[320px] flex flex-col" >
        <div v-for="(n, i) in notifications" :key="i"
            class="w-full min-h-20 px-4 py-2 border-black hover:bg-blue-100 cursor-pointer"
        >
            <!-- <div> New task Assigned </div> -->
            <div class="flex justify-between items-center">
              <div class="font-semibold">{{ n.title }}</div>
              <div class="text-sm text-gray-400">{{ timeAgo(n.created_at) }}</div>
            </div>
            <div class="text-sm text-gray-500 line-clamp-2 p-1">
                {{ n.message }}
                <!-- new task assigned with a really long description that keeps going and going until it should be truncated at two lines and more than that will resulted in 3 dots -->
            </div>
        </div>   
    </div>
  </div>

</template>

<script setup lang="ts">
import { useNotificationStore } from '@/stores/notification';
import { storeToRefs } from 'pinia';

const store = useNotificationStore();
const { notifications } = storeToRefs(store);

  // store.connect('1'); // !!! Testing !!! - userId of current user

//   const userId = authStore.user.id; // comes from API login response
//   store.connect(userId.toString());

function timeAgo(dateString: string) {
  const now = new Date();
  const past = new Date(dateString);
  const diff = (now.getTime() - past.getTime()) / 1000; // in seconds

  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
</script>
