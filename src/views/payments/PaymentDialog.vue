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
        | {{ timecards.length }}
        | contractor{{ timecards.length == 1 ? '' : 's' }}
        | will be paid {{ wagePayment  | currency }}{{ timecards.length > 1 ? ' in total' : ''}}.
        br
        | A {{ feesPayment | currency }} fee will be applied.
        br
        | The total cost for this transaction is {{ totalPayment | currency }}.

    v-spacer

    v-card-actions
      v-spacer
      v-btn(text @click='closeDialog') Cancel
      v-btn(text color='success' @click='completePayments' :loading='loading') Complete
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { Timecard } from '@/definitions/Payments'
import { completePayments } from '@/services/payments'

@Component
export default class PaymentDialog extends Vue {

  @Prop({ default: false }) opened!: boolean
  @Prop({ type: Array }) timecardIds!: number[]

  loading = false

  get timecards() {
    return this.$store.getters.timecardsByIds(this.timecardIds)
  }

  get totalPayment() {
    return this.wagePayment + this.feesPayment;
  }

  get wagePayment() {
    const total = this.timecards.reduce((total: number, current: Timecard) => {
      return total + parseFloat(current.wage_payment)
    }, 0)

    return Math.round(total * 100) / 100
  }

  get feesPayment() {
    const total = this.timecards.reduce((total: number, current: Timecard) => {
      return total + parseFloat(current.fees_payment)
    }, 0)

    return Math.round(total * 100) / 100
  }

  closeDialog() {
    this.$emit("update:opened", false);
  }
  
  async completePayments() {
    this.loading = true
    await completePayments(this.$store, this.timecards.map((t: Timecard) => t.id))
    this.loading = false
    this.closeDialog()
  }
}
</script>