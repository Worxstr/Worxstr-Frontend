<template lang="pug">
GmapMap.gmap(
  :center='centerLocation'
  :zoom='zoomLevel'
  :style='`min-height: ${height}`'
  :options='mapOptions'
)
  //- Device gps location and accuracy
  GmapCircle(
    v-if='deviceLocation && showDeviceLocation'
    :center='deviceLocation'
    :radius='deviceLocation.accuracy'
    :options="{fillColor: '#4285f4',fillOpacity: .15, strokeColor: 'TRANSPARENT'}"
  )
  GmapMarker(
    v-if='deviceLocation && showDeviceLocation'
    :position="deviceLocation"
    :icon="{ url: require('@/assets/icons/current-location-marker.svg') }"
  )
  
  //- User markers
  div(v-for='(user, i) in users' :key='user.id')
    GmapMarker(
      v-if='user.location && user.location.latitude && user.location.longitude'
      class-name='user-marker'
      :position='gmapMarker(user.location)'
      :icon="{ url: `https://avatars.dicebear.com/api/initials/${fullName(user)}.svg`, scaledSize: { width: 50, height: 50 }, anchor: {x: 25, y: 25}}"
    )
    GmapCircle(
      v-if='user.location && user.location.latitude && user.location.longitude'
      :center='gmapMarker(user.location)'
      :radius='user.location.accuracy'
      :options="{fillColor: '#4285f4',fillOpacity: .15, strokeColor: 'TRANSPARENT'}"
    )

  //- Job markers
  div(v-for='(job, i) in jobs' :key='job.id')
    GmapCircle(
      v-if='gmapMarker(job)'
      :center='gmapMarker(job)'
      :radius='job.radius || 75'
      :options="{fillColor: job.color || '#ea4335', fillOpacity: .15, strokeColor: darkenColor(job.color, 30)}"
    )
    GmapMarker(
      v-if='gmapMarker(job)'
      :position="gmapMarker(job)"
      :options="{icon: marker(job.color)}"
      :clickable='true'
      @click='toggleInfoWindow(job, i)'
    )
  //- Info window for jobs
  GmapInfoWindow(
    :options='infoOptions'
    :position='infoWindowPos'
    :opened='infoWinOpen'
    @closeclick='infoWinOpen = false'
  )
    .info_window.container(v-if='infoContent')
      h3 {{ infoContent.name }}
      p
        | {{ infoContent.address }}
        br
        | {{ infoContent.city }}, {{ infoContent.state }} {{ infoContent.zip_code }}
      router-link(:to="{name: 'job', params: {jobId: infoContent.id}}") View job
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import * as geolocation from '@/services/geolocation'
import { darkenColor } from '@/util/helpers'
import { fullName } from '@/util/filters'

import { light, dark } from '@/assets/mapStyles'
import { User } from '../types/Users'
import { Job } from '@/types/Jobs'
import { Position } from '@/services/geolocation'


@Component
export default class GMap extends Vue {
  locationAccuracy: number | null = null
  infoWindowPos: geolocation.Position | null = null
  infoWinOpen = false
  currentMidx = null
  infoContent: Job | null = null
  infoOptions = {
    pixelOffset: {
      width: 0,
      height: -30,
    },
  }

  @Prop({ default: () => [] }) readonly jobs!: Job[]
  @Prop({ default: () => [] }) readonly users!: User[]
  @Prop({ default: '40vh' }) height!: string
  @Prop({ default: false }) showDeviceLocation!: boolean

  defaultPosition = {
    lat: 0,
    lng: 0,
  }
  defaultZoom = 16

  get deviceLocation() {
    const location = this.$store.state.users.deviceLocation
    if (!location) return this.defaultPosition
    return this.gmapMarker(location)
  }

  get mapOptions() {
    return {
      styles: this.$vuetify.theme.dark ? dark : light
    }
  }

  get allCoordinates() {
    return [
      ...this.users
        .filter((user: User) => user && user.location)
        .map((user: User) => ({lat: user.location?.latitude, lng: user.location?.longitude})),
      
      ...this.jobs
        .filter((job: Job) => !!job)
        .map((job: Job) => ({lat: job.latitude, lng: job.longitude})),
      
      (this.showDeviceLocation && this.deviceLocation ? {
        lat: this.deviceLocation.lat,
        lng: this.deviceLocation.lng,
      } : null),

    ].filter((coord: any) => coord && coord.lat && coord.lng)
  }

  // Calculate appropriate zoom level to display user location and job location
  get zoomLevel() {
    if (!this.jobs) return this.defaultZoom

    const distance = this.maxDistanceBetweenAll
    const zoom = Math.abs(Math.ceil(Math.log2(distance / 360)))

    const value = Math.min(zoom, this.defaultZoom)

    return isNaN(value) ? this.defaultZoom : value
  }

  gmapMarker(position: Position) {
    if (!position.latitude || !position.longitude) return null
    return {
      lat: position.latitude,
      lng: position.longitude,
    }
  }

  fullName(user: User) {
    return fullName(user)
  }

  get maxDistanceBetweenAll() {
    let max = 0
    const n = this.allCoordinates.length

    for (let i = 0; i < n; i++) {
      // Compare each marker to every other marker
      for (let j = i + 1; j < n; j++) {
        max = Math.max(max, this.distanceBetweenPoints(this.allCoordinates[i], this.allCoordinates[j]))
      }
    }

    return max
  }

  distanceBetweenPoints(a: any, b: any) {
    const deltaA = a.lat - b.lat
    const deltaB = a.lng - b.lng

    return Math.sqrt(deltaA ** 2 + deltaB ** 2)
  }

  get centerLocation() {
    
    const sumLats = this.allCoordinates.reduce((acc, curr) => acc + (curr?.lat || 0), 0)
    const sumLngs = this.allCoordinates.reduce((acc, curr) => acc + (curr?.lng || 0), 0)

    const avgLats = sumLats / this.allCoordinates.length
    const avgLngs = sumLngs / this.allCoordinates.length

    if (isNaN(avgLats) || isNaN(avgLngs)) return this.defaultPosition

    return {
      lat: avgLats,
      lng: avgLngs,
    }
  }

  darkenColor(color: string, amount: number) {
    return darkenColor(color, amount)
  }
  
  marker(color: string) {
    return {
      path:
        'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z',
      fillColor: color,
      fillOpacity: 1,
      strokeColor: this.darkenColor(color, -50),
      strokeWeight: 2,
      scale: 1,
    }
  }

  toggleInfoWindow(job: Job, idx: any) {
    this.infoWindowPos = job
    // this.infoOptions.content = job.name
    this.infoContent = job

    //check if its the same marker that was selected if yes toggle
    if (this.currentMidx == idx) {
      this.infoWinOpen = !this.infoWinOpen
    }
    //if different marker set infowindow to open and reset current marker index
    else {
      this.infoWinOpen = true
      this.currentMidx = idx
    }
  }
}
</script>

<style lang="scss">
.gmap {
  .user-marker {
    border-radius: 50%;
  }
}
</style>