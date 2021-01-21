<template lang="pug">
v-container.availability.d-flex.flex-column.align-center
  v-card.pa-4
    div(v-for="(day, index) in availability", :key="index")
      p.text-subtitle-2 {{ index | capitalize }}
      .d-flex.flex-row
        v-text-field(
          v-model="availability[index].startTime",
          label="Start time",
          type="time"
        )
        v-spacer.mx-3
        v-text-field(
          v-model="availability[index].endTime",
          label="End time",
          type="time"
        )
</template>

<script>
export default {
  name: "availability",
  data: () => ({
    menu: false,
    availability: {
      monday: {
        startTime: "09:00",
        endTime: "17:00",
      },
      tuesday: {
        startTime: "09:00",
        endTime: "17:00",
      },
      wednesday: {
        startTime: "09:00",
        endTime: "17:00",
      },
      thursday: {
        startTime: "09:00",
        endTime: "17:00",
      },
      friday: {
        startTime: "09:00",
        endTime: "17:00",
      },
      saturday: {
        startTime: null,
        endTime: null,
      },
      sunday: {
        startTime: null,
        endTime: null,
      },
    },
  }),
};
</script>