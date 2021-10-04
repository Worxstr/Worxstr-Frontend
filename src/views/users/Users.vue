<template lang="pug">
v-container
  edit-user-dialog(:opened.sync="editUserDialog")

  portal(to="toolbarActions")
    v-btn(
      text
      color='primary'
      @click='editUserDialog = true'
      :icon='$vuetify.breakpoint.xs'
    )
      v-icon(:left='!$vuetify.breakpoint.xs') mdi-account-plus
      span(v-if='!$vuetify.breakpoint.xs') Add manager

  v-card.soft-shadow
    v-data-table(
      :headers="headers",
      :items="workforce",
      :loading="loading",
      @click:row="openUser"
    )
      template(v-slot:item.name="{ item }")
        span {{ item | fullName }}

      template(v-slot:item.phone="{ item }")
        span {{ item.phone | phone }}

      template(v-slot:item.manager_id="{ item }")
        span {{ user(item.id) | fullName }}

      template(v-slot:item.roles="{ item }")
        roles(:roles='item.roles' small)

      //- template(v-slot:item.phone="{ item }")
      //- 	v-icon(small class="mr-2" @click="editUser(item)") mdi-pencil
      //- 	v-icon(small @click="deleteItem(item)") mdi-delete
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { currentUserIs, User, UserRole } from '@/definitions/User'
import EditUserDialog from './EditUserDialog.vue'
import Roles from '@/components/Roles.vue'
import { loadWorkforce } from '@/services/users'

@Component({
  metaInfo: {
    title: 'Users',
  },
  components: {
    EditUserDialog,
    Roles,
  },
})
export default class Users extends Vue {
  loading = false
  editUserDialog = false
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
    return currentUserIs(UserRole.OrganizationManager)
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
