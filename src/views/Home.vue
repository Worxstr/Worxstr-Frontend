<template lang="pug">
  .home
    v-container.fill-height.d-flex.flex-column.justify-center.align-center
      img.ma-8(src="@/assets/logo.svg" width='180')
      h2.text-h2.font-weight-bold.mb-2 Worxstr
      p.text-subtitle-2
      v-btn(v-if='authenticatedUser' @click='signOut' color='primary') Sign out
      v-btn(v-else :to="{name: 'signIn'}" color='primary') Sign in
      div(style='height: 160px;display: block')

    v-footer(dark padless)
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

        v-card-text.white--text
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
  })
}
</script>