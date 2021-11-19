<template lang="pug">
div
  edit-default-wage-dialog(:opened.sync="editOrganizationWageDialog" :organization-id='myOrganization.id')

  v-list
    v-list-item(two-line)
      v-list-item-content
        v-list-item-subtitle.mb-2 Organization name
        v-list-item-title {{ myOrganization.name }}

    v-list-item(two-line)
      v-list-item-content
        v-list-item-subtitle.mb-2 Default contractor wage
        v-list-item-title
          span {{ myOrganization.minimum_wage | currency }}

      v-list-item-action
        v-btn(text color='primary' @click='openEditOrganizationWageDialog') Edit
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { getMyOrganization } from '@/services/organizations'
import EditDefaultWageDialog from './EditDefaultWageDialog.vue'

@Component({
  components: {
    EditDefaultWageDialog,
  },
})
export default class Organization extends Vue {

  loadingMyOrganization = false
  editOrganizationWageDialog = false

  async mounted() {
    this.loadingMyOrganization = true
    try {
      await getMyOrganization(this.$store)
    }
    finally {
      this.loadingMyOrganization = false
    }
  }

  get myOrganization() {
    return this.$store.getters.myOrganization
  }

  openEditOrganizationWageDialog() {
    this.editOrganizationWageDialog = true
  }
}
</script>