<template lang="pug">
v-container.d-flex.flex-column.justify-center.align-center.pt-8
  p.text-h4.font-weight-bold.mb-10 Contact us

  contact-form
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
  mounted() {
    if (this.$route.params.subject) {
      this.subject = this.$route.params.subject
    }
  },
  data: () => ({
    subject: "",
    message: "",
  }),
  methods: {
    openEmailClient() {
      const win = window.open(
        `mailto:support@worxstr.com?subject=${this.subject}&body=${this.message}`,
        "_blank"
      );
      win.focus();
    },
  },
};
</script>