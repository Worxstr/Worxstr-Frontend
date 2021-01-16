<template>
  <v-card>
    <v-card-title class="headline"> Approve all timecards? </v-card-title>
    <v-card-text> This will approve all unapproved timecards </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn text> Cancel </v-btn>
      <v-btn color="green" text> Approve all </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: "approveAllDialog",
  props: {
    timecard: Object,
  },
  data: () => ({
    payWithCash: false,
  }),
  methods: {
    approveTimecard() {
      this.$store.dispatch("approveTimecard", {
        id: this.timecard.id,
        approved: true,
        paypal: !this.payWithCash,
      });
    },
  },
};
</script>