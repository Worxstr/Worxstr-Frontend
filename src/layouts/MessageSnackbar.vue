<template lang="pug">
  v-snackbar(app, v-model="snackbar.show", :timeout="snackbar.timeout")
    | {{ snackbar.text }}

    template(v-slot:action="{ attrs }" v-if="snackbar.action")
      v-btn(
        :color="snackbar.action.color",
        text,
        v-bind="attrs",
        @click="() => { snackbar.action.action(); snackbar.show = false; }"
      )
        | {{ snackbar.action.text }}
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class MessageSnackbar extends Vue {
  get snackbar() {
    return this.$store.state.snackbar;
  }
}
</script>