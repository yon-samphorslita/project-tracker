<template>
  <footer class="bg-[#C6E7FF]">
    <div
      class="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center px-6 py-8 min-h-[140px]"
    >
      <!-- Logo Section -->
      <div class="flex-1 flex flex-col items-start justify-center gap-2">
        <img src="../assets/images/image.png" alt="TrackZen Logo" class="h-[150px] mr-2" />
      </div>

      <!-- Center Text -->
      <div
        class="flex-2 flex flex-col items-center justify-center text-center mx-auto max-w-[260px]"
      >
        <p class="text-gray-700 text-base">Less stress. More progress.</p>
      </div>

      <!-- Contact Section -->
      <div class="flex-[1.5] flex flex-col items-end justify-start gap-2">
        <h3 class="text-[1.25rem] font-medium text-right mb-2">Contact Us</h3>

        <div class="flex items-center gap-2 mb-1 text-gray-900 text-base">
          <img src="../assets/icons/mail.svg" alt="Mail" class="w-5 h-5" />
          <span>trackzen@gmail.com</span>
        </div>

        <div class="flex items-center gap-2 mb-2 text-gray-900 text-base">
          <img src="../assets/icons/phone.svg" alt="Phone" class="w-5 h-5" />
          <span>+855 99 999 999</span>
        </div>

        <!-- Social Buttons -->
        <div class="flex flex-row gap-4 mt-2 justify-end">
          <button class="p-0">
            <img src="../assets/icons/facebook.svg" alt="Facebook" class="w-7 h-7" />
          </button>
          <button class="p-0">
            <img src="../assets/icons/instagram.svg" alt="Instagram" class="w-7 h-7" />
          </button>
          <button class="p-0">
            <img src="../assets/icons/twitter.svg" alt="Twitter" class="w-7 h-7" />
          </button>
        </div>
      </div>
    </div>
  </footer>
</template>
