<template lang="pug">

v-select.timezone-input(
  v-model='value',
  :items='timezones'
  outlined
  dense
  hide-details
  :label='label || "Time zone"'
  item-text='label'
  item-value='tzCode'
  @input='onChange'
  ref='select'
)
  template(v-slot:prepend-item)
    v-subheader Recent

    v-list-item(
      v-for='key in recommended'
      :key='key'
      dense
      @click='select(key)'
      :class='{"v-list-item--active primary--text": key === value}'
    )
      v-list-item-title {{ lookup(key).label }}
      v-list-item-action
        v-icon(small v-if='key === currentTimezone') mdi-home

    v-divider

    v-subheader All time zones

  template(v-slot:item='{ item, on, attrs }')
    v-list-item(dense @click='select(item.tzCode)' v-on='on' v-bind='attrs')
      v-list-item-title {{ item.label }}
      v-list-item-action
        v-icon(small v-if='item.tzCode === currentTimezone') mdi-home


</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { minimalTimezoneSet } from 'compact-timezone-list'
import dayjs, { tz } from 'dayjs'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(timezone)


@Component
export default class TimezoneInput extends Vue {

  currentTimezone = tz.guess()
  timezones = minimalTimezoneSet
  recent: any[] = []
  value = ''

  @Prop({ type: String }) label?: string

  mounted() {
    // Get recently picked time zones from local storage
    const recent = localStorage.getItem('recentTimezones')
    if (recent) {
      const recentZones = JSON.parse(recent)
      if (recentZones.length) {
        this.recent = recentZones
      }
    }
  }
  
  // Called when user selects a slot template (recommended timezone)
  select(tzCode: string) {
    this.closeMenu()
    this.value = tzCode
    this.onChange(tzCode)
  }

  // Called when the timezone value changes
  onChange(tzCode: string) {
    // Save to localStorage
    this.addTzToRecent(tzCode)
    this.$emit('input', tzCode)
  }

  closeMenu() {
    (this.$refs.select as any)?.blur()
  }
  
  // Collect recent time zones and the current one
  get recommended() {
    if (this.recent.includes(this.currentTimezone)) return this.recent
    const recommendations = [...this.recent, this.currentTimezone]
    this.value = recommendations[0]
    return recommendations
  }

  // Lookup a time zone by its tzCode
  lookup(tzCode: string) {
    return this.timezones.find((tz: any) => tz.tzCode === tzCode)
  }

  // Add a time zone to the recent list in local storage and in memory
  addTzToRecent(tzCode: string) {
    if (this.recent.includes(tzCode)) return

    this.recent.unshift(tzCode)
    
    // Limit length to 4
    if (this.recent.length > 4) {
      this.recent = this.recent.slice(0, 4)
    }

    localStorage.setItem('recentTimezones', JSON.stringify(this.recent))
  }

}
</script>