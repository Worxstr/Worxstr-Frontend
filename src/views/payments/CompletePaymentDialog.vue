<template lang="pug">
v-dialog(
  id="payment-dialog"
  v-model="opened",
  :fullscreen="$vuetify.breakpoint.smAndDown",
  max-width="500",
  persistent
  eager
)
  v-card.d-flex.flex-column
    v-toolbar.flex-grow-0(flat)
      v-btn(icon, @click="closeDialog")
        v-icon mdi-close
      v-toolbar-title.text-h6.pl-0 Complete payment
  
    v-divider

    v-card-text.mt-5
      p
        | {{ payments.length }}
        | contractor{{ payments.length == 1 ? '' : 's' }}
        | will be paid {{ wagePayment  | currency }}{{ payments.length > 1 ? ' in total' : ''}}.
        br
        | A {{ feesPayment | currency }} fee will be applied.
        br
        | The total cost for this transaction is {{ totalPayment | currency }}.

    v-spacer

    v-card-actions
      v-spacer
      v-btn(text @click='closeDialog') Cancel
      v-btn(
        text
        color='success'
        @click='completePayments'
        :loading='loading'
        data-cy='confirm-complete-payment-button'
      ) Complete
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { Payment } from '@/types/Payments'
import { completePayments } from '@/services/payments'

@Component
export default class CompletePaymentDialog extends Vue {

  @Prop({ default: false }) opened!: boolean
  @Prop({ type: Array }) paymentIds!: number[]

  loading = false

  get payments() {
    return this.$store.getters.paymentsByIds(this.paymentIds)
  }

  get totalPayment() {
    return this.wagePayment + this.feesPayment;
  }

  get wagePayment() {
    const total = this.payments.reduce((total: number, current: Payment) => {
      return total + parseFloat(current.amount)
    }, 0)

    return Math.round(total * 100) / 100
  }

  get feesPayment() {
    const total = this.payments.reduce((total: number, current: Payment) => {
      return total + parseFloat(current.fee)
    }, 0)

    return Math.round(total * 100) / 100
  }

  closeDialog() {
    this.$emit("update:opened", false);
  }
  
  async completePayments() {
    this.loading = true
    await completePayments(this.$store, this.payments.map((t: Payment) => t.id))
    this.loading = false
    this.closeDialog()
    this.$emit('completed')
  }
}
</script>