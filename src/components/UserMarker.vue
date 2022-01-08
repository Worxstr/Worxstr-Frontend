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
      @mouseenter='hover = true'
      :style='`background: ${markerColor}`'
      :class="{'solid-ring': isDeviceLocation}"
    )
    v-scale-transition
      //- Container for scale transition
      div(v-show='hover')
        .marker-details.px-3.py-1(
          @mouseleave='hover = false'
          :style='`background: ${markerColor}`'
          :class="{'solid-ring': isDeviceLocation}"
        )
          .text-caption
            .font-weight-bold
              span(v-if='isDeviceLocation') Your location
              span(v-else-if='user') {{ user | fullName }}

            div {{ lastUpdated | date('MMM D') }} at {{ lastUpdated | time }}
            div.text-xs Accuracy: {{ markerAccuracy | numberFormat }}m

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
  @Prop(Boolean) isDeviceLocation?: boolean // If true, location is the device location

  hover = false

  get lastUpdated() {
    if (this.location?.timestamp) {
      return this.location.timestamp
    }
    if (this.user?.location?.timestamp) {
      return this.user.location.timestamp
    }
    return ''
  }

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

.marker-dot, .marker-details {
  border-radius: $userMarkerWidth;
  box-shadow: 0px 2px 4px -1px rgb(0 0 0 / 40%),
              0px 4px 5px 0px rgb(0 0 0 / 30%),
              0px 1px 10px 0px rgb(0 0 0 / 25%) !important;
  border: #{$userMarkerWidth / 6} solid rgba(255, 255, 255, 0.3);

  &.solid-ring {
    border-color: white;
  }
}

.marker-dot {
  width: $userMarkerWidth;
  height: $userMarkerWidth;
  transform: translateY(8px);
}

.marker-details {
  position: absolute;
  white-space: nowrap;
  left: 50%;
  transform: translate(-50%, -50%);

  .text-caption {
    line-height: 1rem !important;
  }
}
</style>