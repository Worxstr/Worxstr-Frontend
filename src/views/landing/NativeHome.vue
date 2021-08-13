<template lang="pug">
.native-home.arrow-container.d-flex.flex-column.justify-center.align-center
  arrows(type='smallGroup')

  img.logo.pb-6(:src="require(`@/assets/logos/${mini ? 'icon' : $vuetify.theme.dark ? 'logotype-dark' : 'logotype'}.svg`)", alt="Worxstr logo")

  .d-flex
  
    v-btn.mr-3.black--text(elevation='0' color="accent", :to="{ name: `signUp` }") Start now
    v-btn.mr-3(outlined, color="accent", :to="{ name: `signIn` }")
      span(:class="`${$vuetify.theme.dark ? 'white' : 'black'}--text`") Sign in
</template>

<script>
import Arrows from '@/components/Arrows.vue'

export default {
  name: 'Native home',
  metaInfo: {
    title: 'Home',
  },
  components: {
    Arrows,
  }
}
</script>

<style lang="scss">
.native-home {
  height: 100%;

  .logo {
    width: 70%;
    max-width: 500px;
  }

  .arrows {
    position: absolute;
    z-index: -1;
    bottom: 0;
  }
}
</style>
