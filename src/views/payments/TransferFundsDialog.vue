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
        )

      v-spacer

      v-card-actions
        v-spacer
        v-btn(text, @click="closeDialog") Cancel
        v-btn(text, color="primary", :disabled="!isValid", type="submit") Transfer
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { exists, currency } from '@/plugins/inputValidation'
import CurrencyInput from '@/components/inputs/CurrencyInput.vue'

@Component({
  components: {
    CurrencyInput,
  },
})
export default class TransferFundsDialog extends Vue {
  isValid = false
  loading = false
  rules = {
    amount: [
      currency
    ],
    location: [exists('You must choose a funding source.')],
  }
  transfer = {
    amount: 0,
    location: '',
  }

  @Prop({ default: false }) readonly opened!: boolean
  @Prop(String) readonly action!: 'add' | 'remove' | null

  @Watch('opened')
  onOpened() {
    if (this.action == 'remove')
      this.transfer.amount = this.$store.state.payments.balance.value
    else this.transfer.amount = 0
  }

  closeDialog() {
    this.$emit('update:opened', null)
  }

  mounted() {
    this.$store.dispatch('loadFundingSources')
  }

  async sendTransfer() {
    this.loading = true
    try {
      await this.$store.dispatch(this.action == 'add' ? 'addToBalance' : 'removeFromBalance', this.transfer)
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