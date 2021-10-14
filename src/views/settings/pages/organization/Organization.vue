<template lang="pug">
  v-list
    v-list-item(two-line)
      v-list-item-content
        v-list-item-subtitle.mb-2 Default contractor wage
        v-list-item-title
          span {{ myOrganization.minimum_wage | currency }}

      v-list-item-action
        v-btn(text color='primary' disabled) Edit
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { getMyOrganization } from '@/services/organizations'

@Component
export default class Organization extends Vue {

  loadingMyOrganization = false

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
}
</script>