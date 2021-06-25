<template lang="pug">
div
  v-sheet.gradient.overlap
    v-container.py-16
      h3.text-h3.font-weight-bold Contact us

  v-container.shift-down.mb-3
    v-row
      v-col(cols="12", sm="6" v-for='option in helpOptions')
        v-card.hover-effect(elevation="15")
          v-card-title {{ option.title }}

          v-card-text.pb-0
            p {{ option.text }}

          v-card-actions.justify-center
            v-btn(:color='option.button.color') {{ option.button.text }}
        
            //- contact-form(
            //-   :subject="subject",
            //-   style="width: 600px; max-width: 100%"
            //- )
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
    subject: '',
    helpOptions: [{
      title: 'Help and support',
      text: 'Having technical trouble? Contact our support team and we will get back to you soon.',
      button: {
        text: 'Contact support',
        color: 'primary',
      },
      to: '',
    },{
      title: 'Sales and pricing',
      text: 'Need help deciding if Worxstr is right for you? Contact our sales team and we can help you choose.',
      button: {
        text: 'Contact sales',
        color: 'accent',
      },
      to: '',
    }]
  }),
  mounted() {
    if (this.$route.params.subject) {
      this.subject = this.$route.params.subject;
    }
  },
};
</script>