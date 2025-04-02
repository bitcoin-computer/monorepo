import * as turf from '@turf/turf'
import usStatesJson from '../geodata/us-states.json' assert { type: 'json' }
const usStates: StatesGeoJSON = usStatesJson as StatesGeoJSON

interface StateProperties {
  name: string
  density: number
}

type StateFeature = GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon, StateProperties>
type StatesGeoJSON = GeoJSON.FeatureCollection<
  GeoJSON.Polygon | GeoJSON.MultiPolygon,
  StateProperties
>

function getStatesContainingPoint(point: GeoJSON.Point, geojsonData: StatesGeoJSON): string[] {
  const matchingStates: string[] = []

  geojsonData.features.forEach((state: StateFeature) => {
    if (turf.booleanPointInPolygon(point, state.geometry)) {
      const stateName = state.properties.name
      matchingStates.push(stateName)
    }
  })

  return matchingStates
}

export const checkGeoLocation = async (): Promise<boolean> => {
  const isEnabled = import.meta.env.VITE_ENABLE_GEOLOCATION === 'true'
  const blockedStates: string[] = import.meta.env.VITE_BLOCKED_STATES?.split(',') || []

  if (!isEnabled) return true // Skip geolocation checks if not enabled

  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords

          const point = turf.point([longitude, latitude])

          const statesContainingPoint = getStatesContainingPoint(point.geometry, usStates)
          if (statesContainingPoint.length > 1) {
            // The getStatesContainingPoint returned multiple points this is not expected
            resolve(false)
          } else if (statesContainingPoint[0] && blockedStates.includes(statesContainingPoint[0])) {
            // The user is accessing from one of the blocked US states
            resolve(false)
          } else {
            resolve(true)
          }
        } catch (error) {
          reject(new Error('Failed to determine your location. Please try again.'))
        }
      },
      () => {
        reject(new Error('You denied location access. Location is mandatory for legal reasons.'))
      },
    )
  })
}
