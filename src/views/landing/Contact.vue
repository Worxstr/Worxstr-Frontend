<template lang="pug">
div
  v-sheet.gradient.overlap
    v-container.py-16
      h3.text-h3.font-weight-bold Contact us

  v-container.shift-down
    v-row.mb-12
      v-col(cols="12", sm="6", v-for="option in helpOptions")
        v-card.hover-effect(elevation="15")
          v-card-title {{ option.title }}

          v-card-text.pb-0
            p {{ option.text }}

          v-card-actions.pb-5.justify-center
            v-dialog(v-model="option.dialog")
              
              template(v-slot:activator="{ on, attrs }")
                v-btn(v-bind="attr", v-on="on", :color="option.button.color") {{ option.button.text }}
              
              //- Contact form
              v-card
                v-card-title
                  h5.text-h5.font-weight-bold.mb-4 Contact sales
                v-card-text
                  contact-form(color='primary')

    div
      h4.text-h4.font-weight-black.mb-3 Need help now?
      p
        | Visit our
        router-link(:to="{ name: 'support' }") &nbsp;support page&nbsp;
        | for common questions and answers.
</template>

<script>
import ContactForm from "@/components/ContactForm.vue";

export default {
  name: "contact",
  metaInfo: {
    title: "Contact us",
  },
  components: {
    ContactForm,
  },
  data: () => ({
    subject: "",
    helpOptions: [
      {
        title: "Help and support",
        text: "Having technical trouble? Contact our support team and we will get back to you soon.",
        button: {
          text: "Contact support",
          color: "primary",
        },
        dialog: false,
      },
      {
        title: "Sales and pricing",
        text: "Need help deciding if Worxstr is right for you? Contact our sales team and we can help you choose.",
        button: {
          text: "Contact sales",
          color: "accent",
        },
        dialog: false,
      },
    ],
  }),
  mounted() {
    if (this.$route.params.subject) {
      this.subject = this.$route.params.subject;
    }
  },
};
</script>