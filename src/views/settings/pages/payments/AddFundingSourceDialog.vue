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
      @submit.prevent="openPlaidAuth",
      ref="form",
      v-model="isValid"
    )
      v-toolbar.flex-grow-0(flat)
        v-toolbar-title.text-h6 Add funding source

      v-divider

      v-card-text.pb-0
        v-text-field(
          autofocus
          outlined,
          dense,
          label="Name for funding source",
          v-model="accountName",
          :rules="rules.accountName",
          required,
        )

      v-spacer

      v-card-actions
        v-spacer
        v-btn(text, @click="closeDialog") Cancel
        v-btn(text, color="primary", :disabled="!isValid", type="submit") Begin authentication
</template>

<script>
/* eslint-disable @typescript-eslint/camelcase */

import { exists } from '@/util/inputValidation'

export default {
  name: "addFundingSourceDialog",
  props: {
    opened: Boolean,
  },
  data: () => ({
    isValid: false,
    loading: false,
    accountName: '',
    rules: {
      accountName: [exists('You must enter a name for your account.')],
    },
  }),
  watch: {
    opened(opened) {
      if (opened) this.$refs.form.reset()
    }
  },
  methods: {
    closeDialog() {
      this.$emit("update:opened", false)
    },
    async openPlaidAuth() {
      this.loading = true
      try {
        await this.$store.dispatch("openPlaidLink", this.accountName)
        this.closeDialog()
      }
      finally {
        this.loading = false
      }
    },
  },
};
</script>