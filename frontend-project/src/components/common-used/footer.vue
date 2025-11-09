<template>
  <footer class="bg-blue-bg z-[41]">
    <div
      class="w-full px-14 flex flex-col md:flex-row justify-between items-start md:items-center py-8 min-h-[140px]"
    >
      <!-- Logo Section -->
      <div class="flex-[1.5] flex flex-col items-start">
        <Logo class="text-[var(--graysvg-text)]" />
      </div>

      <!-- Center Text -->
      <div class="flex-2 flex flex-col items-center text-center">
        <p class="text-gray-text text-base">Less stress. More progress.</p>
      </div>

      <!-- Contact Section -->
      <div class="flex-[1.5] flex flex-col items-end gap-2">
        <h3 class="text-[1.25rem] font-medium text-right mb-2">Contact Us</h3>

        <div class="flex items-center gap-2 mb-1 text-main-text text-base">
          <Mail class="text-[var(--graysvg-text)]" />
          <span>trackzen@gmail.com</span>
        </div>

        <div class="flex items-center gap-2 mb-2 text-main-text text-base">
          <Phone class="text-[var(--graysvg-text)]" />
          <span>+855 99 999 999</span>
        </div>

        <!-- Social Buttons -->
        <div class="flex flex-row gap-4 mt-2 justify-end">
          <Facebook class="text-[var(--graysvg-text)] w-6 h-6" />
          <Instagram class="text-[var(--graysvg-text)] w-6 h-6" />
          <Twitter class="text-[var(--graysvg-text)] w-6 h-6" />
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import Logo from '@/assets/icons/logo.svg'
import Mail from '@/assets/icons/mail.svg'
import Phone from '@/assets/icons/phone.svg'
import Facebook from '@/assets/icons/facebook.svg'
import Instagram from '@/assets/icons/instagram.svg'
import Twitter from '@/assets/icons/twitter.svg'
</script>
