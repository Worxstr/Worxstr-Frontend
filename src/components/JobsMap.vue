<template lang="pug">
  GmapMap(
    :center="centerLocation",
    :zoom="zoomLevel",
    :style='`height: ${height}`'
  )
    GmapCircle(
      v-if='userLocation'
      :center='userLocation'
      :radius='locationAccuracy'
      :options="{fillColor: '#4285f4',fillOpacity: .15, strokeColor: 'TRANSPARENT'}"
    )
    GmapMarker(
      v-if='userLocation'
      :position="userLocation"
      :icon="{ url: require('@/assets/icons/current-location-marker.svg')}"
    )
    
    GmapCircle(
      v-for='job in jobs'
      :key='`circle-${job.id}`'
      :center='jobLocation(job)'
      :radius='job.radius || 75'
      :options="{fillColor: job.color || '#ea4335', fillOpacity: .15, strokeColor: 'white'}"
    )
    GmapMarker(
      v-for='job in jobs'
      :key='`marker-${job.id}`'
      :position="jobLocation(job)"
      :options="{fillColor: job.color || '#ea4335'}"
    )
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { Geolocation } from '@capacitor/geolocation'
import { Job } from '@/definitions/Job'

@Component
export default class JobsMap extends Vue {
  
  userLocation: any = null
  locationAccuracy: null | number = null
  
  @Prop(Array) readonly jobs!: Array<Job>
  @Prop({ default: '40vh' }) height!: string
  @Prop({ default: false }) hideUserLocation!: boolean

  async mounted() {
    this.getUserLocation()
  }

  async getUserLocation() {

    if (this.hideUserLocation) return

    // TODO: Keep track of user location in global app state

    const { coords /* , timestamp */ } = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
    })

    // Watch position changes
    /* Geolocation.watchPosition({
      enableHighAccuracy: true,
    }, ({coords}) => {
      this.updatePosition(coords)
    }) */

    this.updatePosition(coords)
  }

  updatePosition(coords: any) {
    console.log({coords})
    this.locationAccuracy = coords.accuracy
    this.userLocation = {
      lat: coords.latitude,
      lng: coords.longitude,
    }
  }

  // Calculate appropriate zoom level to display user location and job location
  get zoomLevel() {
    if (!this.jobs) return 17

    const distance = this.maxDistanceBetweenAllJobs(this.jobs)
    const zoom = Math.abs(Math.log2(distance / 360))

    return Math.min(zoom, 19)
  }

  maxDistanceBetweenAllJobs(jobs: Array<Job>) {
    let max = 0
    const n = jobs.length

    for (let i = 0; i < n; i++) {
      
      // Compare each job to every other job
      for (let j = i + 1; j < n; j++) {
        max = Math.max(max, this.distanceBetweenPoints(jobs[i], jobs[j]))
      }

      if (this.userLocation) {
        // Compare each job to user location
        max = Math.max(max, this.distanceBetweenPoints(jobs[i], {
          latitude: this.userLocation.lat,
          longitude: this.userLocation.lng,
        }))
      }
    }

    return max
  }

  distanceBetweenPoints(a: any, b: any) {
    const deltaA = a.latitude - b.latitude
    const deltaB = a.longitude - b.longitude

    return Math.sqrt(deltaA**2 + deltaB**2)
  }

  get centerLocation() {
    const sumLats = this.jobs.reduce((acc, job) => acc + job.latitude, 0) + (this.userLocation?.lat || 0)
    const sumLngs = this.jobs.reduce((acc, job) => acc + job.longitude, 0) + (this.userLocation?.lng || 0)
    const avgLats = sumLats / (this.jobs.length + (this.userLocation ? 1 : 0))
    const avgLngs = sumLngs / (this.jobs.length + (this.userLocation ? 1 : 0))

    return {
      lat: avgLats,
      lng: avgLngs,
    }
  }

  jobLocation(job: Job) {
    return { lat: job.latitude, lng: job.longitude }
  }
}
</script>