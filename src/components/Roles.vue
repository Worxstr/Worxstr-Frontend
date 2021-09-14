<template lang="pug">
  div
    v-chip.mr-2(label v-for="(role, i) in roles" :key='i')
      | {{role.name | snakeToSpace | capitalize }}
</template>

<script lang="ts">
import { Role } from '@/definitions/User'
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component
export default class Roles extends Vue {
  @Prop({ default: [] }) roles!: Role[]
}
</script>