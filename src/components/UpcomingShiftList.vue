<template lang="pug">
.upcoming-shift-list
  v-toolbar.pa-0.flex-grow-0(flat color='transparent')
    v-toolbar-title
      h6.text-h6 Upcoming shifts

  div(v-if='!upcomingShifts.length')
    p.text-center
      | You have no shifts assigned. Go have fun! 🥂🎉

  div(v-else)
    shift-list(:shifts='upcomingShifts')

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

@Component({
  components: {
    ShiftList,
  },
})
export default class UpcomingShiftList extends Vue {
  
  offset = 0
  loading = false

  async mounted() {
    console.log(getUpcomingShifts)
    this.loadUpcomingShifts()
  }

  get upcomingShifts() {
    return this.$store.getters.upcomingShifts
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