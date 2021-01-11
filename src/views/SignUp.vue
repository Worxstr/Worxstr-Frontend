<template>
  <v-container
    class="sign-in fill-height d-flex flex-column justify-center align-center"
  >
    <v-card width="500">
      <v-form @submit.prevent="signUp" v-model="isValid">
        <v-card-title>Sign up</v-card-title>

        <v-card-text>
          <v-text-field
            label="First name"
            v-model="form.first_name"
            :rules="rules.firstName"
            required
          />
          <v-text-field
            label="Last name"
            v-model="form.last_name"
            :rules="rules.lastName"
            required
          />
          <v-text-field
            label="Email"
            type="email"
            :rules="rules.email"
            v-model="form.email"
            required
          />
          <v-text-field
            label="Phone"
            type="phone"
            v-model="form.phone"
            :rules="rules.phone"
            required
          />
          <v-text-field
            label="Manager ID"
            v-model="form.manager_id"
            :rules="rules.managerId"
          />
          <v-text-field
            label="Password"
            type="password"
            v-model="form.password"
            :rules="rules.password"
            required
          />
          <v-text-field
            label="Confirm password"
            type="password"
            v-model="form.confirm_password"
            :rules="[
              ...rules.confirmPassword,
              (value) => value == form.password || 'Passwords must match',
            ]"
            required
          />
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text color="primary" type="submit" :disabled="!isValid"
            >Sign up</v-btn
          >
        </v-card-actions>
      </v-form>

      <v-fade-transition>
        <v-overlay absolute opacity="0.2" v-if="loading">
          <v-progress-circular indeterminate />
        </v-overlay>
      </v-fade-transition>
    </v-card>
  </v-container>
</template>

<script>
/* eslint-disable @typescript-eslint/camelcase */

export default {
  name: "signUp",
  data: () => ({
    form: {
      first_name: "",
      last_name: "",
      phone: "",
      email: "",
      manager_id: "",
      password: "",
      confirm_password: "",
    },
    isValid: false,
    rules: {
      firstName: [(value) => !!value || "First name required"],
      lastName: [(value) => !!value || "Last name required"],
      phone: [
        (value) => !!value || "Phone required",
        (value) => {
          // https://stackoverflow.com/questions/4338267/validate-phone-number-with-javascript
          // TODO: Use a library for these rules

          const pattern = /^(()?\d{3}())?(-|\s)?\d{3}(-|\s)?\d{4}$/;
          return pattern.test(value) || "Invalid phone";
        },
      ],
      email: [
        (value) => !!value || "Email required",
        (value) => {
          const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          return pattern.test(value) || "Invalid email";
        },
      ],
      managerId: [(value) => !!value || "Manager ID required"],
      password: [
        (value) => !!value || "Password required",
        (value) => value.length >= 8 || "Password must be 8 characters",
      ],
      confirmPassword: [
        (value) => !!value || "Password confirmation required",
      ],
    },
    loading: false,
  }),
  methods: {
    async signUp() {
      this.loading = true;
      await this.$store.dispatch("signUp", this.form);
      this.loading = false;
    },
  },
};
</script>
