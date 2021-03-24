<template lang="pug">
v-footer.worxstr-footer(padless)
  v-card.lighten-2.text-center(flat, tile, width="100%")
    .my-2
      v-btn.my-2(v-for='link in links', :key='link.to', text, :to='link.to') {{ link.text }}

    .mb-3
      v-btn(v-for='social in socials', icon :href="social.link" target="_blank")
        v-icon(size='24px') {{ social.icon }}

    v-card-text.pt-0 Some additional info can go here

    v-divider

    v-card-text
      span &copy;&nbsp;
      strong Worxstr L.L.C.&nbsp;
      span {{ new Date().getFullYear() }} — All rights reserved
      br
      span.text-caption
        | Site design by&nbsp;
        a(href="https://www.linkedin.com/in/alexwohlbruck/", target="_blank") Alex Wohlbruck
</template>

<script>
export default {
  name: "worxstrFooter",
  data: () => ({
    links: [
      {
        to: "about",
        text: "About us",
      },
      {
        to: "contact",
        text: "Contact us",
      },
      {
        to: "privacy",
        text: "Privacy policy",
      },
      {
        to: "terms",
        text: "Terms of use",
      },
    ],
    socials: [
      {
        icon: "mdi-facebook",
        link: "",
      },
      {
        icon: "mdi-instagram",
        link: "",
      },
      {
        icon: "mdi-twitter",
        link: "",
      },
      {
        icon: "mdi-linkedin",
        link: "https://www.linkedin.com/company/worxstr-llc/",
      },
    ],
  }),
};
</script>
