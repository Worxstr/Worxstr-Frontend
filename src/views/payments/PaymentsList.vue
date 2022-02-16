<template lang="pug">
  div(v-if="loadingPayments && !(payments.length)")
    v-skeleton-loader.my-4(type="heading")
    v-skeleton-loader(
      type="list-item, list-item, list-item, list-item, list-item, list-item, list-item"
    )

  .d-flex.flex-column.justify-center(v-else)
    .payments.pt-0(v-if='payments && payments.length')

      edit-payment-dialog(
        :opened.sync="editPaymentDialog",
        :paymentId="selectedPaymentIds[0]"
        @saved='clearSelection'
      )
      deny-dialog(
        :opened.sync="denyDialog"
        :paymentIds="selectedPaymentIds"
        @denied='clearSelection'
      )
      complete-payments-dialog(
        :opened.sync="paymentDialog"
        :paymentIds="selectedPaymentIds"
        @completed='clearSelection'
      )

      multiselect-list(
        v-model='selectedPaymentIds'
        :items='payments'
        :loading='loadingPayments'
        :show-checkboxes='userIsManager && editable'
        item-name='payment'
      )
        template(#title)
          span(v-if='$vuetify.breakpoint.smAndUp') {{ title }}
          span(v-else) Pending
          v-chip.mx-3.pa-2.font-weight-bold(small) {{ payments.length }}
        
        template(#actions v-if='editable')
          v-btn(
            text
            color='success'
            @click='openPaymentDialog()'
            :disabled='!hasSufficientBalance()'
            :icon='$vuetify.breakpoint.xs'
            data-cy='complete-all-payments-button'
          )
            v-icon(:left='!$vuetify.breakpoint.xs') mdi-check-all
            span(v-if='!$vuetify.breakpoint.xs') Complete all

          v-btn(
            text
            color='error'
            @click='openDenyDialog()'
            :icon='$vuetify.breakpoint.xs'
            data-cy='deny-all-payments-button'
          )
            v-icon(:left='!$vuetify.breakpoint.xs') mdi-close
            span(v-if='!$vuetify.breakpoint.xs') Deny all
        
        template(#item-actions)
          v-btn(
            v-if='selectedPaymentIds.length == 1'
            text
            @click="openEditPaymentDialog(selectedPaymentIds[0])"
            data-cy='edit-payment-button'
            color='primary'
          ) 
            v-icon(:left='!$vuetify.breakpoint.xs') mdi-pencil
            span(v-if='!$vuetify.breakpoint.xs') Edit


          v-btn(
            text
            color='success'
            @click='openPaymentDialog()'
            :disabled='!hasSufficientBalance()'
            :icon='$vuetify.breakpoint.xs'
            data-cy='complete-all-payments-button'
          )
            v-icon(:left='!$vuetify.breakpoint.xs') {{ selectedPaymentIds.length == 1 ? 'mdi-check' : 'mdi-check-all' }}
            span(v-if='!$vuetify.breakpoint.xs')
              | Complete {{ selectedPaymentIds.length == 1 ? '' : (selectedPaymentIds.length == payments.length) ? 'all' : selectedPaymentIds.length }}
              | ({{ selectedTotal | currency }})

          v-btn(
            text
            color='error'
            @click='openDenyDialog()'
            :icon='$vuetify.breakpoint.xs'
            data-cy='deny-all-payments-button'
          )
            v-icon(:left='!$vuetify.breakpoint.xs') mdi-close
            span(v-if='!$vuetify.breakpoint.xs') Deny {{ selectedPaymentIds.length == 1 ? '' : (selectedPaymentIds.length == payments.length) ? 'all' : selectedPaymentIds.length }}

        template(#content='{ item }')
          v-list-item-content
            v-list-item-title
              router-link.alt-style.font-weight-medium(
                :to="{name: 'payment', params: {paymentId: item.id}}"
              )
                | {{ isDebit(item) ? 'From' : 'To' }}
                | {{ (isDebit(item) ? item.sender : item.receiver) | name }}
          
          v-list-item-action.align-self-center.flex-row
            span.flex-grow-0.px-2(
              v-if="item.time_clocks && item.time_clocks.length"
            )
              | {{
              |   timeDiff(
              |     item.time_clocks[0].time,
              |     item.time_clocks[item.time_clocks.length - 1].time
              |   )
              | }}
            span.flex-grow-0.px-2.font-weight-bold(:class="{'green--text': isDebit(item)}")
              | {{ isDebit(item) ? '+' : '-' }}{{ item.total | currency }}
        
          v-list-item-action.mx-0
            v-btn(
              icon
              :to="{name: 'payment', params: {paymentId: item.id}}"
            )
              v-icon mdi-chevron-right

</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

import MultiselectList from '@/components/MultiselectList.vue'
import EditPaymentDialog from '@/views/payments/EditPaymentDialog.vue'
import DenyDialog from '@/views/payments/DenyPaymentsDialog.vue'
import CompletePaymentsDialog from '@/views/payments/CompletePaymentsDialog.vue'

import { Payment, isDebit, isUser } from '@/types/Payments'
import { loadPayments } from '@/services/payments'
import { currentUserIs, Managers, User } from '@/types/Users'
import { Organization } from '@/types/Organizations'

dayjs.extend(relativeTime)

@Component({
  components: {
    MultiselectList,
    EditPaymentDialog,
    CompletePaymentsDialog,
    DenyDialog,
  },
  filters: {
    name(account: any) {
      if (isUser(account)) {
        return `${account.first_name} ${account.last_name}`
      } else {
        return account.name
      }
    }
  }
})
export default class PaymentsList extends Vue {
  
    loadingPayments = false
    selectedPaymentIds: number[] = []
    editPaymentDialog = false
    approveDialog = false
    denyDialog = false
    paymentDialog = false

    @Prop({ required: true }) payments!: Payment[]
    @Prop({ default: false }) editable!: boolean
    @Prop({ type: String, required: true }) title!: string
    
    async mounted() {
      this.loadingPayments = true
      try {
        await loadPayments(this.$store)
      } finally {
        this.loadingPayments = false
      }
    }

    clearSelection() {
      this.selectedPaymentIds = []
    }

    get me() {
      return this.$store.getters.me
    }

    get balance() {
      return this.$store.state.payments.balance
    }
    
    get userIsManager() {
      return currentUserIs(...Managers)
    }

    // Sum the amount of all selected payments
    get selectedTotal() {
      return this.selectedPaymentIds.reduce((total, id) => {
        const payment = this.payments.find((p: Payment) => p.id === id)
        return total + (payment ? parseFloat(payment.total) : 0)
      }, 0)
    }

    isDebit(payment: Payment) {
      return isDebit(payment)
    }

    hasSufficientBalance(paymentId: number) {

      let paymentIds = []

      if (paymentId) paymentIds = [paymentId]
      else if (!this.selectedPaymentIds.length) paymentIds = this.payments.map((p: Payment) => p.id)
      else paymentIds = this.selectedPaymentIds

      const payments: Payment[] = this.$store.getters.paymentsByIds(paymentIds)

      const totalPayment = payments.reduce((total: number, payment: Payment) => {
        return total + (payment ? parseFloat(payment.total) : 0)
      }, 0)

      return Math.round(totalPayment * 100) / 100 <= parseFloat(this.balance.value)
    }

    timeDiff(timeIn: string, timeOut: string) {
      const _in = dayjs(timeIn)
      const _out = dayjs(timeOut)
      return _out.from(_in, true)
    }


    selectAll() {
      this.selectedPaymentIds = this.payments.map((t: Payment) => t.id)
    }

    deselectAll() {
      this.selectedPaymentIds = []
    }

    openEditPaymentDialog(paymentId: number) {
      this.selectedPaymentIds = [paymentId]
      this.editPaymentDialog = true
    }

    openDenyDialog(paymentId: number) {
      if (paymentId) this.selectedPaymentIds = [paymentId]
      else if (!this.selectedPaymentIds.length) this.selectAll()
      this.denyDialog = true
    }

    openPaymentDialog(paymentId: number) {
      // this.selectTimecards()
      if (paymentId) this.selectedPaymentIds = [paymentId]
      else if (!this.selectedPaymentIds.length) this.selectAll()
      this.paymentDialog = true
    }
}
</script>