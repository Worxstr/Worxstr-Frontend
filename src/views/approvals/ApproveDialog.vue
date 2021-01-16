<template>
  <v-card>
    <v-card-title class="headline"> Approve this timecard? </v-card-title>
    <v-card-text>
			{{ timecard.first_name }} {{ timecard.last_name }}
			will be paid
			${{ timecard.total_payment }}
      for this shift.

			<v-checkbox label="Make this a cash payment" v-model="payWithCash"/>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn text> Cancel </v-btn>
      <v-btn color="green" text> Approve </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: "approveDialog",
  props: {
		timecard: Object,
	},
	data: () => ({
		payWithCash: false,
	}),
	methods: {
		approveTimecard() {
			this.$store.dispatch('approveTimecard', {
				id: this.timecard.id,
				approved: true,
				paypal: !this.payWithCash
			})
		}
	}
};
</script>