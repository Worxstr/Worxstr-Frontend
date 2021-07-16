<template lang="pug">
  v-snackbar(app, v-model="snackbar.show", :timeout="snackbar.timeout")
    | {{ snackbar.text }}

    template(v-slot:action="{ attrs }", v-if="snackbar.action")
      v-btn(
        color="blue",
        text,
        v-bind="attrs",
        @click="() => { snackbar.action(); snackbar.show = false; }"
      )
        | {{ snackbar.actionText }}
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