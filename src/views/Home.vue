<template lang="pug">
  .home
    v-container.jumbo.d-flex.flex-column.justify-center.align-center
      img.ma-8(src="@/assets/logo.svg" width='180')
      h2.text-h2.font-weight-bold.mb-2 Worxstr
      p.text-subtitle-2
      v-btn(v-if='authenticatedUser' @click='signOut' color='primary') Sign out
      v-btn(v-else :to="{name: 'signIn'}" color='primary') Sign in
      div(style='height: 160px;display: block')
    
    v-container.jumbo.d-flex.flex-row.justify-center.align-center
      .d-flex  
        .ma-5.d-flex.flex-column.justify-start.align-center(v-for='member in team')
          v-avatar.mb-7(size='150' :elevation='3')
            img(:src='member.photo' :alt='member.name')
          span.text-center.mb-1.text-h4 {{ member.name }}
          span.text-center.mb-3.text-h6 {{ member.title }}
          span.text-center.mb-3 {{ member.description }}

    v-footer(padless)
      v-card(falt tile width='100%' class="lighten-2 text-center")
        
        div.my-2
          v-btn(
            v-for='link in links'
            :key='link.to',
            text
            class='my-2'
            :to='link.to'
          )
            | {{ link.text }}

        //- v-card-text
        //-   v-btn.mx-4.white--text(icon)
        //-     v-icon(size='24px') mdi-facebook

        //- v-card-text.white--text.pt-0 asldkfj alskdj laskdjf kalsdjf lkasdjf lkasdjf klajsdf klasdj 
        
        v-divider

        v-card-text
          span &copy;&nbsp;
          strong Worxstr Inc.&nbsp;
          span {{ new Date().getFullYear() }} — All rights reserved

</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  name: 'home',
  metaInfo: {
    title: 'Worxstr',
    titleTemplate: null
  },
  computed: {
    ...mapState(['authenticatedUser'])
  },
  methods: {
    ...mapActions(['signOut'])
  },
  data: () => ({
    links: [{
      to: 'about',
      text: 'About us',
    }, {
      to: 'contact',
      text: 'Contact us',
    }, {
      to: 'privacyPolicy',
      text: 'Privacy policy',
    }, {
      to: 'terms',
      text: 'Terms of use',
    }],
    team: [{
      name: 'Jackson Sippe',
      title: 'Co-Founder/Head of Product and Development',
      photo: 'https://avatars.githubusercontent.com/u/33528902?s=460&u=ccb7ab8b58ec7551843df6d4d0490faecc410677&v=4',
      description: 'Jackson Sippe is a second-generation operator of his family’s construction business with extensive experience managing contract labor. He is a software developer with experience working for a major Point-Of-Sale system provider in the retail industry. Jackson is also an MBA student at Appalachian State University with an undergraduate degree in Computer Science.'
    }, {
      name: 'James Wheeler',
      title: 'Co-Founder/Head of Sales and Marketing',
      photo: 'https://cdn.vuetifyjs.com/images/john.jpg',
      description: 'James Wheeler is a third-generation businessman having grown up in a business family and has experience as a national accounts manager at a logistics company based in Hickory, NC. He has extensive insight into the management for gig labor through his work within the liquidation advertising industry. James is currently completing his second undergraduate degree from Appalachian State University in Computer Information Systems Management with a prior degree in Advertising and General Business.'
    }]
  })
}
</script>

<style lang="scss" scoped>
  .jumbo {
    height: 80vh;
  }
</style>