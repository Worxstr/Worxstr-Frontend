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
      @submit.prevent="setSSN",
      ref="form",
      v-model="isValid"
    )
      v-toolbar.flex-grow-0(flat)
        v-toolbar-title Register your Social Security number

      v-card-text.pb-0
        v-text-field(
          outlined,
          dense,
          label="Social Security number",
          v-model="ssn",
          :rules="rules.ssn",
          required,
          pattern="\d{3}[\-]\d{2}[\-]\d{4}"
        )

        v-text-field(
          outlined,
          dense,
          label="Confirm SSN",
          v-model="confirmSSN",
          :rules="[...rules.ssn, rules.matches(ssn, confirmSSN)]",
          required,
          pattern="\d{3}[\-]\d{2}[\-]\d{4}"
        )

      v-spacer

      v-card-actions
        v-spacer
        v-btn(text, @click="closeDialog") Cancel
        v-btn(text, color="green", :disabled="!isValid", type="submit")
          | Save SSN
</template>

<script>
/* eslint-disable @typescript-eslint/camelcase */

// TODO: Move this to reusable import
const exists = (errorString) => (value) => !!value || errorString;

export default {
  name: "ssnDialog",
  props: {
    opened: Boolean,
  },
  data: () => ({
    isValid: false,
    loading: false,
    ssn: "",
    confirmSSN: "",
    rules: {
      ssn: [
        exists("SSN required"),
        (value) => {
          const pattern = /^\d{3}-\d{2}-\d{4}|\d{9}$/;
          return pattern.test(value) || "Invalid SSN";
        },
      ],
      matches: (val1, val2) => {
        return (
          val1.replaceAll("-", "") == val2.replaceAll("-", "") ||
          "SSNs must match"
        );
      },
    },
  }),
  methods: {
    closeDialog() {
      this.$emit("update:opened", false);
      if (this.create) this.$refs.form.reset();
    },
    async setSSN() {
      this.loading = true;
      const rawSSN = this.ssn.replaceAll("-", "");
      await this.$store.dispatch("setSSN", rawSSN);
      this.loading = false;
      this.closeDialog();
    },
  },
};
</script>