<template lang="pug">
div

  //- Toolbar buttons
  portal(to="toolbarActions")
    v-btn(
      color="primary",
      text
      :icon='$vuetify.breakpoint.xs'
    )
      v-icon(:left='!$vuetify.breakpoint.xs') mdi-cash-plus
      span(v-if='!$vuetify.breakpoint.xs') Withdraw funds
    
    v-btn(
      color="primary",
      text
      :icon='$vuetify.breakpoint.xs'
    )
      v-icon(:left='!$vuetify.breakpoint.xs') mdi-bank-transfer-in
      span(v-if='!$vuetify.breakpoint.xs') Transfer to bank


  v-container.d-flex.flex-column.justify-center(
    fluid
  )
    //- Balance display
    div(v-if="loadingBalance && !payments.balance.value")
      v-skeleton-loader.my-4(type="heading")

    .text-center.my-5(v-else)
      .text-h6 Available balance
      .text-h2 {{ payments.balance.value | currency }}


    timecards.mb-5

    transfer-history

      
</template>

<script>
import { mapState, mapActions } from 'vuex'
import Timecards from '@/components/Timecards.vue'
import TransferHistory from '@/components/TransferHistory.vue'

export default {
  name: 'payments',
  metaInfo: {
    title: 'Payments',
  },
  data: () => ({
    loadingBalance: false,
    breaks: [{}],
  }),
  components: {
    Timecards,
    TransferHistory,
  },
  computed: {
    ...mapState(['authenticatedUser', 'payments']),
  },
  async mounted() {
    this.loadingBalance = true
    try {
      await this.$store.dispatch('loadBalance')
    } finally {
      this.loadingBalance = false
    }
  },
  methods: {
    ...mapActions(['signOut']),
  },
}
</script>

<style lang="scss">
.no-padding .v-toolbar__content {
  padding: 0 !important;
}
</style>
