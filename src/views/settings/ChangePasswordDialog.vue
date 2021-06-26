<template lang="pug">
v-dialog(
  v-model="opened",
  :fullscreen="$vuetify.breakpoint.smAndDown",
  max-width="500",
  persistent
)
  v-card.d-flex.flex-column
    v-fade-transition
      v-overlay(v-if="loading", absolute, opacity=".2")
        v-progress-circular(indeterminate)

    v-form.flex-grow-1.d-flex.flex-column(
      @submit.prevent="updatePassword",
      ref="form",
      v-model="isValid"
    )
      v-toolbar.flex-grow-0(flat)
        v-toolbar-title Update your password
      
      v-divider

      v-card-text.pb-0
        v-text-field(
          autofocus
          outlined,
          dense,
          label="New password",
          v-model="password",
          :rules="rules.password",
          required
          type="password"
        )

        v-text-field(
          outlined,
          dense,
          label="Confirm new password",
          v-model="confirmPassword",
          :rules="[...rules.confirmPassword, rules.passwordMatches(password, confirmPassword)]",
          required
          type="password"
        )

      v-spacer

      v-card-actions
        v-spacer
        v-btn(text, @click="closeDialog") Cancel
        v-btn(text, color="green", :disabled="!isValid", type="submit")
          | Update password
</template>

<script>
/* eslint-disable @typescript-eslint/camelcase */
import { exists, passwordRules, passwordMatches } from '@/plugins/inputValidation'

export default {
  name: "changePasswordDialog",
  props: {
    opened: Boolean,
  },
  data: () => ({
    isValid: false,
    loading: false,
    password: "",
    confirmPassword: "",
    rules: {
      password: passwordRules,
      confirmPassword: [exists('Password confirmation required')],
      passwordMatches,
    },
  }),
  methods: {
    closeDialog() {
      this.$emit("update:opened", false);
      if (this.create) this.$refs.form.reset();
    },
    async updatePassword() {
      this.loading = true
      try {
        await this.$store.dispatch("updatePassword", this.password)
        this.$store.dispatch("showSnackbar", { text: "Password changed" })
        this.closeDialog()
      }
      finally {
        this.loading = false
      }
    },
  },
};
</script>