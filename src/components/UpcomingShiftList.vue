<template lang="pug">
.upcoming-shift-list
  v-toolbar.pa-0.flex-grow-0(flat color='transparent')
    v-toolbar-title
      h6.text-h6 Upcoming shifts

  div(v-if='!loading && !upcomingShifts.length')
    p.text-center
      | You have no shifts assigned. Go have fun! 🥂🎉

  div(v-else)
    shift-list(:shifts='upcomingShifts' :loading='loading')

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
import { getUpcomingShifts } from '@/services/shifts'
import { Shift } from '@/types/Jobs'

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
      // TODO: Add some type of watcher for when a shift ends, and update this computed value.
      return (new Date(shift.time_end)) > (new Date())
    })
  }

  async loadUpcomingShifts() {
    this.loading = true
    try {
      await getUpcomingShifts(this.$store, this.offset)
      this.offset++
    }
    finally {
      this.loading = false
    }
  }

}
</script>