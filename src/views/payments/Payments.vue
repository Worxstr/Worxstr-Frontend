<template lang="pug">
v-container(
  v-if="loading && !(approvedTimecards.length || unapprovedTimecards.length)"
)
  v-skeleton-loader.my-4(type="heading")
  v-skeleton-loader(
    type="list-item, list-item, list-item, list-item, list-item, list-item, list-item"
  )

  v-skeleton-loader.mt-8.mb-4(type="heading")
  v-skeleton-loader(
    type="list-item, list-item, list-item, list-item, list-item, list-item, list-item"
  )

div(v-else)
  v-container.d-flex.flex-column.justify-center(
    fill-height,
    v-if="!approvedTimecards.length && !unapprovedTimecards.length"
  )
    v-icon.text-h2.ma-5 mdi-clock-check-outline
    p.text-body-1 No timecard approvals left!

  v-container.approvals(v-else)
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

    .mb-5(v-if="approvedTimecards.length")
      v-toolbar.no-padding(flat, color="transparent")
        v-toolbar-title.text-h6
          span Pending
          v-chip.mx-3.pa-2.font-weight-black(small) {{ approvedTimecards.length }}
        v-spacer
        v-btn(text, @click="openPaymentDialog(approvedTimecards)")
          v-icon mdi-currency-usd
          |
          | Complete payments

      v-expansion-panels
        v-expansion-panel(
          v-for="timecard in approvedTimecards",
          :key="timecard.id"
        )
          v-expansion-panel-header.d-flex
            span.text-subtitle-1.flex-grow-0
              | {{ timecard | fullName }}
            v-spacer
            span.flex-grow-0.px-2.font-weight-bold ${{ timecard.total_payment }}
            span.flex-grow-0.px-2(
              v-if="timecard.time_clocks && timecard.time_clocks.length"
            )
              | {{ timecard.time_clocks[0].time | time }}
              | -
              | {{ timecard.time_clocks[timecard.time_clocks.length - 1].time | time }}

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
      v-toolbar.no-padding(flat, color="transparent")
        v-toolbar-title.text-h6
          span Unapproved
          v-chip.mx-3.pa-2.font-weight-black(small) {{ unapprovedTimecards.length }}

        v-spacer
        v-btn(
          text,
          color="green",
          @click="openApproveDialog(unapprovedTimecards)"
        )
          v-icon mdi-check
          |
          | Approve all

      v-expansion-panels
        v-expansion-panel(
          v-for="timecard in unapprovedTimecards",
          :key="timecard.id"
        )
          v-expansion-panel-header
            span.text-subtitle-1.flex-grow-0 {{ timecard | fullName }}
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
  metaInfo: {
    title: 'Approvals'
  },
  async mounted() {
    this.loading = true;
    await this.$store.dispatch("loadApprovals");
    this.loading = false;
  },
  components: {
    EditTimecardDialog,
    ApproveDialog,
    PaymentDialog,
    DenyDialog,
  },
  data: () => ({
    loading: false,
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

<style lang="scss">
.no-padding .v-toolbar__content {
  padding: 0 !important;
}
</style>