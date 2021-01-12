<template>
  <v-container class="home fill-height d-flex flex-column justify-center align-center">
    <h2 class="text-h2 font-weight-bold mb-2">Aprovals</h2>
  </v-container>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  name: 'approvals',
  computed: {
    ...mapState(['authenticatedUser'])
  },
  methods: {
    ...mapActions(['signOut'])
  }
}
</script>