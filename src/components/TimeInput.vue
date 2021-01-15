<template>
  <v-text-field
    dense
    outlined
		:required="required"
    :hide-details="hideDetails"
    :label="label"
    type="time"
    v-model="timeString"
    @change="updateDate"
  />
</template>

<script>
export default {
  name: "timeInput",
  props: {
    date: String,
    label: String,
		hideDetails: Boolean,
		required: Boolean
  },
  computed: {
    timeString(date) {
      return new Date(this.date).toLocaleTimeString([], { hour12: false });
    },
  },
  mounted() {
    // Convert to ISO string on init
    setTimeout(() => this.updateDate(), 0);
  },
  methods: {
    updateDate() {
      const newDate = new Date(this.date);
      const [hours, minutes, seconds] = this.timeString.split(":");
      newDate.setHours(hours);
      newDate.setMinutes(minutes);
      newDate.setSeconds(seconds);
      this.date = newDate.toISOString();
    },
  },
};
</script>