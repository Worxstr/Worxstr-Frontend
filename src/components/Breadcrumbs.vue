<template lang="pug">
v-breadcrumbs.nav-breadcrumbs.pl-1.d-flex.flex-nowrap(
  :items='items'
  large
)
  template(v-slot:item='{ item }')
    v-breadcrumbs-item.subtitle-1.font-weight-medium(
      :to='item.to'
      exact
      :class="$vuetify.theme.dark ? 'white-text' : ''"
    ) {{ item.text | capitalize }}
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class Breadcrumbs extends Vue {
  @Prop ({ default: [] }) items!: any[]
}
</script>