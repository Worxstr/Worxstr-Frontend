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
    
    div(v-for='(job, i) in jobs' :key='job.id')
      GmapCircle(
        :center='jobLocation(job)'
        :radius='job.radius || 75'
        :options="{fillColor: job.color || '#ea4335', fillOpacity: .15, strokeColor: darkenColor(job.color, 30)}"
      )
      GmapMarker(
        :position="jobLocation(job)"
        :options="{icon: marker(job.color)}"
        :clickable='true'
        @click='toggleInfoWindow(job, i)'
      )
    GmapInfoWindow(
      :options='infoOptions'
      :position='infoWindowPos'
      :opened='infoWinOpen'
      @closeclick='infoWinOpen = false'
    )
      .info_window.container(v-if='infoContent')
        h3 {{ infoContent.name }}
        p {{ infoContent.address }}
        router-link(:to="{name: 'job', params: {jobId: infoContent.id}}") View job
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { Geolocation } from '@capacitor/geolocation'
import { Job } from '@/definitions/Job'

type LatLng = {
  lat: number;
  lng: number;
}

@Component
export default class JobsMap extends Vue {
  userLocation: LatLng | null = null
  locationAccuracy: number | null = null

  infoWindowPos: LatLng | null = null
  infoWinOpen = false
  currentMidx = null
  infoContent: Job | null = null
  infoOptions = {
    // content: '',
    pixelOffset: {
      width: 0,
      height: -30,
    },
  }

  @Prop(Array) readonly jobs!: Array<Job>
  @Prop({ default: '40vh' }) height!: string
  @Prop({ default: false }) showUserLocation!: boolean

  async mounted() {
    this.getUserLocation()
  }

  async getUserLocation() {
    if (!this.showUserLocation) return

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
    console.log({ coords })
    this.locationAccuracy = coords.accuracy
    this.userLocation = {
      lat: coords.latitude,
      lng: coords.longitude,
    }
  }

  // Calculate appropriate zoom level to display user location and job location
  get zoomLevel() {
    if (!this.jobs) return 16

    const distance = this.maxDistanceBetweenAllJobs(this.jobs)
    const zoom = Math.abs(Math.ceil(Math.log2(distance / 360)))

    return Math.min(zoom, 16)
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
        max = Math.max(
          max,
          this.distanceBetweenPoints(jobs[i], {
            latitude: this.userLocation.lat,
            longitude: this.userLocation.lng,
          })
        )
      }
    }

    return max
  }

  distanceBetweenPoints(a: any, b: any) {
    const deltaA = a.latitude - b.latitude
    const deltaB = a.longitude - b.longitude

    return Math.sqrt(deltaA ** 2 + deltaB ** 2)
  }

  get centerLocation() {
    const sumLats =
      this.jobs.reduce((acc, job) => acc + job.latitude, 0) +
      (this.userLocation?.lat || 0)
    const sumLngs =
      this.jobs.reduce((acc, job) => acc + job.longitude, 0) +
      (this.userLocation?.lng || 0)
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

  darkenColor(color: string, amount: number) {
    const c = /^#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})$/.exec(color)!
    return `#${c[1] +
      (~~Math.min(Math.max(parseInt(c[2], 16) + amount, 0), 255)).toString(
        16
      )}${c[3]}`
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

  toggleInfoWindow(job: Job, idx) {
    this.infoWindowPos = this.jobLocation(job)
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
