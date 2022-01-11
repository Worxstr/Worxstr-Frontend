<template lang="pug">
v-dialog(
  v-model="opened"
  :fullscreen="$vuetify.breakpoint.smAndDown"
  max-width="500"
  persistent
)
  v-card.d-flex.flex-column
    v-fade-transition
      v-overlay(v-if="loading" absolute opacity=".2")
        v-progress-circular(indeterminate)

    v-form.flex-grow-1.d-flex.flex-column(
      @submit.prevent="openPlaidAuth"
      ref="form"
      v-model="isValid"
    )
      v-toolbar.flex-grow-0(flat)
        v-toolbar-title.text-h6 Add funding source

      v-divider

      v-card-text.pb-0
        v-text-field(
          autofocus
          outlined
          dense
          label="Name for funding source"
          v-model="form.accountName"
          :rules="rules.accountName"
          required
        )

        v-subheader Verification method

        v-radio-group.mt-0(v-model='verificationMethod' mandatory)
          v-radio(value='instant')
            template(v-slot:label)
              div
                .text-body-1 Instant verification
                .text-caption.font-italic You will sign in to your bank account using Plaid for instant verification.

          v-radio(value='micro-deposit')
            template(v-slot:label)
              div
                .text-body-1 Micro-deposit verification
                .text-caption.font-italic A small deposit will be made to your bank account, which will take about 2-3 business days. Use this if your bank does not support Plaid.
      
        v-slide-y-transition
          div(v-if='verificationMethod === "micro-deposit"')
            v-subheader Account details
            v-text-field(
              outlined
              dense
              label='Routing number'
              v-model="form.routingNumber"
              :rules="rules.routingNumber"
              placeholder='123456789'
              maxlength='9'
              required
              pattern='[0-9]*'
            )

            v-text-field(
              outlined
              dense
              label='Account number'
              v-model="form.accountNumber"
              :rules="rules.accountNumber"
              placeholder='1234567890'
              minlength='6'
              maxlength='17'
              required
              pattern='[0-9]*'
            )

            v-radio-group.mt-0(v-model='form.accountType' mandatory)
              v-radio(value='checking' label='Checking account')
              v-radio(value='savings' label='Savings account')

      v-spacer

      v-card-actions
        v-spacer
        v-btn(text @click="closeDialog") Cancel
        v-btn(text color="primary" :disabled="!isValid" type="submit")
          | {{ verificationMethod === 'instant' ? 'Begin verification' : 'Deposit and begin verification' }}
</template>

<script>
/* eslint-disable @typescript-eslint/camelcase */
import { openPlaidLink } from '@/util/plaid'
import { addFundingSource } from '@/services/payments'

import { exists } from '@/util/inputValidation'

export default {
  name: "addFundingSourceDialog",
  props: {
    opened: Boolean,
  },
  data: () => ({
    isValid: false,
    loading: false,
    form: {
      accountName: '',
      routingNumber: '',
      accountNumber: '',
    },
    verificationMethod: 'instant',
    rules: {
      accountName: [exists('You must enter a name for your account.')],
      routingNumber: [exists('You must enter a routing number.'), (value) => {
        // Check must be 9 digits and numerical
        if (value.length !== 9 || !/^\d+$/.test(value)) {
          return 'Routing number must be 9 digits.'
        }
      }],
      accountNumber: [exists('You must enter an account number.'), (value) => {
        // Check must be 10 digits and numerical
        if (value.length < 6 || value.length > 17 || !/^\d+$/.test(value)) {
          return 'Account number must be 6-17 digits.'
        }
      }],
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
        // Using instant verification, load the plaid auth screen
        if (this.verificationMethod === 'instant') {
          await openPlaidLink(this.form.accountName, (loading) => {
            this.$emit('updateFundingSourceLoader', loading)
          })
        }
        // Using micro-deposit, call API directly
        else {
          await addFundingSource(this.$store, this.form)
        }
        this.closeDialog()
      }
      finally {
        this.loading = false
      }
    },
  },
};
</script>