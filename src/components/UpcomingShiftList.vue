<template lang="pug">
.upcoming-shift-list
  v-toolbar.pa-0.flex-grow-0(flat color='transparent')
    v-toolbar-title
      h6.text-h6 Upcoming shifts

  shift-list(:shifts='upcomingShifts')

  .my-4.d-flex.justify-center
    v-btn(text outlined color='primary') View more

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
  
  async mounted() {
    console.log(getUpcomingShifts)
    await getUpcomingShifts(this.$store)
  }

  get upcomingShifts() {
    return this.$store.getters.upcomingShifts
  }

}
</script>