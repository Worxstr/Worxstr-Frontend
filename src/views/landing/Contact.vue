<template lang="pug">
div
  v-sheet.gradient.overlap
    v-container.py-16
      h3.text-h3.font-weight-bold Contact us

  v-container.shift-down
    v-row.mb-12
    
      v-col(
        cols="12",
        :sm="chosenOption == option.name ? 12 : 6",
        v-for="(option, i) in helpOptions",
        :index='i'
        v-if="chosenOption == option.name || chosenOption == null"
      )
        v-card.hover-effect(elevation="15")
          v-card-title {{ option.title }}

          v-expand-transition(appear)
            v-card-text.pb-0(v-if="chosenOption == option.name")
              contact-form(color="primary")
                v-btn(text, @click="chosenOption = null") Cancel

          v-expand-transition(appear)
            div(v-if="chosenOption != option.name")
              v-card-text.py-0
                p {{ option.text }}

              v-card-actions.pb-5.justify-center
                v-btn(
                  v-bind="attrs",
                  v-on="on",
                  :color="option.button.color",
                  @click="chosenOption = option.name"
                ) {{ option.button.text }}

    div
      h4.text-h4.font-weight-black.mb-3 Need help now?
      p
        | Visit our
        router-link(:to="{ name: 'support' }") &nbsp;support page&nbsp;
        | for common questions and answers.
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'
import ContactForm from "@/components/ContactForm.vue"

@Component({
  metaInfo: {
    title: 'Contact us'
  },
  components: {
    ContactForm,
  },
})
export default class Contact extends Vue {

  chosenOption: 'support' | 'sales' | null = null

  helpOptions = [
    {
      name: 'support',
      title: "Help and support",
      text: "Having technical trouble? Contact our support team and we will get back to you soon.",
      button: {
        text: "Contact support",
        color: "primary",
      },
      dialog: false,
    },
    {
      name: 'sales',
      title: "Sales and pricing",
      text: "Need help deciding if Worxstr is right for you? Contact our sales team and we can help you choose.",
      button: {
        text: "Contact sales",
        color: "accent",
      },
      dialog: false,
    },
  ]

  mounted() {
    if (this.$route.params.subject) {
      this.subject = this.$route.params.subject;
    }
  }
}
</script>