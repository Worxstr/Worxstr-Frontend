<template>
  <v-container class="approvals">
    <div v-if="approvedTimecards.length" class="mb-5">
      <v-toolbar flat color="transparent">
        <v-toolbar-title class="text-h6">Approved timecards</v-toolbar-title>
        <v-spacer />
        <v-toolbar-actions>
          <v-btn text @click="openConfirmDialog(1)">
            <v-icon>mdi-currency-usd</v-icon>
            Complete payments
          </v-btn>
        </v-toolbar-actions>
      </v-toolbar>

      <v-expansion-panels popout>
        <v-expansion-panel
          v-for="timecard in approvedTimecards"
          :key="timecard.id"
        >
          <v-expansion-panel-header>
            <span class="text-subtitle-1">
              {{ timecard.first_name }} {{ timecard.last_name }}
            </span>
            <span>
              {{ timecard.time_in | time }}
              -
              {{ timecard.time_out | time }}
            </span>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-card-text class="text-body-1">
              <p>
                Worked for
                {{ timeDiff(timecard.time_in, timecard.time_out) }}
              </p>

              <p>{{ timecard.time_break }} minute break</p>

              <p>${{ timecard.total_payment }} earned</p>
            </v-card-text>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>

    <div v-if="unapprovedTimecards.length" class="mb-5">
      <v-toolbar flat color="transparent">
        <v-toolbar-title class="text-h6">Unapproved timecards</v-toolbar-title>
        <v-spacer />
        <v-toolbar-actions>
          <v-btn text color="green">
            <v-icon>mdi-check</v-icon>
            Approve all
          </v-btn>
        </v-toolbar-actions>
      </v-toolbar>

      <v-expansion-panels popout>
        <v-expansion-panel
          v-for="timecard in unapprovedTimecards"
          :key="timecard.id"
        >
          <v-expansion-panel-header>
            <span class="text-subtitle-1">
              {{ timecard.id }} {{ timecard.first_name }}
              {{ timecard.last_name }}
            </span>
            <span>
              {{ timecard.time_in | time }}
              -
              {{ timecard.time_out | time }}
            </span>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-card-text class="text-body-1">
              <p>
                Worked for
                {{ timeDiff(timecard.time_in, timecard.time_out) }}
              </p>

              <p>{{ timecard.time_break }} minute break</p>

              <p>${{ timecard.total_payment }} earned</p>
            </v-card-text>

            <v-card-actions>
              <v-spacer />
              <v-btn text @click="openEditDialog(timecard)">Edit</v-btn>
              <v-btn text color="green" @click="approveTimecard(timecard)"
                >Approve</v-btn
              >
              <v-btn text color="red">Deny</v-btn>
            </v-card-actions>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>

    <v-dialog
      v-model="editDialog"
      :fullscreen="$vuetify.breakpoint.smAndDown"
      max-width="500"
    >
      <edit-dialog :timecard="timecards[selectedTimecard]" />
    </v-dialog>

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
          <p class="text-subtitle-1">
            Sending ${{ timecards[selectedTimecard].total_payment }}
            to
            {{ timecards[selectedTimecard].first_name }}
            {{ timecards[selectedTimecard].last_name }}
          </p>

          <v-checkbox v-model="cashPayment" label="Send cash payment" />

          <paypal-buttons
            v-if="!cashPayment"
            [props]="{createOrder: createOrder, onApprove: onApprove}"
          />
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
import Vue from "vue";
import EditDialog from "./EditDialog";

dayjs.extend(duration);

// eslint-disable-next-line no-undef
const PayPalButton = paypal.Buttons.driver("vue", Vue);

export default {
  name: "approvals",
  async mounted() {
    this.$store.dispatch("loadApprovals");
  },
  components: {
    "paypal-buttons": PayPalButton,
    EditDialog,
  },
  data: () => ({
    selectedTimecard: 0,
    editDialog: false,
    confirmDialog: false,
    cashPayment: false,
    breaks: [{}],
  }),
  computed: {
    ...mapState(["authenticatedUser"]),
    ...mapGetters(["timecards"]),
    approvedTimecards: function () {
      return this.timecards.filter((timecard) => timecard.approved);
    },
    unapprovedTimecards: function () {
      return this.timecards.filter((timecard) => !timecard.approved);
    },
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
    openConfirmDialog() {
      this.confirmDialog = true;
    },
    openEditDialog(timecard) {
      this.selectedTimecard = this.timecards
        .map((t) => t.id)
        .indexOf(timecard.id);
      this.editDialog = true;
    },
    approveTimecard(timecard) {
      this.$store.dispatch("approveTimecard", {});
    },
  },
};
</script>