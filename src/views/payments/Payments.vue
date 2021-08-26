<template lang="pug">
div

  portal(to="toolbarActions")
    v-btn(
      color="primary",
      text
      :icon='$vuetify.breakpoint.xs'
    )
      v-icon(left) mdi-cash-plus
      span(v-if='!$vuetify.breakpoint.xs') Withdraw funds
    
    v-btn(
      color="primary",
      text
      :icon='$vuetify.breakpoint.xs'
    )
      v-icon(left) mdi-bank-transfer-in
      span(v-if='!$vuetify.breakpoint.xs') Transfer to bank




  v-container.d-flex.flex-column.justify-center.text-center(
    fluid
  )
    div(v-if="loadingWallet")
      v-skeleton-loader.my-4(type="heading")

    .my-5(v-else)
      .text-h6 Available balance
      .text-h2 {{ payments.wallet.balance | currency }}



  timecards

      
</template>

<script>
import { mapState, mapActions } from 'vuex'
import Timecards from '@/components/Timecards.vue'


export default {
  name: 'payments',
  metaInfo: {
    title: 'Payments',
  },
  data: () => ({
    loadingWallet: false,
    breaks: [{}],
  }),
  components: {
    Timecards
  },
  computed: {
    ...mapState(['authenticatedUser', 'payments']),
  },
  async mounted() {
    this.loadingWallet = true
    try {
      await this.$store.dispatch('loadWallet')
    } finally {
      this.loadingWallet = false
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
