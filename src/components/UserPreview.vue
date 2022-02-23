<template lang="pug">
.user-preview
  g-map(
    v-if='showMap'
    :users='[user]'
    :height="$vuetify.breakpoint.mdAndUp ? '25vh' : '35vh'"
  )

  v-card-text.pb-1
    .d-flex.flex-column
      h6.text-body-1
        router-link.alt-style(
          :to="{name: 'user', params: { userId: user.id }}"
        ) {{ user.name }}

      .text-body-2 {{ user.email }}
      //- .text-body-2(v-if='countShifts') {{ countShifts }} {{ countShifts > 1 ? 'shifts' : 'shift' }}

  v-card-actions
    v-spacer
    v-btn(
      text
      color='primary'
      :to="{name: 'user', params: {userId: user.id}}"
      exact
    ) View {{ user.first_name }}'s profile

</template>

<script lang="ts">
import { User } from '@/types/Users'
import { Vue, Component, Prop } from 'vue-property-decorator'
import GMap from '@/components/GMap.vue'

@Component({
  components: {
    GMap,
  },
})
export default class UserPreview extends Vue {
  @Prop({ required: true }) user!: User
  @Prop({ default: false }) showMap!: boolean
}
</script>