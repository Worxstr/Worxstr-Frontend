<template lang="pug">
.shift
  div(v-if='shift.notes')
    p.text-subtitle-1.mb-2 Notes
    v-sheet(outlined rounded)
      v-card-text
        div(v-html='shift.notes')

  div(v-if='shift.tasks')
    p.text-subtitle-1.mb-2 Tasks
    task-list(:tasks='shift.tasks')

  div(v-if="shift.active")
    p.text-subtitle-1.mb-2 Activity
    clock-events(
      v-if="shift.timeclock_actions && shift.timeclock_actions.length",
      :events="shift.timeclock_actions"
    )
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { getShift } from '@/services/jobs'
import TaskList from '@/components/TaskList.vue'
import ClockEvents from '@/components/ClockEvents.vue'

@Component({
  components: {
    TaskList,
    ClockEvents,
  }
})
export default class Shift extends Vue {

  mounted() {
    getShift(this.$store, this.$route.params.shiftId)
  }

  get shift() {
    return this.$store.getters.shift(parseInt(this.$route.params.shiftId))
  }
}
</script>