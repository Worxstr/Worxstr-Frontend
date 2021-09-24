<template lang="pug">
v-list
  v-list-item(two-line)
    v-list-item-content
      v-list-item-title Dark theme
    v-list-item-action
      v-select.fit(
        v-model="preferences.darkMode",
        :items="['System default', 'Light', 'Dark']",
        @change="updateDarkMode",
        dense,
        hide-details
      )
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component({
  metaInfo: {
    title: 'Settings - Preferences'
  },
})
export default class Preferences extends Vue {

  preferences = {
    darkMode: window.localStorage.getItem("darkMode") || "System default",
  }

  updateDarkMode() {
    let dark
    switch (this.preferences.darkMode) {
      case "System default":
        dark =
          window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches;
        break;
      case "Light":
        dark = false;
        break;
      case "Dark":
        dark = true;
        break;
    }
    window.localStorage.setItem("darkMode", this.preferences.darkMode);
    this.$vuetify.theme.dark = dark as boolean;
  }
}
</script>