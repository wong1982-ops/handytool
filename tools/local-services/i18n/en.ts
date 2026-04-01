export const en = {
  pageTitle: 'Local Services',
  pageDescription: 'Find nearby services — plumber, hairdresser, doctor, and more',

  locationBar: {
    title: 'Local Services',
    change: 'Change',
    detecting: 'Detecting location...',
    unknown: 'Location unknown',
  },

  search: {
    placeholder: 'Search services...',
  },

  categories: {
    title: 'What do you need?',
  },

  radius: {
    label: 'Search radius',
  },

  results: {
    noResults: 'No services found nearby',
    tryLarger: 'Try a larger radius or different category',
    loading: 'Searching nearby...',
    openNow: 'Open now',
    closed: 'Closed',
    closesAt: 'Closes at {time}',
    opensAt: 'Opens at {time}',
    km: '{d} km',
    m: '{d} m',
    reviews: 'Reviews',
    noReviews: 'No reviews yet',
  },

  detail: {
    call: 'Call',
    visit: 'Visit Website',
    copyInfo: 'Copy Info',
    save: 'Save',
    saved: 'Saved',
    openingHours: 'Opening Hours',
    centerMap: 'Show on Map',
    viewDetails: 'View Details',
  },

  tabs: {
    home: 'Home',
    favourites: 'Favourites',
    recent: 'Recent',
  },

  favourites: {
    title: 'Favourites',
    empty: 'No saved services yet',
    emptyHint: 'Tap the heart icon on any service to save it here',
    remove: 'Remove',
  },

  recent: {
    title: 'Recent Searches',
    empty: 'No recent searches',
    clearAll: 'Clear All',
    results: '{n} results',
  },

  location: {
    title: 'Set Location',
    placeholder: 'Enter address or suburb...',
    useGps: 'Use My Location',
    searching: 'Searching...',
    confirm: 'Confirm',
  },
} as const

type DeepStringify<T> = {
  [K in keyof T]: T[K] extends string ? string : DeepStringify<T[K]>
}

export type I18nStrings = DeepStringify<typeof en>
