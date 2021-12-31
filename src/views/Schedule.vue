<template lang="pug">
v-container.d-flex.flex-column.align-stretch(fluid)
  edit-shift-dialog(
    :opened.sync='createShiftDialog'
    :time.sync='newEventTime'
  )

  v-toolbar.flex-grow-0(flat, color="transparent")
    v-btn.ma-2(icon, @click="$refs.calendar.prev()")
      v-icon mdi-chevron-left

    v-btn.ma-2(icon, @click="$refs.calendar.next()")
      v-icon mdi-chevron-right

    v-spacer

    v-select.ma-2.flex-grow-0(
      v-if='userIsManager'
      v-model='colorBy'
      :items='colorByOptions'
      dense
      outlined
      hide-details
      label='Color by'
      @change='updateColorBy'
    )

    v-select.ma-2.flex-grow-0(
      v-model='view'
      :items='views'
      :item-text='(t) => t.charAt(0).toUpperCase() + t.slice(1)'
      dense
      outlined
      hide-details
      label='View'
      @change='updateView'
    )

  v-card.flex-1.d-flex.flex-column.flex-md-row.soft-shadow(outlined)
    //- View toggle options
    div(v-if='userIsManager')
      v-list.pr-4
        v-subheader Contractors
        v-list-item(v-for='(user, index) in users' :key='user.id')
          template(v-slot:default='{ active }')
            v-list-item-action
              v-checkbox(
                :input-value='active'
                v-model='activeUsers'
                :value='user.id'
                :color='user.additional_info.color'
              )
            
            v-list-item-content
              v-list-item-title
                router-link.alt-style(:to="{ name: 'user', params: { userId: user.id } }")
                  | {{ user | fullName }}
      
        v-subheader Jobs
        v-list-item(v-for='(job, index) in jobs' :key='job.id')
          template(v-slot:default='{ active }')
            v-list-item-action
              v-checkbox(
                :input-value='active'
                v-model='activeJobs'
                :value='job.id'
                :color='job.color'
              )
            
            v-list-item-content
                router-link.alt-style(:to="{ name: 'job', params: { jobId: job.id } }")
                  | {{ job.name }}
  
    //- Calendar
    .flex-1(style='position: relative')
      v-fade-transition
        v-overlay(v-if="loading && !calendarEvents.length" absolute :color='$vuetify.theme.dark ? "black" : "white"')
          v-progress-circular(indeterminate :color='$vuetify.theme.dark ? "white" : "black"')
      
      v-calendar(
        style='position: absolute; height:100%; width: 100%'
        ref='calendar'
        v-model='value'
        :type='view'
        :events='calendarEvents'
        event-overlap-mode='stack'
        :event-overlap-threshold='30'
        :event-color='getEventColor'
        @change='getEvents'
        @click:event='openEvent'
        @mousedown:event='moveEventDragStart'
        @mousedown:time='createEventDragStart'
        @mousemove:time='eventDragMove'
        @mouseup:time='eventDragEnd'
      )
      
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import * as schedule from '@/services/schedule'
import { CalendarEvent } from '@/types/Schedule'
import { loadWorkforce } from '@/services/users'
import { loadJobs } from '@/services/jobs'
import { currentUserIs, Managers, User, userIs, UserRole } from '@/types/Users'
import { Job } from '@/types/Jobs'
import EditShiftDialog from '@/views/jobs/EditShiftDialog.vue'



@Component({
  metaInfo: {
    title: 'Schedule',
  },
  components: {
    EditShiftDialog,
  },
})
export default class Schedule extends Vue {

  createShiftDialog = false

  virtualEvent: any = null // The event that is shown when creating a new event by dragging
  newEventTime: any = null // The start and end time used to pass to shift create dialog
  creatingEventDrag = false // User is creating an event by drag
  movingEventDrag = false // User is moving an event by drag

  // We use these to track the difference of time between start and end of drag
  dragStartTime: any = null // Timestamp when the user started drag
  dragEndTime: any = null // Timestamp when the user ended drag

  openEvent({ /* nativeEvent, */ event }: { event: CalendarEvent }) {
    
    // nativeEvent is the browser click event, event is the calendar event data
    // TODO: Use hasRole defined in User.ts

    // this.$router.push({ name: 'shift', params: {
    //   jobId: event.job_id.toString(),
    //   shiftId: event.id.toString()
    // }})
  }

  // User started dragging to create an event
  createEventDragStart(timeData: any, e: MouseEvent) {

    const startTime = this.roundDate(this.toDate(timeData))
    
    if (this.movingEventDrag) {
      this.dragStartTime = startTime
    }

    else {
      this.creatingEventDrag = true
      this.dragStartTime = startTime 

      this.virtualEvent = {
        name: 'New shift',
        color: 'primary',
        start: startTime,
        end: startTime,
        timed: true,
      }
    }
  }
  // User started dragging to move an event
  moveEventDragStart(data: any) {
    const { event, day } = data
    console.log('moveEventDragStart')

    this.movingEventDrag = true
    this.virtualEvent = event
    // Save the original start and end time for updating the drag position
    this.virtualEvent.originalStart = event.start
    this.virtualEvent.originalEnd = event.end
  }
  // User is already dragging and moved the mouse
  eventDragMove(timeData: any, e: MouseEvent) {
    
    const endTime = this.roundDate(this.toDate(timeData))
    this.dragEndTime = endTime

    if (this.movingEventDrag) {
      console.log(this.dragEndTime.getTime() - this.dragStartTime.getTime())
      const delta = this.dragEndTime.getTime() - this.dragStartTime.getTime()
      this.virtualEvent.start = new Date(this.virtualEvent.originalStart.getTime() + delta)
      this.virtualEvent.end = new Date(this.virtualEvent.originalEnd.getTime() + delta)
    }

    
    if (this.creatingEventDrag) {
      this.virtualEvent.end = endTime
    }
  }
  // User stopped dragging
  eventDragEnd(timeData: any, e: MouseEvent) {
    console.log('eventDragEnd')
    
    if (this.creatingEventDrag) {
      this.newEventTime = {
        start: this.virtualEvent?.start,
        end: this.virtualEvent?.end,
      }
      this.createShiftDialog = true
  
      this.virtualEvent = null
    }
    
    this.creatingEventDrag = false
    this.movingEventDrag = false
  }

  toDate(timeData: any) {
    return new Date(timeData.year, timeData.month - 1, timeData.day, timeData.hour, timeData.minute)
  }

  // Round date to nearest 15 minutes
  roundDate(date: Date) {
    const minutes = date.getMinutes()
    const newMinutes = Math.round(minutes / 15) * 15
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), newMinutes)
  }


  loading = false
  value = ''

  view = 'week'
  views = ['month', 'week', 'day', '4day']

  colorBy = 'job'
  colorByOptions = ['job', 'contractor']

  activeUsers: number[] = []
  activeJobs: number[] = []

  async mounted() {
    const colorBy = localStorage.getItem('colorScheduleBy')
    const view = localStorage.getItem('scheduleView')
    if (colorBy) {
      this.colorBy = colorBy
    }
    if (view) {
      this.view = view
    }
    if (this.userIsManager) {
      this.loadJobs()
      this.loadWorkforce()
    }
  }

  async loadJobs() {
    const { jobs } = await loadJobs(this.$store)
    this.activeJobs = jobs.map((j: Job) => j.id)
  }
  
  async loadWorkforce() {
    const { users } = await loadWorkforce(this.$store)
    this.activeUsers = users.map((u: User) => u.id)
  }

  updateColorBy(val: string) {
    localStorage.setItem('colorScheduleBy', val)
  }

  updateView(val: string) {
    localStorage.setItem('scheduleView', val)
  }
  
  get allCalendarEvents() {
    return this.$store.getters.calendarEvents(this.colorBy)
  }

  get calendarEvents() {

    let events = this.allCalendarEvents

    if (this.userIsManager) {
      events = events.filter(
        (event: CalendarEvent) => {
          return this.activeJobs.includes(event.job_id)
              && this.activeUsers.includes(event.contractor_id)
        }
      )
    }

    // Add virtual event when creating an event on calendar by dragging
    if (this.virtualEvent && this.creatingEventDrag) events.push(this.virtualEvent)

    return events
  }

  get users() {
    return this.$store.getters.workforce.filter((u: User) => {
      return userIs(u, UserRole.Contractor)
    })
  }

  get jobs() {
    return this.$store.getters.jobs
  }

  async getEvents({ start, end }: any) {
    this.loading = true
    try {
      await schedule.loadCalendarEvents(
        this.$store,
        new Date(`${start.date}T00:00:00`).toISOString(),
        new Date(`${end.date}T23:59:59`).toISOString(),
      )
    } finally {
      this.loading = false
    }
  }

  getEventColor(event: CalendarEvent) {
    return event.color
  }

  get userIsManager() {
    return currentUserIs(...Managers)
  }
}
</script>

<style lang="scss">
// #calendar-container {
//   width: 100%;
//   height: 100%;
// }
</style>