<template lang="pug">
div(v-if="loadingTransfers && !(transfers.length)")
  v-skeleton-loader.my-4(type="heading")
  v-skeleton-loader(
    type="list-item, list-item, list-item, list-item, list-item, list-item, list-item"
  )

.payments.d-flex.flex-column.justify-center.mb-5(v-else-if='transfers.length')

  v-toolbar.no-padding(flat, color="transparent")
  
    v-toolbar-title.px-4.text-h6
      span Transfer history

  v-card.soft-shadow(outlined rounded)
    v-expansion-panels.mb-6(accordion flat)
      v-expansion-panel(
        v-for="(transfer, i) in transfers",
        :key="transfer.id"
      )
        v-expansion-panel-header
          
          .flex-grow-0.font-weight-medium
            v-badge.mr-5(
              v-if='$vuetify.breakpoint.smAndDown'
              dot
              left
              style='margin-bottom: 3px'
              :color='`${statusColor(transfer.status)} ${$vuetify.theme.dark ? "darken" : "lighten"}-3`')

            v-chip.mr-3(
              v-else
              small
              :color='`${statusColor(transfer.status)} ${$vuetify.theme.dark ? "darken" : "lighten"}-3`'
              )
                | {{ transfer.status | capitalize }}

            //- TODO: This looks like shit
            span.mt-1
              | {{ transferFundsAdded(transfer) ? 'From' : 'To' }}&nbsp;
              span(v-if="transfer._links[transferFundsAdded(transfer) ? 'source' : 'destination']['additional-information'].type == 'business'")
                | {{ transfer._links[transferFundsAdded(transfer) ? 'source' : 'destination']['additional-information'].businessName }}

              span(v-if="transfer._links[transferFundsAdded(transfer) ? 'source' : 'destination']['additional-information'].type == 'bank'")
                | {{ transfer._links[transferFundsAdded(transfer) ? 'source' : 'destination']['additional-information'].bankName }}

              span(v-if="transfer._links[transferFundsAdded(transfer) ? 'source' : 'destination']['additional-information'].type == 'Commercial'")
                | {{ transfer._links[transferFundsAdded(transfer) ? 'source' : 'destination']['additional-information'].name }}
                
              span(v-if="transfer._links[transferFundsAdded(transfer) ? 'source' : 'destination']['additional-information'].type == 'personal'")
                | {{ transfer._links[transferFundsAdded(transfer) ? 'source' : 'destination']['additional-information'].firstName }}
                | {{ transfer._links[transferFundsAdded(transfer) ? 'source' : 'destination']['additional-information'].lastName }}
          
          v-spacer

          span.flex-grow-0.px-2.font-weight-bold(
            :class="transferFundsAdded(transfer) ? 'green--text' : 'red--text'"
          ) {{ transferFundsAdded(transfer) ? '+' : '-' }}{{ transfer.amount.value | currency }}
          
          span.flex-grow-0.px-2(v-if='$vuetify.breakpoint.smAndUp') {{ transfer.created | date }}

        v-expansion-panel-content
          v-card-text.text-body-1
            p(v-if='$vuetify.breakpoint.xs') {{ transfer.created | date }}
            p Transfer ID: {{ transfer.id }}
            p {{ transfer._links.destination['additional-information'].type == 'Commercial' ? 'Fee' : ''}}

        v-divider(v-if='i != transfers.length - 1')

  .mt-4.d-flex.justify-center
    v-btn(
      v-if='!noMore'
      text
      outlined
      color='primary'
      @click='loadPage'
      :loading='loadingMore'
    ) View more
</template>

<script lang="ts">
import { Transfer } from '@/types/Payments'
import { Component, Vue } from 'vue-property-decorator'
import { loadTransfers } from '@/services/payments'

@Component
export default class TransferHistory extends Vue {
  loadingTransfers = false
  pageOffset = 0
  loadingMore = false
  noMore = false

  mounted() {
    this.loadPage()
  }

  statusColor(status: string): string {
    switch (status) {
      case 'pending':
        return 'amber'
      case 'processed':
        return 'green'
      case 'cancelled':
        return 'deep-orange'
      case 'failed':
        return 'red'
      default:
        return 'primary'
    }
  }

  get me() {
    return this.$store.getters.me
  }

  transferFundsAdded(transfer: Transfer): boolean {
    return transfer._links.destination.href ===
      this.me.dwolla_customer_url
  }

  get transfers() {
    return this.$store.getters.transfers
  }

  async loadPage() {
    // TODO: Move pagination to store. Current page offset is not persistent
    if (this.pageOffset == 0) this.loadingTransfers = true
    else this.loadingMore = true

    const data = await loadTransfers(this.$store, {
      offset: this.pageOffset,
    })

    if (this.pageOffset == 0) this.loadingTransfers = false
    else this.loadingMore = false

    if (!data.transfers.length) this.noMore = true
    this.pageOffset++
  }
}
</script>
