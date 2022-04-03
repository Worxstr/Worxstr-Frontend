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
      @submit.prevent="sendTransfer",
      ref="form",
      v-model="isValid"
    )
      v-toolbar.flex-grow-0(flat)
        v-toolbar-title.text-h6 {{action == 'add' ? 'Add' : 'Transfer'}} funds {{action == 'add' ? 'to' : 'from'}} Worxstr wallet

      v-divider

      v-card-text.transfer-amount.pb-0
        currency-input(
          v-model.number="transfer.amount"
          :rules="rules.amount"
          label="Amount to transfer"
          autofocus
          outlined
          required
          :headerFont='true'
          data-cy='transfer-amount'
        )

        v-select(
          outlined
          dense
          :label="`Funding source to ${action == 'add' ? 'draw from' : 'deposit to'}`"
          v-model="transfer.location"
          :rules="rules.location"
          required
          :items='fundingSources'
          item-text='name'
          item-value='_links.self.href'
          data-cy='transfer-location'
          hide-details
          :loading='loadingFundingSources'
        )

        //- Standard / instant transfer radio options
        v-radio-group(
          v-if='action == "add"'
          v-model="transfer.transfer_speed"
          required
          data-cy='transfer-speed'
        )
          v-radio(value='standard')
            template(v-slot:label)
              .d-flex.flex-column
                div Standard ACH {{action == 'add' ? 'transfer' : 'withdrawal'}}
                div.text-caption
                  span(v-if='achFee === 0') Free
                  span(v-else-if='achFee === null') Calculating fee...
                  span(v-else) {{ achFee | currency }} fee
              
          v-radio(value='next_available')
            template(v-slot:label)
              .d-flex.flex-column
                div Same-day {{action == 'add' ? 'transfer' : 'withdrawal'}}
                div.text-caption
                  span(v-if='sameDayFee === 0') Free
                  span(v-else-if='sameDayFee === null') Calculating fee...
                  span(v-else) {{ sameDayFee | currency }} fee
          
      v-spacer

      v-card-actions
        v-spacer
        v-btn(text, @click="closeDialog") Cancel
        v-btn(
          text
          color="primary"
          :disabled="!isValid"
          type="submit"
          data-cy='transfer-submit-button'
        ) Transfer
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/camelcase */
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { exists, currency } from '@/util/inputValidation'
import CurrencyInput from '@/components/inputs/CurrencyInput.vue'
import * as payments from '@/services/payments'
import { getMyOrganization } from '@/services/organizations'
import { Organization } from '@/types/Organizations'

@Component({
  components: {
    CurrencyInput,
  },
})
export default class TransferFundsDialog extends Vue {
  isValid = false
  loading = false
  loadingMyOrganization = false
  loadingFundingSources = false
  rules = {
    amount: [
      currency
    ],
    location: [exists('You must choose a funding source.')],
  }
  transfer = {
    amount: 0,
    location: '',
    transfer_speed: 'standard',
  }

  @Prop({ default: false }) readonly opened!: boolean
  @Prop(String) readonly action!: 'add' | 'remove' | null

  @Watch('opened')
  onOpened(opened: boolean) {
    if (opened) {
      // Set amount to how much is in balance
      if (this.action == 'remove')
        this.transfer.amount = this.$store.state.payments.balance.value
      else this.transfer.amount = 0

      // Set funding source to the first option
      if (this.fundingSources.length)
        this.transfer.location = this.fundingSources[0]._links.self.href

      this.transfer.transfer_speed = 'standard'
    }
  }

  get myOrganization(): Organization {
    return this.$store.getters.myOrganization
  }

  get sameDayFee() {
    if (!this.myOrganization) return null
    return this.transfer.amount * parseFloat(this.myOrganization.subscription_tier?.business_same_day_fee)
  }

  get achFee() {
    if (!this.myOrganization) return null
    return this.transfer.amount * parseFloat(this.myOrganization.subscription_tier?.business_ach_fee)
  }

  closeDialog() {
    (this.$refs.form as HTMLFormElement).reset()
    this.$emit('update:opened', null)
  }

  async mounted() {
    Promise.all([
      this.getMyOrganziation(),
      this.getFundingSources(),
    ])
  }

  async getMyOrganziation() {
    this.loadingMyOrganization = true
    try {
      await getMyOrganization(this.$store)
    }
    finally {
      this.loadingMyOrganization = false
    }
  }

  async getFundingSources() {
    this.loadingFundingSources = true
    try {
      await payments.loadFundingSources(this.$store)
    }
    finally {
      this.loadingFundingSources = false
    }
  }

  async sendTransfer() {
    this.loading = true
    try {
      if (this.action === 'add') {
        await payments.addToBalance(this.$store, this.transfer)
      }
      else {
        await payments.removeFromBalance(this.$store, this.transfer)
      }
    }
    finally {
      this.loading = false
      this.closeDialog()
    }
  }

  get fundingSources() {
    return this.$store.getters.fundingSources
  }
}
</script>