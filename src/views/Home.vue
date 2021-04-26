<template lang="pug">
.home
  //- Main CTA
  .gradient
    v-container
      v-row.jumbo.d-flex.align-center
        v-col.ma-8
          img.svg-shadow(src="@/assets/logo.svg", width="150")
          
          .my-8
            h2.text-h2.font-weight-bold.mb-2.white--text Worxstr
            p.text-h5.font-weight-medium.white--text The adaptive solution to wide-scale temp labor management

          div(v-if="authenticatedUser")
            v-btn.mr-2(color='amber' :to="{ name: 'schedule' }") Enter site
            v-btn.mr-2(color='amber' @click="signOut") Sign out

          div(v-else)
            v-btn.mr-2(color='amber' :to="{ name: 'signIn' }") Sign in
            v-btn.mr-2(color='amber' :to="{ name: 'signUp' }") Sign up

          v-spacer(style='height: 100px')

        v-col(v-if='$vuetify.breakpoint.mdAndUp')
          p {{carouselIndex}}

  //- Feature carousel
  v-carousel(
    v-model='carouselIndex'
    cycle,
    interval="80000",
    height="700",
    hide-delimiter-background,
    show-arrows-on-hover,
    delimiter-icon="mdi-circle-medium"
    :dark='carousel[carouselIndex].dark'
    :light='!carousel[carouselIndex].dark'
  )
    v-carousel-item(v-for="feature in carousel")
      v-sheet(:color="feature.color", :dark="feature.dark", height="100%")
        .carousel-content.d-flex.flex-column.flex-md-row(
          :class="feature.reverse ? 'flex-md-row-reverse' : ''"
        )
          .px-15.pt-15.pb-10.pt-md-0.d-flex.flex-column.justify-center.align-md-start.text-center.text-md-start(
            :style="`width: ${$vuetify.breakpoint.mdAndUp ? 40 : 100}%;  : 100%`"
          )
            v-icon.text-h2.mb-6 {{ feature.icon }}
            p.text-h4.font-weight-bold {{ feature.title }}
            p {{ feature.description }}
          .flex-grow-1
            div(:style="$vuetify.breakpoint.mdAndUp ? feature.style.large : feature.style.small")
              v-img(
                :src="require(`@/assets/images/landing/${feature.image}`)",
                :alt="feature.title"
              )

  //- Calculator
  v-container
    p.text-center.ma-10 Calculator here
</template>

<script>
import { mapState, mapActions } from "vuex";

export default {
  name: "home",
  metaInfo: {
    title: "Worxstr",
    titleTemplate: null,
  },
  computed: {
    ...mapState(["authenticatedUser"]),
  },
  methods: {
    ...mapActions(["signOut"]),
  },
  data: () => ({
    carouselIndex: 0,
    carousel: [
      {
        dark: true,
        color: "indigo",
        icon: "mdi-clock-fast",
        title: "Scheduling",
        description:
          "Worxstr’s real time scheduling system decreases the amount of time to fill a schedule and increases transparency between the parties.",
        image: "schedule.svg",
        style: {
          large: "transform: rotate(-2.5deg) scale(1.2) translate(100px,100px)",
          small: "transform: rotate(-2.5deg) scale(1.2) translate(100px,50px)",
        },
      },
      {
        reverse: true,
        color: "grey lighten-2",
        icon: "mdi-clock-check-outline",
        title: "Time Approvals",
        description:
          "Worxstr’s live time clock feature provides verified in and out times making the time approval process more effective and less time consuming.",
        image: "approvals.svg",
        style: {
          large: "transform: scale(1) translate(0px,100px)",
          small: "transform: scale(.9) translatey(-80px)",
        },
      },
      {
        dark: true,
        color: "blue darken-3",
        icon: "mdi-badge-account",
        title: "Onboarding",
        description:
          "Worsxtr’s onboarding process streamlines the information gathering process to increase efficiency and decrease communication errors.",
        image: "onboarding.svg",
        style: {
          large: "transform: scale(1.7) translate(120px, 100px)",
          small: "transform: scale(1.7) translatex(150px)",
        },
      },
      {
        color: "green lighten-2",
        icon: "mdi-cash-lock",
        title: "Payments",
        description:
          "Worxstr’s streamlined payment system allows for flexible payment methods to contractors.",
        image: "approvals.svg",
        style: {
          large: "transform: scale(1) translate(0px,100px)",
          small: "transform: scale(.9) translatey(-80px)",
        },
      },
    ],
  }),
};
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