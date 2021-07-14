<template lang="pug">
.d-flex.flex-column

  //- What is Worxstr?
  v-sheet
    v-container.d-flex.flex-column.justify-center.align-center.pa-16
      h3.text-h3.font-weight-black.mb-15 What is Worxstr?

      p The Worxstr management platform was built to address the specific challenges of the temporary labor management industry by people who have operated within it. The platform provides structure and consistency to traditionally disparate and inefficient systems. Every step and process laid out in the platform has been designed with efficiency in mind. The goal of the platform is to make managers more productive and boost labor retention.
      p Time is money. Using the Worxstr platform, the average manager will be able to cut down the time consumed by each task by at least one third, based on conservative time calculations. The increase in manager productivity will enable greater accuracy and increased bandwidth. A 33 percent increase in productivity will reduce expenses, increase efficiency, speed up processes, boost retention, and streamline reporting.


  //- Our mission/vision
  v-container.justify-center.align-center.pa-16.gradient-primary.text-center(fluid)
    v-row
      v-col(cols="12", md="6")
        v-icon.white--text.text-h2.mb-6 mdi-rocket-launch
        p.text-h4.font-weight-black.white--text Our mission
        p.white--text At Worxstr our mission is to drive efficiency, consistency, and respect into the management systems for gig labor.

      v-col(cols="12", md="6")
        v-icon.white--text.text-h2.mb-6 mdi-eye-outline
        p.text-h4.font-weight-black.white--text Our vision
        p.white--text At Worxstr we aspire to transform the gig labor industry by providing financial stability, transparency, and accountability through a management platform that will drive tomorrow's economy. At Worxstr we believe that every working American deserves the freedom that comes from opportunity and possibility.

  //- Team
  v-sheet
    v-container.d-flex.flex-column.justify-center.align-stretch.px-16.py-16.text-center(fluid style='position: relative; z-index: 1')
      h3.text-h3.font-weight-black.mb-10 Our team

      v-row
        v-col(
          cols="12",
          sm="6",
          md="4",
          lg="3"
          xl='2'
          v-for="member in team"
        )
          v-card.soft-shadow(rounded='lg' outlined @click='viewMember(member)')
            v-card-text.pa-4.d-flex.flex-column.justify-start.align-center
              v-avatar.mb-7(size="120", elevation="15")
                img(
                  :src="require(`@/assets/images/team/${member.photo}`)",
                  :alt="member.name"
                )
              span.text-center.mb-1.text-h5.font-weight-bold {{ member.name }}
              span.text-center.font-weight-medium {{ member.title }}

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
            :src="require(`@/assets/images/team/${selectedMember.photo}`)",
            :alt="selectedMember.name"
          )
        span.text-center.mb-1.text-h5.font-weight-bold {{ selectedMember.name }}
        span.text-center.mb-3.text-subtitle-1.font-weight-medium {{ selectedMember.title }}
        span.text-center.mb-3 {{ selectedMember.description }}
        .mb-3
          v-btn(v-for='social in selectedMember.socials', icon :href='social.link' target="_blank" rel="noreferrer")
            v-icon(size='24px') {{ social.icon }}
  
  arrows(type='smallGroup' style='position: absolute; bottom: 0; right: 0')

</template>

<script>
import Arrows from '@/components/Arrows.vue'

export default {
  name: "about",
  metaInfo: {
    title: "About us",
  },
  methods: {
    viewMember(member) {
      this.memberDialog = true
      this.selectedMember = member;
    }
  },
  components: {
    Arrows
  },
  data: () => ({
    memberDialog: false,
    selectedMember: null,
    team: [
      {
        name: "Jackson Sippe",
        title: "Co-Founder / Head of Product and Development",
        photo: "jackson.jpg",
        description: "Jackson Sippe is a second-generation operator of his family’s construction business with extensive experience managing contract labor. He is a software developer with experience working for a major Point-Of-Sale system provider in the retail industry. Jackson is also an MBA student at Appalachian State University with an undergraduate degree in Computer Science.",
        socials: [
          {
            link: 'mailto:jackson@worxstr.com',
            icon: 'mdi-at'
          },
          {
            link: 'https://github.com/sippejw',
            icon: 'mdi-github',
          },
          {
            link: 'https://www.linkedin.com/in/jackson-sippe-628392159/',
            icon: 'mdi-linkedin'
          },
        ]
      },
      {
        name: "James Wheeler",
        title: "Co-Founder / Head of Sales and Marketing",
        photo: "james.jpg",
        description: "James Wheeler is a third-generation businessman having grown up in a business family and has experience as a national accounts manager at a logistics company based in Hickory, NC. He has extensive insight into the management for gig labor through his work within the liquidation advertising industry. James is currently completing his second undergraduate degree from Appalachian State University in Computer Information Systems Management with a prior degree in Advertising and General Business.",
        socials: [
          {
            link: 'mailto:james@worxstr.com',
            icon: 'mdi-at'
          },
          {
            link: 'https://www.linkedin.com/in/jameswheeler94/',
            icon: 'mdi-linkedin'
          },
        ]
      },
      {
        name: "Alex Wohlbruck",
        title: "Lead Frontend Developer",
        photo: "alex.jpg",
        description: "Alex Wohlbruck is a web developer at heart and has experience doing contract work for various organizations. He loves cats, and he is an undergrad student at Appalachian State University, studying for a B.S. in computer science.",
        socials: [
          {
            link: 'mailto:alexwohlbruck@gmail.com',
            icon: 'mdi-at'
          },
          {
            link: 'https://github.com/alexwohlbruck',
            icon: 'mdi-github',
          },
          {
            link: 'https://www.linkedin.com/in/alexwohlbruck/',
            icon: 'mdi-linkedin'
          },
        ]
      },
      {
        name: 'Andrew Thorp',
        title: "Lead Backend Developer / DevOps engineer",
        photo: 'andrew.jpg',
        socials: [
          {
            link: 'https://github.com/aThorp96',
            icon: 'mdi-github',
          },
          {
            link: 'https://www.linkedin.com/in/aThorp96',
            icon: 'mdi-linkedin'
          },
        ]
      },
      {
        name: 'Coley Lippard',
        title: "Creative Marketing Director",
        photo: 'coley.jpg',
        description: "Coley Lippard has grown from a unique history of forward-thinking individuals that push the envelope of normalcy. As the son of a variety entertainer, his creativity has lead to a career in design and marketing with a fresh perspective and an eye on sustainable results. He is a recent Digital Marketing and Computer Information Service graduate at Appalachian State University and is currently guiding the creative direction of several businesses.",
        socials: [
          {
            link: 'mailto:coleylipp237@gmail.com',
            icon: 'mdi-at',
          },
          {
            link: 'https://www.linkedin.com/in/coleylipp',
            icon: 'mdi-linkedin'
          },
        ]
      },
      {
        name: 'Victoria DiMarco',
        title: "Lead UI/UX designer",
        photo: 'victoria.jpg',
        socials: [
          {
            link: 'mailto:victoriadimarco99@gmail.com',
            icon: 'mdi-at',
          },
          {
            link: 'https://www.linkedin.com/in/victoriadimarco',
            icon: 'mdi-linkedin'
          },
          {
            link: 'https://www.instagram.com/designdimarco',
            icon: 'mdi-instagram'
          },
        ]
      },
    ],
  }),
};
</script>

<style lang="scss">
  .text-block {
    text-align: justify !important;
  }
</style>