<template lang="pug">
v-container.shift.pa-6.d-flex.flex-column.align-stretch.gap-medium(v-if='job')

  .mt-8.d-flex.flex-column

    .clock-display(v-if='nextShift && shift.time_begin && shift.time_end' style='width: 100%')

      //- Shift name
      h6.text-h6.text-center
        | {{ isMyShift ? 'Your' : '{Contractor name}\'s' }} shift at&nbsp;
        span.font-weight-bold {{ shift.site_location }}
        | &nbsp;for&nbsp;
        span.font-weight-bold {{ job.name }}
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
    
      clock-buttons(v-if='isMyShift')
      
    div(v-else-if='!loadingNextShift')
      h6.text-h6.text-center.text-sm-left You have no upcoming shifts. Go have fun! 🎉
    
    //- Loader
    div(
      v-else
      style='width: 300px'
    )
      v-skeleton-loader(type='sentences')


  .d-flex.flex-column.flex-md-row.gap-medium

    //- Shift notes
    .flex-1.d-flex.flex-column.gap-small(v-if='shift.notes')
      h5.text-h5 Notes
      v-sheet(outlined rounded)
        v-card-text
          div(v-html='job.notes')
        v-divider
        v-card-text
          div(v-html='shift.notes')
          
    //- Task list
    .flex-1.d-flex.flex-column.gap-small(v-if='totalTasks > 0')
      div
        h5.text-h5 {{ isMyShift ? 'Your' : 'Shift' }} tasks
        h6.text-caption(:class="{'success--text font-weight-bold': allTasksComplete}")
          | {{tasksComplete}}/{{totalTasks}} completed

      task-list(:tasks='tasks')
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import vueAwesomeCountdown from "vue-awesome-countdown"

import * as clock from '@/services/clock'
import * as jobs from '@/services/jobs'
import { getShift } from '@/services/jobs'
import { Task } from '@/types/Jobs'
import { Socket } from 'vue-socket.io-extended'

import TaskList from '@/components/TaskList.vue'
import ClockButtons from '@/components/ClockButtons.vue'

Vue.use(vueAwesomeCountdown, "vac");

@Component({
  metaInfo: {
    title: 'Clock'
  },
  components: {
    TaskList,
    ClockButtons,
  },
})
export default class Shift extends Vue {
  
  loadingNextShift = false
  loadingJob = false

  async mounted() {
    console.log('mounted')
    await this.loadShift()
    if (this.shift?.job_id) {
      console.log('loading job' + this.shift.job_id)
      this.loadJob()
    }
  }

  get shift() {
    return this.$store.getters.shift(parseInt(this.$route.params.shiftId))
  }

  // For some fucking reason the view won't rerender when we delete a shift and socket.io pushes the new next shift.
  // This forces the view to rerender when that mutation occurs.
  @Socket('SET_NEXT_SHIFT')
  update() {
    this.$forceUpdate()
  }

  get clock() {
    return this.$store.state.clock
  }

  get nextShift() {
    return this.$store.getters.nextShift
  }

  get job() {
    if (!this.shift) return null
    return this.$store.getters.job(this.shift.job_id)
  }

  get iAmVerified() {
    return this.$store.getters.iAmVerified
  }

  get me() {
    return this.$store.getters.me
  }

  get isMyShift() {
    return this.me.id === this.shift.contractor_id
  }

  get tasks() {
    return this.shift.tasks.sort((a: Task, b: Task) => a.id - b.id)
  }

  get totalTasks() {
    return this.shift.tasks.length
  }

  get tasksComplete() {
    return this.shift.tasks.filter((task: Task) => task.complete).length
  }

  get allTasksComplete() {
    return this.tasksComplete == this.totalTasks
  }

  async loadShift() {
    this.loadingShift = true
    try {
      getShift(this.$store, parseInt(this.$route.params.shiftId))
    }
    finally {
      this.loadingShift = false
    }
  }

  async loadNextShift() {
    this.loadingNextShift = true
    try {
      await clock.loadNextShift(this.$store)
    }
    finally {
      this.loadingNextShift = false
    }
  }

  async loadJob() {
    this.loadingJob = true
    if (!this.shift || !this.shift.job_id) return
    try {
      await jobs.loadJob(this.$store, this.shift.job_id)
    }
    finally {
      this.loadingJob = false
    }
  }
}
</script>