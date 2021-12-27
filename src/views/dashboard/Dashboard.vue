<template lang="pug">

v-container.dashboard.d-flex.flex-column

  upcoming-shift-list
  
  //- .d-flex.gap-small
  //-   .flex-1
  //-     v-toolbar.pa-0.flex-grow-0(flat color='transparent')
  //-       v-toolbar-title
  //-         h6.text-h6 Your week
  //-     v-card.soft-shadow.flex-1(outlined)
  //-       .pa-4
  //-         h4.text-h4.green--text $256.32
  //-         p.text-caption earned


  //-       v-card-text.d-flex.align-center.justify-center(style='height: 300px') A graph or something

  //-   .flex-1
  //-     v-toolbar.pa-0.flex-grow-0(flat color='transparent')
  //-       v-toolbar-title
  //-         h6.text-h6 Payments

  //-     v-card.soft-shadow.flex-1(outlined)
  //-       v-list
  //-         v-list-item
  //-           v-list-item-content
  //-             v-list-item-title $256.32
  //-             v-list-item-subtitle 2021-12-19
  //-           v-list-item-action
  //-             v-btn(text color='primary' icon)
  //-               v-icon(left) mdi-chevron-right

  //-     .my-4.d-flex.justify-center
  //-       v-btn(text outlined color='primary' to='payments') View more

  //- Activity timeline
  //- div
  //-   v-toolbar.pa-0.flex-grow-0(flat color='transparent')
  //-     v-toolbar-title
  //-       h6.text-h6 Your activity

    //- v-card.clock-history.soft-shadow.mt-4.align-self-center.d-flex.flex-column(
    //-   outlined
    //-   rounded='lg'
    //-   width='100%'
    //- )
    //-   div(v-if='clockHistory.length')
    //-     clock-events(:events='clockHistory')

    //-     v-card-actions.d-flex.justify-center
    //-       v-btn(text color='primary' @click='loadClockHistory' :loading='loadingHistory')
    //-         v-icon(left dark)  mdi-arrow-down 
    //-         span View {{ clockHistoryCurrentWeek }}

      .px-4(v-else-if='loadingHistory')
        v-skeleton-loader.py-2(v-for='i in 10' :key='i' type="sentences")

      v-card-text(v-else)
        | No history yet

</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import ClockEvents from '@/components/ClockEvents.vue'
import UpcomingShiftList from '@/components/UpcomingShiftList.vue'

@Component({
  metaInfo: {
    title: 'Dashboard',
  },
  components: {
    ClockEvents,
    UpcomingShiftList,
  },
})
export default class Dashboard extends Vue {

  
  // loadingHistory = false

  async mounted() {
    // this.loadClockHistory()
  }


  // get clockHistory() {
  //   return this.$store.getters.clockHistory
  // }

  // get clockHistoryCurrentWeek() {
  //   const nextOffset = this.$store.state.clock.events.historyPaginationOffset + 1
  //   const start = new Date()
  //   const end = new Date()
  //   start.setDate(start.getDate() - nextOffset * 7)
  //   end.setDate(end.getDate() - (nextOffset * 7) + 7)
  //   return `${dayjs(start).format('MMM DD')} - ${dayjs(end).format('MMM DD')}`
  // }

  // async loadClockHistory() {
  //   this.loadingHistory = true
  //   try {
  //     await clock.loadClockHistory(this.$store)
  //   }
  //   finally {
  //     this.loadingHistory = false
  //   }
  // }

}
</script>
