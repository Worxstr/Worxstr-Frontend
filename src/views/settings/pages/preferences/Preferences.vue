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
    
  v-list-item(two-line)
    v-list-item-content
      v-list-item-title Mini navigation
    v-list-item-action
      v-switch(
        v-model='preferences.miniNav'
        @change='updateMiniNav'
      )
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { DarkPreference, setTheme } from '@/util/theme'

@Component({
  metaInfo: {
    title: 'Settings - Preferences'
  },
})
export default class Preferences extends Vue {

  get preferences() {
    return this.$store.state.app.preferences
  }

  darkPreferenceOptions = [
    {
      text: 'System default',
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

  updateDarkMode() {
    setTheme(this.preferences.darkMode as DarkPreference)
  }
}
</script>