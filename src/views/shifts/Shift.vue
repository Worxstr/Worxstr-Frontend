<template lang="pug">
v-container.shift.pa-6.d-flex.flex-column.align-stretch.gap-medium(v-if='job')

  edit-shift-dialog(
    :editing='true'
    :shift.sync='shift'
    :opened.sync='editShiftDialog'
    :job-id='shift.job_id'
  )
  delete-shift-dialog(
    :opened.sync='deleteShiftDialog'
    :shiftIds='[shift.id]'
  )
  
  portal(to='toolbarActions')
    v-btn(
      v-if='userIsManager'
      text
      :icon='$vuetify.breakpoint.xs'
      color='primary'
      @click='editShiftDialog = true'
      data-cy='edit-shift-button'
    )
      v-icon(:left='!$vuetify.breakpoint.xs') mdi-pencil
      span(v-if='!$vuetify.breakpoint.xs') Edit

    v-btn(
      v-if='userIsManager'
      text
      :icon='$vuetify.breakpoint.xs'
      color='error'
      @click='deleteShiftDialog = true'
      :disabled='!!history.length'
      data-cy='delete-shift-button'
    )
      v-icon(:left='!$vuetify.breakpoint.xs') mdi-delete
      span(v-if='!$vuetify.breakpoint.xs') Delete

  .mt-8 
    //- Loader
    div(
      v-if='!(shift && shift.time_begin && shift.time_end)'
      style='width: 300px'
    )
      v-skeleton-loader(type='sentences')

    .d-flex.flex-column.flex-md-row.justify-space-between.gap-small(v-else)

      .d-flex.flex-column

        h4.text-h4 {{ shift.site_location }}
        //- Countdown clock
        .text-h6
          div(v-if='clockedIn') Clocked in for {{ timeSinceClockIn }}
          div(v-else-if='shiftIsActive') Ends in {{ timeUntilShift }}
          div(v-else-if='shiftIsOver') Ended {{ timeUntilShift }} ago
          div(v-else) Starts in {{ timeUntilShift }}

        h6.text-body-1
          router-link.alt-style(
            :to="{name: 'job', params: { jobId: job.id }}"
          ) {{ job.name }}

          span(v-if='!isMyShift') &nbsp;- Assigned to&nbsp;

          router-link.alt-style(
            v-if='!isMyShift && contractor'
            :to="{name: 'user', params: { userId: contractor.id }}"
          ) {{ contractor | fullName }}

        .text-body-2 {{ shift.time_begin | time }} - {{ shift.time_end | time }}
        .text-body-2 {{ shift.time_begin | date('MMM D, YYYY') }} - {{ shift.time_end | date('MMM D, YYYY') }}

      .d-flex.flex-column.align-md-end.gap-small
        clock-buttons(v-if='isMyShift' :shift='shift' large)

        .d-flex.flex-md-column.align-stretch.gap-small
          v-btn(
            text
            outlined
            color='primary'
            :to="{name: 'job', params: {jobId: shift.job_id}}"
            exact
          ) View job details

          v-btn(
            v-if='userIsManager && contractor'
            text
            outlined
            color='primary'
            :to="{name: 'user', params: {userId: shift.contractor_id}}"
          ) View {{ contractor.first_name }}'s profile
       
  
  //- // TODO: Use better masonry library
  masonry(:cols='{default: 2, 959: 1}' :gutter='30')

    //- Shift notes
    .mb-4.d-flex.flex-column.gap-small(v-if='job.notes || shift.notes')
      h5.text-h5 Notes
      v-sheet(outlined rounded)
        v-card-text(v-if='job.notes')
          h6.text-h6.mb-3 Job notes
          div(v-html='job.notes')
        
        v-divider(v-if='job.notes && shift.notes')

        v-card-text(v-if='shift.notes')
          h6.text-h6.mb-3 Shift notes
          div(v-html='shift.notes')
          
    //- Task list
    .mb-4.d-flex.flex-column.gap-small(v-if='totalTasks > 0')
      div
        h5.text-h5 {{ isMyShift ? 'Your' : 'Shift' }} tasks
        h6.text-caption(:class="{'success--text font-weight-bold': allTasksComplete}")
          | {{tasksComplete}}/{{totalTasks}} completed

      task-list(:tasks='tasks')
    
    //- Shift history
    .mb-4.d-flex.flex-column.gap-small(v-if='history.length')
      h5.text-h5 History

      v-card(outlined flat)
        clock-events(:events='history')
      
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'

import * as jobs from '@/services/jobs'
import * as shifts from '@/services/shifts'
import { Managers, currentUserIs } from '@/types/Users'
import { Task } from '@/types/Jobs'
import { ClockEvent, ClockAction } from '@/types/Clock'

import EditShiftDialog from '@/views/jobs/EditShiftDialog.vue'
import DeleteShiftDialog from '@/views/jobs/DeleteShiftDialog.vue'
import TaskList from '@/components/TaskList.vue'
import ClockButtons from '@/components/ClockButtons.vue'
import ClockEvents from '@/components/ClockEvents.vue'

// Return days, hours, minutes, and seconds between now and a given date
function timeBetween(time: Date) {
  const now = new Date()
  const diff = Math.abs(time.getTime() - now.getTime())
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor(diff / (1000 * 60 * 60)) - (days * 24)
  const minutes = Math.floor(diff / (1000 * 60)) - (days * 24 * 60) - (hours * 60)
  const seconds = Math.floor(diff / 1000) - (days * 24 * 60 * 60) - (hours * 60 * 60) - (minutes * 60)

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m ${seconds}s`
  } else if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  } else if (seconds > 0) {
    return `${seconds}s`
  } else {
    return 'now'
  }
}

@Component({
  metaInfo: {
    title: 'Clock'
  },
  components: {
    EditShiftDialog,
    DeleteShiftDialog,
    TaskList,
    ClockButtons,
    ClockEvents,
  },
})
export default class Shift extends Vue {
  
  loadingShift = false
  loadingJob = false

  editShiftDialog = false
  deleteShiftDialog = false

  timeUntilShift = ''
  timeSinceClockIn = ''

  async mounted() {
    const shift = await this.loadShift()

    if (shift?.job_id) {
      this.loadJob(shift.job_id)
    }

    setInterval(() => {
      this.computeTimeUntilShift()
      this.computeTimeSinceClockIn()
    }, 1000)
  }

  @Watch('shift')
  onShiftChange() {
    this.computeTimeUntilShift()
  }

  @Watch('clockInTime')
  onClockInTimeChange() {
    this.computeTimeSinceClockIn()
  }

  // User info

  get me() {
    return this.$store.getters.me
  }

  get iAmVerified() {
    return this.$store.getters.iAmVerified
  }

  get userIsManager() {
    return currentUserIs(...Managers)
  }

  // Computed data

  get shift() {
    return this.$store.getters.shift(parseInt(this.$route.params.shiftId))
  }

  get contractor() {
    return this.$store.getters.user(this.shift.contractor_id)
  }

  get clock() {
    return this.$store.state.clock
  }

  get history() {
    if (!this.shift || !this.shift.clock_history) return []
    return this.shift.clock_history.sort((a: ClockEvent, b: ClockEvent) => {
      return (new Date(b.time)).getTime() - (new Date(a.time)).getTime()
    })
  }

  get job() {
    if (!this.shift) return null
    return this.$store.getters.job(this.shift.job_id)
  }

  get tasks() {
    return this.shift.tasks.sort((a: Task, b: Task) => a.id - b.id)
  }

  // Task info

  get totalTasks() {
    if (!this.shift?.tasks?.length) return 0
    return this.shift.tasks.length
  }

  get tasksComplete() {
    return this.shift.tasks.filter((task: Task) => task.complete).length
  }

  get allTasksComplete() {
    return this.tasksComplete == this.totalTasks
  }

  // Computed shift info

  get clockedIn() {
    if (!this.history.length) return false
    return this.history[0].action === ClockAction.ClockIn
  }

  get shiftIsActive() {
    if (!this.shift) return false
    const now = (new Date()).getTime()
    return (new Date(this.shift.time_begin)).getTime() <= now
      && (new Date(this.shift.time_end)).getTime() >= now
  }

  get shiftIsOver() {
    if (!this.shift) return false
    return (new Date(this.shift.time_end)).getTime() < (new Date()).getTime()
  }

  get isMyShift() {
    return this.me.id === this.shift.contractor_id
  }

  get clockInTime() {
    return this.history.find((e: ClockEvent) => e.action === ClockAction.ClockIn)?.time
  }

  computeTimeUntilShift() {
    if (!this.shift) return
    this.timeUntilShift = timeBetween(new Date(
      this.shiftIsActive ? this.shift.time_end : this.shift.time_begin
    ))
  }

  computeTimeSinceClockIn() {
    if (!this.clockInTime) return
    this.timeSinceClockIn = timeBetween(new Date(this.clockInTime))
  }

  // Network actions

  async loadShift() {
    this.loadingShift = true
    try {
      return shifts.loadShift(this.$store, parseInt(this.$route.params.shiftId))
    }
    finally {
      this.loadingShift = false
    }
  }

  async loadJob(jobId: number) {
    this.loadingJob = true
    if (!this.shift || !this.shift.job_id) return
    try {
      await jobs.loadJob(this.$store, jobId)
    }
    finally {
      this.loadingJob = false
    }
  }
}
</script>