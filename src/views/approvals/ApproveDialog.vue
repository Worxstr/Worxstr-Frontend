<template lang="pug">
v-dialog(
  v-model="opened",
  :fullscreen="$vuetify.breakpoint.smAndDown",
  max-width="500",
  persistent
)
  v-card.d-flex.flex-column
    v-card-title.headline
      | Approve
      | {{ timecards.length == 1 ? 'this timecard' : 'these timecards' }}?
    v-card-text
      span
        span(v-if="timecards.length == 1")
          | You are approving {{ timecards[0].first_name }}
          | {{ timecards[0].last_name }} for ${{ timecards[0].total_payment }}
          | for this shift.
        span(v-else)
          | You are approving {{ timecards.length }} employees for ${{
          | totalPayment
          | }}
          | in total.

      v-checkbox(
        :label="`Make a cash payment${timecards.length == 1 ? '' : 's'}`",
        v-model="payWithCash"
      )
        span(v-if="payWithCash")
          span.text-subtitle-2.red--text.d-flex.align-center.my-2(
            v-for="timecard in timecards",
            :key="timecard.id"
          )
            v-icon.mr-2(color="red") mdi-alert-circle-outline
            |
            | Be sure to pay
            |
            | {{ timecard.first_name }} {{ timecard.last_name }}
            span.font-weight-black.mx-1 ${{ timecard.total_payment }}
            |
            | in cash.

    v-spacer
            
    v-card-actions
      v-spacer
      v-btn(text, @click="closeDialog") Cancel
      v-btn(color="green", text, @click="approveTimecard")
        | {{
        | payWithCash
        | ? `Confirm cash payment${timecards.length == 1 ? "" : "s"}`
        | : "Yes, Approve"
        | }}
</template>

<script>
export default {
  name: "approveDialog",
  props: {
    timecards: Array,
    opened: Boolean,
  },
  data: () => ({
    payWithCash: false,
  }),
  computed: {
    totalPayment() {
      const total = this.timecards.reduce((total, current) => {
        return total + parseFloat(current.total_payment);
      }, 0);

      return Math.round(total * 100) / 100;
    },
  },
  methods: {
    closeDialog() {
      this.$emit("update:opened", false);
    },
    async approveTimecard() {
      await this.$store.dispatch(
        "approveTimecards",
        this.timecards.map((t) => ({
          id: t.id,
          approved: true,
          paypal: !this.payWithCash,
        }))
      );
      this.closeDialog();
    },
  },
};
</script>