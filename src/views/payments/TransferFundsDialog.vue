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
        v-text-field.text-h5(
          autofocus
          outlined
          type='number'
          prefix='$'
          step='1'
          min='0.00'
          label="Amount to transfer"
          v-model.number="transfer.amount"
          :rules="rules.amount"
          required
        )

        v-select(
          outlined
          dense
          :label="`Funding source to ${action == 'add' ? 'draw from' : 'deposit to'}`"
          v-model.number="transfer.location"
          :rules="rules.location"
          required
          :items='fundingSources'
          item-text='name'
          item-value='location'
        )

      v-spacer

      v-card-actions
        v-spacer
        v-btn(text, @click="closeDialog") Cancel
        v-btn(text, color="primary", :disabled="!isValid", type="submit") Transfer
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { exists } from '@/plugins/inputValidation'

@Component
export default class TransferFundsDialog extends Vue {
  isValid = false
  loading = false
  rules = {
    amount: [
      (value: string) => {
        // Check that number has no more than two decimal places
        const pattern = /^\d+(\.\d{0,2})?$/
        return pattern.test(value) && parseFloat(value) > 0 || 'You must enter a valid amount.'
      }
    ],
    location: [exists('You must choose a funding source.')],
  }
  transfer = {
    amount: 10,
    location: '',
  }

  @Prop({ default: false }) readonly opened!: boolean
  @Prop(String) readonly action!: 'add' | 'remove' | null

  @Watch('opened')
  onOpened() {
    if (this.action == 'remove')
      this.transfer.amount = this.$store.state.payments.balance.value
    else this.transfer.amount = 10
  }

  closeDialog() {
    this.$emit('update:opened', null)
  }

  mounted() {
    this.$store.dispatch('loadFundingSources')
  }

  async sendTransfer() {
    this.loading = true
    await this.$store.dispatch(this.action == 'add' ? 'addToBalance' : 'removeFromBalance', this.transfer)
    this.loading = false
    this.closeDialog()
  }

  get fundingSources() {
    return this.$store.getters.fundingSources
  }
}
</script>