<template lang="pug">
  .pb-1
    v-chip.mr-1.mt-1(label v-for="(role, i) in roles" :key='i' :small='small')
      | {{role.name | snakeToSpace | capitalize }}
</template>

<script lang="ts">
import { Role } from '@/definitions/User'
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component
export default class Roles extends Vue {
  @Prop({ default: [] }) roles!: Role[]
  @Prop({ default: false }) small!: boolean
}
</script>