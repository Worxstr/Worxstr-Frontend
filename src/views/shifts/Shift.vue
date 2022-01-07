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
    :shift.sync='shift'
    :contractorName="contractor ? contractor.first_name : 'This contractor'"
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
      :disabled='shift.clock_history.length'
      data-cy='delete-shift-button'
    )
      v-icon(:left='!$vuetify.breakpoint.xs') mdi-delete
      span(v-if='!$vuetify.breakpoint.xs') Delete

  .mt-8.d-flex.flex-column

    .clock-display(v-if='shift && shift.time_begin && shift.time_end' style='width: 100%')

      //- Shift name
      h6.text-h6.text-center
        span(v-if='isMyShift') Your
        router-link.alt-style.font-weight-black(v-else :to="{name: 'user', params: {userId: contractor.id}}")
          | {{contractor.first_name}}'s
        span &nbsp;shift at&nbsp;
        span.font-weight-bold {{ shift.site_location }}
        | &nbsp;for&nbsp;
        router-link.alt-style.font-weight-black(:to="{name: 'job', params: { jobId: shift.job_id }}")
          | {{ job.name }}
        | &nbsp;{{ shift.shiftActive ? "ends" : "begins" }} at

      //- Shift time
      h3.text-h3.py-2.font-weight-bold.text-center
        | {{
        | (shift.shiftActive ? (new Date(shift.time_end)) : (new Date(shift.time_begin)))
        | .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        | .replace(/^0(?:0:0?)?/, "")
        | }}


      //- Countdown clock
      p.text-subtitle-2.text-center

        countdown(:end-time='\
        shift.shiftActive ? shift.time_end : shift.time_begin\
        ')
          template(v-slot:process='props')
            span
              | That's in &nbsp;
              span(v-if='props.timeObj.d != 0')
                | {{ props.timeObj.d }} days,&nbsp;
              span(v-if='props.timeObj.h != 0')
                | {{ props.timeObj.h }} hours,&nbsp;
              span(v-if='props.timeObj.m != 0')
                | {{ props.timeObj.m }} minutes, {{ props.timeObj.s }} seconds.
          template(v-slot:finish)
            span That's right now!
    
      clock-buttons(v-if='isMyShift' :shift='shift' large)

      .d-flex.justify-center.mt-4.gap-small
        v-btn(
          text
          outlined
          color='primary'
          :to="{name: 'job', params: {jobId: this.shift.job_id}}"
          exact
        ) View job details

        v-btn(
          v-if='userIsManager'
          text
          outlined
          color='primary'
          :to="{name: 'user', params: {userId: this.shift.contractor_id}}"
        ) View {{ this.contractor.first_name }}'s profile
      
    //- Loader
    div(
      v-else
      style='width: 300px'
    )
      v-skeleton-loader(type='sentences')
  
  //- // TODO: Use better masonry library
  masonry(:cols='{default: 2, 959: 1}' :gutter='30')

    //- Shift notes
    .mb-4.d-flex.flex-column.gap-small(v-if='shift.notes')
      h5.text-h5 Notes
      v-sheet(outlined rounded)
        v-card-text
          div(v-html='job.notes')
        v-divider
        v-card-text
          div(v-html='shift.notes')
          
    //- Task list
    .mb-4.d-flex.flex-column.gap-small(v-if='totalTasks > 0')
      div
        h5.text-h5 {{ isMyShift ? 'Your' : 'Shift' }} tasks
        h6.text-caption(:class="{'success--text font-weight-bold': allTasksComplete}")
          | {{tasksComplete}}/{{totalTasks}} completed

      task-list(:tasks='tasks')
    
    //- Shift history
    .mb-4.d-flex.flex-column.gap-small(v-if='shift.clock_history.length')
      h5.text-h5 History

      v-card(outlined flat)
        clock-events(:events='shift.clock_history')
      
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import vueAwesomeCountdown from "vue-awesome-countdown"

import * as jobs from '@/services/jobs'
import * as shifts from '@/services/shifts'
import { Managers, currentUserIs } from '@/types/Users'
import { Task } from '@/types/Jobs'
import { Socket } from 'vue-socket.io-extended'

import EditShiftDialog from '@/views/jobs/EditShiftDialog.vue'
import DeleteShiftDialog from '@/views/jobs/DeleteShiftDialog.vue'
import TaskList from '@/components/TaskList.vue'
import ClockButtons from '@/components/ClockButtons.vue'
import ClockEvents from '@/components/ClockEvents.vue'

Vue.use(vueAwesomeCountdown, "vac");

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

  async mounted() {
    const shift = await this.loadShift()

    if (shift?.job_id) {
      this.loadJob(shift.job_id)
    }
  }

  get shift() {
    return this.$store.getters.shift(parseInt(this.$route.params.shiftId))
  }

  get contractor() {
    return this.$store.getters.user(this.shift.contractor_id)
  }

  get clock() {
    return this.$store.state.clock
  }

  get job() {
    if (!this.shift) return null
    return this.$store.getters.job(this.shift.job_id)
  }

  get isMyShift() {
    return this.me.id === this.shift.contractor_id
  }

  get tasks() {
    return this.shift.tasks.sort((a: Task, b: Task) => a.id - b.id)
  }

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

  get me() {
    return this.$store.getters.me
  }

  get iAmVerified() {
    return this.$store.getters.iAmVerified
  }

  get userIsManager() {
    return currentUserIs(...Managers)
  }

  async loadShift() {
    this.loadingShift = true
    try {
      return shifts.getShift(this.$store, parseInt(this.$route.params.shiftId))
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