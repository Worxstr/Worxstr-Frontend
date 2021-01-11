<template>
  <v-container
    class="sign-in fill-height d-flex flex-column justify-center align-center"
  >
    <v-card width="500">
      <form @submit.prevent="signIn">
        <v-card-title>Sign in</v-card-title>

        <v-card-text>
          <v-text-field
            label="Email"
            type="email"
            required
            v-model="form.email"
            :rules="emailRules"
          />
          <v-text-field
            label="Password"
            type="password"
            required
            v-model="form.password"
            :rules="passwordRules"
          />
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text color="primary" type="submit">Sign in</v-btn>
        </v-card-actions>
      </form>

      <v-fade-transition>
        <v-overlay absolute opacity="0.2" v-if="loading">
          <v-progress-circular indeterminate />
        </v-overlay>
      </v-fade-transition>
    </v-card>
  </v-container>
</template>

<script>
export default {
  name: "signIn",
  data: () => ({
    form: {
      email: "",
      password: "",
    },
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
      await this.$store.dispatch("signIn", this.form);
      console.log("test");
      this.loading = false;
    },
  },
};
</script>
