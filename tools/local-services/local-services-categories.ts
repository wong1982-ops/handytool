import type { ServiceCategory } from './local-services-types'

export const CATEGORIES: ServiceCategory[] = [
  { id: 'moving', name: 'Moving', icon: '🚛', foursquareId: 'moving' },
  { id: 'plumber', name: 'Plumber', icon: '🔧', foursquareId: '11178' },
  { id: 'electrician', name: 'Electrician', icon: '⚡', foursquareId: '11176' },
  { id: 'hairdresser', name: 'Hairdresser', icon: '✂️', foursquareId: '11057' },
  { id: 'lawn-garden', name: 'Lawn & Garden', icon: '🌿', foursquareId: '11182' },
  { id: 'cleaning', name: 'Cleaning', icon: '🧹', foursquareId: '11174' },
  { id: 'locksmith', name: 'Locksmith', icon: '🔑', foursquareId: '11183' },
  { id: 'mechanic', name: 'Mechanic', icon: '🔧', foursquareId: '11029' },
  { id: 'doctor', name: 'Doctor / GP', icon: '🏥', foursquareId: '15014' },
  { id: 'dentist', name: 'Dentist', icon: '🦷', foursquareId: '15010' },
  { id: 'pharmacy', name: 'Pharmacy', icon: '💊', foursquareId: '15022' },
  { id: 'vet', name: 'Vet', icon: '🐾', foursquareId: '15048' },
  { id: 'childcare', name: 'Childcare', icon: '👶', foursquareId: '12056' },
  { id: 'restaurant', name: 'Restaurant', icon: '🍽️', foursquareId: '13065' },
  { id: 'cafe', name: 'Cafe', icon: '☕', foursquareId: '13032' },
  { id: 'supermarket', name: 'Supermarket', icon: '🛒', foursquareId: '17069' },
  { id: 'gym', name: 'Gym', icon: '💪', foursquareId: '18021' },
  { id: 'laundry', name: 'Laundry', icon: '👕', foursquareId: '11185' },
]

export function getCategoryById(id: string): ServiceCategory | undefined {
  return CATEGORIES.find(c => c.id === id)
}

export function getCategoryByFoursquareId(fsId: string): ServiceCategory | undefined {
  return CATEGORIES.find(c => c.foursquareId === fsId)
}
