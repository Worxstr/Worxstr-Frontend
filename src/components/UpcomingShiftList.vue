<template lang="pug">
.upcoming-shift-list
  div(v-if='!loading && !upcomingShifts.length')
    p.text-center
      | You have no shifts assigned. Go have fun! 🥂🎉

  div(v-else)
    shift-list(:shifts='upcomingShifts' :loading='loading')
      template(v-slot:title) Upcoming shifts 

    .my-4.d-flex.justify-center
      v-btn(
        text
        outlined
        color='primary'
        @click='loadUpcomingShifts'
        :loading='loading'
      ) View more

</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/camelcase */
import { Vue, Component } from 'vue-property-decorator'
import ShiftList from '@/components/ShiftList.vue'
import { loadUpcomingShifts } from '@/services/shifts'
import { ClockAction, Shift } from '@/types/Jobs'

@Component({
  components: {
    ShiftList,
  },
})
export default class UpcomingShiftList extends Vue {
  
  offset = 0
  loading = false

  async mounted() {
    this.loadUpcomingShifts()
  }

  get upcomingShifts() {
    return this.$store.getters.upcomingShifts.filter((shift: Shift) => {
      if (!shift) return false
      const isInFuture = (new Date(shift.time_end)) > (new Date())
      const isClockedIn = shift.clock_state !== ClockAction.ClockOut && shift.clock_state !== null
      return isInFuture || isClockedIn
    })
  }

  async loadUpcomingShifts() {
    this.loading = true
    try {
      await loadUpcomingShifts(this.$store, this.offset)
      this.offset++
    }
    finally {
      this.loading = false
    }
  }

}
</script>