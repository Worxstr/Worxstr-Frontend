<template lang="pug">
  v-list
    v-list-item(two-line)
      v-list-item-content
        v-list-item-subtitle.mb-2 Default contractor wage
        v-list-item-title
          span {{ 7.25 | currency }}

      v-list-item-action
        v-btn(text color='primary' disabled) Edit
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class Organization extends Vue {
  
}
</script>