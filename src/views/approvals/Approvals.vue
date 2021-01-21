<template lang="pug">
v-container.approvals
  .mb-5(v-if="approvedTimecards.length")
    v-toolbar(flat, color="transparent")
      v-toolbar-title.text-h6 Pending payments ({{ approvedTimecards.length }})
      v-spacer
      v-btn(text, @click="openPaymentDialog(approvedTimecards)")
        v-icon mdi-currency-usd
        |
        | Complete payments

    v-expansion-panels(popout)
      v-expansion-panel(
        v-for="timecard in approvedTimecards",
        :key="timecard.id"
      )
        v-expansion-panel-header.d-flex
          span.text-subtitle-1.flex-grow-0
            | {{ timecard.first_name }} {{ timecard.last_name }}
          v-spacer
          span.flex-grow-0.px-2.font-weight-bold ${{ timecard.total_payment }}
          span.flex-grow-0.px-2(
            v-if="timecard.time_clocks && timecard.time_clocks.length"
          )
            | {{ timecard.time_clocks[0].time | time }}
            | -
            | {{
            | timecard.time_clocks[timecard.time_clocks.length - 1].time
            | | time
            | }}

        v-expansion-panel-content
          v-card-text.text-body-1
            p(v-if="timecard.time_clocks && timecard.time_clocks.length")
              | Worked for
              | {{
              | timeDiff(
              | timecard.time_clocks[0].time,
              | timecard.time_clocks[timecard.time_clocks.length - 1].time
              | )
              | }}
            p {{ timecard.time_break }} minute break
            p ${{ timecard.total_payment }} earned

  .mb-5(v-if="unapprovedTimecards.length")
    v-toolbar(flat, color="transparent")
      v-toolbar-title.text-h6
        | Unapproved timecards ({{
        | unapprovedTimecards.length
        | }})

      v-spacer
      v-btn(
        text,
        color="green",
        @click="openApproveDialog(unapprovedTimecards)"
      )
        v-icon mdi-check
        |
        | Approve all

    v-expansion-panels(popout)
      v-expansion-panel(
        v-for="timecard in unapprovedTimecards",
        :key="timecard.id"
      )
        v-expansion-panel-header
          span.text-subtitle-1.flex-grow-0
            | {{ timecard.first_name }}
            | {{ timecard.last_name }}
          v-spacer
          span.flex-grow-0.px-2.font-weight-bold ${{ timecard.total_payment }}
          span.flex-grow-0.px-2(
            v-if="timecard.time_clocks && timecard.time_clocks.length"
          )
            | {{ timecard.time_clocks[0].time | time }}
            | -
            | {{
            | timecard.time_clocks[timecard.time_clocks.length - 1].time
            | | time
            | }}

        v-expansion-panel-content
          v-card-text.text-body-1
            p(v-if="timecard.time_clocks && timecard.time_clocks.length")
              | Worked for
              | {{
              | timeDiff(
              | timecard.time_clocks[0].time,
              | timecard.time_clocks[timecard.time_clocks.length - 1].time
              | )
              | }}
            p {{ timecard.time_break }} minute break
            p ${{ timecard.total_payment }} earned

          v-card-actions
            v-spacer
            v-btn(text, @click="openEditTimecardDialog(timecard)") Edit
            v-btn(
              text,
              color="green",
              @click="openApproveDialog([timecard])"
            )
              v-icon mdi-check
              |
              | Approve
            v-btn(text, color="red", @click="openDenyDialog(timecard)")
              v-icon mdi-close
              | Deny

  edit-timecard-dialog(
    :opened.sync="editTimecardDialog",
    :timecard="selectedTimecards[0]"
  )
  approve-dialog(
    :opened.sync="approveDialog",
    :timecards="selectedTimecards"
  )
  deny-dialog(:opened.sync="denyDialog", :timecard="selectedTimecards[0]")
  payment-dialog(
    :opened.sync="paymentDialog",
    :timecards="selectedTimecards"
  )
</template>

<script>
import { mapState, mapGetters, mapActions } from "vuex";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

import EditTimecardDialog from "./EditTimecardDialog";
import ApproveDialog from "./ApproveDialog";
import DenyDialog from "./DenyDialog.vue";
import PaymentDialog from "./PaymentDialog.vue";

dayjs.extend(duration);

export default {
  name: "approvals",
  async mounted() {
    this.$store.dispatch("loadApprovals");
  },
  components: {
    EditTimecardDialog,
    ApproveDialog,
    PaymentDialog,
    DenyDialog,
  },
  data: () => ({
    selectedTimecards: [],
    editTimecardDialog: false,
    approveDialog: false,
    denyDialog: false,
    paymentDialog: false,
    breaks: [{}],
  }),
  computed: {
    ...mapState(["authenticatedUser"]),
    ...mapGetters(["approvedTimecards", "unapprovedTimecards"]),
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
    openEditTimecardDialog(timecard) {
      this.selectedTimecards = [timecard];
      this.editTimecardDialog = true;
    },
    openApproveDialog(timecards) {
      this.selectedTimecards = timecards;
      this.approveDialog = true;
    },
    openDenyDialog(timecard) {
      this.selectedTimecards = [timecard];
      this.denyDialog = true;
    },
    openPaymentDialog(timecards) {
      this.selectedTimecards = timecards;
      this.paymentDialog = true;
    },
  },
};
</script>