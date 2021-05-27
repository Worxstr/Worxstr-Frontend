<template lang="pug">
.home
  //- Main CTA
  v-sheet.gradient
    v-container
      v-row.jumbo.d-flex.align-center
        v-col.ma-8
          img.svg-shadow(src='@/assets/logo.svg', width='150' alt='Worxstr logo')

          .my-8
            h2.text-h2.font-weight-bold.mb-2.white--text Worxstr
            p.text-h5.font-weight-medium.white--text The adaptive solution to wide-scale temp labor management

          div(v-if='authenticatedUser')
            v-btn.mr-3(color='secondary', :to='{ name: defaultRoute }') Enter site
            v-btn.mr-3(outlined, color='secondary', @click='signOut') Sign out

          div(v-else)
            v-btn.mr-3(color='secondary', :to='{ name: `signUp` }') Start now
            v-btn.mr-3(outlined, color='secondary', :to='{ name: `signIn` }') Sign in

          v-spacer(style='height: 70px')

        v-col(v-if='$vuetify.breakpoint.mdAndUp')
          v-img(
            src='@/assets/images/landing/devices.svg',
            alt='Worxstr on mobile and web',
            :style="`transform: scale(${$vuetify.breakpoint.xl ? 1.5 : 2.5}) translate(${$vuetify.breakpoint.xl ? '3%' : '25%'}, ${$vuetify.breakpoint.xl ? '13px' : '36px'})`"
          )

  //- Feature carousel
  v-carousel(
    v-model='carouselIndex',
    cycle,
    interval='8000',
    height='700',
    hide-delimiter-background,
    show-arrows-on-hover,
    delimiter-icon='mdi-circle-medium',
    :dark='carousel[carouselIndex].dark',
    :light='!carousel[carouselIndex].dark'
  )
    v-carousel-item(v-for='feature in carousel')
      v-sheet(:color='feature.color', :dark='feature.dark', height='100%')
        .carousel-content.d-flex.flex-column.flex-md-row(
          :class="feature.reverse ? 'flex-md-row-reverse' : ''"
        )
          .px-15.pt-15.pb-10.pt-md-0.d-flex.flex-column.justify-center.align-md-start.text-center.text-md-start(
            :style='`width: ${$vuetify.breakpoint.mdAndUp ? 40 : 100}%;  : 100%`'
          )
            v-icon.text-h2.mb-6 {{ feature.icon }}
            p.text-h4.font-weight-bold {{ feature.title }}
            p {{ feature.description }}
          .flex-grow-1
            div(
              :style='$vuetify.breakpoint.mdAndUp ? feature.style.large : feature.style.small'
            )
              v-img(
                :src='require(`@/assets/images/landing/${feature.image}`)',
                :alt='feature.title'
              )

  //- Calculator
  v-sheet#calculator.gradient(dark)
    v-container.py-16.px-10
      v-row(cols='12', md='6')
        v-col.d-flex.flex-column.justify-center
          h4.text-h4.font-weight-bold.mb-4 Calculate savings with Worxstr
          p With features aimed at saving your workforce time and money, we’ve created this easy to use savings calculator that can give you an estimate of the time and value provided to your organization.
        v-col(cols='12', md='6')
          p.text-h6.mb-4.pl-2 My company has:
          v-text-field.pb-4(
            v-model='calculator.managers',
            suffix='managers',
            outlined,
            color='white',
            hide-details,
            type='number',
            min='1'
          )
          v-text-field.pb-4(
            v-model='calculator.contracts',
            suffix='contracts / year',
            outlined,
            color='white',
            hide-details,
            type='number',
            min='1'
          )
          v-text-field.pb-4(
            v-model='calculator.contractors',
            suffix='contractors',
            outlined,
            color='white',
            hide-details,
            type='number',
            min='1'
          )

      .d-flex.flex-column.align-center.mt-10
        p.text-h2.font-weight-bold {{ savingsEstimate | numberFormat }}
          span.text-h6.ml-2 hours / year
        span.text-body-2(style='opacity: 0.8') In estimated savings
</template>

<script>
import { defaultRoute } from '@/definitions/User'
import { mapState, mapActions } from 'vuex'

export default {
  name: 'home',
  metaInfo: {
    title: 'Worxstr',
    titleTemplate: null,
  },
  computed: {
    ...mapState(['authenticatedUser']),
    savingsEstimate: function () {
      const { managers, contracts, contractors } = this.calculator
      return managers * contracts * 12 + 0.05 * (contractors / managers) * 52
    },
    defaultRoute: function() {
      return defaultRoute(this.authenticatedUser)
    }
  },
  methods: {
    ...mapActions(['signOut']),
  },
  data: () => ({
    calculator: {
      managers: 10,
      contracts: 15,
      contractors: 20,
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
          large: 'transform: rotate(-2.5deg) scale(1.2) translate(100px,100px)',
          small: 'transform: rotate(-2.5deg) scale(1.2) translate(100px,50px)',
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
          small: 'transform: scale(.9) translatey(-80px)',
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
          large: 'transform: scale(1.7) translate(120px, 100px)',
          small: 'transform: scale(1.7) translatex(150px)',
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
          small: 'transform: scale(.9) translatey(-80px)',
        },
      },
    ],
  }),
}
</script>

<style lang="scss" scoped>
.jumbo {
  min-height: 50vh;
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