<template>
  <v-dialog
    v-model="opened"
    :fullscreen="$vuetify.breakpoint.smAndDown"
    max-width="500"
    persistent
  >
    <v-card>
      <v-toolbar flat>
        <v-btn icon @click="closeDialog">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title>Complete payment</v-toolbar-title>
      </v-toolbar>

      <v-card-text>
        <p class="text-subtitle-1">
          {{ timecards.length }}
          employee{{ timecards.length == 1 ? "" : "s" }} will be paid ${{
            totalPayment
          }}
          in total.
        </p>

        <paypal-buttons
          :createOrder="createOrder"
          :onApprove="onApprove"
					v-if="!transaction"
        ></paypal-buttons>

				<div v-else>
					<p class="text-subtitle-2 green--text d-flex align-center my-2">
						Payment successful.
            Your PayPal order ID is:
          </p>
					<p class="green--text font-weight-black mx-1">{{ transaction.orderID }}</p>
				</div>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn text @click="closeDialog">Cancel</v-btn>
        <v-btn text color="primary" :disabled="!transaction">Complete payment</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import Vue from "vue";
// eslint-disable-next-line no-undef
const PayPalButton = paypal.Buttons.driver("vue", Vue);

export default {
  name: "paymentDialog",
  components: {
    "paypal-buttons": PayPalButton,
  },
  props: {
    opened: Boolean,
		timecards: Array,
		transaction: null,
  },
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
    createOrder(data, actions) {
			console.log({data, actions})
			
      return actions.order.create({
        // eslint-disable-next-line @typescript-eslint/camelcase
        purchase_units: [
          {
            amount: {
              value: this.totalPayment,
            },
          },
        ],
      });
    },
    onApprove(data, actions) {
			
			this.transaction = data
			
      return actions.order.capture();
    },
  },
};
</script>