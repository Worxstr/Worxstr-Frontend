<template lang="pug">
v-text-field(
	type="date",
	dense,
	outlined,
	:required="required",
	:rules="rules",
	:hide-details="hideDetails",
	:label="label",
	:value="dateString",
	@input="updateDate"
)
</template>

<script>
import dayjs from "dayjs";

export default {
  name: "timeInput",
  props: {
    value: String,
    label: String,
    hideDetails: Boolean,
    required: Boolean,
    rules: Array,
  },
  computed: {
    dateString() {
      console.log(dayjs(this.value).format("YYYY-MM-DD"));
      return dayjs(this.value).format("YYYY-MM-DD");
    },
  },
  methods: {
    updateDate: function (value) {
      if (!value) return;
      const newDate = new Date(this.value);
      this.$emit("input", newDate.toISOString());
    },
  },
};
</script>