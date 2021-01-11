<template>
  <v-container
    class="clock d-flex flex-column flex-md-row-reverse justify-md-center align-md-start"
  >
    <div
      class="mx-15 d-flex align-center align-md-start flex-column justify-center"
      style="margin-top: 20vh; margin-bottom: 15vh; top: 60px; position: sticky"
    >
      <h6 class="text-h6">Your shift ends at</h6>
      <h3 class="text-h3 py-2 font-weight-bold">
        {{
          nextEvent.timestamp
            .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            .replace(/^0(?:0:0?)?/, "")
        }}
      </h3>
      <p class="text-subtitle-2 text-center text-md-left">
        <countdown :end-time="nextEvent.timestamp">
          <template v-slot:process="props">
            <span>
              That's in
              <span v-if="props.timeObj.d != 0"
                >{{ props.timeObj.d }} days,
              </span>
              <span v-if="props.timeObj.h != 0"
                >{{ props.timeObj.h }} hours,
              </span>
              <span v-if="props.timeObj.m != 0"
                >{{ props.timeObj.m }} minutes,
              </span>
              {{ props.timeObj.s }} seconds.
            </span>
          </template>
          <template v-slot:finish>
            <span>That's right now!</span>
          </template>
        </countdown>
      </p>

      <div class="d-flex flex-row">
        <v-dialog
          v-model="verifyDialog.opened"
          :fullscreen="$vuetify.breakpoint.smAndDown"
          max-width="500"
        >
          <v-card class="sign-in fill-height">
            <form @submit.prevent="submitCode(verifyDialog.code)">
              <v-card-title>Scan your clock in QR code</v-card-title>

              <div>
                <qrcode-stream
                  @decode="submitCode"
                  @init="qrInit"
                ></qrcode-stream>
              </div>

              <v-card-text>
                <v-text-field
                  label="Or enter the clock in code"
                  v-model="verifyDialog.code"
                  hide-details
                />
              </v-card-text>

              <v-card-actions>
                <v-spacer />
                <v-btn text @click="verifyDialog.opened = false">Cancel</v-btn>
                <v-btn text color="primary" type="submit">Submit</v-btn>
              </v-card-actions>
            </form>

            <v-fade-transition>
              <v-overlay
                absolute
                opacity="0.2"
                v-if="verifyDialog.cameraLoading"
              >
                <v-progress-circular indeterminate />
              </v-overlay>
            </v-fade-transition>
          </v-card>
        </v-dialog>

        <v-expand-x-transition>
          <div v-if="!this.break" class="py-2">
            <v-btn
              raised
              :color="clocked ? 'pink' : 'green'"
              @click="clocked ? clockOut() : openVerifyDialog()"
              class="pa-6 mr-2"
              width="130px"
              dark
              style="transition: background-color 0.3s"
            >
              Clock {{ clocked ? "out" : "in" }}
            </v-btn>
          </div>
        </v-expand-x-transition>

        <v-expand-x-transition>
          <div v-if="clocked" class="py-2">
            <v-btn
              raised
              :color="this.break ? 'green' : 'amber'"
              @click="toggleBreak()"
              class="pa-6"
              width="130px"
              dark
              style="transition: background-color 0.3s"
            >
              {{ this.break ? "End" : "Start" }} break
            </v-btn>
          </div>
        </v-expand-x-transition>
      </div>
    </div>

    <v-card
      class="align-self-center"
      width="100%"
      max-width="500px"
      rounded="lg"
    >
      <v-card-title class="ma-1">Your history</v-card-title>

      <v-timeline align-top dense>
        <transition-group name="scroll-y-transition">
          <div v-for="event in clockHistory" :key="event.id || event.label">
            <v-timeline-item v-if="event.label" hide-dot>
              <span>{{ event.label | date("dddd, MMM D") }}</span>
            </v-timeline-item>

            <v-timeline-item v-else :color="eventColor(event.action)" small>
              <v-row class="pt-1">
                <v-col cols="3">
                  <strong>{{ event.time | time }}</strong>
                </v-col>
                <v-col>
                  <strong>{{ eventType(event.action) }}</strong>
                  <div class="caption">{{ event.description }}</div>
                </v-col>
              </v-row>
            </v-timeline-item>
          </div>
        </transition-group>
      </v-timeline>

      <v-card-actions class="d-flex justify-center">
        <v-btn text color="primary" @click="loadClockHistory">
          <v-icon right dark> mdi-arrow-down </v-icon>
          Load previous week
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script>
import Vue from "vue";
import vueAwesomeCountdown from "vue-awesome-countdown";
import { QrcodeStream } from "vue-qrcode-reader";
import { mapState, mapGetters, mapActions } from "vuex";

Vue.use(vueAwesomeCountdown, "vac");

const shiftBegin = new Date();
// shiftBegin.setDate(shiftBegin.getDate() + 1) // Add a day
shiftBegin.setHours(9);
shiftBegin.setMinutes(0);
shiftBegin.setSeconds(0);

const shiftEnd = shiftBegin;
shiftEnd.setHours(17);

export default {
  name: "Clock",
  data: () => ({
    verifyDialog: {
      opened: false,
      cameraLoading: false,
      code: "",
    },
    nextEvent: {
      timestamp: shiftEnd,
      type: "shift_end",
    },
  }),
  components: {
    QrcodeStream,
  },
  mounted() {
    if (!this.clockHistory.length) this.loadClockHistory();
  },
  computed: {
    ...mapState(["clock"]),
    ...mapGetters(["clockHistory"]),
    clocked() {
      const lastClockEvent = this.clockHistory.find(
        (event) => event.action == 1 || event.action == 2
      );
      return lastClockEvent ? lastClockEvent.event == 1 : null;
    },
    break() {
      const lastBreakEvent = this.clockHistory.find(
        (event) => event.action == 3 || event.action == 4
      );
      return lastBreakEvent ? lastBreakEvent.event == 3 : null;
    },
  },
  methods: {
    ...mapActions(["clockIn", "clockOut"]),
    openVerifyDialog() {
      this.verifyDialog.opened = true;
    },
    async qrInit(promise) {
      this.verifyDialog.cameraLoading = true;
      try {
        /* const { capabilities } = */ await promise;
      } catch (error) {
        // TODO: Handle these errors with toast
        if (error.name === "NotAllowedError") {
          // user denied camera access permisson
        } else if (error.name === "NotFoundError") {
          // no suitable camera device installed
        } else if (error.name === "NotSupportedError") {
          // page is not served over HTTPS (or localhost)
        } else if (error.name === "NotReadableError") {
          // maybe camera is already in use
        } else if (error.name === "OverconstrainedError") {
          // did you requested the front camera although there is none?
        } else if (error.name === "StreamApiNotSupportedError") {
          // browser seems to be lacking features
        }
      } finally {
        this.verifyDialog.cameraLoading = false;
      }
    },
    async submitCode(code) {
      // TODO: Handle incorrect code
      await this.$store.dispatch("clockIn", { code });
      this.verifyDialog.opened = false;
      // TODO: Stop camera on close
    },
    eventType(eventEnum) {
      switch (eventEnum) {
        case 1:
          return "Clocked in";
        case 2:
          return "Clocked out";
        case 3:
          return "Started break";
        case 4:
          return "Ended break";
        default:
          return "Unknown event";
      }
    },
    eventColor(eventEnum) {
      switch (eventEnum) {
        case 1:
          return "green";
        case 2:
          return "pink";
        case 3:
          return "amber";
        case 4:
          return "green";
        default:
          return "blue";
      }
    },
    loadClockHistory() {
      this.$store.dispatch("loadClockHistory");
    },
  },
};
</script>
