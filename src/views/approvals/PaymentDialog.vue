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
        <v-toolbar-title>Confirm payment</v-toolbar-title>
      </v-toolbar>

      <v-card-text>
        <!-- <p class="text-subtitle-1">
          Send payment
          <span v-if="approvedTimecards.length != 1">s</span>
          to
          <span
            v-for="(timecard, index) in approvedTimecards"
            :key="timecard.id"
          >
            {{ timecard.first_name }} {{ timecard.last_name }}
            <span v-if="index != approvedTimecards.length - 1">, </span>
          </span>
        </p> -->

        <paypal-buttons
          v-if="!cashPayment"
          [props]="{createOrder: createOrder, onApprove: onApprove}"
        />
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn text @click="closeDialog">Cancel</v-btn>
        <v-btn text color="primary">Send payment</v-btn>
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
  },
  methods: {
    closeDialog() {
      this.$emit("update:opened", false);
    },
  },
};
</script>