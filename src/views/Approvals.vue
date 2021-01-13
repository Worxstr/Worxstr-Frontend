<template>
  <v-container class="approvals">
    <h4 class="text-h4 font-weight-bold mb-2">Approvals</h4>

    <v-card
      v-for="(timecard, index) in timecards"
      :key="timecard.id"
      class="my-4"
    >
      <v-card-title>
        {{ timecard.first_name }} {{ timecard.last_name }}
      </v-card-title>

      <v-card-text>
        <p>
          {{ timecard.time_in | time }}
          -
          {{ timecard.time_out | time }}
        </p>

        <p>
          Worked for
          {{ timeDiff(timecard.time_in, timecard.time_out) }}
        </p>

        <p>{{ timecard.time_break }} minute break</p>

        <p>${{ timecard.total_payment }} earned</p>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn text>Edit</v-btn>
        <v-btn text color="green" @click="openConfirmDialog(index)"
          >Approve</v-btn
        >
        <v-btn text color="red">Deny</v-btn>
      </v-card-actions>
    </v-card>

    <v-dialog
      v-model="confirmDialog"
      :fullscreen="$vuetify.breakpoint.smAndDown"
      max-width="500"
    >
      <v-card>
        <v-toolbar flat>
          <v-btn icon @click="confirmDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>Confirm payment</v-toolbar-title>
        </v-toolbar>

        <v-card-text>
          <p>
            {{ timecards[selectedTimecard].first_name }}
            {{ timecards[selectedTimecard].last_name }}
          </p>
          <p>
            {{ timecards[selectedTimecard].time_in | time }}
            -
            {{ timecards[selectedTimecard].time_out | time }}
          </p>

          <p>
            Worked for
            {{
              timeDiff(
                timecards[selectedTimecard].time_in,
                timecards[selectedTimecard].time_out
              )
            }}
          </p>

          <p>{{ timecards[selectedTimecard].time_break }} minute break</p>

          <p>${{ timecards[selectedTimecard].total_payment }} earned</p>

          <v-checkbox v-model="payWithCash" label="Pay with cash" />

          <paypal-buttons v-if="!payWithCash" [props]="{createOrder: createOrder, onApprove: onApprove}"/>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn text @click="confirmDialog = false">Cancel</v-btn>
          <v-btn text color="primary">Send payment</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { mapState, mapGetters, mapActions } from "vuex";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import Vue from 'vue'

dayjs.extend(duration);

// eslint-disable-next-line no-undef
const PayPalButton  = paypal.Buttons.driver("vue", Vue);

export default {
  name: "approvals",
  async mounted() {
    this.$store.dispatch("loadApprovals");
  },
  components: {
    "paypal-buttons": PayPalButton,
  },
  data: () => ({
    selectedTimecard: 0,
    confirmDialog: false,
    payWithCash: false,
  }),
  computed: {
    ...mapState(["authenticatedUser"]),
    ...mapGetters(["timecards"]),
    createOrder: function (data, actions) {
      return actions.order.create({
        // eslint-disable-next-line @typescript-eslint/camelcase
        purchase_units: [
          {
            amount: {
              value: "0.01",
            },
          },
        ],
      });
    },
    onAuthorize: function (data, actions) {
      return actions.order.capture();
    },
  },
  methods: {
    ...mapActions(["signOut"]),
    timeDiff(timeIn, timeOut) {
      timeIn = dayjs(timeIn);
      timeOut = dayjs(timeOut);

      const duration = dayjs.duration(timeOut.diff(timeIn)),
        hours = duration.format("H"),
        minutes = duration.format("m");

      return `${hours} hour${hours == 1 ? "" : "s"}, ${minutes} minute${
        minutes == 1 ? "" : "s"
      }`;
    },
    openConfirmDialog(timecardIndex) {
      this.selectedTimecard = timecardIndex;
      this.confirmDialog = true;
    },
  },
};
</script>