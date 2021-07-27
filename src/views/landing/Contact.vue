<template lang="pug">
div
  v-sheet.gradient-secondary.overlap
    v-container.py-16
      h3.text-h3.font-weight-black Contact us

  v-container.shift-down(style='position: relative; z-index: 1')
    v-row.justify-center
      v-col(
        v-for="(option, i) in helpOptions", :index="i"
        cols="12",
        :md="chosenOption == option.name ? 9 : 6",
        v-if="chosenOption == option.name || chosenOption == null"
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
                  v-bind="attrs",
                  v-on="on",
                  :color="option.button.color",
                  @click="chosenOption = option.name"
                ) {{ option.button.text }}

          v-expand-transition(appear)
            v-card-text.py-0(v-if="chosenOption == option.name")
              contact-form(color="primary" @submitted='chosenOption = null')
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
      this.chosenOption = this.$route.params.option
    }
  }

  chosenOption: 'support' | 'sales' | string | null = null

  helpOptions = [
    // {
    //   name: 'support',
    //   title: "Help and support",
    //   text: "Having technical trouble? Contact our support team and we will get back to you soon.",
    //   button: {
    //     text: "Contact support",
    //     color: "primary",
    //   },
    //   dialog: false,
    // },
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
}
</script>