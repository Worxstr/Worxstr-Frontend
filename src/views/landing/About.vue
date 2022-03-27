<template lang="pug">
.d-flex.flex-column

  //- What is Worxstr?
  v-sheet
    .pa-8.pa-md-16.d-flex.flex-column.justify-center.align-center
      h3.text-h3.font-weight-black.mb-15 What is Worxstr?

      p The Worxstr management platform was built to address the specific challenges of the temporary labor management industry by people who have operated within it. The platform provides structure and consistency to traditionally disparate and inefficient systems. Every step and process laid out in the platform has been designed with efficiency in mind. The goal of the platform is to make managers more productive and boost labor retention.
      p Time is money. Using the Worxstr platform, the average manager will be able to cut down the time consumed by each task by at least one third, based on conservative time calculations. The increase in manager productivity will enable greater accuracy and increased bandwidth. A 33% increase in productivity will reduce expenses, increase efficiency, speed up processes, boost retention, and streamline reporting.

      v-btn(
        v-if='!me'
        :to="{ name: 'contact', params: {option: 'demo'}}"
        class="mr-3"
        outlined
        color='primary'
        large
      )
        span Schedule in-person demo

      .demo-video(:class='{small: $vuetify.breakpoint.smAndDown}')
        iframe.mt-5(
          width='100%'
          height='100%'
          src='https://www.youtube.com/embed/0M7xGxuE2iI'
          title='YouTube video player'
          frameborder='0'
          allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
          allowfullscreen=''
        )


  //- Our mission/vision
  .pa-8.pa-md-16.justify-center.align-center.gradient-primary.text-center(fluid)
    v-row
      v-col(cols="12", md="6")
        v-icon.white--text.text-h2.mb-6 mdi-rocket-launch
        p.text-h4.font-weight-black.white--text Our mission
        p.white--text At Worxstr our mission is to drive efficiency, consistency, and respect into the management systems for gig labor.

      v-col(cols="12", md="6")
        v-icon.white--text.text-h2.mb-6 mdi-eye-outline
        p.text-h4.font-weight-black.white--text Our vision
        p.white--text We aspire to transform the gig labor industry by providing financial stability, transparency, and accountability through a management platform that will drive tomorrow's economy. We believe that every working American deserves the freedom that comes from opportunity and possibility.

  //- Team
  v-sheet
    .pa-8.pa-md-16.d-flex.flex-column.justify-center.align-stretch.text-center(fluid style='position: relative; z-index: 1')
      h3.text-h3.font-weight-black.mb-10 Our team

      v-row
        v-col(
          cols="12",
          sm="6",
          md="4",
          lg="3"
          xl='2'
          v-for="member in team"
          :key='member.id'
        )
          v-card.soft-shadow(rounded='lg' outlined @click='viewMember(member)')
            v-card-text.pa-4.d-flex.flex-column.justify-start.align-center
              v-avatar.mb-7(size="120", elevation="15")
                img(
                  :src='member.attributes.photo.data.attributes.url'
                  :alt="member.name"
                )
              span.text-center.mb-1.text-h5.font-weight-bold {{ member.attributes.name }}
              span.text-center.font-weight-medium {{ member.attributes.title }}

  //- Member dialog
  v-dialog(v-model='memberDialog' max-width='500')
    v-card(v-if='selectedMember' rounded='lg' outlined)
      v-toolbar(flat)
        v-spacer
        v-btn(icon @click='memberDialog = false')
          v-icon mdi-close

      v-card-text.pa-4.d-flex.flex-column.justify-start.align-center
        v-avatar.mb-7(size="180", elevation="15")
          img(
            :src='selectedMember.attributes.photo.data.attributes.url',
            :alt="selectedMember.name"
          )
        span.text-center.mb-1.text-h5.font-weight-bold {{ selectedMember.attributes.name }}
        span.text-center.mb-3.text-subtitle-1.font-weight-medium {{ selectedMember.attributes.title }}
        span.text-center.mb-3 {{ selectedMember.attributes.about }}
        .mb-3
          v-btn(v-for='social in selectedMember.attributes.socials' :key='social.id' icon :href='social.url' target="_blank" rel="noreferrer")
            v-icon(size='24px') {{ social.icon }}
  
  arrows(type='smallGroup' style='position: absolute; bottom: 0; right: 0')

</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import Arrows from '@/components/Arrows.vue'
import { getTeamMembers } from '@/services/cms'

@Component({
  metaInfo: {
    title: 'About us',
  },
  components: {
    Arrows,
  },
})
export default class About extends Vue {

  team: any[] = []

  async mounted() {
    this.team = await getTeamMembers()
  }

  memberDialog = false
  selectedMember = null
  
  viewMember(member: any) {
    this.memberDialog = true
    this.selectedMember = member;
  }
}
</script>

<style lang="scss">
  .text-block {
    text-align: justify !important;
  }

  .demo-video {
    position: relative;
    width: 70%;
    padding-bottom: 39.5%;

    iframe {
      width:100%;
      height:100%;
      position:absolute;
      left:0px;
      top:0px;
    }

    &.small {
      width: 100%;
      padding-bottom: 56.25%;
    }
  }
</style>
