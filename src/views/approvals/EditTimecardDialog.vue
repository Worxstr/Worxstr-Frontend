<template lang="pug">
v-dialog(
  v-model="opened",
  :fullscreen="$vuetify.breakpoint.smAndDown",
  max-width="500",
  persistent
)
  v-card
    v-form(@submit.prevent="updateTimecard", v-model="form.isValid")
      v-toolbar(flat)
        v-toolbar-title
          | Editing timecard for
          | {{ timecard.first_name }}
          | {{ timecard.last_name }}
          
      v-card-text
        time-input(v-model="form.data.timeIn.time", label="Time in")

        .mb-5(v-for="(breakItem, index) in form.data.breaks", :key="index")
          v-row
            v-col
              time-input(
                required,
                hide-details,
                v-model="breakItem.start.time",
                :label="`Break ${index + 1} start`"
              )
            v-col
              time-input(
                required,
                hide-details,
                v-model="breakItem.end.time",
                :label="`Break ${index + 1} end`"
              )

        time-input(
          required,
          v-model="form.data.timeOut.time",
          label="Time out"
        )
      v-card-actions
        v-spacer
        v-btn(text, @click="closeDialog") Cancel
        v-btn(text, color="primary", @click="updateTimecard") Save

    v-fade-transition
      v-overlay(v-if="loading", absolute, opacity=".2")
        v-progress-circular(indeterminate)
</template>

<script>
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import TimeInput from "@/components/TimeInput.vue";

dayjs.extend(duration);

export default {
  components: { TimeInput },
  name: "approvals",
  data: () => ({
    loading: false,
    form: {
      isValid: false,
      data: {
        timeIn: null,
        timeOut: null,
        breaks: [],
      },
    },
  }),
  props: {
    opened: Boolean,
    timecard: Object,
  },
  watch: {
    timecard: function (newVal, oldVal) {
      this.calculateFormValues();
    },
    opened(newVal, oldVal) {
      if (newVal == true) this.calculateFormValues();
    },
  },
  methods: {
    closeDialog() {
      this.$emit("update:opened", false);
    },

    calculateFormValues() {
      const events = this.timecard.time_clocks;

      this.form.data.timeIn = Object.assign({}, events[0]);
      this.form.data.timeOut = Object.assign({}, events[events.length - 1]);

      const breakEvents = events.slice(1, events.length - 1),
        breaks = [];

      for (let i = 0; i < breakEvents.length; i += 2) {
        breaks.push({
          start: breakEvents[i],
          end: breakEvents[i + 1],
        });
      }
      this.form.data.breaks = breaks;
    },

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
    async updateTimecard() {
      const newTimeclockEvents = [];

      newTimeclockEvents.push(this.form.data.timeIn);
      this.form.data.breaks.forEach((breakItem) => {
        newTimeclockEvents.push(breakItem.start);
        newTimeclockEvents.push(breakItem.end);
      });
      newTimeclockEvents.push(this.form.data.timeOut);

      this.loading = true

      await this.$store.dispatch("updateTimecard", {
        timecardId: this.timecard.id,
        events: newTimeclockEvents,
      });

      this.loading = false
      this.closeDialog();
    },
  },
};
</script>