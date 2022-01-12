<template lang="pug">
v-dialog(
  v-if='fundingSource'
  v-model="opened"
  :fullscreen="$vuetify.breakpoint.smAndDown"
  max-width="500"
  persistent
)
  v-card.d-flex.flex-column
    v-form.flex-grow-1.d-flex.flex-column(
      @submit.prevent="verifyFundingSource"
      ref="form"
      v-model="isValid"
    )
      v-toolbar.flex-grow-0(flat)
        v-toolbar-title.text-h6 Verifying {{ fundingSource.name }}

      v-divider

      v-card-text.pb-0
        p Two small deposits will be made to your bank account, which will take about 2-3 business days to process. Enter those amounts here to verify your account.

        currency-input(
          v-model.number="form.amount1"
          :rules="rules.amount"
          label="Amount 1"
          autofocus
          outlined
          required
          dense
        )

        currency-input(
          v-model.number="form.amount2"
          :rules="rules.amount"
          label="Amount 2"
          outlined
          required
          dense
        )

      v-spacer

      v-card-actions
        v-spacer
        v-btn(text @click="closeDialog") Cancel
        v-btn(
          text
          color="success"
          :disabled="!isValid"
          type="submit"
          :loading='loading'
        ) Verify
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/camelcase */
import { Component, Vue, Prop } from 'vue-property-decorator'
import { FundingSource } from '@/types/Payments'
import { verifyFundingSource } from '@/services/payments'
import CurrencyInput from '@/components/inputs/CurrencyInput.vue'

@Component({
  components: {
    CurrencyInput,
  },
})
export default class VerifyFundingSourceDialog extends Vue {

  @Prop({ default: false }) readonly opened!: boolean
  @Prop(Object) readonly fundingSource!: FundingSource

  loading = false
  isValid = false

  form = {
    amount1: 0,
    amount2: 0,
  }
  rules = {
    amount: [
      (v: number) => !!v || 'Amount is required',
      (v: number) => v > 0 || 'Amount is invalid',
      (v: number) => v <= .1 || 'Amount will be no more than 10 cents',
    ]
  }

  closeDialog() {
    this.$emit('update:opened', false)
  }

  async verifyFundingSource() {
    this.loading = true
    try {
      await verifyFundingSource(this.$store, {
        ...this.form,
        fundingSourceUrl: this.fundingSource._links.self.href
      })
      this.closeDialog()
    }
    finally {
      this.loading = false 
    }
  }
}
</script>