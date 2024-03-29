<template lang="pug">
	v-container(v-if="loading && user")
		v-skeleton-loader.my-4(type="heading")
		v-skeleton-loader(
			type="list-item, list-item, list-item, list-item, list-item, list-item, list-item"
		)

	div(v-else-if='user')
		edit-user-dialog(:opened.sync='editUserDialog' :user='user')
		delete-user-dialog(:opened.sync='deleteUserDialog' :user='user')
		
		portal(to="toolbarActions")
			v-btn(
				v-if='currentUserIsManager'
				:disabled='!userIsContractor'
				text
				color='primary'
				@click='editUserDialog = true'
				:icon='$vuetify.breakpoint.xs'
			)
				v-icon(:left='!$vuetify.breakpoint.xs') mdi-pencil
				span(v-if='!$vuetify.breakpoint.xs') Edit

			v-btn(
				v-if='currentUserIsAdmin && user.id != me.id'
				text
				color='error'
				@click='deleteUserDialog = true'
				:icon='$vuetify.breakpoint.xs'
			)
				v-icon(:left='!$vuetify.breakpoint.xs') mdi-delete
				span(v-if='!$vuetify.breakpoint.xs') Delete

		v-container.d-flex.flex-column.justify-center
			v-card.soft-shadow(outlined)
				.py-5.px-4
					h4.text-h4 {{ user.name }}
					h6.text-h6
						a(:href='`mailto:${user.email}`' target="_blank") {{ user.email }}
					h6.text-h6
						a(:href='`sms:${user.phone}`' target="_blank") {{ user.phone | phone }}

					roles.mt-3(:roles='user.roles')

				v-list.pb-0(color='transparent')
					v-list-item(v-if='manager')
						v-list-item-content
							v-list-item-subtitle Manager
							v-list-item-title
								router-link.alt-style(:to="{ name: 'user', params: { userId: manager.id }}")
									| {{ manager.name }}

					v-list-item(v-if='user.manager_info')
						v-list-item-content
							v-list-item-subtitle Manager reference number
							v-list-item-title {{ user.manager_info.reference_number }}
						v-list-item-action
							clipboard-copy(:text='user.manager_info.reference_number')
					
					div(v-if='user.contractor_info')
						v-list-item
							v-list-item-content
								v-list-item-subtitle Hourly wage
								v-list-item-title {{ user.contractor_info.hourly_rate | currency }} / hour

					div(v-if='user.additional_info')
						v-list-item
							v-list-item-content
								v-list-item-subtitle Assigned color
								v-list-item-title
									v-badge.soft-shadow.ml-1.mr-5(:color="user.additional_info.color || '#4285f4'" bordered)
									span {{ user.additional_info.color }}
				
					v-list-item.px-0(v-if='user.location')
						v-list-item-content.pb-0
							v-list-item-subtitle.px-4 Location
							v-list-item-title.px-4 Updated {{ user.location.timestamp | timeAgo }}, {{ user.location.timestamp | time }}
							v-list-item-title.mt-4
								v-card.soft-shadow
									g-map(:users='[user]')

</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import EditUserDialog from './EditUserDialog.vue'
import DeleteUserDialog from './DeleteUserDialog.vue'
import GMap from '@/components/GMap.vue'
import Roles from '@/components/Roles.vue'
import { Managers, userIs, currentUserIs, UserRole } from '@/types/Users'
import { loadUser } from '@/services/users'
import ClipboardCopy from '@/components/ClipboardCopy.vue'

@Component({
  components: {
    EditUserDialog,
    DeleteUserDialog,
    Roles,
		ClipboardCopy,
		GMap,
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

  get me() {
    return this.$store.getters.me
  }

	get manager() {
		if (this.user.manager_id) {
			return this.$store.getters.user(this.user.manager_id)
		}
		return null
	}

	get currentUserIsAdmin() {
		return currentUserIs(UserRole.Admin)
	}

	get currentUserIsManager() {
		return currentUserIs(...Managers)
	}

	get userIsContractor() {
		return userIs(this.user, UserRole.Contractor)
	}
}
</script>

<style lang="scss">
.color {
	width: 20px;
	height: 20px;
	border-radius: 50%;
}
</style>