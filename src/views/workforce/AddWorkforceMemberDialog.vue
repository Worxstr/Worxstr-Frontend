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
      @submit.prevent="addWorkforceMember",
      ref="form",
      v-model="isValid"
    )
      v-toolbar.flex-grow-0(flat)
        v-toolbar-title Add {{ type }}

      v-card-text
        v-text-field(
          label="First name",
          dense,
          outlined,
          v-model="workforceMember.first_name",
          :rules="rules.firstName",
          required
        )
        v-text-field(
          label="Last name",
          dense,
          outlined,
          v-model="workforceMember.last_name",
          :rules="rules.lastName",
          required
        )
        v-text-field(
          label="Email",
          type="email",
          dense,
          outlined,
          :rules="rules.email",
          v-model="workforceMember.email",
          required
        )
        v-text-field(
          label="Phone",
          type="phone",
          dense,
          outlined,
          v-model="workforceMember.phone",
          :rules="rules.phone",
          required
        )

        v-select(
          v-if="type == 'manager'",
          v-model="workforceMember.roles",
          :items="managerTypes",
          multiple,
          outlined,
          dense,
          required,
          label="Manager type"
        )

        v-text-field(
          v-if="type == 'employee'"
          prefix="$"
          suffix="/ hour"
          label="Hourly wage",
          type="number",
          min="0.01"
          step="0.01"
          dense,
          outlined,
          :rules="rules.currency",
          v-model="workforceMember.hourly_rate",
          required
        )

        v-select(
          v-if="managers.employee.length",
          v-model="workforceMember.manager_id",
          :items="managers.employee",
          :item-text="(m) => `${m.first_name} ${m.last_name}`",
          :item-value="'id'",
          outlined,
          dense,
          required,
          label="Direct manager"
        )
      v-spacer

      v-card-actions
        v-spacer
        v-btn(text, @click="closeDialog") Cancel
        v-btn(text, color="green", :disabled="!isValid", type="submit") Add
</template>

<script>
/* eslint-disable @typescript-eslint/camelcase */

import { mapState } from 'vuex'

export default {
  name: "addWorkforceMemberDialog",
  props: ["opened", "type"],
  computed: {
    ...mapState(['managers'])
  },
  watch: {
    opened(newVal, oldVal) {
      if (newVal) this.$store.dispatch('loadManagers');
    },
  },
  data: () => ({
    isValid: false,
    workforceMember: {
      hourly_rate: 12.00
    },
    loading: false,
    managerTypes: [
      {
        text: "Organization manager",
        value: "organization_manager"
      },
      {
        text: "Employee manager",
        value: "employee_manager"
      }
    ],
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
      currency: [
        (value) => !!value || "Wage required",
        (value) => {
          // https://regexlib.com/Search.aspx?k=currency&c=-1&m=5&ps=20
          const pattern = /^\$?-?([1-9]{1}[0-9]{0,2}(,\d{3})*(\.\d{0,2})?|[1-9]{1}\d{0,}(\.\d{0,2})?|0(\.\d{0,2})?|(\.\d{1,2}))$|^-?\$?([1-9]{1}\d{0,2}(,\d{3})*(\.\d{0,2})?|[1-9]{1}\d{0,}(\.\d{0,2})?|0(\.\d{0,2})?|(\.\d{1,2}))$|^\(\$?([1-9]{1}\d{0,2}(,\d{3})*(\.\d{0,2})?|[1-9]{1}\d{0,}(\.\d{0,2})?|0(\.\d{0,2})?|(\.\d{1,2}))\)$/
          return pattern.text(value) || "Invalid wage"
        }
      ],
      managerId: [(value) => !!value || "Manager ID required"],
      password: [
        (value) => !!value || "Password required",
        (value) => value.length >= 8 || "Password must be 8 characters",
      ],
      confirmPassword: [(value) => !!value || "Password confirmation required"],
    },
  }),
  methods: {
    closeDialog() {
      this.$emit("update:opened", false);
      if (this.create) this.$refs.form.reset();
    },
    async addWorkforceMember() {
      this.loading = true;
      if (this.type == 'manager') {
        await this.$store.dispatch("addManager", this.workforceMember);
      }
      else {
        await this.$store.dispatch('addEmployee', this.workforceMember)
      }
      this.$store.dispatch("showSnackbar", { text: this.$options.filters.capitalize(this.type + " added")})
      this.loading = false;
      this.closeDialog();
    },
  },
};
</script>