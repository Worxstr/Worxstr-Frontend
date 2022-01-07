<template lang="pug">
v-footer.worxstr-footer(padless)
  v-card.text-center(flat, tile, width="100%" :class="`${$vuetify.theme.dark ? 'dark' : 'light'}-color`")

    .my-2
      v-btn.my-2(v-for='(link, i) in links', :key='i', text, :to='{name: link.to}' :exact="link.to == 'home'") {{ link.text }}

    .mb-3
      v-btn(v-for='(social, i) in socials' :key='i' icon :href="social.link" target="_blank" rel="noreferrer")
        v-icon(size='24px') {{ social.icon }}

    //- v-card-text.pt-0 Some additional info can go here

    v-card-text.white-transparent
      span &copy;&nbsp;
      strong Worxstr L.L.C.&nbsp;
      span {{ new Date().getFullYear() }} — All rights reserved
</template>

<script>
export default {
  name: 'worxstrFooter',
  data: () => ({
    links: [
      {
        to: 'home',
        text: 'Home',
      },
      {
        to: 'about',
        text: 'About',
      },
      {
        to: 'blog',
        text: 'Blog',
      },
      {
        to: 'contact',
        text: 'Contact us',
      },
      // {
      //   to: 'support',
      //   text: 'Support',
      // },
      {
        to: 'pricing',
        text: 'Pricing',
      },
      {
        to: 'privacy',
        text: 'Privacy policy',
      },
      {
        to: 'terms',
        text: 'Terms of use',
      },
    ],
    socials: [
      {
        icon: 'mdi-facebook',
        link: 'https://www.facebook.com/worxstr',
      },
      {
        icon: 'mdi-instagram',
        link: 'https://www.instagram.com/worxstr/',
      },
      {
        icon: 'mdi-twitter',
        link: 'https://twitter.com/worxstr',
      },
      {
        icon: 'mdi-linkedin',
        link: 'https://www.linkedin.com/company/worxstr-llc/',
      },
      {
        icon: 'mdi-youtube',
        link: 'https://www.youtube.com/channel/UCIthM10Z0VK6U0Tm1MjZXHQ',
      },
    ],
  }),
}
</script>
