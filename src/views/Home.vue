<template lang="pug">
.home
  //- Main CTA
  v-container.jumbo.d-flex.flex-column.justify-center.align-center.gradient(
    fluid
    color="primary lighten-1"
  )
    img.ma-8.svg-shadow(src="@/assets/logo.svg", width="180")
    h2.text-h2.font-weight-bold.mb-2.white--text Worxstr
    p.text-subtitle-2
    v-btn(v-if="authenticatedUser", @click="signOut", color="white") Sign out
    v-btn(v-else, :to="{ name: 'signIn' }", color="white") Sign in
    div(style="height: 160px; display: block")

  //- What is Worxstr?
  v-container.d-flex.flex-column.justify-center.align-center.pa-16
    p.text-h3.font-weight-bold.mb-15 What is Worxstr?

    p The Worxstr management platform was built to address the specific challenges of the temporary labor management industry by people who have operated within it. The platform provides structure and consistency to traditionally disparate and inefficient systems. Every step and process laid out in the platform has been designed with efficiency in mind. The goal of the platform is to make managers more productive and boost labor retention.
    p Time is money. Using the Worxstr platform, the average manager will be able to cut down the time consumed by each task by at least one third, based on conservative time calculations. The increase in manager productivity will enable greater accuracy and increased bandwidth. A 33 percent increase in productivity will reduce expenses, increase efficiency, speed up processes, boost retention, and streamline reporting.

  //- Our mission/vision
  v-container.justify-center.align-center.pa-16.gradient.text-center(fluid)
    v-row
      v-col(cols='12' md='6')
        v-icon.white--text.text-h2.mb-6 mdi-rocket-launch
        p.text-h3.font-weight-bold.white--text Our mission
        p.white--text At Worxstr our mission is to drive efficiency, consistency, and respect into the management systems for gig labor.

      v-col(cols='12' md='6')
        v-icon.white--text.text-h2.mb-6 mdi-eye-outline
        p.text-h3.font-weight-bold.white--text Our vision
        p.white--text At Worxstr we aspire to transform the gig labor industry by providing financial stability, transparency, and accountability through a management platform that will drive tomorrow's economy. At Worxstr we believe that every working American deserves the freedom that comes from opportunity and possibility.

  worxstr-footer
  
</template>

<script>
import { mapState, mapActions } from "vuex";
import WorxstrFooter from '@/components/WorxstrFooter'

console.log(WorxstrFooter)

export default {
  name: "home",
  metaInfo: {
    title: "Worxstr",
    titleTemplate: null,
  },
  components: {
    WorxstrFooter
  },
  computed: {
    ...mapState(["authenticatedUser"]),
  },
  methods: {
    ...mapActions(["signOut"]),
  }
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
</style>