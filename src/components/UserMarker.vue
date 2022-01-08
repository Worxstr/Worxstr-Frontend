<template lang="pug">
.user-marker(v-if='markerLocation')

  GmapCircle(
    v-if='markerAccuracy'
    :center='markerLocation'
    :radius='markerAccuracy || 75'
    :options="{fillColor: markerColor, fillOpacity: .15, strokeColor: 'TRANSPARENT'}"
  )

  GmapCustomMarker(
    :marker='markerLocation'
  )
    .marker-dot(
      :style='`background: ${markerColor}`'
      :class="{'solid-ring': solidRing}"
      @mouseenter='hover = true'
      @mouseleave='hover = false'
    )
    v-fade-transition
      .marker-details.pa-2(v-show='hover' v-if='user' :style='`background: ${markerColor}`')
        span {{ user | fullName }}

</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

import { Position } from '@/services/geolocation'
import { User } from '@/types/Users'
import { darkenColor } from '@/util/helpers'

import GmapCustomMarker from 'vue2-gmap-custom-marker'

@Component({
  components: {
    GmapCustomMarker,
  },
})
export default class UserMarker extends Vue {
  
  @Prop(Object) user?: User
  @Prop(Object) location?: Position
  @Prop(String) color?: string
  @Prop(Boolean) solidRing?: boolean

  hover = false

  get markerAccuracy() {
    if (this.location?.accuracy) return this.location.accuracy
    if (this.user?.location?.accuracy) {
      return this.user.location.accuracy
    }
    return 0
  }

  get markerLocation() {
    if (this.location) return this.location
    if (this.user?.location) {
      return this.gmapMarker(this.user.location)
    }
    return {
      lat: 0,
      lng: 0,
    }
  }

  get markerColor() {
    if (this.color) return this.color
    if (this.user?.additional_info?.color) {
      return this.user.additional_info.color
    }
    return '#4285f4'
  }

  gmapMarker(position: Position) {
    if (!position.latitude || !position.longitude) return null
    return {
      lat: position.latitude,
      lng: position.longitude,
    }
  }

  darkenColor(color: string, amount: number) {
    return darkenColor(color, amount)
  }
}
</script>

<style lang="scss">
$userMarkerWidth: 18px;

.marker-dot {
  border-radius: $userMarkerWidth;
  width: $userMarkerWidth;
  height: $userMarkerWidth;
  box-shadow: 0px 2px 4px -1px rgb(0 0 0 / 40%),
              0px 4px 5px 0px rgb(0 0 0 / 30%),
              0px 1px 10px 0px rgb(0 0 0 / 25%) !important;
  border: #{$userMarkerWidth / 6} solid rgba(255, 255, 255, 0.3);
  transform: translateY(8px);

  &.solid-ring {
    border-color: white;
  }
}


.marker-details {
  border-radius: $userMarkerWidth;
  box-shadow: 0px 2px 4px -1px rgb(0 0 0 / 40%),
              0px 4px 5px 0px rgb(0 0 0 / 30%),
              0px 1px 10px 0px rgb(0 0 0 / 25%) !important;
  border: #{$userMarkerWidth / 6} solid rgba(255, 255, 255, 0.3);
  position: absolute;
  white-space: nowrap;
  left: 50%;
  transform: translate(-50%, #{$userMarkerWidth / 2});
}
</style>