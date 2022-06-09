<template lang="pug">
.home
  //- Main CTA
  v-sheet.arrow-container
    arrows(type='background' style='position: absolute')
    
    v-container.px-10(:class="{'mt-9': $vuetify.breakpoint.smAndUp}")
      v-row.jumbo.d-flex.align-center
        v-col.flex-grow-1
          .my-8
            h3.text-h3.text-md-h2.font-weight-black.mb-2
              | The&nbsp;
              span.gradient-text(:class="$vuetify.theme.dark ? 'gradient-secondary' : 'gradient-tertiary'") adaptive
              | &nbsp;solution to contract labor management

            h6.text-h6 Schedule, track, and pay contractors with ease.

          div(v-if='me')
            v-btn.mr-3.black--text(
              elevation='0'
              color='accent'
              :to='{ name: defaultRoute }'
              large
            ) Enter app

            v-btn.mr-3(
              outlined
              color='accent'
              @click='signOut'
              large
            )
              span(:class="`${$vuetify.theme.dark ? 'white' : 'black'}--text`") Sign out

          div(v-else)
            v-btn.mr-3.black--text(
              elevation='0'
              color="accent"
              :to="{ name: `signUp` }"
              large
            ) Start now

            v-btn.mr-3(
              outlined
              color="accent"
              :to="{ name: `signIn` }"
              large
            )
              span(:class="`${$vuetify.theme.dark ? 'white' : 'black'}--text`") Sign in


            //- p.mb-0.mr-2.font-weight-medium Get the app:
            //- v-btn(
            //-   icon
            //-   href='https://apps.apple.com/us/app/worxstr/id1571853545'
            //-   target='_blank'
            //- )
            //-   v-icon mdi-apple

            //- v-btn(
            //-   icon
            //-   href='https://play.google.com/store/apps/details?id=com.worxstr.worxstr'
            //-   target='_blank'
            //- )
            //-   v-icon mdi-google-play

          v-spacer(style='height: 70px')

        v-col.flex-grow-1.pa-0(v-if='$vuetify.breakpoint.mdAndUp' style='width: 50%')
          arrows(type='largeGroup')
            

  //- Feature carousel
  v-carousel(
    v-model='carouselIndex'
    cycle
    interval='8000'
    height='700'
    hide-delimiter-background
    show-arrows-on-hover
    delimiter-icon='mdi-circle-medium'
    :dark='true'
  )
    v-carousel-item(v-for='(feature, i) in carousel' :key='i')
      v-sheet(:dark='feature.dark', height='100%' :class='`gradient-${feature.gradient}`')

        v-row.jumbo.carousel-content.flex-column.flex-md-row.jumbo.d-flex.align-center.justify-center(:class="feature.reverse ? 'flex-md-row-reverse' : ''")
          v-col.flex-grow-1
            .px-12.pt-15.pt-md-0.pb-md-10.d-flex.flex-column.justify-center.align-md-start.text-center.text-md-start
              .d-flex.flex-column.flex-sm-row.justify-center
                v-icon.text-h2 {{ feature.icon }}
                h3.text-h3.font-weight-black.ma-4 {{ feature.title }}
              p {{ feature.description }}

              v-btn.white--text(
                v-if='feature.featureId'
                :to="{ name: 'feature', params: { contentId: feature.featureId } }"
                color='accent'
                outlined
              )
                span Learn more

          v-col.flex-grow-1(style='width: 30%')
            v-img(
              :src='require(`@/assets/images/landing/${feature.image}`)',
              :alt='feature.title'
              :style='$vuetify.breakpoint.mdAndUp ? feature.style.md : feature.style.xs'
            )

  //- Calculator
  v-sheet.arrow-container#calculator

    arrows(style='position: absolute' type='background-accent')

    v-container.py-16.px-10
      v-row
        v-col.d-flex.flex-column.justify-center(cols='12', md='6')
          h4.text-h4.font-weight-black.mb-4 Calculate savings with Worxstr
          p With features aimed at saving your workforce time and money, we’ve created this easy to use savings calculator that can give you an estimate of the time and value provided to your organization.
        v-col(cols="12", md="6")
          p.text-h6.mb-4.pl-2 My company has:
          v-text-field.pb-4(
            v-model.number="calculator.managers"
            suffix="managers"
            outlined
            color="accent"
            hide-details
            type="number"
            pattern="\d*"
            min="1"
            filled
          )
          v-text-field.pb-4(
            v-model.number="calculator.contracts"
            suffix="contracts / year"
            outlined
            color="accent"
            hide-details
            type="number"
            pattern="\d*"
            min="1"
            filled
          )
          v-text-field.pb-4(
            v-model.number="calculator.contractors"
            suffix="contractors"
            outlined
            color="accent"
            hide-details
            type="number"
            pattern="\d*"
            min="1"
            filled
          )

      v-row(cols="12", md="6")
        //- Savings estimate and helpful prompt
        v-col.d-flex.flex-column.justify-center
          .d-flex.flex-column.align-center
            p.text-h2.mb-2.font-weight-black {{ savingsEstimate | numberFormat }}
              span.text-h6.ml-2 hours / year

            span.mb-4.text-body-2(style="opacity: 0.8") In estimated savings

            v-expand-transition
              .d-flex.align-center(v-if="calculator.promptHelpful && calculator.helpful == null")
                p.mr-2.mb-0.text-body-1.font-weight-medium.text-no-wrap Was this helpful?
                v-btn(text @click="calculator.helpful = true") Yes
                v-btn(text @click="calculator.helpful = false") No

        //- Feedback form
        v-col(cols="12", md="6", v-if="calculator.helpful != null")
          p.text-center.text-md-start
            span(v-if="calculator.helpful") Great! We'd love to get in touch with you about how Worxstr can help solve your management issues.
            span(v-else) We're sorry to hear that. We would love a moment to speak with you about what we could be doing differently.

          contact-form(
            color='accent'
            filled
            text
            :data-supplement='{num_contractors: this.calculator.contractors, num_managers: this.calculator.managers}'
            :show-manager-contractor-fields='false'
            type='sales'
          )
</template>

<script>
import { Component, Vue, Watch } from 'vue-property-decorator'
import { defaultRoute } from '@/types/Users'
import Arrows from '@/components/Arrows.vue'
import ContactForm from '@/components/ContactForm.vue'
import { signOut } from '@/services/auth'

let timeout

@Component({
  metaInfo: {
    title: 'Worxstr',
    titleTemplate: null,
  },
  components: {
    Arrows,
    ContactForm,
  },
})
export default class Home extends Vue {

  calculator = {
    managers: 10,
    contracts: 15,
    contractors: 20,
    promptHelpful: false,
    helpful: null,
  }
  
  carouselIndex = 0

  carousel = [
    {
      gradient: 'primary',
      icon: 'mdi-clock-fast',
      title: 'Scheduling',
      featureId: 'scheduling',
      description:
        'Worxstr’s real time scheduling system decreases the amount of time to fill a schedule and increases transparency between the parties.',
      image: 'schedule.svg',
      style: {
        md: 'transform: rotate(-2.5deg) scale(1.5) translate(20%,15%)',
        xs: 'transform: rotate(-2.5deg) scale(3.5) translateY(50px)',
      },
    },
    // TODO: Create "communication" graphic
    // {
    //   reverse: true,
    //   gradient: 'tertiary',
    //   icon: 'mdi-clock-check-outline',
    //   title: 'Communication',
    //   description:
    //     'Worxstr’s live time clock feature provides verified in and out times making the time approval process more effective and less time consuming.',
    //   image: 'approvals.svg',
    //   style: {
    //     md: 'transform: scale(1) translate(0px,100px)',
    //     xs: 'transform: scale(3.5) translateY(30%)',
    //   },
    // },
    {
      gradient: 'tertiary',
      icon: 'mdi-badge-account',
      title: 'Onboarding',
      description:
        'Worsxtr’s onboarding process streamlines the information gathering process to increase efficiency and decrease communication errors.',
      image: 'onboarding.svg',
      style: {
        md: 'transform: scale(1.7) translatex(20%)',
        xs: 'transform: scale(6) translate(20px, 10%)',
      },
    },
    {
      gradient: 'secondary',
      icon: 'mdi-cash-lock',
      title: 'Payments',
      featureId: 'payments',
      description:
        'Worxstr’s streamlined payment system allows for flexible payment methods to contractors.',
      image: 'approvals.svg',
      style: {
        md: 'transform: scale(1) translate(0px,100px)',
        xs: 'transform: scale(3.5) translateY(30%)',
      },
    },
  ]

  get me() {
    return this.$store.getters.me
  }

  get savingsEstimate() {
    const { managers, contracts, contractors } = this.calculator
    return managers * contracts * 12 + 0.05 * (contractors / managers) * 52
  }
  
  get defaultRoute() {
    return defaultRoute(this.me)
  }

  @Watch('savingsEstimate')
  savingsEstimateChanged() {
    clearTimeout(timeout)
    timeout = setTimeout(() => (this.calculator.promptHelpful = true), 1500)
  }

  signOut() {
    signOut(this.$store)
  }
}
</script>

<style lang="scss" scoped>
.jumbo {
  min-height: 50vh;
  width: 100%;
}
.svg-shadow {
  -webkit-filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.3));
  filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.3));
}
.carousel-content {
  margin: 0 auto;
  height: 100%;
  max-width: 1500px;
}
</style>
