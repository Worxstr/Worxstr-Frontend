<template lang="pug">
div(v-if="loadingTransfers && !(transfers.length)")
  v-skeleton-loader.my-4(type="heading")
  v-skeleton-loader(
    type="list-item, list-item, list-item, list-item, list-item, list-item, list-item"
  )

.payments.d-flex.flex-column.justify-center.mb-5(v-else)

  v-toolbar.no-padding(flat, color="transparent")
  
    v-toolbar-title.px-4.text-h6
      span Transfer history

  v-expansion-panels.mb-6.soft-shadow(accordion flat)
    v-expansion-panel(
      v-for="(transfer, i) in transfers",
      :key="transfer.id"
    )
      v-expansion-panel-header
        
        .flex-grow-0.font-weight-medium
          v-chip.mr-3(small :color='`${statusColor(transfer.status)} ${$vuetify.theme.dark ? "darken" : "lighten"}-3`')
            | {{ transfer.status | capitalize }}


          span.mt-1
            span(v-if="transfer._links.source['additional-information'].type == 'business'")
              | {{ transfer._links.source['additional-information'].businessName }}

            span(v-if="transfer._links.source['additional-information'].type == 'bank'")
              | {{ transfer._links.source['additional-information'].bankName }}

            span(v-if="transfer._links.source['additional-information'].type == 'Commercial'")
              | {{ transfer._links.source['additional-information'].name }}
              
            span(v-if="transfer._links.source['additional-information'].type == 'personal'")
              | {{ transfer._links.source['additional-information'].firstName }} {{ transfer._links.source['additional-information'].lastName }}

          v-icon mdi-chevron-right
          span.mt-1 {{ transfer._links.destination['additional-information'].name }}
        
        v-spacer

        span.flex-grow-0.px-2 {{ transfer.created | date }}
        span.flex-grow-0.px-2.font-weight-bold(
          :class="transfer._links.source['resource-type'] == 'customer' ? 'red--text' : 'green--text'"
        )
          | {{ transfer.amount.value | currency }}

      v-expansion-panel-content
        v-card-text.text-body-1
          p {{ transfer.id }}

      v-divider(v-if='i != transfers.length - 1')

  v-btn(
    v-if='!noMore'
    text
    color='primary'
    @click='loadPage'
    :loading='loadingMore'
  ) Load more
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class TransferHistory extends Vue {
  loadingTransfers = false
  pageOffset = 0
  loadingMore = false
  noMore = false

  mounted() {
    this.loadPage()
  }

  statusColor(status: string) {
    switch (status) {
      case 'pending':
        return 'amber'
      case 'processed':
        return 'green'
      case 'cancelled':
        return 'deep-orange'
      case 'failed':
        return 'red'
    }
  }

  get transfers() {
    return this.$store.getters.transfers
  }

  async loadPage() {
    // TODO: Move pagination to store. Current page offset is not persistent

    this.loadingMore = true
    const data = await this.$store.dispatch('loadTransfers', {
      offset: this.pageOffset
    })
    if (!data.transfers.length) this.noMore = true
    this.loadingMore = false
    this.pageOffset++
  }
}
</script>
