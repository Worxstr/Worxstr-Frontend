<template lang="pug">
v-list
  v-list-item(two-line)
    v-list-item-content
      v-list-item-title Dark theme
    v-list-item-action
      v-select.fit(
        v-model="preferences.darkMode"
        :items="darkPreferenceOptions"
        @change="updateDarkMode"
        dense
        hide-details
      )
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { DarkPreference, getStoredPreference, setTheme } from '@/plugins/theme'

@Component({
  metaInfo: {
    title: 'Settings - Preferences'
  },
})
export default class Preferences extends Vue {

  preferences = {
    darkMode: 'Default',
  }

  darkPreferenceOptions = [
    {
      text: 'Default',
      value: 'default',
    },
    {
      text: 'Light',
      value: 'light',
    },
    {
      text: 'Dark',
      value: 'dark',
    },
  ]

  mounted() {
    this.preferences.darkMode = getStoredPreference()
  }

  updateDarkMode() {
    setTheme(this.preferences.darkMode as DarkPreference)
  }
}
</script>