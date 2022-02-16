<template lang="pug">
v-dialog(
  id='payment-dialog'
  v-model='opened'
  :fullscreen='$vuetify.breakpoint.smAndDown'
  max-width='500'
  persistent
  eager
)
  v-card.d-flex.flex-column
    v-toolbar.flex-grow-0(flat)
      v-btn(icon @click='closeDialog')
        v-icon mdi-close
      v-toolbar-title.text-h6.pl-0 Complete payment
  
    v-divider

    v-card-text.mt-5
      p
        | {{ countUniquePeople == 1 ? (`${payments[0].receiver.first_name} ${payments[0].receiver.last_name}`) : `${countUniquePeople} people` }}
        | will be paid {{ subtotal | currency }}{{ payments.length > 1 ? ' in total' : ''}}.
        br
        | A {{ fees | currency }} fee will be applied.
        br
        | The total cost for this transaction is {{ total | currency }}.

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
export default class CompletePaymentsDialog extends Vue {

  @Prop({ default: false }) opened!: boolean
  @Prop({ type: Array }) paymentIds!: number[]

  loading = false

  get payments() {
    return this.$store.getters.paymentsByIds(this.paymentIds)
  }

  get subtotal() {
    const total = this.payments.reduce((total: number, current: Payment) => {
      return total + parseFloat(current.amount)
    }, 0)

    return Math.round(total * 100) / 100
  }

  get fees() {
    const total = this.payments.reduce((total: number, current: Payment) => {
      return total + parseFloat(current.fee)
    }, 0)

    return Math.round(total * 100) / 100
  }

  get total() {
    return this.subtotal + this.fees
  }

  get countUniquePeople() {
    return this.payments.reduce((acc: any[], payment: Payment) => {
      if (!payment?.receiver?.id) return acc
      
      if (acc.indexOf(payment.receiver.id) === -1) {
        acc.push(payment.receiver.id)
      }
      return acc
    }, []).length
  }

  closeDialog() {
    this.$emit("update:opened", false);
  }
  
  async completePayments() {
    this.loading = true
    try {
      await completePayments(this.$store, this.paymentIds)
      this.closeDialog()
      this.$emit('completed')
    }
    finally {
      this.loading = false
    }
  }
}
</script>