<template>
  <v-container class="approvals">
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
      <v-expansion-panel v-for="timecard in timecards" :key="timecard.id">
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

    <v-toolbar flat color="transparent" class="mt-5">
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
        v-for="(timecard, index) in timecards"
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

          <v-card-actions>
            <v-spacer />
            <v-btn text @click="openEditDialog(index)">Edit</v-btn>
            <v-btn text color="green">Approve</v-btn
            >
            <v-btn text color="red">Deny</v-btn>
          </v-card-actions>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>

    <v-dialog
      v-model="editDialog"
      :fullscreen="$vuetify.breakpoint.smAndDown"
      max-width="500"
    >
      <v-card>
        <v-toolbar flat>
          <v-btn icon @click="editDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>
            Edit timecard for
            {{ timecards[selectedTimecard].first_name }}
            {{ timecards[selectedTimecard].last_name }}
          </v-toolbar-title>
        </v-toolbar>

        <v-card-text>
          <v-text-field
            dense
            outlined
            label="Time in"
            type="time"
            v-model="timecards[selectedTimecard].time_in"
          />

          <div class="mb-5" v-for="(breakItem, index) in breaks" :key="index">
            <v-row class="align-center">
              <v-col>
                <v-text-field
                  dense
                  outlined
                  hide-details
                  :label="`Break ${index + 1} start`"
                  type="time"
                  v-model="timecards[selectedTimecard].time_in"
                />
              </v-col>
              <v-col>
                <v-text-field
                  dense
                  outlined
                  hide-details
                  :label="`Break ${index + 1} end`"
                  type="time"
                  v-model="timecards[selectedTimecard].time_out"
                />
              </v-col>
              <v-btn
                icon
                v-if="breaks.length > 1"
                @click="breaks.splice(index, 1)"
              >
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </v-row>
          </div>
          <v-row class="mb-5">
            <v-spacer />
            <v-btn text dense color="primary" @click="breaks.push({})">
              <v-icon>mdi-plus</v-icon>
              Add break
            </v-btn>
          </v-row>

          <v-text-field
            dense
            outlined
            label="Time out"
            type="time"
            v-model="timecards[selectedTimecard].time_out"
          />
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn text @click="editDialog = false">Cancel</v-btn>
          <v-btn text color="primary">Save</v-btn>
        </v-card-actions>
      </v-card>
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
    openEditDialog(timecardIndex) {
      this.selectedTimecard = timecardIndex;
      this.editDialog = true;
    },
  },
};
</script>