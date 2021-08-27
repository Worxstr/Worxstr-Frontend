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
      v-chip.mx-3.pa-2.font-weight-bold(small) 5

  v-expansion-panels.mb-6.soft-shadow(accordion flat)
    v-expansion-panel(
      v-for="(transfer, i) in transfers",
      :key="transfer.id"
    )
      v-expansion-panel-header
        
        .flex-grow-0.font-weight-medium
          v-chip.mr-3(small :color='`amber ${$vuetify.theme.dark ? "darken" : "lighten"}-3`')
          | {{ transfer.status }}

          span.mt-1 {{ transfer.achDetails.source.traceId }}
          v-icon mdi-chevron-right
          span.mt-1 {{ transfer.achDetails.destination.traceId }}
        
        v-spacer

        span.flex-grow-0.px-2.font-weight-bold {{ transfer.amount.value | currency }}

      v-expansion-panel-content
        v-card-text.text-body-1
          p Transfer details

      v-divider(v-if='i != transfers.length - 1')

  v-btn(text color='primary') Load more
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class DwollaTransfers extends Vue {
  transfers: any = []
  loadingTransfers = false

  mounted() {
    for (let i = 0; i < 5; i++) {
      this.transfers.push({
        _links: {},
        _embedded: {},
        id: '859237471483',
        status: 'Pending',
        amount: {
          value: '142.32',
          currency: 'USD',
        },
        created: '2021-08-24T10:30:208Z',
        metadata: {
          key: 'value',
        },
        clearing: {
          source: 'standard',
          destination: 'next-available',
        },
        achDetails: {
          source: {
            addenda: {
              values: ['string'],
            },
            traceId: 'Dwolla balance',
          },
          destination: {
            addenda: {
              values: ['string'],
            },
            traceId: 'Wells Fargo Checking',
          },
        },
        rtpDetails: {
          destination: 'rtpDestination',
          networkId: 'rtpNetworkId',
        },
        correlationId: 'coorelationId',
        individualAchId: 'individualAchId',
        processingChannel: {
          destination: 'real-time-payments',
        },
      })
    }
  }
}
</script>
