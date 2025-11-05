<template>
  <PageLayout>
    <div class="flex flex-col gap-6">
      <!-- Intro -->
      <div class="bg-main-bg shadow-md rounded-2xl p-6">
        <h2 class="font-semibold text-lg mb-2">Need assistance?</h2>
        <p class="text-gray-600 text-sm leading-relaxed">
          We’re here to help. Whether you’re experiencing a technical issue, need guidance, or want
          to share feedback — you can reach out to our support team anytime.
        </p>
      </div>

      <!-- Help Options -->
      <div class="grid md:grid-cols-2 gap-6">
        <!-- FAQs -->
        <div
          class="bg-main-bg shadow-md rounded-2xl p-6 cursor-pointer hover:scale-[1.03] transition"
          @click="$router.push('/help/faqs')"
        >
          <div class="flex items-center gap-4">
            <div class="p-3 bg-blue-bg rounded-xl">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-6 h-6 text-blue-600"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M8.25 9.75a3.75 3.75 0 1 1 7.5 0c0 2.25-3.75 3.75-3.75 3.75m0 3.75h.008v.008H12z"
                />
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-lg">FAQs</h3>
              <p class="text-sm text-sub-text">Find quick answers to common questions.</p>
            </div>
          </div>
        </div>

        <!-- Contact Support -->
        <div
          class="bg-main-bg shadow-md rounded-2xl p-6 cursor-pointer hover:scale-[1.03] transition"
          @click="$router.push('/help/contact')"
        >
          <div class="flex items-center gap-4">
            <div class="p-3 bg-green-100 rounded-xl">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-6 h-6 text-green-600"
                viewBox="0 0 24 24"
              >
                <path fill="currentColor" d="M16.1 13.359 ..." />
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-lg">Contact Support</h3>
              <p class="text-sm text-sub-text">
                Get in touch with our support team for direct assistance.
              </p>
            </div>
          </div>
        </div>

        <!-- Report a Problem -->
        <div
          class="bg-main-bg shadow-md rounded-2xl p-6 cursor-pointer hover:scale-[1.03] transition"
          @click="$router.push('/help/report')"
        >
          <div class="flex items-center gap-4">
            <div class="p-3 bg-red-100 rounded-xl">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-6 h-6 text-red-600"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 9v3.75m0 3.75h.008v.008H12zM21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
                />
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-lg">Report a Problem</h3>
              <p class="text-sm text-sub-text">
                Found a bug or issue? Let us know so we can fix it quickly.
              </p>
            </div>
          </div>
        </div>

        <!-- Feedback -->
        <div
          class="bg-main-bg shadow-md rounded-2xl p-6 cursor-pointer hover:scale-[1.03] transition"
          @click="$router.push('/help/feedback')"
        >
          <div class="flex items-center gap-4">
            <div class="p-3 bg-yellow-100 rounded-xl">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-6 h-6 text-yellow-600"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M11.48 3.499a.75.75 0 0 1 1.04 0l2.122 2.12a.75.75 0 0 1 .22.53v1.38a8.25 8.25 0 1 1-3.382-1.28.75.75 0 0 1-.22-.53V4.05a.75.75 0 0 1 .22-.53z"
                />
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-lg">Send Feedback</h3>
              <p class="text-sm text-sub-text">
                Share your ideas to help us improve your experience.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Note -->
      <div class="text-center text-gray-400 text-sm mt-10">
        Can’t find what you’re looking for? Email us at
        <a href="mailto:support@ahago.com" class="text-blue-600 hover:underline"
          >support@trackzen.com</a
        >
      </div>
    </div>
  </PageLayout>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import PageLayout from '@/views/pageLayout.vue'

const auth = useAuthStore()

onMounted(async () => {
  if (!auth.user) {
    try {
      await auth.fetchProfile()
    } catch (err) {
      console.error('Failed to fetch profile', err)
    }
  }
})
</script>
