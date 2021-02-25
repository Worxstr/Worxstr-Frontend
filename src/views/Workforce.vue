<template lang="pug">
	v-container
		v-toolbar(flat, color="transparent")
			v-toolbar-title.text-h5.font-weight-medium Workforce
			v-spacer
			v-btn(text) Add org manager
			
		v-card
			v-card-content
				p.pa-5 Employees go here
</template>

<script>
export default {
  name: "workforce",
};
</script>