<template>
  <PageLayout>
    <!-- Main Content -->
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
                width="24px"
                height="24px"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="m16.1 13.359l-.528-.532zm.456-.453l.529.532zm2.417-.317l-.358.66zm1.91 1.039l-.358.659zm.539 3.255l.529.532zm-1.42 1.412l-.53-.531zm-1.326.67l.07.747zm-9.86-4.238l.528-.532zM4.002 5.746l-.749.042zm6.474 1.451l.53.532zm.157-2.654l.6-.449zM9.374 2.86l-.601.45zM6.26 2.575l.53.532zm-1.57 1.56l-.528-.531zm7.372 7.362l.529-.532zm4.567 2.394l.455-.453l-1.058-1.064l-.455.453zm1.985-.643l1.91 1.039l.716-1.318l-1.91-1.038zm2.278 3.103l-1.42 1.413l1.057 1.063l1.42-1.412zm-2.286 1.867c-1.45.136-5.201.015-9.263-4.023l-1.057 1.063c4.432 4.407 8.65 4.623 10.459 4.454zm-9.263-4.023c-3.871-3.85-4.512-7.087-4.592-8.492l-1.498.085c.1 1.768.895 5.356 5.033 9.47zm1.376-6.18l.286-.286L9.95 6.666l-.287.285zm.515-3.921L9.974 2.41l-1.201.899l1.26 1.684zM5.733 2.043l-1.57 1.56l1.058 1.064l1.57-1.56zm4.458 5.44c-.53-.532-.53-.532-.53-.53h-.002l-.003.004a1 1 0 0 0-.127.157c-.054.08-.113.185-.163.318a2.1 2.1 0 0 0-.088 1.071c.134.865.73 2.008 2.256 3.526l1.058-1.064c-1.429-1.42-1.769-2.284-1.832-2.692c-.03-.194.001-.29.01-.312q.009-.02 0-.006a.3.3 0 0 1-.03.039l-.01.01l-.01.009zm1.343 4.546c1.527 1.518 2.676 2.11 3.542 2.242c.443.068.8.014 1.071-.087a1.5 1.5 0 0 0 .42-.236l.05-.045l.007-.006l.003-.003l.001-.002s.002-.001-.527-.533c-.53-.532-.528-.533-.528-.533l.002-.002l.002-.002l.006-.005l.01-.01l.038-.03q.014-.009-.007.002c-.025.009-.123.04-.32.01c-.414-.064-1.284-.404-2.712-1.824zm-1.56-9.62C8.954 1.049 6.95.834 5.733 2.044L6.79 3.107c.532-.529 1.476-.475 1.983.202zM4.752 5.704c-.02-.346.139-.708.469-1.036L4.163 3.604c-.537.534-.96 1.29-.909 2.184zm14.72 12.06c-.274.274-.57.428-.865.455l.139 1.494c.735-.069 1.336-.44 1.784-.885zM11.006 7.73c.985-.979 1.058-2.527.229-3.635l-1.201.899c.403.539.343 1.246-.085 1.673zm9.52 6.558c.817.444.944 1.49.367 2.064l1.058 1.064c1.34-1.333.927-3.557-.71-4.446zm-3.441-.849c.384-.382 1.002-.476 1.53-.19l.716-1.317c-1.084-.59-2.428-.427-3.304.443z"
                />
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
        <a href="mailto:support@ahago.com" class="text-blue-600 hover:underline">
          support@trackzen.com
        </a>
      </div>
    </div>
  </PageLayout>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { onMounted } from 'vue'
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
