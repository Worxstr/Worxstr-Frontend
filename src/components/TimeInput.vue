<template>
  <v-text-field
    type="time"
    dense
    outlined
    :required="required"
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
    required: Boolean,
  },
  computed: {
    timeString() {
      return new Date(this.value).toLocaleTimeString([], { hour12: false });
    },
  },
  methods: {
    updateDate: function (value) {
      const newDate = new Date(this.value);
      const [hours, minutes, seconds] = value.split(":");
      newDate.setHours(hours);
      newDate.setMinutes(minutes);
      newDate.setSeconds(seconds);
      this.$emit("input", newDate.toISOString());
    },
  },
};
</script>