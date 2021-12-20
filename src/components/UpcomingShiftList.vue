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

@Component({
  components: {
    ShiftList,
  },
})
export default class UpcomingShiftList extends Vue {
  
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
      id: 115,
      job: {
        title: "Alex's test job",
      },
      site_location: 'Back of store',
      tasks: [{}],
      time_begin: "2021-12-03T21:00:00Z",
      time_end: "2022-12-03T22:00:00Z",
    },
    {
      id: 116,
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