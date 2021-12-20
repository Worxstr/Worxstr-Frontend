<template lang="pug">

v-container.dashboard.d-flex.flex-column

  v-toolbar.pa-0.flex-grow-0(flat color='transparent')
    v-toolbar-title
      h6.text-h6 Upcoming shifts

  v-card(outlined).soft-shadow
    v-list.pt-0
      v-card.mb-2(flat style='background: rgba(255, 255, 255,.1)')
        v-list-item.px-5.py-2(
          two-line
          :to="{ name: 'shift', params: { id: upcomingShifts[0].id } }"
          exact
        )
          v-list-item-content
            v-list-item-title {{ upcomingShifts[0].site_location }}
            v-list-item-subtitle {{  upcomingShifts[0].job.title }} &bull; {{ upcomingShifts[0].tasks.length }} tasks
          v-list-item-actions
            v-btn(color='green' @click.stop='clockIn') Clock in

      v-list-item(
        v-for='shift in upcomingShifts.slice(1)'
        :key='shift.id'
        two-line
        :to="{ name: 'shift', params: { id: shift.id } }"
        exact
      )
        v-list-item-content
          v-list-item-title {{ shift.site_location }}
          v-list-item-subtitle {{ shift.job.title }} &bull; {{ shift.tasks.length }} tasks
        
        v-list-item-action
          v-list-item-action-text {{ shift.time_begin | time }}
  
  .my-4.d-flex.justify-center
    v-btn(text outlined color='primary') View more
  
  .d-flex.gap-small
    .flex-1
      v-toolbar.pa-0.flex-grow-0(flat color='transparent')
        v-toolbar-title
          h6.text-h6 Your week
      v-card.soft-shadow.flex-1(outlined)
        .pa-4
          h4.text-h4.green--text $256.32
          p.text-caption earned


        v-card-text.d-flex.align-center.justify-center(style='height: 300px') A graph or something

    .flex-1
      v-toolbar.pa-0.flex-grow-0(flat color='transparent')
        v-toolbar-title
          h6.text-h6 Payments

      v-card.soft-shadow.flex-1(outlined)
        v-list
          v-list-item
            v-list-item-content
              v-list-item-title $256.32
              v-list-item-subtitle 2021-12-19
            v-list-item-action
              v-btn(text color='primary' icon)
                v-icon(left) mdi-chevron-right

      .my-4.d-flex.justify-center
        v-btn(text outlined color='primary') View more

</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/camelcase */

import { Vue, Component } from 'vue-property-decorator'

@Component({
  metaInfo: {
    title: 'Dashboard',
  },
})
export default class Dashboard extends Vue {

  clockIn() {
    // TODO
    console.log('clocked in')
  }

  upcomingShifts = [
    {
      job: {
        title: "Alex's test job",
      },
      contractor_id: 162,
      id: 398,
      job_id: 114,
      notes:
        "<p>Here are some <strong>notes</strong> about this shift.</p><p><em>Do not</em> be late!</p>",
      site_location: "Front of store",
      tasks: [
        {
          complete: true,
          description: "<ul><li>Bulleted</li><li>List</li></ul>",
          id: 4,
          shift_id: 398,
          time_complete: "2021-12-18T03:36:54Z",
          title: "Task 3 rich text",
        },
        {
          complete: true,
          description: "Task description",
          id: 2,
          shift_id: 398,
          time_complete: "2021-12-19T23:33:41Z",
          title: "Task 1",
        },
        {
          complete: true,
          description: "Task description",
          id: 3,
          shift_id: 398,
          time_complete: "2021-12-19T23:33:44Z",
          title: "Task 2",
        },
        {
          complete: true,
          description:
            "lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
          id: 5,
          shift_id: 398,
          time_complete: "2021-12-19T23:38:10Z",
          title: "Task 4",
        },
      ],
      time_begin: "2021-12-03T21:00:00Z",
      time_end: "2022-12-03T22:00:00Z",
      timecard_id: 334,
    },
    {
      id: 1239841,
      job: {
        title: "Alex's test job",
      },
      site_location: 'Back of store',
      tasks: [{}],
      time_begin: "2021-12-03T21:00:00Z",
      time_end: "2022-12-03T22:00:00Z",
    },
    {
      id: 12532841,
      job: {
        title: "Alex's test job",
      },
      site_location: 'Side of store',
      tasks: [{}],
      time_begin: "2021-12-03T21:00:00Z",
      time_end: "2022-12-03T22:00:00Z",
    }
  ]
}
</script>
