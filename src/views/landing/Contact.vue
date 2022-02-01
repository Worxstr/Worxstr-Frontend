<template lang="pug">
div
  v-sheet.gradient-secondary.overlap
    v-container.py-16
      h3.text-h3.font-weight-black Contact us

  v-container.shift-down(style='position: relative; z-index: 1')
    v-row.justify-center
      v-col(
        v-for="(option, i) in helpOptions" :key="i"
        cols="12",
        :md="chosenOption == option.name ? 9 : 4",
        v-if="(chosenOption == option.name || chosenOption == null) && !(option.hideIfSignedIn && me)"
      )
        v-card.soft-shadow(outlined :class="chosenOption ? '' : 'hover-effect'")
          v-card-title.text-h5 {{ option.title }}

          v-expand-transition(appear)
            div(v-if="chosenOption != option.name")
              v-card-text.py-0
                p {{ option.text }}

              v-card-actions.pb-5.justify-center
                v-btn(
                  elevation='0'
                  v-bind="attrs"
                  v-on="on"
                  :class="{'black--text': option.button.color == 'accent'}"
                  :color="option.button.color"
                  @click="selectOption(option)"
                ) {{ option.button.text }}

          v-expand-transition(appear)
            v-card-text.py-0(v-if="chosenOption == option.name")
              contact-form(:type='chosenOption' color="primary" @submitted='chosenOption = null')
                v-btn(text, @click="chosenOption = null") Cancel

    //- .mt-12
    //-   h4.text-h4.font-weight-black.mb-3 Need help now?
    //-   p
    //-     | Visit our
    //-     router-link(to="/support") &nbsp;support page&nbsp;
    //-     | for common questions and answers.

  arrows(type='smallGroup' style='position: absolute; bottom: 0; right: 0' v-if='$vuetify.breakpoint.smAndUp')
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'
import ContactForm from "@/components/ContactForm.vue"
import Arrows from '@/components/Arrows.vue'
import calendly from '@/util/calendly'

type Option = {
  name: string
  title: string
  text: string
  hideIfSignedIn: boolean
  button: {
    text: string
    color: string
    action?: Function
  }
  dialog: boolean
}

function openCalendly() {
  calendly.showPopupWidget('https://calendly.com/d/cps-z6n-m4m/worxstr-consultation?hide_event_type_details=0&hide_gdpr_banner=1&primary_color=2e6aef')
}

@Component({
  metaInfo: {
    title: 'Contact us'
  },
  components: {
    ContactForm,
    Arrows
  },
})
export default class Contact extends Vue {

  mounted() {
    if (this.$route.params.option) {
      this.selectOption(this.helpOptions.find(option => option.name == this.$route.params.option))
    }
  }

  get me() {
    return this.$store.getters.me
  }

  selectOption(option: any) {
    if (option.button.action) {
      option.button.action()
    }
    else {
      this.chosenOption = option.name
    }
  }

  chosenOption: 'support' | 'sales' | string | null = null

  helpOptions: Option[] = [
    {
      name: 'demo',
      title: 'Schedule a demo',
      text: 'Want to learn more about our platform? Schedule a demo with one of our managers to learn more about Worxstr and how it can help you manage your team.',
      hideIfSignedIn: true,
      button: {
        text: 'Find a time',
        color: 'primary',
        action: openCalendly
      },
      dialog: false,
    },
    {
      name: 'support',
      title: "Help and support",
      text: "Having technical trouble? Contact our support team and we will get back to you soon.",
      hideIfSignedIn: false,
      button: {
        text: "Contact support",
        color: "accent",
      },
      dialog: false,
    },
    {
      name: 'sales',
      title: "Sales and pricing",
      text: "Need help deciding if Worxstr is right for you? Contact our sales team and we can help you choose.",
      hideIfSignedIn: true,
      button: {
        text: "Contact sales",
        color: "primary",
      },
      dialog: false,
    },
  ]
}
</script>