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
          autofocus
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
          type="tel",
          v-mask="'(###) ###-####'"
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
          v-if="type == 'contractor'"
          prefix="$"
          suffix="/ hour"
          label="Hourly wage",
          type="number",
          min="0.01",
          step="0.01",
          dense,
          outlined,
          :rules="rules.currency",
          v-model.number="workforceMember.hourly_rate",
          required
        )

        v-select(
          v-if="managers.contractor.length",
          v-model="workforceMember.manager_id",
          :items="managers.contractor",
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

import { mapState } from "vuex";
import {
  exists,
  emailRules,
  phoneRules,
  currencyRules,
} from "@/plugins/inputValidation";

export default {
  name: "addWorkforceMemberDialog",
  props: ["opened", "type"],
  computed: {
    ...mapState(["managers"]),
  },
  watch: {
    opened(newVal) {
      if (newVal) this.$store.dispatch("loadManagers");
    },
  },
  data: () => ({
    isValid: false,
    workforceMember: {
      hourly_rate: 12.0,
    },
    loading: false,
    managerTypes: [
      {
        text: "Organization manager",
        value: "organization_manager",
      },
      {
        text: "Contractor manager",
        value: "contractor_manager"
      }
    ],
    rules: {
      firstName: [exists("First name required")],
      lastName: [exists("Last name required")],
      phone: phoneRules,
      email: emailRules,
      currency: currencyRules,
      managerId: [(value) => !!value || "Manager ID required"],
    },
  }),
  methods: {
    closeDialog() {
      this.$emit("update:opened", false);
      if (this.create) this.$refs.form.reset();
    },
    async addWorkforceMember() {
      this.loading = true;
      try {
        if (this.type == 'manager') {
          await this.$store.dispatch("addManager", this.workforceMember)
        }
        else {
          await this.$store.dispatch('addContractor', this.workforceMember)
        }
        this.$store.dispatch("showSnackbar", {
          text: this.$options.filters.capitalize(this.type + " added"),
        });
        this.closeDialog();
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>