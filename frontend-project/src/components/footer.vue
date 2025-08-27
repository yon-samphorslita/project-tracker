<template>
  <v-footer class="footer-bg" height="auto" padless>
    <div class="footer-container">
      <!-- Logo and Brand -->
      <div class="footer-section logo-section">
        <img src="../assets/images/image.png" alt="TrackZen Logo" class="footer-logo" />
      </div>

      <!-- Center Text -->
      <div class="footer-section center-section">
        <div class="footer-center-text">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </div>
      </div>

      <!-- Contact Info -->
      <div class="footer-section contact-section">
        <div class="footer-contact-title">Contact Us</div>
        <div class="footer-contact-row">
          <img
            src="../assets/icons/mail.svg"
            alt="Mail"
            class="footer-contact-icon"
            width="20"
            height="20"
          />
          <span>trackzen@gmail.com</span>
        </div>
        <div class="footer-contact-row">
          <img
            src="../assets/icons/phone.svg"
            alt="Phone"
            class="footer-contact-icon"
            width="20"
            height="20"
          />
          <span>+855 99 999 999</span>
        </div>
        <div class="footer-socials">
          <v-btn icon variant="text" size="small">
            <img
              src="../assets/icons/facebook.svg"
              alt="facebook"
              class="footer-contact-icon"
              width="30"
              height="30"
            />
          </v-btn>
          <v-btn icon variant="text" size="small">
            <img
              src="../assets/icons/instagram.svg"
              alt="instagram"
              class="footer-contact-icon"
              width="30"
              height="30"
            />
          </v-btn>
          <v-btn icon variant="text" size="small">
            <img
              src="../assets/icons/twitter.svg"
              alt="twitter"
              class="footer-contact-icon"
              width="30"
              height="30"
            />
          </v-btn>
        </div>
      </div>
    </div>
  </v-footer>
</template>

<script setup>
// No script needed for this static footer
</script>

<style scoped>
.footer-bg {
  background-color: #c6e7ff;
  padding: 0;
  margin-bottom: 0;
}

.footer-container {
  background-color: #c6e7ff;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex;
  width: 100%;
  padding: 32px 24px;
  box-sizing: border-box;
  min-height: 140px;
}

.footer-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.logo-section {
  flex: 1;
  align-items: flex-start;
  justify-content: center;
  gap: 8px;
}

.footer-logo {
  margin-right: 8px;
  height: 150px;
}

.footer-brand {
  font-weight: bold;
  font-size: 1.5rem;
  margin-left: 4px;
  letter-spacing: 1px;
}

.center-section {
  flex: 2;
  align-items: center;
  justify-content: center;
}

.footer-center-text {
  text-align: center;
  font-size: 1rem;
  color: #444;
  max-width: 260px;
  margin: 0 auto;
}

.contact-section {
  flex: 1.5;
  align-items: flex-end;
  justify-content: flex-start;
}

.footer-contact-title {
  font-size: 1.25rem;
  font-weight: 500;
  margin-bottom: 8px;
  text-align: right;
}

.footer-contact-row {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
  font-size: 1rem;
  color: #222;
  justify-content: flex-start;
}

.footer-contact-icon {
  margin-right: 8px;
}

.footer-socials {
  display: flex;
  flex-direction: row;
  gap: 16px;
  margin-top: 8px;
  justify-content: flex-end;
}
</style>
