<template lang="pug">
.d-flex.flex-column

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
          v-btn(v-for='social in selectedMember.socials', icon :href='social.link' target="_blank")
            v-icon(size='24px') {{ social.icon }}

  v-container.d-flex.flex-column.justify-center.align-stretch.px-16.pt-8.text-center(fluid)
    p.text-h4.font-weight-bold Our team

    v-row
      v-col(
        cols="12",
        sm="6",
        md="4",
        lg="3"
        xl='2'
        v-for="member in team"
      )
        v-card(rounded='lg' outlined @click='viewMember(member)')
          v-card-text.pa-4.d-flex.flex-column.justify-start.align-center
            v-avatar.mb-7(size="120", elevation="15")
              img(
                :src="require(`@/assets/images/team/${member.photo}`)",
                :alt="member.name"
              )
            span.text-center.mb-1.text-h5.font-weight-bold {{ member.name }}
            span.text-center.text-subtitle-2.font-weight-medium {{ member.title }}

</template>

<script>

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
  data: () => ({
    memberDialog: false,
    selectedMember: null,
    team: [
      {
        name: "Jackson Sippe",
        title: "Co-Founder/Head of Product and Development",
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
        title: "Co-Founder/Head of Sales and Marketing",
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
        title: "Lead frontend developer",
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
        title: "Lead backend developer & DevOps engineer",
        photo: 'andrew.jpg',
        description: "Andrew is a genius",
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
      }
    ],
  }),
};
</script>

<style lang="scss">
  .text-block {
    text-align: justify !important;
  }
</style>