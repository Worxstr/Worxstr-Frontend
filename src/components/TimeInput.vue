<template>
  <v-text-field
    type="time"
    dense
    outlined
    :required="required"
    :rules="rules"
    :hide-details="hideDetails"
    :label="label"
    :value="timeString"
    @input="updateDate"
  />
</template>

<script>
export default {
  name: "timeInput",
  props: {
    value: String,
    label: String,
    hideDetails: Boolean,
    timeOnly: Boolean,
    required: Boolean,
    rules: Array,
  },
  computed: {
    timeString() {
      return new Date(this.value).toLocaleTimeString([], { hour12: false });
    },
  },
  methods: {
    updateDate: function (value) {
      if (!value) return;

      const newDate = this.value ? new Date(this.value) : new Date();

      // Just use the time string XX:XX
      if (this.timeOnly) {
        this.$emit("input", value);
      }
      // Use ISO date string from props
      else {
        const [hours, minutes, seconds] = value.split(":");
        newDate.setHours(hours);
        newDate.setMinutes(minutes);
        newDate.setSeconds(seconds);
        this.$emit("input", newDate.toISOString());
      }
    },
  },
};
</script>