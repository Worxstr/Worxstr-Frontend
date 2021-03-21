<template lang="pug">
v-container.d-flex.flex-column.justify-center.align-center.pa-16(fluid)
  p.text-h3.font-weight-bold.mb-15 About us

  v-row
    v-col.my-5.d-flex.flex-column.justify-start.align-center(
      cols="12",
      md="6",
      v-for="member in team"
    )
      v-avatar.mb-7(size="150", elevation="15")
        img(:src="member.photo", :alt="member.name")
      span.text-center.mb-1.text-h4.font-weight-bold {{ member.name }}
      span.text-center.mb-3.text-subtitle-1.font-weight-medium {{ member.title }}
      span.text-center.mb-3 {{ member.description }}
</template>

<script>
export default {
  name: "about",
  metaInfo: {
    title: 'About us'
  },
  data: () => ({
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
      },
    ],
  }),
};
</script>