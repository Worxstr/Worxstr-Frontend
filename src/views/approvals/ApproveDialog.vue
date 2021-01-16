<template>
  <v-dialog
    v-model="opened"
    :fullscreen="$vuetify.breakpoint.smAndDown"
    max-width="500"
		persistent
  >
    <v-card>
      <v-card-title class="headline"> Approve this timecard? </v-card-title>
      <v-card-text>
        {{ timecard.first_name }} {{ timecard.last_name }} will be paid ${{
          timecard.total_payment
        }}
        for this shift.

        <v-checkbox label="Make this a cash payment" v-model="payWithCash" />
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="closeDialog"> Cancel </v-btn>
        <v-btn color="green" text @click="approveTimecard"> Approve </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "approveDialog",
  props: {
		timecard: Object,
		opened: Boolean
  },
  data: () => ({
    payWithCash: false,
  }),
  methods: {
    closeDialog() {
      this.$emit("update:opened", false);
    },
    approveTimecard() {
      console.log(this.timecard.id);
      this.$store.dispatch("approveTimecards", [
        {
          id: this.timecard.id,
          approved: true,
          paypal: !this.payWithCash,
        },
      ]);
    },
  },
};
</script>