<template lang="pug">
	v-container(v-if="loading && user")
		v-skeleton-loader.my-4(type="heading")
		v-skeleton-loader(
			type="list-item, list-item, list-item, list-item, list-item, list-item, list-item"
		)

	div(v-else)
		edit-user-dialog(:opened.sync='editUserDialog' :user='user')

		v-container.d-flex.flex-column.justify-center
			v-card.soft-shadow
				v-card-title {{ user | fullName }}
				v-card-text
					p User ID: {{ user.id }}
					p {{ user.email }}
					p {{ user.phone | phone }}

					.d-flex
						v-spacer
						v-btn(text color='primary' @click='editUserDialog = true') Edit wage
						v-btn(text disabled color="red") Delete user

</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import EditUserDialog from './EditUserDialog.vue'

@Component({
  components: {
    EditUserDialog,
  },
})
export default class User extends Vue {
	selectedUser: User | null = null
	editUserDialog = false
	loading = false

  metaInfo() {
    return {
      title: this.user ? this.$options.filters?.fullName(this.user) : 'User',
    }
  }

  async mounted() {
    await this.$store.dispatch('loadUser', this.$route.params.userId)
  }

  get user() {
    return this.$store.getters.user(this.$route.params.userId)
  }
}
</script>
