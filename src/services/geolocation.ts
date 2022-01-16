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
    enableHighAccuracy: false
  })
  return setDeviceLocation(store, position)
}
/* 

def haversine(lat1, lng1, lat2, lng2):
    """
    Calculate the great circle distance between two points
    on the earth (specified in decimal degrees)
    """
    # convert decimal degrees to radians
    lng1, lat1, lng2, lat2 = map(radians, [lng1, lat1, lng2, lat2])

    # haversine formula
    dlng = lng2 - lng1
    dlat = lat2 - lat1
    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlng / 2) ** 2
    c = 2 * asin(sqrt(a))
    r = 6371000  # Radius of earth in meters.
    return c * r
    
*/

// Convert degress to radians
function radians(degress: number) {
  return degress * Math.PI / 180
}

/* 
  Calculate the great circle distance between two points
  on the earth (specified in decimal degrees)
*/
export function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
  // convert decimal degrees to radians
  lng1 = radians(lng1)
  lat1 = radians(lat1)
  lng2 = radians(lng2)
  lat2 = radians(lat2)

  // haversine formula
  const dlng = lng2 - lng1
  const dlat = lat2 - lat1

  const a = Math.sin(dlat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlng / 2) ** 2
  const c = 2 * Math.asin(Math.sqrt(a))
  const r = 6371000  // Radius of earth in meters.

  return c * r
}

type Location = [number, number]

export function withinBounds(location1: Location, r1: number, location2: Location, r2: number) {
  const distance = haversine(location1[0], location1[1], location2[0], location2[1])
  return r1 + r2 >= distance
}