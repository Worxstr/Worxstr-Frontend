<template lang="pug">
.home
  //- Main CTA
  v-container.jumbo.d-flex.flex-column.justify-center.align-center.gradient(
    fluid
    color="primary lighten-1"
  )
    img.ma-8.shadow(src="@/assets/logo.svg", width="180")
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

  //- Our mission
  v-container.d-flex.flex-column.justify-center.align-center.pa-16.gradient(fluid)
    p.text-h3.font-weight-bold.mb-15.white--text Our mission

    p.white--text At Worxstr our mission is to drive efficiency, consistency, and respect into the management systems for gig labor.

  //- Our vision
  v-container.d-flex.flex-column.justify-center.align-center.pa-16
    p.text-h3.font-weight-bold.mb-15 Our vision

    p At Worxstr we aspire to transform the gig labor industry by providing financial stability, transparency, and accountability through a management platform that will drive tomorrow's economy. At Worxstr we believe that every working American deserves the freedom that comes from opportunity and possibility.

  //- About us
  v-container.d-flex.flex-column.justify-center.align-center.pa-16.gradient(fluid)
    p.text-h3.font-weight-bold.mb-15.white--text About us

    .d-flex.flex-column.flex-sm-row
      .my-5.mx-10.d-flex.flex-column.justify-start.align-center(
        v-for="member in team"
      )
        v-avatar.mb-7(size="150", :elevation="3")
          img(:src="member.photo", :alt="member.name")
        span.text-center.mb-1.white--text.text-h4.font-weight-bold {{ member.name }}
        span.text-center.mb-3.white--text.text-subtitle-1.font-weight-medium {{ member.title }}
        span.text-center.mb-3.white--text {{ member.description }}

  //- Footer
  v-footer(padless)
    v-card.lighten-2.text-center(flat, tile, width="100%")
      .my-2
        v-btn.my-2(v-for="link in links", :key="link.to", text, :to="link.to")
          | {{ link.text }}

      .mb-3
        v-btn(v-for="link in social", icon)
          v-icon(size="24px") {{ link.icon }}

      v-card-text.pt-0 Some additional info can go here

      v-divider

      v-card-text
        span &copy;&nbsp;
        strong Worxstr Inc.&nbsp;
        span {{ new Date().getFullYear() }} — All rights reserved
        br
        span.text-caption
          | Site design by&nbsp;
          a(href='https://www.linkedin.com/in/alexwohlbruck/' target='_blank') Alex Wohlbruck
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
    links: [
      {
        to: "contact",
        text: "Contact us",
      },
      {
        to: "privacyPolicy",
        text: "Privacy policy",
      },
      {
        to: "terms",
        text: "Terms of use",
      },
    ],
    team: [
      {
        name: "Jackson Sippe",
        title: "Co-Founder/Head of Product and Development",
        photo:
          "https://avatars.githubusercontent.com/u/33528902?s=460&u=ccb7ab8b58ec7551843df6d4d0490faecc410677&v=4",
        description:
          "Jackson Sippe is a second-generation operator of his family’s construction business with extensive experience managing contract labor. He is a software developer with experience working for a major Point-Of-Sale system provider in the retail industry. Jackson is also an MBA student at Appalachian State University with an undergraduate degree in Computer Science.",
      },
      {
        name: "James Wheeler",
        title: "Co-Founder/Head of Sales and Marketing",
        photo: "https://cdn.vuetifyjs.com/images/john.jpg",
        description:
          "James Wheeler is a third-generation businessman having grown up in a business family and has experience as a national accounts manager at a logistics company based in Hickory, NC. He has extensive insight into the management for gig labor through his work within the liquidation advertising industry. James is currently completing his second undergraduate degree from Appalachian State University in Computer Information Systems Management with a prior degree in Advertising and General Business.",
      }
    ],
    social: [
      {
        icon: "mdi-facebook",
        url: "",
      },
      {
        icon: "mdi-instagram",
        url: "",
      },
      {
        icon: "mdi-twitter",
        url: "",
      },
      {
        icon: "mdi-linkedin",
        url: "",
      },
    ],
  }),
};
</script>

<style lang="scss" scoped>
.jumbo {
  min-height: 80vh;
}
.shadow {
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