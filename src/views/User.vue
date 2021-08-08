<template lang="pug">
	v-container(v-if="loading && user")
		v-skeleton-loader.my-4(type="heading")
		v-skeleton-loader(
			type="list-item, list-item, list-item, list-item, list-item, list-item, list-item"
		)

	div(v-else)
		v-container.d-flex.flex-column.justify-center
			v-card.soft-shadow
				v-card-title {{ user | fullName }}
				v-card-text
					p User ID: {{ user.id }}
					p {{ user.email }}
					p {{ user.phone | phone }}

					.d-flex
						v-spacer
						v-btn(text disabled) Edit wage
						v-btn(text disabled color="red") Delete user

</template>

<script>
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class User extends Vue {
	metaInfo() {
    return {
      title: this.user ? this.$options.filters.fullName(this.user) : 'User'
    }
  }

  mounted() {
    this.$store.dispatch('loadUser', this.$route.params.userId)
  }

	get user() {
		return this.$store.getters.user(this.$route.params.userId)
	}
}
</script>