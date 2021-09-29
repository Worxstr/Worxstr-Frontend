<template lang="pug">
  //- TODO: Update padding-bottom to be safeAreaBottom + headerHeight from App.vue
  v-snackbar(
    app
    bottom
    v-model='snackbar.show'
    :timeout='snackbar.timeout'
    :style="`padding-bottom: ${bottomOffset}px`"
  )
    | {{ snackbar.text }}

    template(v-slot:action='{ attrs }' v-if='snackbar.action')
      v-btn(
        :color='snackbar.action.color'
        text
        v-bind='attrs'
        @click='() => { snackbar.action.action(); snackbar.show = false; }'
      )
        | {{ snackbar.action.text }}
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component
export default class MessageSnackbar extends Vue {
  @Prop({ type: Number, default: 0 }) bottomOffset!: number

  get snackbar() {
    return this.$store.state.snackbar
  }
}
</script>