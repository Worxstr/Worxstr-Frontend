<template lang="pug">
.d-flex.flex-column
  v-container.d-flex.flex-column.justify-center.align-center.pa-16(fluid)
    p.text-h3.font-weight-bold.mb-15 About us

    v-row
      v-col.my-5.d-flex.flex-column.justify-start.align-center(
        cols="12",
        sm="6",
        md="4",
        v-for="member in team"
      )
        v-avatar.mb-7(size="150", elevation="15")
          img(
            :src="require(`@/assets/images/team/${member.photo}`)",
            :alt="member.name"
          )
        span.text-center.mb-1.text-h4.font-weight-bold {{ member.name }}
        span.text-center.mb-3.text-subtitle-1.font-weight-medium {{ member.title }}
        span.text-center.mb-3 {{ member.description }}

  worxstr-footer
</template>

<script>
import WorxstrFooter from "@/components/WorxstrFooter";

export default {
  name: "about",
  metaInfo: {
    title: "About us",
  },
  components: {
    WorxstrFooter,
  },
  data: () => ({
    team: [
      {
        name: "Jackson Sippe",
        title: "Co-Founder/Head of Product and Development",
        photo: "jackson.jpg",
        description:
          "Jackson Sippe is a second-generation operator of his family’s construction business with extensive experience managing contract labor. He is a software developer with experience working for a major Point-Of-Sale system provider in the retail industry. Jackson is also an MBA student at Appalachian State University with an undergraduate degree in Computer Science.",
      },
      {
        name: "James Wheeler",
        title: "Co-Founder/Head of Sales and Marketing",
        photo: "james.jpg",
        description:
          "James Wheeler is a third-generation businessman having grown up in a business family and has experience as a national accounts manager at a logistics company based in Hickory, NC. He has extensive insight into the management for gig labor through his work within the liquidation advertising industry. James is currently completing his second undergraduate degree from Appalachian State University in Computer Information Systems Management with a prior degree in Advertising and General Business.",
      },
      {
        name: "Alex Wohlbruck",
        title: "Lead frontend developer",
        photo: "alex.jpg",
        description: "uhhhhh"
      },
    ],
  }),
};
</script>