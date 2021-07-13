<template lang="pug">
.home
  //- Main CTA
  v-sheet
    v-container.px-10
      v-row.jumbo.d-flex.align-center
        v-col.flex-grow-1
          .my-8
            h3.text-h3.font-weight-bold.mb-2 The adaptive solution to widescale temp labor management

          div(v-if='authenticatedUser')
            v-btn.mr-3(elevation='0' color='accent', :to='{ name: defaultRoute }') Enter app
            v-btn.mr-3(outlined, color='accent', @click='signOut') Sign out

          div(v-else)
            v-btn.mr-3.black--text(elevation='0' color="accent", :to="{ name: `signUp` }") Start now
            v-btn.mr-3.black--text(outlined, color="accent", :to="{ name: `signIn` }") Sign in

          v-spacer(style='height: 70px')
        v-col.flex-grow-1.pa-0(v-if='$vuetify.breakpoint.mdAndUp' style='width: 50%')
          arrows
            

  //- Feature carousel
  v-carousel(
    v-model="carouselIndex",
    cycle,
    interval='8000',
    height='700',
    hide-delimiter-background,
    show-arrows-on-hover,
    delimiter-icon="mdi-circle-medium",
    :dark="carousel[carouselIndex].dark",
    :light="!carousel[carouselIndex].dark"
  )
    v-carousel-item(v-for='feature in carousel')
      v-sheet(:color='feature.color', :dark='feature.dark', height='100%')


        v-row.jumbo.carousel-content.flex-column.flex-md-row.jumbo.d-flex.align-center.justify-center(:class="feature.reverse ? 'flex-md-row-reverse' : ''")
          v-col.flex-grow-1
            .px-15.pt-15.pt-md-0.pb-md-10.d-flex.flex-column.justify-center.align-md-start.text-center.text-md-start
              v-icon.text-h2.mb-6 {{ feature.icon }}
              p.text-h4.font-weight-bold {{ feature.title }}
              p {{ feature.description }}

          v-col.flex-grow-1(style='width: 30')
            v-img(
              :src='require(`@/assets/images/landing/${feature.image}`)',
              :alt='feature.title'
              :style='$vuetify.breakpoint.mdAndUp ? feature.style.large : feature.style.small'
            )

  //- Calculator
  v-sheet#calculator.gradient(dark)
    v-container.py-16.px-10
      v-row
        v-col.d-flex.flex-column.justify-center(cols='12', md='6')
          h4.text-h4.font-weight-bold.mb-4 Calculate savings with Worxstr
          p With features aimed at saving your workforce time and money, we’ve created this easy to use savings calculator that can give you an estimate of the time and value provided to your organization.
        v-col(cols="12", md="6")
          p.text-h6.mb-4.pl-2 My company has:
          v-text-field.pb-4(
            v-model="calculator.managers",
            suffix="managers",
            outlined,
            color="white",
            hide-details,
            type="number",
            min="1"
            filled
          )
          v-text-field.pb-4(
            v-model="calculator.contracts",
            suffix="contracts / year",
            outlined,
            color="white",
            hide-details,
            type="number",
            min="1"
            filled
          )
          v-text-field.pb-4(
            v-model="calculator.contractors",
            suffix="contractors",
            outlined,
            color="white",
            hide-details,
            type="number",
            min="1"
            filled
          )

      v-row(cols="12", md="6")
        //- Savings estimate and helpful prompt
        v-col.d-flex.flex-column.justify-center
          .d-flex.flex-column.align-center
            p.text-h2.mb-2.font-weight-bold {{ savingsEstimate | numberFormat }}
              span.text-h6.ml-2 hours / year

            span.mb-4.text-body-2(style="opacity: 0.8") In estimated savings

            v-expand-transition
              .d-flex.align-center(v-if="calculator.promptHelpful && calculator.helpful == null")
                p.mr-2.mb-0.text-body-1.font-weight-medium.text-no-wrap Was this helpful?
                v-btn(text, color="white", @click="calculator.helpful = true") Yes
                v-btn(text, color="white", @click="calculator.helpful = false") No

        //- Feedback form
        v-col(cols="12", md="6", v-if="calculator.helpful != null")
          p.text-center.text-md-start
            span(v-if="calculator.helpful") Great! We'd love to get in touch with you about how Worxstr can help solve your management issues.
            span(v-else) We're sorry to hear that. We would love a moment to speak with you about what we could be doing differently.

          contact-form(color='white' filled text)
</template>

<script>
import { defaultRoute } from '@/definitions/User'
import { mapState, mapActions } from 'vuex'
import Arrows from '@/components/Arrows.vue'
import ContactForm from '@/components/ContactForm.vue'

let timeout

export default {
  name: 'home',
  metaInfo: {
    title: 'Worxstr',
    titleTemplate: null,
  },
  components: {
    Arrows,
    ContactForm,
  },
  computed: {
    ...mapState(['authenticatedUser']),
    savingsEstimate: function() {
      const { managers, contracts, contractors } = this.calculator
      return managers * contracts * 12 + 0.05 * (contractors / managers) * 52
    },
    defaultRoute: function() {
      return defaultRoute(this.authenticatedUser)
    },
  },
  watch: {
    savingsEstimate() {
      clearTimeout(timeout)
      timeout = setTimeout(() => (this.calculator.promptHelpful = true), 1500)
    },
  },
  methods: {
    ...mapActions(['signOut']),
  },
  data: () => ({
    calculator: {
      managers: 10,
      contracts: 15,
      contractors: 20,
      promptHelpful: false,
      helpful: null,
    },
    carouselIndex: 0,
    carousel: [
      {
        dark: true,
        color: 'indigo',
        icon: 'mdi-clock-fast',
        title: 'Scheduling',
        description:
          'Worxstr’s real time scheduling system decreases the amount of time to fill a schedule and increases transparency between the parties.',
        image: 'schedule.svg',
        style: {
          large: 'transform: rotate(-2.5deg) scale(1.5) translate(20%,15%)',
          small: 'transform: rotate(-2.5deg) scale(3.5) translatey(50px)',
        },
      },
      {
        reverse: true,
        color: 'grey lighten-2',
        icon: 'mdi-clock-check-outline',
        title: 'Time Approvals',
        description:
          'Worxstr’s live time clock feature provides verified in and out times making the time approval process more effective and less time consuming.',
        image: 'approvals.svg',
        style: {
          large: 'transform: scale(1) translate(0px,100px)',
          small: 'transform: scale(3.5) translateY(30%)',
        },
      },
      {
        dark: true,
        color: 'blue darken-3',
        icon: 'mdi-badge-account',
        title: 'Onboarding',
        description:
          'Worsxtr’s onboarding process streamlines the information gathering process to increase efficiency and decrease communication errors.',
        image: 'onboarding.svg',
        style: {
          large: 'transform: scale(1.7) translatex(20%)',
          small: 'transform: scale(6) translate(20px, 10%)',
        },
      },
      {
        dark: true,
        color: 'green',
        icon: 'mdi-cash-lock',
        title: 'Payments',
        description:
          'Worxstr’s streamlined payment system allows for flexible payment methods to contractors.',
        image: 'approvals.svg',
        style: {
          large: 'transform: scale(1) translate(0px,100px)',
          small: 'transform: scale(3.5) translateY(30%)',
        },
      },
    ],
  }),
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
