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
        <span v-if="!payWithCash">
				{{ timecard.first_name }} {{ timecard.last_name }} will be paid ${{
          timecard.total_payment
        }}
        for this shift.
				</span>

        <v-checkbox label="Make a cash payment" v-model="payWithCash" />

				<span class="text-subtitle-2 red--text d-flex align-center" v-if="payWithCash">
					<v-icon color="red" class="mr-2">
						mdi-alert-circle-outline
						</v-icon>
					Be sure to pay
					{{timecard.first_name}} {{timecard.last_name}}
					<span class="font-weight-black mx-1">${{timecard.total_payment}}</span>
					in cash.
				</span>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="closeDialog"> Cancel </v-btn>
        <v-btn color="green" text @click="approveTimecard">
					{{ payWithCash ? 'Confirm cash payment' : 'Approve'}}
				</v-btn>
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
    async approveTimecard() {
      await this.$store.dispatch("approveTimecards", [
        {
          id: this.timecard.id,
          approved: true,
          paypal: !this.payWithCash,
        },
			]);
			this.closeDialog()
    },
  },
};
</script>