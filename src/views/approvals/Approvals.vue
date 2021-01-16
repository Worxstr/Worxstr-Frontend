<template>
  <v-container class="approvals">
    <div v-if="approvedTimecards.length" class="mb-5">
      <v-toolbar flat color="transparent">
        <v-toolbar-title class="text-h6">Approved timecards</v-toolbar-title>
        <v-spacer />
        <v-btn text @click="paymentDialog = true">
          <v-icon>mdi-currency-usd</v-icon>
          Complete payments
        </v-btn>
      </v-toolbar>

      <v-expansion-panels popout>
        <v-expansion-panel
          v-for="timecard in approvedTimecards"
          :key="timecard.id"
        >
          <v-expansion-panel-header
            v-if="timecard.time_clocks && timecard.time_clocks.length"
          >
            <span class="text-subtitle-1">
              {{ timecard.id }}
              {{ timecard.first_name }} {{ timecard.last_name }}
            </span>
            <span>
              {{ timecard.time_clocks[0].time | time }}
              -
              {{
                timecard.time_clocks[timecard.time_clocks.length - 1].time
                  | time
              }}
            </span>
          </v-expansion-panel-header>
          <v-expansion-panel-content
            v-if="timecard.time_clocks && timecard.time_clocks.length"
          >
            <v-card-text class="text-body-1">
              <p>
                Worked for
                {{
                  timeDiff(
                    timecard.time_clocks[0].time,
                    timecard.time_clocks[timecard.time_clocks.length - 1].time
                  )
                }}
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
        <v-btn text color="green" @click="approveAllDialog = true">
          <v-icon>mdi-check</v-icon>
          Approve all with paypal
        </v-btn>
      </v-toolbar>

      <v-expansion-panels popout>
        <v-expansion-panel
          v-for="timecard in unapprovedTimecards"
          :key="timecard.id"
        >
          <v-expansion-panel-header
            v-if="timecard.time_clocks && timecard.time_clocks.length"
          >
            <span class="text-subtitle-1">
              {{ timecard.id }}
              {{ timecard.first_name }}
              {{ timecard.last_name }}
              {{ timecard.approved }}
            </span>
            <span v-if="timecard.time_clocks.length">
              {{ timecard.time_clocks[0].time | time }}
              -
              {{
                timecard.time_clocks[timecard.time_clocks.length - 1].time
                  | time
              }}
            </span>
          </v-expansion-panel-header>
          <v-expansion-panel-content
            v-if="timecard.time_clocks && timecard.time_clocks.length"
          >
            <v-card-text class="text-body-1">
              <p v-if="timecard.time_clocks.length">
                Worked for
                {{
                  timeDiff(
                    timecard.time_clocks[0].time,
                    timecard.time_clocks[timecard.time_clocks.length - 1].time
                  )
                }}
              </p>

              <p>{{ timecard.time_break }} minute break</p>

              <p>${{ timecard.total_payment }} earned</p>
            </v-card-text>

            <v-card-actions>
              <v-spacer />
              <v-btn text @click="openEditDialog(timecard)">Edit</v-btn>
              <v-btn text color="green" @click="openApproveDialog(timecard)"
                >Approve</v-btn
              >
              <v-btn text color="red">Deny</v-btn>
            </v-card-actions>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>

    <edit-dialog
      :opened.sync="editDialog"
      :timecard="unapprovedTimecards[selectedTimecard]"
    />

    <approve-dialog
      :opened.sync="approveDialog"
      :timecard="unapprovedTimecards[selectedTimecard]"
    />

    <approve-all-dialog :opened.sync="approveAllDialog" />

    <payment-dialog :opened.sync="paymentDialog"/>
  </v-container>
</template>

<script>
import { mapState, mapGetters, mapActions } from "vuex";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

import EditDialog from "./EditDialog";
import ApproveDialog from "./ApproveDialog";
import ApproveAllDialog from "./ApproveAllDialog";
import PaymentDialog from './PaymentDialog.vue';

dayjs.extend(duration);

export default {
  name: "approvals",
  async mounted() {
    this.$store.dispatch("loadApprovals");
  },
  components: {
    EditDialog,
    ApproveDialog,
    ApproveAllDialog,
    PaymentDialog,
  },
  data: () => ({
    selectedTimecard: 0,
    editDialog: false,
    approveDialog: false,
    approveAllDialog: false,
    confirmDialog: false,
    paymentDialog: false,
    breaks: [{}],
  }),
  computed: {
    ...mapState(["authenticatedUser"]),
    ...mapGetters(["approvedTimecards", "unapprovedTimecards"]),
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
    openEditDialog(timecard) {
      this.selectedTimecard = this.unapprovedTimecards
        .map((t) => t.id)
        .indexOf(timecard.id);
      this.editDialog = true;
    },
    openApproveDialog(timecard) {
      this.selectedTimecard = this.unapprovedTimecards
        .map((t) => t.id)
        .indexOf(timecard.id);
      this.approveDialog = true;
    },
  },
};
</script>