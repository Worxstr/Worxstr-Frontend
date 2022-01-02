<template lang="pug">
v-container.d-flex.flex-column.align-stretch(fluid)
  edit-shift-dialog(
    :opened.sync='createShiftDialog'
    :time.sync='newEventTime'
  )
  edit-shift-dialog(
    :opened.sync='editShiftDialog'
    :shift.sync='selectedShift'
    :editing='true'
  )

  portal(to='toolbarTitle')
    v-btn.ma-2(icon small @click="$refs.calendar.prev()")
      v-icon mdi-chevron-left

    v-btn.ma-2(icon small @click="$refs.calendar.next()")
      v-icon mdi-chevron-right
    
    v-toolbar-title.text-subtitle-1(v-if='$refs.calendar') {{ $refs.calendar.title }}

  portal(to='toolbarActions')

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
        @mousedown:event='moveEventDragStart'
        @mousedown:time='createEventDragStart'
        @mousemove:time='eventDragMove'
        @mouseup:time='eventDragEnd'
        @contextmenu:event='contextMenu'
      )
        template(v-slot:event='{ event, timed, eventSummary }')
          .v-event-draggable
            div(v-html='eventSummary()')

          .v-event-drag-bottom(v-if='timed' @mousedown='extendBottom(event)')
      
      v-menu(
        v-model='ctxMenu.show'
        :position-x='ctxMenu.x'
        :position-y='ctxMenu.y'
        absolute
        offset-y
        style='max-width: 600px'
      )
        v-list(dense v-if='ctxMenu.event')
          v-list-item(
            @click='duplicateEvent(ctxMenu.event)'
          )
            v-list-item-icon.mr-2
              v-icon(small) mdi-content-copy
            v-list-item-title Duplicate shift

          v-list-item(
            @click='editShift(ctxMenu.event)'
          )
            v-list-item-icon.mr-2
              v-icon(small) mdi-pencil
            v-list-item-title Edit shift
          
          v-list-item(
            @click='deleteShift(ctxMenu.event)'
          )
            v-list-item-icon.mr-2
              v-icon(small) mdi-delete
            v-list-item-title Delete shift
            
          v-divider

          v-list-item(
            exact
            :to="{name: 'shift', params: { jobId: ctxMenu.event.job_id, shiftId: ctxMenu.event.id }}"
          )
            v-list-item-title View shift

          v-list-item(
            exact
            :to="{name: 'job', params: { jobId: ctxMenu.event.job_id }}"
          )
            v-list-item-title View job

          v-list-item(
            exact
            :to="{name: 'user', params: { userId: ctxMenu.event.contractor_id }}"
          )
            v-list-item-title View contractor

</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/camelcase */

import { Vue, Component } from 'vue-property-decorator'

import EditShiftDialog from '@/views/jobs/EditShiftDialog.vue'

import { CalendarEvent } from '@/types/Schedule'
import { currentUserIs, Managers, User, userIs, UserRole } from '@/types/Users'
import { Job, Shift } from '@/types/Jobs'

import * as schedule from '@/services/schedule'
import { updateShift, deleteShift } from '@/services/shifts'
import { loadJobs } from '@/services/jobs'
import { loadWorkforce } from '@/services/users'

@Component({
  metaInfo: {
    title: 'Schedule',
  },
  components: {
    EditShiftDialog,
  },
})
export default class Schedule extends Vue {

  virtualEvent: any = null // The event that is shown when creating a new event by dragging
  newEventTime: any = null // The start and end time used to pass to shift create dialog
  creatingEventDrag = false // User is creating an event by drag
  movingEventDrag = false // User is moving an event by drag
  extendingEventDrag = false // User is extending an event by drag
  duplicatingEvent = false // User is duplicating an event
  isRightClick = false

  // We use these to track the difference of time between start and end of drag
  dragStartTime: any = null // Timestamp when the user started drag
  dragEndTime: any = null // Timestamp when the user ended drag

  openEvent({ /* nativeEvent, */ event }: { event: CalendarEvent }) {
    this.$router.push({ name: 'shift', params: {
      jobId: event.job_id.toString(),
      shiftId: event.id.toString()
    }})
  }

  // User started dragging to create an event
  createEventDragStart(timeData: any, e: MouseEvent) {

    if (this.duplicatingEvent || e.which === 3) return

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
  // User pressed their mouse on an event (started drag)
  moveEventDragStart(data: any) {
    const { event, nativeEvent } = data

    if (this.duplicatingEvent) {

      // User has placed the duplicated event
      this.newEventTime = {
        start: this.virtualEvent?.start,
        end: this.virtualEvent?.end,
      }
      console.log(this.newEventTime)
      this.createShiftDialog = true
      return
    }

    this.isRightClick = nativeEvent.which === 3
    this.movingEventDrag = true
    this.virtualEvent = event
    // Save the original start and end time for updating the drag position
    this.virtualEvent.originalStart = event.start
    this.virtualEvent.originalEnd = event.end
  }
  // User is already dragging and moved the mouse
  eventDragMove(timeData: any, e: MouseEvent) {

    if (this.isRightClick) return

    const endTime = this.roundDate(this.toDate(timeData))
    this.dragEndTime = endTime
    
    if (this.creatingEventDrag) {
      this.virtualEvent.end = endTime
      return
    }

    if (!this.dragStartTime || !this.dragEndTime) return
    const delta = endTime.getTime() - this.dragStartTime.getTime()

    if (this.duplicatingEvent) {
      this.virtualEvent.start = new Date(this.virtualEvent.originalStart.getTime() + delta)
      this.virtualEvent.end = new Date(this.virtualEvent.originalEnd.getTime() + delta)
    }
    
    else if (this.movingEventDrag) {
      if (!this.extendingEventDrag) {
        this.virtualEvent.start = new Date(this.virtualEvent.originalStart.getTime() + delta)
      }
      this.virtualEvent.end = new Date(this.virtualEvent.originalEnd.getTime() + delta)
    }
  }
  // User stopped dragging
  async eventDragEnd(timeData: any, e: MouseEvent) {

    if (this.isRightClick || this.duplicatingEvent) {
      this.cancelDrag()
      return
    }
    
    // User created new shift
    if (this.creatingEventDrag) {
      this.newEventTime = {
        start: this.virtualEvent?.start,
        end: this.virtualEvent?.end,
      }
      this.createShiftDialog = true
      this.virtualEvent = null
      this.cancelDrag()
    }
    // User clicked existing shift
    else {
      if (this.virtualEvent.start === this.virtualEvent.originalStart &&
          this.virtualEvent.end === this.virtualEvent.originalEnd) {
        this.openEvent({
          event: this.virtualEvent
        })
      } else {
        try {
          const newShift = {
            ...this.virtualEvent,
            time_begin: this.virtualEvent.start,
            time_end: this.virtualEvent.end,
          }
          this.cancelDrag()
          console.log("updating")
          await updateShift(this.$store, newShift)
        }
        catch {
          // If update fails, revert the event
          this.virtualEvent.start = this.virtualEvent.originalStart
          this.virtualEvent.end = this.virtualEvent.originalEnd
        }
      }
    }
  }

  extendBottom(event: any) {
    this.extendingEventDrag = true
  }

  duplicateEvent(event: any) {
    this.duplicatingEvent = true
    this.isRightClick = false
    this.dragStartTime = event.start
    this.virtualEvent = {...event}
    // Virtual event is created, and will follow the mouse until placed
  }

  cancelDrag() {
    this.creatingEventDrag = false
    this.movingEventDrag = false
    this.extendingEventDrag = false
    this.duplicatingEvent = false
    this.isRightClick = false
    this.virtualEvent = null
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


  createShiftDialog = false
  editShiftDialog = false
  selectedShift: Shift | null = null

  loading = false
  deletingShift = false
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
    if (this.virtualEvent && (this.creatingEventDrag || this.duplicatingEvent))
      events.push(this.virtualEvent)

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

  ctxMenu: any = {
    show: false,
    x: 0,
    y: 0,
    event: null
  }

  contextMenu({nativeEvent, event}: any) {
    nativeEvent.preventDefault()

    this.ctxMenu.show = false
    this.ctxMenu.x = nativeEvent.clientX
    this.ctxMenu.y = nativeEvent.clientY
    // make event useable by menuClick items
    this.ctxMenu.event = event
    this.$nextTick(() => {
      this.ctxMenu.show = true
    })
  }

  updateColorBy(val: string) {
    localStorage.setItem('colorScheduleBy', val)
  }

  updateView(val: string) {
    localStorage.setItem('scheduleView', val)
  }

  editShift(shift: Shift) {
    this.selectedShift = shift
    this.editShiftDialog = true
  }

  async deleteShift(shift: Shift) {
    this.deletingShift = true
    try {
      await deleteShift(this.$store, shift.id, shift.job_id)
    }
    finally {
      this.deletingShift = false
    }
  }

}
</script>


<style lang="scss">
.v-event-draggable {
  padding-left: 6px;
}

.v-event-timed {
  user-select: none;
  -webkit-user-select: none;
}

.v-event-drag-bottom {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 4px;
  height: 4px;
  cursor: ns-resize;

  &::after {
    display: none;
    position: absolute;
    left: 50%;
    height: 4px;
    border-top: 1px solid white;
    border-bottom: 1px solid white;
    width: 16px;
    margin-left: -8px;
    opacity: 0.8;
    content: '';
  }

  &:hover::after {
    display: block;
  }
}
</style>