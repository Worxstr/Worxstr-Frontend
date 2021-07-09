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
      v-toolbar-title Complete payment
  
    v-divider

    v-card-text.mt-5
      p.text-subtitle-1
        | {{ timecards.length }}
        | contractor{{ timecards.length == 1 ? '' : 's' }} will be paid ${{
        | wagePayment
        | }}
        | in total. A ${{ feesPayment }} fee will be applied.
        br
        |
        | Your total is ${{ totalPayment }}.
    
      paypal-buttons(
        :createOrder="createOrder",
        :onApprove="onApprove",
        v-if="renderPaypal && !transaction"
      )
      div(v-if="transaction")
        p.text-subtitle-2.green--text.d-flex.align-center.my-2
          | Payment successful. Your PayPal order ID is:
        p.green--text.font-weight-black.mx-1
          | {{ transaction.orderID }}

    v-spacer

    v-card-actions
      v-spacer
      v-btn(text, @click="closeDialog") Cancel
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
  data: () => ({
    renderPaypal: false,
  }),
  mounted() {
    // Wait to render paypal buttons so the DOM container is not removed
    setTimeout(() => this.renderPaypal = true, 1)
  },
  computed: {
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
    createOrder(data, actions) {
      console.log({ data, actions });
      console.log(this.totalPayment)

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
    async onApprove(data, actions) {
      this.transaction = data;
      this.closeDialog();
      this.$store.dispatch("approvePayment", {
        timecards: this.timecards,
        transaction: data,
      });
      return actions.order.capture();
    },
  },
};
</script>