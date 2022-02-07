<template lang="pug">
  div(v-if="loadingTimecards && !(timecards.length)")
    v-skeleton-loader.my-4(type="heading")
    v-skeleton-loader(
      type="list-item, list-item, list-item, list-item, list-item, list-item, list-item"
    )

  .d-flex.flex-column.justify-center(v-else)
    .payments.pt-0(v-if='timecards && timecards.length')

      edit-timecard-dialog(
        :opened.sync="editTimecardDialog",
        :timecardId="selectedTimecardIds[0]"
        @saved='clearSelection'
      )
      deny-dialog(
        :opened.sync="denyDialog"
        :timecardIds="selectedTimecardIds"
        @denied='clearSelection'
      )
      payment-dialog(
        :opened.sync="paymentDialog",
        :timecardIds="selectedTimecardIds"
        @completed='clearSelection'
      )

      multiselect-list(
        v-model='selectedTimecardIds'
        :items='timecards'
        :loading='loadingTimecards'
        :show-checkboxes='userIsManager'
        item-name='payment'
      )
        template(#title)
          span(v-if='$vuetify.breakpoint.smAndUp') Pending payments
          span(v-else) Pending
          v-chip.mx-3.pa-2.font-weight-bold(small) {{ timecards.length }}
        
        template(#actions)
          v-btn(
            text
            color='success'
            @click='openPaymentDialog()'
            :disabled='!hasSufficientBalance()'
            :icon='$vuetify.breakpoint.xs'
            data-cy='complete-all-timecards-button'
          )
            v-icon(:left='!$vuetify.breakpoint.xs') mdi-check-all
            span(v-if='!$vuetify.breakpoint.xs') Complete all

          v-btn(
            text
            color='error'
            @click='openDenyDialog()'
            :icon='$vuetify.breakpoint.xs'
            data-cy='deny-all-timecards-button'
          )
            v-icon(:left='!$vuetify.breakpoint.xs') mdi-close
            span(v-if='!$vuetify.breakpoint.xs') Deny all
        
        template(#item-actions)
          v-btn(
            v-if='selectedTimecardIds.length == 1'
            text
            @click="openEditTimecardDialog(selectedTimecardIds[0])"
            data-cy='edit-timecard-button'
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
            data-cy='complete-all-timecards-button'
          )
            v-icon(:left='!$vuetify.breakpoint.xs') {{ selectedTimecardIds.length == 1 ? 'mdi-check' : 'mdi-check-all' }}
            span(v-if='!$vuetify.breakpoint.xs') Complete {{ selectedTimecardIds.length == 1 ? '' : (selectedTimecardIds.length == timecards.length) ? 'all' : selectedTimecardIds.length }}

          v-btn(
            text
            color='error'
            @click='openDenyDialog()'
            :icon='$vuetify.breakpoint.xs'
            data-cy='deny-all-timecards-button'
          )
            v-icon(:left='!$vuetify.breakpoint.xs') mdi-close
            span(v-if='!$vuetify.breakpoint.xs') Deny {{ selectedTimecardIds.length == 1 ? '' : (selectedTimecardIds.length == timecards.length) ? 'all' : selectedTimecardIds.length }}

        template(#content='{ item }')
          v-list-item-content
            v-list-item-title
              router-link.alt-style.font-weight-medium(
                :to="{name: 'user', params: {userId: item.contractor_id}}"
              ) {{ item | fullName }}
          
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
            span.flex-grow-0.px-2.font-weight-bold {{ item.total_payment | currency }}
        
          v-list-item-action.mx-0
            v-btn(
              icon
              :to="{name: 'payment', params: {paymentId: item.id}}"
            )
              v-icon mdi-chevron-right

</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

import MultiselectList from '@/components/MultiselectList.vue'
import EditTimecardDialog from '@/views/payments/EditTimecardDialog.vue'
import DenyDialog from '@/views/payments/DenyDialog.vue'
import PaymentDialog from '@/views/payments/PaymentDialog.vue'

import { Timecard } from '@/types/Payments'
import { loadTimecards } from '@/services/payments'
import { currentUserIs, Managers } from '@/types/Users'

dayjs.extend(relativeTime)

@Component({
  components: {
    MultiselectList,
    EditTimecardDialog,
    PaymentDialog,
    DenyDialog,
  },
})
export default class Timecards extends Vue {
  
    loadingTimecards = false
    selectedTimecardIds: number[] = []
    editTimecardDialog = false
    approveDialog = false
    denyDialog = false
    paymentDialog = false
    
    async mounted() {
      this.loadingTimecards = true
      try {
        await loadTimecards(this.$store)
      } finally {
        this.loadingTimecards = false
      }
    }

    clearSelection() {
      this.selectedTimecardIds = []
    }

    get payments() {
      return this.$store.state.payments
    }

    get timecards() {
      return this.$store.getters.timecards
    }
    
    get userIsManager() {
      return currentUserIs(...Managers)
    }

    hasSufficientBalance(timecardId: number) {

      let timecardIds = []

      if (timecardId) timecardIds = [timecardId]   
      else if (!this.selectedTimecardIds.length) timecardIds = this.timecards.map((t: Timecard) => t.id)
      else timecardIds = this.selectedTimecardIds

      const timecards = this.$store.getters.timecardsByIds(timecardIds)

      const totalPayment = timecards.reduce((total: number, timecard: Timecard) => {
        return total + (timecard ? parseFloat(timecard.total_payment) : 0)
      }, 0)

      return Math.round(totalPayment * 100) / 100 <= parseFloat(this.payments.balance.value)
    }

    timeDiff(timeIn: string, timeOut: string) {
      const _in = dayjs(timeIn)
      const _out = dayjs(timeOut)
      return _out.from(_in, true)
    }


    selectAll() {
      this.selectedTimecardIds = this.timecards.map((t: Timecard) => t.id)
    }

    deselectAll() {
      this.selectedTimecardIds = []
    }

    openEditTimecardDialog(timecardId: number) {
      this.selectedTimecardIds = [timecardId]
      this.editTimecardDialog = true
    }

    openDenyDialog(timecardId: number) {
      if (timecardId) this.selectedTimecardIds = [timecardId]
      else if (!this.selectedTimecardIds.length) this.selectAll()
      this.denyDialog = true
    }

    openPaymentDialog(timecardId: number) {
      // this.selectTimecards()
      if (timecardId) this.selectedTimecardIds = [timecardId]
      else if (!this.selectedTimecardIds.length) this.selectAll()
      this.paymentDialog = true
    }
}
</script>