<template lang="pug">
	v-container(v-if="loading && user")
		v-skeleton-loader.my-4(type="heading")
		v-skeleton-loader(
			type="list-item, list-item, list-item, list-item, list-item, list-item, list-item"
		)

	div(v-else)
		edit-user-dialog(:opened.sync='editUserDialog' :user='user')
		delete-user-dialog(:opened.sync='deleteUserDialog' :user='user')
		
		portal(to="toolbarActions")
			v-btn(
				:disabled='userIsManager'
				text
				color='primary'
				@click='editUserDialog = true'
				:icon='$vuetify.breakpoint.xs'
			)
				v-icon(:left='!$vuetify.breakpoint.xs') mdi-pencil
				span(v-if='!$vuetify.breakpoint.xs') Edit

			v-btn(
				v-if='userIsOrgManager && user.id != authenticatedUser.id'
				text
				color='error'
				@click='deleteUserDialog = true'
				:icon='$vuetify.breakpoint.xs'
			)
				v-icon(:left='!$vuetify.breakpoint.xs') mdi-delete
				span(v-if='!$vuetify.breakpoint.xs') Delete

		v-container.d-flex.flex-column.justify-center
			.py-5
				h4.text-h4 {{ user | fullName }}
				h6.text-h6
					a(:href='`mailto:${user.email}`' target="_blank") {{ user.email }}
				h6.text-h6
					a(:href='`sms:${user.phone}`' target="_blank") {{ user.phone | phone }}

				roles.mt-3(:roles='user.roles')

			//- div(v-if='user.contractor_info')
			//- 	p Makes {{ user.contractor_info.hourly_rate | currency }}/hour

			v-list(color='transparent')
				v-list-item(v-for='key in Object.keys(user).sort()')
					v-list-item-content
						v-list-item-title {{ key | snakeToSpace | capitalize }}
						v-list-item-subtitle {{ user[key] }}

</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import EditUserDialog from './EditUserDialog.vue'
import DeleteUserDialog from './DeleteUserDialog.vue'
import Roles from '@/components/Roles.vue'
import { Managers, userIs, currentUserIs, UserRole } from '@/definitions/User'
import { loadUser } from '@/services/users'

@Component({
  components: {
    EditUserDialog,
    DeleteUserDialog,
    Roles,
  },
})
export default class User extends Vue {
  selectedUser: User | null = null
  editUserDialog = false
  deleteUserDialog = false
  loading = false

  metaInfo() {
    return {
      title: this.user ? this.$options.filters?.fullName(this.user) : 'User',
    }
  }

  async mounted() {
		await loadUser(this.$store, parseInt(this.$route.params.userId))
	}

  get user() {
    return this.$store.getters.user(this.$route.params.userId)
  }

	get authenticatedUser() {
		return this.$store.state.users.authenticatedUser
	}

  get userIsManager() {
    return userIs(this.user, ...Managers)
  }

	get userIsOrgManager() {
		return currentUserIs(UserRole.OrganizationManager)
	}
}
</script>
