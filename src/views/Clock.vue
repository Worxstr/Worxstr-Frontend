<template lang="pug">
  v-container.clock.d-flex.flex-column.flex-md-row-reverse.justify-md-center.align-md-start
    .mx-15.d-flex.align-center.align-md-start.flex-column.justify-center(
      style='margin-top: 20vh; margin-bottom: 15vh; top: 60px; position: sticky'
    )
      div(v-if='nextShift && nextShift.time_begin && nextShift.time_end')
        h6.text-h6
          | Your shift
          | {{ nextShift.shiftActive ? "ends" : "begins" }}
          | at
          | {{ nextShift.site_location }}
          | at

        h3.text-h3.py-2.font-weight-bold
          | {{
          | (nextShift.shiftActive ? nextShift.time_end : nextShift.time_begin)
          | .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          | .replace(/^0(?:0:0?)?/, "")
          | }}

        p.text-subtitle-2.text-center.text-md-left

          countdown(:end-time='\
          nextShift.shiftActive ? nextShift.time_end : nextShift.time_begin\
          ')
            template(v-slot:process='props')
              span
                | That's in &nbsp;
                span(v-if='props.timeObj.d != 0')
                  | {{ props.timeObj.d }} days,
                span(v-if='props.timeObj.h != 0')
                  | {{ props.timeObj.h }} hours,
                span(v-if='props.timeObj.m != 0')
                  | {{ props.timeObj.m }} minutes,
                |                 {{ props.timeObj.s }} seconds.
            template(v-slot:finish)
              span That's right now!

        .d-flex.flex-row
          v-dialog(
            v-model='verifyDialog.opened'
            :fullscreen='$vuetify.breakpoint.smAndDown'
            max-width='500'
          )
            v-card.sign-in.fill-height
              form(@submit.prevent='submitCode(verifyDialog.code)')
                v-card-title Scan your clock in QR code
                div
                  qrcode-stream(@decode='submitCode' @init='qrInit')
                v-card-text
                  v-text-field(label='Or enter the clock in code' v-model='verifyDialog.code' hide-details)
                v-card-actions
                  v-spacer
                  v-btn(text @click='verifyDialog.opened = false') Cancel
                  v-btn(text color='primary' type='submit') Submit

              v-fade-transition
                v-overlay(absolute opacity='0.2' v-if='verifyDialog.cameraLoading')
                  v-progress-circular(indeterminate)

          v-expand-x-transition
            .py-2(v-if='!onBreak')
              v-btn.pa-6.mr-2(
                raised
                :color="clocked ? 'pink' : 'green'"
                @click='clocked ? clockOut() : openVerifyDialog()'
                width='130px'
                dark
                style='transition: background-color 0.3s'
              )
                | Clock {{ clocked ? "out" : "in" }}

          v-expand-x-transition
            .py-2(v-if='clocked')
              v-btn.pa-6(
                raised
                :color="onBreak ? 'green' : 'amber'"
                @click='toggleBreak(!!onBreak)'
                width='130px'
                dark
                style='transition: background-color 0.3s')
                | {{ onBreak ? "End" : "Start" }} break

      div(v-else)
        h6.text-h6 You have no upcoming shifts

    v-card.align-self-center(width='100%' max-width='500px' rounded='lg')

      v-card-title.ma-1 Your history

      div(v-if='clockHistory.length')
        v-timeline(align-top dense)
          transition-group(name='scroll-y-transition')
            div(v-for='event in clockHistory' :key='event.id || event.label')

              v-timeline-item(v-if='event.label' hide-dot)
                span {{ event.label | date("dddd, MMM D") }}

              v-timeline-item(v-else :color='eventColor(event.action)' small)
                v-row.pt-1
                  v-col(cols='3')
                    strong {{ event.time | time }}

                  v-col
                    strong {{ eventType(event.action) }}
                    .caption {{ event.description }}

        v-card-actions.d-flex.justify-center
          v-btn(text color='primary' @click='loadClockHistory')
            v-icon(right dark)  mdi-arrow-down 
            |             Load previous week

      v-card-text(v-else)
        | No history yet
</template>

<script>
import Vue from "vue";
import vueAwesomeCountdown from "vue-awesome-countdown";
import { QrcodeStream } from "vue-qrcode-reader";
import { mapState, mapGetters, mapActions } from "vuex";

Vue.use(vueAwesomeCountdown, "vac");

export default {
  name: "clock",
  data: () => ({
    verifyDialog: {
      opened: false,
      cameraLoading: false,
      code: "",
    },
  }),
  components: {
    QrcodeStream,
  },
  mounted() {
    if (!this.clockHistory.length) this.loadClockHistory();
    this.$store.dispatch("loadNextShift");
  },
  computed: {
    ...mapState(["clock"]),
    ...mapGetters(["clockHistory", "nextShift"]),
    clocked() {
      const lastClockEvent = this.clockHistory.find(
        (event) => event.action == 1 || event.action == 2
      );
      return lastClockEvent ? lastClockEvent.action == 1 : null;
    },
    onBreak() {
      const lastBreakEvent = this.clockHistory.find(
        (event) => event.action == 3 || event.action == 4
      );
      return lastBreakEvent ? lastBreakEvent.action == 3 : null;
    },
  },
  methods: {
    ...mapActions(["clockIn", "clockOut", "toggleBreak"]),
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
