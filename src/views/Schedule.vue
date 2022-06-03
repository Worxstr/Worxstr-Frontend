<template lang="pug">
v-container.schedule.d-flex.flex-column.align-stretch(fluid)
  edit-shift-dialog(
    :opened.sync='createShiftDialog'
    :time.sync='newEventTime'
  )
  edit-shift-dialog(
    :opened.sync='editShiftDialog'
    :shiftId='selectedShift ? selectedShift.id : null'
    :editing='true'
  )

  template(v-if='$vuetify.breakpoint.mdAndUp')
    portal(to='toolbarTitle')
      v-btn.ml-2(text outlined color='primary' @click='setToToday') Today

      v-btn.ma-2(icon small @click="$refs.calendar.prev()")
        v-icon mdi-chevron-left

      v-btn.ma-2(icon small @click="$refs.calendar.next()")
        v-icon mdi-chevron-right
      
      v-toolbar-title.text-subtitle-1(v-if='$refs.calendar') {{ $refs.calendar.title }}

    portal(to='toolbarActions')

      v-select.ma-2.flex-grow-0.fit(
        v-if='userIsManager'
        v-model='colorBy'
        :items='colorByOptions'
        dense
        outlined
        hide-details
        label='Color by'
        @change='updateColorBy'
      )

      //- // TODO: item-text prop doesn't work for some reason?
      v-select.ma-2.flex-grow-0.fit(
        v-model='view'
        :items='Object.keys(views)'
        :item-text='(t) => views[view].text'
        dense
        outlined
        hide-details
        label='View'
        @change='updateView'
      )
  
  template(v-else) 

    portal(to='toolbarActions')
      v-btn.mr-4(text outlined color='primary' @click='setToToday' v-if='$vuetify.breakpoint.smAndUp') Today

      v-toolbar-title.text-subtitle-1(v-if='$refs.calendar') {{ $refs.calendar.title }}

      v-menu(v-model='overflowMenu')
        template(v-slot:activator='{ on, attrs }')
          v-btn(icon v-bind='attrs' v-on='on')
            v-icon mdi-dots-vertical
        
        v-list
          v-list-item(@click="setToToday" v-if='$vuetify.breakpoint.xs')
            v-list-item-icon
              v-icon mdi-calendar-today
            v-list-item-content
              v-list-item-title Today

          v-list-item(@click="$refs.calendar.prev()")
            v-list-item-icon
              v-icon mdi-chevron-left
            v-list-item-content
              v-list-item-title Previous {{ view === 'month' ? 'month' : 'week' }}

          v-list-item(@click="$refs.calendar.next()")
            v-list-item-icon
              v-icon mdi-chevron-right
            v-list-item-content
              v-list-item-title Next {{ view === 'month' ? 'month' : 'week' }}

          v-menu(v-if='userIsManager')
            template(v-slot:activator='{ on, attrs }')
              v-list-item(v-bind='attrs' v-on='on')
                v-list-item-icon
                  v-icon mdi-palette
                v-list-item-content
                  v-list-item-title Color by

            v-list
              v-list-item(@click="updateColorBy('contractor')")
                v-list-item-content 
                  v-list-item-title Contractor

              v-list-item(@click="updateColorBy('job')")
                v-list-item-content 
                  v-list-item-title Job

          v-menu
            template(v-slot:activator='{ on, attrs }')
              v-list-item(v-bind='attrs' v-on='on')
                v-list-item-icon
                  v-icon mdi-view-dashboard
                v-list-item-content
                  v-list-item-title Change view

            v-list
              v-list-item(
                v-for='view in Object.keys(views)'
                :key='view'
                @click="updateView(view)"
              )
                v-list-item-content 
                  v-list-item-title {{ views[view].text }}
          
          v-menu(:close-on-content-click='false' v-if='userIsManager')
            template(v-slot:activator='{ on, attrs }')
              v-list-item(v-bind='attrs' v-on='on')
                v-list-item-icon
                  v-icon mdi-account-group
                v-list-item-content
                  v-list-item-title Toggle contractors

            v-list
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
                    v-list-item-title {{ user.name }}
                  
          v-menu(:close-on-content-click='false' v-if='userIsManager')
            template(v-slot:activator='{ on, attrs }')
              v-list-item(v-bind='attrs' v-on='on')
                v-list-item-icon
                  v-icon mdi-calendar-check
                v-list-item-content
                  v-list-item-title Toggle jobs

            v-list
              v-list-item(v-for='(job, index) in jobs' :key='job.id')
                template(v-slot:default='{ active }')
                  v-list-item-action
                    v-checkbox(
                      :input-value='active'
                      v-model='activeJobs'
                      :value='job.id'
                      :color='job.color'
                    )
                  
                  v-list-item-content {{ job.name }}
                  
  v-card.flex-1.d-flex.flex-column.flex-md-row.soft-shadow(outlined style='height: 100%')
    //- View toggle options
    template(v-if='userIsManager && $vuetify.breakpoint.mdAndUp')
      v-list.pt-0.d-flex.flex-column

        v-date-picker.mr-0(
          v-model='value'
          color='primary'
          show-adjacent-months
          no-title
        )

        .pr-4(style='overflow: auto')
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
                    | {{ user.name }}
        
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
        :type="views[view] ? views[view].value : 'week'"
        :events='calendarEvents'
        event-overlap-mode='stack'
        :event-overlap-threshold='30'
        :event-color='getEventColor'
        :weekdays='weekdays'
        @change='getEvents'
        @mousedown:event='moveEventDragStart'
        @mousedown:time='createEventDragStart'
        @mousemove:time='eventDragMove'
        @mouseup:time='eventDragEnd'
        @contextmenu:event='contextMenu'
      )
        template(v-slot:event='{ event, timed, eventSummary }')
          v-fade-transition
            v-overlay(v-if='savingEvent === event.id' absolute opacity='.2')
              v-progress-circular(indeterminate size='25')

          .v-event-draggable
            div(:class='`${textColor(event.color)}--text`')
              div(v-html='eventSummary()')
              //- p Contractor name 
              //- p Job name

          .v-event-drag-bottom(v-if='timed' @mousedown='extendBottom(event)')
        
        template(v-slot:day-body='{ date, week }')
          .v-current-time(
            v-if='isToday(date)'
            :class='{ first: date === week[0].date }'
            :style='{ top: nowY }'
          )
      
      v-menu(
        v-model='ctxMenu.show'
        :position-x='ctxMenu.x'
        :position-y='ctxMenu.y'
        absolute
        offset-y
        style='max-width: 600px'
      )
        v-list(dense v-if='ctxMenu.event')
        
          div(v-if='userIsManager')
            v-list-item(
              @click='duplicateEvent(ctxMenu.event)'
            )
              v-list-item-icon.mr-2
                v-icon(small color='primary') mdi-content-copy
              v-list-item-title Duplicate shift

            v-list-item(
              @click='editShift(ctxMenu.event)'
            )
              v-list-item-icon.mr-2
                v-icon(small color='primary') mdi-pencil
              v-list-item-title Edit shift
            
            v-list-item(
              v-if='ctxMenu.event && ctxMenu.event.clock_history.length === 0'
              @click='deleteShift(ctxMenu.event)'
            )
              v-list-item-icon.mr-2
                v-icon(small color='error') mdi-delete
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
import dayjs from 'dayjs'

import EditShiftDialog from '@/views/jobs/EditShiftDialog.vue'

import { CalendarEvent } from '@/types/Schedule'
import { currentUserIs, Managers, User, userIs, UserRole } from '@/types/Users'
import { Job, Shift } from '@/types/Jobs'
import { textColor } from '@/util/helpers'

import * as schedule from '@/services/schedule'
import { updateShift, deleteShifts } from '@/services/shifts'
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
  savingEvent: number | null = null // The id of the event that is being saved
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

    if (e.which === 3) return

    if (this.duplicatingEvent) {

      // User has placed the duplicated event
      this.newEventTime = {
        start: this.virtualEvent?.start,
        end: this.virtualEvent?.end,
      }

      if (this.userIsManager)
        this.createShiftDialog = true

      this.cancelDrag()

      return
    }

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

    if (this.duplicatingEvent) return

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

    // Don't allow negative duration if extending
    if (this.extendingEventDrag && endTime < this.virtualEvent.start) {
      return
    }

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
      if (this.userIsManager)
        this.createShiftDialog = true
      this.virtualEvent = null
      this.cancelDrag()
    }
    // User clicked existing shift
    else if (this.movingEventDrag) {
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
          if (this.userIsManager) {
            this.savingEvent = newShift.id
            await updateShift(this.$store, newShift)
            this.savingEvent = null
          }
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
  datePicker: any = null

  loading = false
  ready = false
  deletingShift = false
  value = ''
  overflowMenu = false

  setToToday() {
    this.value = dayjs(new Date()).format('YYYY-MM-DD')
  }

  view = 'week'
  get views() {
    const views: any = {
      month: {
        text: 'Month',
        value: 'month',
      },
      day: {
        text: 'Day',
        value: 'day',
      },
      '4 day': {
        text: '4 day',
        value: '4day',
      },
      weekdays: {
        text: 'Weekdays',
        value: 'week',
      },
    }
    if (this.$vuetify.breakpoint.smAndUp) {
      views['week'] = {
        text: 'Week',
        value: 'week',
      }
    }
    return views
  }

  get currentView() {
    return this.views[this.view]
  }

  get weekdays() {
    return this.view === 'weekdays'
      ? [1,2,3,4,5]
      : [0,1,2,3,4,5,6]
  }

  // Functions used for current day marker
  get cal() {
    return this.ready ? (this.$refs.calendar as any) : null
  }

  get nowY() {
    return this.cal ? this.cal.timeToY(this.cal.times.now) + 'px' : '-10px'
  }

  // Check if date string YYYY-MM-DD is today
  isToday(date: string) {
    return dayjs(new Date()).format('YYYY-MM-DD') === date
  }

  colorBy = 'job'
  colorByOptions = ['job', 'contractor']

  activeUsers: number[] = []
  activeJobs: number[] = []

  async mounted() {
    this.ready = true

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

  textColor(color: string) {
    return textColor(color)
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
    this.overflowMenu = false
    if (this.colorBy !== val) this.colorBy = val
    localStorage.setItem('colorScheduleBy', val)
  }

  updateView(val: string) {
    this.overflowMenu = false
    if (this.view !== val) this.view = val
    localStorage.setItem('scheduleView', val)
  }

  editShift(shift: Shift) {
    this.selectedShift = shift
    this.editShiftDialog = true
  }

  async deleteShift(shift: Shift) {
    this.deletingShift = true
    try {
      await deleteShifts(this.$store, [shift.id])
    }
    finally {
      this.deletingShift = false
    }
  }

}
</script>


<style lang="scss">
.schedule {

  .v-picker__body {
    background-color: transparent !important;
  }
    
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

  .v-current-time {
    height: 2px;
    background-color: #ea4335;
    position: absolute;
    left: -1px;
    right: 0;
    pointer-events: none;

    &::before {
      content: '';
      position: absolute;
      background-color: #ea4335;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      margin-top: -5px;
      margin-left: -6.5px;
    }
  }
  .v-current-time, .v-current-time.first::before {
    box-shadow: 0px 3px 1px -2px rgb(0 0 0 / 20%),
                0px 2px 2px 0px rgb(0 0 0 / 14%),
                0px 1px 5px 0px rgb(0 0 0 / 12%) !important;
  }

}
</style>