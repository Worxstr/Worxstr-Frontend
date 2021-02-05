<template lang="pug">
  v-container.home.fill-height.d-flex.flex-column.justify-center.align-center
    img.ma-8(src="@/assets/logo.svg" width='180')
    h2.text-h2.font-weight-bold.mb-2 Worxstr
    p.text-subtitle-2 Uhhhh idk what else to put here
    v-btn(v-if='authenticatedUser' @click='signOut' color='primary') Sign out
    v-btn(v-else :to="{name: 'signIn'}" color='primary') Sign in
    div(style='height: 160px;display: block')

</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  name: 'home',
  computed: {
    ...mapState(['authenticatedUser'])
  },
  methods: {
    ...mapActions(['signOut'])
  }
}
</script>