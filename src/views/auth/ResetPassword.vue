<template lang="pug">
v-container.sign-in.fill-height.d-flex.flex-column.justify-center.align-center
  v-card(width="500")
    v-form(@submit.prevent="sendResetEmail", v-model="isValid")
      v-card-title Reset your password
      v-card-text
        v-text-field(
          autofocus
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
  arrows(type='smallGroup' style='position: absolute; bottom: 0; right: 50px')
</template>

<script>
import { emailRules } from '@/plugins/inputValidation'
import Arrows from '@/components/Arrows.vue'

export default {
  name: "resetPassword",
  components: {
    Arrows,
  },
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
    emailRules,
    loading: false,
  }),
  methods: {
    async sendResetEmail() {
      this.loading = true;
      try {
        await this.$store.dispatch("resetPassword", this.form.email);
        this.$store.dispatch("showSnackbar", {text: 'Reset link sent'})
      }
      finally {
        this.loading = false;
      }
    },
  },
};
</script>
