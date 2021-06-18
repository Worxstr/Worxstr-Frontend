<template lang="pug">
v-container.d-flex.flex-column.justify-center.align-center.pt-8
  p.text-h4.font-weight-bold.mb-10 Contact us

  contact-form(:subject="subject" style="width: 600px; max-width: 100%")
</template>

<script>
import ContactForm from '@/components/ContactForm.vue'

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
  }),
  mounted() {
    if (this.$route.params.subject) {
      this.subject = this.$route.params.subject
    }
  }
};
</script>