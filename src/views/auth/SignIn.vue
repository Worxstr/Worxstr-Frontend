<template lang="pug">
v-container.sign-in.fill-height.d-flex.flex-column.justify-center.align-center
  v-card(width="500")
    v-form(@submit.prevent="signIn", v-model="isValid")
      v-card-title Sign in
      v-card-text
        v-text-field(
          label="Email",
          type="email",
          required="",
          v-model="form.email",
          :rules="emailRules"
        )
        v-text-field(
          label="Password",
          type="password",
          required="",
          v-model="form.password",
          :rules="passwordRules"
        )
      v-card-actions
        v-btn(text :to="{name: 'resetPassword', params: {email: form.email}}") Forgot password?
        v-spacer
        v-btn(text, color="primary", type="submit", :disabled="!isValid") Sign in
    v-fade-transition
      v-overlay(absolute, opacity="0.2", v-if="loading")
        v-progress-circular(indeterminate)
</template>

<script>
export default {
  name: "signIn",
  metaInfo: {
    title: 'Sign in',
  },
  data: () => ({
    form: {
      email: "",
      password: "",
    },
    isValid: false,
    emailRules: [
      (value) => !!value || "Email required",
      (value) => {
        const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return pattern.test(value) || "Invalid email";
      },
    ],
    passwordRules: [
      (value) => !!value || "Password required",
      (value) => value.length >= 8 || "Password must be 8 characters",
    ],
    loading: false,
  }),
  methods: {
    async signIn() {
      this.loading = true;
      try {
        await this.$store.dispatch("signIn", this.form);
      }
      finally {
        this.loading = false;
      }
    },
  },
};
</script>
