<template lang="pug">
v-container
  edit-user-dialog(:opened.sync="editUserDialog")
  invite-users-dialog(:opened.sync="inviteUsersDialog")

  portal(to="toolbarActions")
    v-btn(
      text
      color='primary'
      @click='editUserDialog = true'
      :icon='$vuetify.breakpoint.xs'
    )
      v-icon(:left='!$vuetify.breakpoint.xs') mdi-account-plus
      span(v-if='!$vuetify.breakpoint.xs') Add manager
    
    v-btn(
      text
      color='primary'
      @click='inviteUsersDialog = true'
      :icon='$vuetify.breakpoint.xs'
    )
      v-icon(:left='!$vuetify.breakpoint.xs') mdi-account-multiple-plus
      span(v-if='!$vuetify.breakpoint.xs') Invite contractors

  v-card.soft-shadow(outlined)
    v-data-table(
      :headers="headers",
      :items="workforce",
      :loading="loading",
      @click:row="openUser"
    )
      template(v-slot:item.name="{ item }")
        span {{ item.name }}

      template(v-slot:item.phone="{ item }")
        span {{ item.phone | phone }}

      template(v-slot:item.manager_id="{ item }")
        span {{ user(item.id).name }}

      template(v-slot:item.roles="{ item }")
        roles(:roles='item.roles' small)

      template(v-slot:item.dwolla_status="{ item }")
        roles(:roles='item.roles' small)

      //- template(v-slot:item.phone="{ item }")
      //- 	v-icon(small class="mr-2" @click="editUser(item)") mdi-pencil
      //- 	v-icon(small @click="deleteItem(item)") mdi-delete
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { currentUserIs, User, UserRole } from '@/types/Users'
import EditUserDialog from './EditUserDialog.vue'
import InviteUsersDialog from './InviteUsersDialog.vue'
import Roles from '@/components/Roles.vue'
import { loadWorkforce } from '@/services/users'

@Component({
  metaInfo: {
    title: 'Users',
  },
  components: {
    EditUserDialog,
    InviteUsersDialog,
    Roles,
  },
})
export default class Users extends Vue {
  loading = false
  editUserDialog = false
  inviteUsersDialog = false
  headers = [
    {
      text: 'Name',
      value: 'name',
    },
    {
      text: 'Email',
      value: 'email',
    },
    {
      text: 'Phone',
      value: 'phone',
    },
    {
      text: 'Manager',
      value: 'manager_id',
    },
    {
      text: 'Roles',
      value: 'roles',
      align: 'end',
    },
  ]

  async mounted() {
    this.loading = true
    try {
      await loadWorkforce(this.$store)
    } finally {
      this.loading = false
    }
  }

  get workforce() {
    return this.$store.getters.workforce
  }

  get userIsOrgManager() {
    return currentUserIs(UserRole.Admin)
  }

  user(userId: number) {
    return this.$store.getters.user(userId)
  }

  openUser(user: User) {
    this.$router.push({
      name: 'user',
      params: {
        userId: user.id.toString()
      }
    })
  }
}
</script>
