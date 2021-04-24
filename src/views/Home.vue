<template lang="pug">
.home
  //- Main CTA
  v-container.jumbo.d-flex.flex-column.justify-center.align-center.gradient(
    fluid,
    color="primary lighten-1"
  )
    img.ma-8.svg-shadow(src="@/assets/logo.svg", width="180")
    h2.text-h2.font-weight-bold.mb-2.white--text Worxstr
    p.text-subtitle-2

    div(v-if="authenticatedUser")
      v-btn.mx-2(:to="{ name: 'schedule' }") Enter site
      v-btn.mx-2(@click="signOut") Sign out
    v-btn.mx-2(v-else, :to="{ name: 'signIn' }") Sign in

    div(style="height: 160px; display: block")

  //- What is Worxstr?
  v-container.d-flex.flex-column.justify-center.align-center.pa-16
    p.text-h4.font-weight-bold.mb-15 What is Worxstr?

    p The Worxstr management platform was built to address the specific challenges of the temporary labor management industry by people who have operated within it. The platform provides structure and consistency to traditionally disparate and inefficient systems. Every step and process laid out in the platform has been designed with efficiency in mind. The goal of the platform is to make managers more productive and boost labor retention.
    p Time is money. Using the Worxstr platform, the average manager will be able to cut down the time consumed by each task by at least one third, based on conservative time calculations. The increase in manager productivity will enable greater accuracy and increased bandwidth. A 33 percent increase in productivity will reduce expenses, increase efficiency, speed up processes, boost retention, and streamline reporting.

  //- Feature carousel
  v-carousel(
    cycle,
    interval="80000",
    height="700",
    hide-delimiter-background,
    show-arrows-on-hover,
    delimiter-icon="mdi-circle-medium",
    :dark="false",
    :light="true"
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

  //- Our mission/vision
  v-container.justify-center.align-center.pa-16.gradient.text-center(fluid)
    v-row
      v-col(cols="12", md="6")
        v-icon.white--text.text-h2.mb-6 mdi-rocket-launch
        p.text-h4.font-weight-bold.white--text Our mission
        p.white--text At Worxstr our mission is to drive efficiency, consistency, and respect into the management systems for gig labor.

      v-col(cols="12", md="6")
        v-icon.white--text.text-h2.mb-6 mdi-eye-outline
        p.text-h4.font-weight-bold.white--text Our vision
        p.white--text At Worxstr we aspire to transform the gig labor industry by providing financial stability, transparency, and accountability through a management platform that will drive tomorrow's economy. At Worxstr we believe that every working American deserves the freedom that comes from opportunity and possibility.
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
  min-height: 80vh;
}
.svg-shadow {
  -webkit-filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.3));
  filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.3));
}
.gradient {
  background: rgb(46, 106, 239);
  background: linear-gradient(
    50deg,
    rgba(46, 106, 239, 1) 0%,
    rgba(46, 170, 230, 1) 100%
  );
}
.carousel-content {
  margin: 0 auto;
  height: 100%;
  max-width: 1500px;
}
</style>