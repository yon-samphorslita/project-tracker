<template>
  <footer class="bg-blue-bg bg-opacity-50">
    <div
      class="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center px-6 py-8 min-h-[140px]"
    >
      <!-- Logo Section -->
      <div class="flex-[1.5] flex flex-col items-start justify-start gap-2">
        <Logo class="text-[var(--graysvg-text)] w-[90%]"/>
      </div>

      <!-- Center Text -->
      <div class="flex-2 flex flex-col items-center justify-center text-center mx-auto">
        <p class="text-gray-text text-base">Less stress. More progress.</p>
      </div>

      <!-- Contact Section -->
      <div class="flex-[1.5] flex flex-col items-end justify-start gap-2">
        <h3 class="text-[1.25rem] font-medium text-right mb-2">Contact Us</h3>

        <div class="flex items-center gap-2 mb-1 text-main-text text-base">
          <Mail class="text-[var(--graysvg-text)]"/>
          <span>trackzen@gmail.com</span>
        </div>

        <div class="flex items-center gap-2 mb-2 text-main-text text-base">
          <Phone class="text-[var(--graysvg-text)]"/>
          <span>+855 99 999 999</span>
        </div>

        <!-- Social Buttons -->
        <div class="flex flex-row gap-4 mt-2 justify-end">
          <button class="p-0">
            <Facebook class="text-[var(--graysvg-text)]"/>
          </button>
          <button class="p-0">
            <Instagram class="text-[var(--graysvg-text)]"/>
          </button>
          <button class="p-0">
            <Twitter class="text-[var(--graysvg-text)]"/>
          </button>
        </div>
      </div>
    </div>
  </footer>
</template>
<script setup>
import Logo from '@/assets/icons/logo.svg'
import Mail from '@/assets/icons/mail.svg'
import Facebook from '@/assets/icons/facebook.svg'
import Phone from '@/assets/icons/phone.svg'
import Instagram from '@/assets/icons/instagram.svg'
import Twitter from '@/assets/icons/twitter.svg'
</script>