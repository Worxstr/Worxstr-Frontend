<template lang="pug">
v-container.sign-in.fill-height.d-flex.flex-column.justify-center.align-center
  v-card(width="500")
    v-form(@submit.prevent="sendResetEmail", v-model="isValid")
      v-card-title Reset your password
      v-card-text
        v-text-field(
          label="Email",
          type="email",
          required="",
          v-model="form.email",
          :rules="emailRules"
        )
      v-card-actions
        v-spacer
        v-btn(text, color="primary", type="submit", :disabled="!isValid") Send reset email
    v-fade-transition
      v-overlay(absolute, opacity="0.2", v-if="loading")
        v-progress-circular(indeterminate)
</template>

<script>
export default {
  name: "resetPassword",
  mounted() {
    if (this.$route.params.email) {
      this.form.email = this.$route.params.email
    }
  },
  data: () => ({
    form: {
      email: "",
    },
    isValid: false,
    emailRules: [
      (value) => !!value || "Email required",
      (value) => {
        const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return pattern.test(value) || "Invalid email";
      },
    ],
    loading: false,
  }),
  methods: {
    async sendResetEmail() {
      this.loading = true;
      await this.$store.dispatch("resetPassword", this.form.email);
      this.$store.dispatch("showSnackbar", {text: 'Reset link sent'})
      this.loading = false;
    },
  },
};
</script>