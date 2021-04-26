<template lang="pug">
v-container.d-flex.flex-column.justify-center.align-center.pt-8
	p.text-h4.font-weight-bold.mb-10 Contact us

	v-form.flex-grow-1.d-flex.flex-column(@submit.prevent="updateTimecard", v-model="isValid" style='width: 600px; max-width: 100%')
				
		v-text-field(
			outlined,
			filled
			dense,
			label="Subject",
			v-model="subject",
			required
		)

		v-textarea(
			outlined,
			filled
			dense,
			label="Message",
			v-model="message",
			required
		)

		v-spacer
		
		v-card-actions
			v-spacer
			v-btn(text, @click='openEmailClient') Send message
</template>

<script>
export default {
  name: "contact",
  metaInfo: {
    title: "Contact us",
  },
  data: () => ({
		subject: "",
    message: "",
  }),
  methods: {
    openEmailClient() {
      const win = window.open(`mailto:support@worxstr.com?subject=${this.subject}&body=${this.message}`, "_blank")
      win.focus()
    },
  },
};
</script>