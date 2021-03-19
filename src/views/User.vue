<template lang="pug">
	v-container(v-if="loading && user")
		v-skeleton-loader.my-4(type="heading")
		v-skeleton-loader(
			type="list-item, list-item, list-item, list-item, list-item, list-item, list-item"
		)

	div(v-else)
		v-container.d-flex.flex-column.justify-center
			p {{ user | fullName }}
			p {{ user.email }}
			p {{ user.phone }}

			v-btn(text) Edit wage

</template>

<script>
export default {
  name: "User",
  metaInfo() {
    return {
      title: this.user ? this.$options.filters.fullName(this.user) : "User",
    };
  },
  mounted() {
    this.$store.dispatch("loadUser", this.$route.params.userId);
  },
  computed: {
    user() {
      return this.$store.getters.user(this.$route.params.userId);
    },
  },
};
</script>