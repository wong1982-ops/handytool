declare module 'amadeus' {
  interface AmadeusOptions {
    clientId: string
    clientSecret: string
  }

  interface AmadeusResponse {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    result: any
  }

  interface FlightOffersSearch {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get(params: Record<string, any>): Promise<AmadeusResponse>
  }

  interface Shopping {
    flightOffersSearch: FlightOffersSearch
  }

  interface Locations {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get(params: Record<string, any>): Promise<AmadeusResponse>
  }

  interface ReferenceData {
    locations: Locations
  }

  class Amadeus {
    constructor(options: AmadeusOptions)
    shopping: Shopping
    referenceData: ReferenceData
  }

  export = Amadeus
}
