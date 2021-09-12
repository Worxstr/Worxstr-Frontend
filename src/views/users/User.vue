<template lang="pug">
	v-container(v-if="loading && user")
		v-skeleton-loader.my-4(type="heading")
		v-skeleton-loader(
			type="list-item, list-item, list-item, list-item, list-item, list-item, list-item"
		)

	div(v-else)
		edit-user-dialog(:opened.sync='editUserDialog' :user='user')
		
		portal(to="toolbarActions")
			v-btn(text color='primary' @click='editUserDialog = true') Edit
			v-btn(text disabled color="red") Delete

		v-container.d-flex.flex-column.justify-center
			v-card(flat)
				v-list
					v-list-item(v-for='key in Object.keys(user).sort()')
						v-list-item-content
							v-list-item-title {{ key }}
							v-list-item-subtitle {{ user[key] }}

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
