import * as Geo from '@capacitor/geolocation'
import { api } from '@/util/axios'

export type Position = {
  latitude: number
  longitude: number
  accuracy?: number
  altitudeAccuracy?: number | null | undefined
  altitude?: number | null
  speed?: number | null
  heading?: number | null
  timestamp?: number
}

let watcher: string | null = null

export async function permissionGranted() {
  const permissions = await Geo.Geolocation.checkPermissions()
  return permissions.location === 'granted'
}

function setDeviceLocation({ commit }: any, position: Geo.Position) {
  const { coords, timestamp } = position
  const p: Position = {
    latitude: coords.latitude,
    longitude: coords.longitude,
    accuracy: coords.accuracy,
    altitudeAccuracy: coords.altitudeAccuracy,
    altitude: coords.altitude,
    speed: coords.speed,
    heading: coords.heading,
    timestamp,
  }
  commit('SET_DEVICE_LOCATION', p)
  // Send location to API
  api({
    method: 'POST',
    url: 'users/me/location',
    data: p,
  })
  return p
}

function onLocationChanged(store: any) {
  return (position: Geo.Position | null, err?: any) => {
    if (position) {
      setDeviceLocation(store, position)
    }
    if (err) {
      console.error(err)
    }
  }
}

export async function init(store: any) {
  if (watcher) return
  watcher = await Geo.Geolocation.watchPosition({
    enableHighAccuracy: false,
  }, onLocationChanged(store))
}

export async function stop() {
  if (watcher) await Geo.Geolocation.clearWatch({
    id: watcher
  })
}

export async function get(store: any) {
  init(store)
  const position = await Geo.Geolocation.getCurrentPosition({
    enableHighAccuracy: true
  })
  return setDeviceLocation(store, position)
}