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

<script>
export default {
  name: "paymentDialog",
  props: {
    opened: Boolean,
    timecardIds: Array,
  },
  data: () => ({
    loading: false,
  }),
  computed: {
    timecards() {
      return this.$store.getters.timecardsByIds(this.timecardIds)
    },
    totalPayment() {
      return this.wagePayment + this.feesPayment;
    },
    wagePayment() {
      const total = this.timecards.reduce((total, current) => {
        return total + parseFloat(current.wage_payment);
      }, 0);

      return Math.round(total * 100) / 100;
    },
    feesPayment() {
      const total = this.timecards.reduce((total, current) => {
        return total + parseFloat(current.fees_payment);
      }, 0);

      return Math.round(total * 100) / 100;
    },
  },
  methods: {
    closeDialog() {
      this.$emit("update:opened", false);
    },
    async completePayments() {
      this.loading = true
      await this.$store.dispatch("completePayments", this.timecards.map(t => t.id))
      this.loading = false
      this.closeDialog()
    },
  },
};
</script>