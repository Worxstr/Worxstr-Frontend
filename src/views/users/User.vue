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
			.py-5.px-4
				h4.text-h4 {{ user | fullName }}
				h6.text-h6
					a(:href='`mailto:${user.email}`' target="_blank") {{ user.email }}
				h6.text-h6
					a(:href='`sms:${user.phone}`' target="_blank") {{ user.phone | phone }}

				roles.mt-3(:roles='user.roles')

			v-list(color='transparent')
				v-list-item(v-if='user.manager_id')
					v-list-item-content
						v-list-item-subtitle Manager
						v-list-item-title {{ user.manager_id }}

				v-list-item(v-if='user.manager_info')
					v-list-item-content
						v-list-item-subtitle Manager reference number
						v-list-item-title {{ user.manager_info.reference_number }}

				v-list-item(v-if='user.contractor_info')
					v-list-item-content
						v-list-item-subtitle Hourly wage
						v-list-item-title {{ user.contractor_info.hourly_rate | currency }} / hour

</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import EditUserDialog from './EditUserDialog.vue'
import DeleteUserDialog from './DeleteUserDialog.vue'
import Roles from '@/components/Roles.vue'
import { Managers, userIs, currentUserIs, UserRole } from '@/types/Users'
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
