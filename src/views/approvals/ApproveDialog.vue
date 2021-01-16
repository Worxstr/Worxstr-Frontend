<template>
  <v-dialog
    v-model="opened"
    :fullscreen="$vuetify.breakpoint.smAndDown"
    max-width="500"
    persistent
  >
    <v-card>
      <v-card-title class="headline">
        Approve
        {{ timecards.length == 1 ? "this timecard" : "these timecards" }}?
      </v-card-title>
      <v-card-text>
        <span v-if="!payWithCash">
          <span v-if="timecards.length == 1">
            {{ timecards[0].first_name }} {{ timecards[0].last_name }} will be
            paid ${{ timecards[0].total_payment }}
            for this shift.
          </span>
          <span v-else>
            {{ timecards.length }} employees will be paid ${{ totalPayment }} in
            total
          </span>
        </span>

        <v-checkbox
          :label="`Make a cash payment${timecards.length == 1 ? '' : 's'}`"
          v-model="payWithCash"
        />

        <span v-if="payWithCash"
          ><span
            class="text-subtitle-2 red--text d-flex align-center my-2"
            v-for="timecard in timecards"
            :key="timecard.id"
          >
            <v-icon color="red" class="mr-2"> mdi-alert-circle-outline </v-icon>

            Be sure to pay

            {{ timecard.first_name }} {{ timecard.last_name }}

            <span class="font-weight-black mx-1"
              >${{ timecard.total_payment }}</span
            >
            in cash.
          </span></span
        >
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="closeDialog"> Cancel </v-btn>
        <v-btn color="green" text @click="approveTimecard">
          {{
            payWithCash
              ? `Confirm cash payment${timecards.length == 1 ? "" : "s"}`
              : "Approve"
          }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
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
      await this.$store.dispatch("approveTimecards", this.timecards.map(t => ({
				id: t.id,
				approved: true,
				paypal: !this.payWithCash
			})));
      this.closeDialog();
    },
  },
};
</script>