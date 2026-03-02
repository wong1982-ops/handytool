export interface MapRegion {
  id: string
  path: string
  centroid: [number, number]
}

export interface FourColourMap {
  name: string
  regions: MapRegion[]
  adjacency: Record<string, string[]>
  chromaticNumber: number
}

// Maps grouped by level (array of variants per level)
export const FOUR_COLOUR_MAPS: FourColourMap[][] = [
  // Level 1: 4 regions, linear chain (chromatic number 2)
  [
    {
      name: 'Four Strips',
      regions: [
        { id: 'A', path: 'M0 0 H75 V300 H0 Z', centroid: [37, 150] },
        { id: 'B', path: 'M75 0 H150 V300 H75 Z', centroid: [112, 150] },
        { id: 'C', path: 'M150 0 H225 V300 H150 Z', centroid: [187, 150] },
        { id: 'D', path: 'M225 0 H300 V300 H225 Z', centroid: [262, 150] },
      ],
      adjacency: {
        A: ['B'],
        B: ['A', 'C'],
        C: ['B', 'D'],
        D: ['C'],
      },
      chromaticNumber: 2,
    },
  ],

  // Level 2: 5 regions, cycle (chromatic number 3 — odd cycle)
  [
    {
      name: 'Pentagon Ring',
      regions: [
        { id: 'A', path: 'M150 10 L250 90 L210 200 L90 200 L50 90 Z', centroid: [150, 120] },
        { id: 'B', path: 'M0 0 H300 V50 L250 90 L150 10 L50 90 L0 50 Z', centroid: [150, 25] },
        { id: 'C', path: 'M250 90 L300 50 V250 L210 200 Z', centroid: [265, 150] },
        { id: 'D', path: 'M210 200 L300 250 V300 H0 V250 L90 200 Z', centroid: [150, 265] },
        { id: 'E', path: 'M50 90 L90 200 L0 250 V50 Z', centroid: [35, 150] },
      ],
      adjacency: {
        A: ['B', 'C', 'D', 'E'],
        B: ['A', 'C', 'E'],
        C: ['A', 'B', 'D'],
        D: ['A', 'C', 'E'],
        E: ['A', 'B', 'D'],
      },
      chromaticNumber: 3,
    },
  ],

  // Level 3: 6 regions, triangular mesh (chromatic number 3)
  [
    {
      name: 'Six Triangles',
      regions: [
        { id: 'A', path: 'M0 0 H150 V150 H0 Z', centroid: [50, 50] },
        { id: 'B', path: 'M150 0 H300 V150 H150 Z', centroid: [250, 50] },
        { id: 'C', path: 'M0 150 H150 V300 H0 Z', centroid: [50, 250] },
        { id: 'D', path: 'M150 150 H300 V300 H150 Z', centroid: [250, 250] },
        { id: 'E', path: 'M75 75 L150 0 V150 H150 L75 75 Z M75 75 L0 150 H150 V150 L75 75 Z', centroid: [75, 75] },
        { id: 'F', path: 'M225 75 L300 150 V150 H150 L225 75 Z M225 75 L150 0 V0 H150 V150 L225 75 Z', centroid: [225, 75] },
      ],
      adjacency: {
        A: ['B', 'C', 'E'],
        B: ['A', 'D', 'F'],
        C: ['A', 'D', 'E'],
        D: ['B', 'C', 'F'],
        E: ['A', 'C'],
        F: ['B', 'D'],
      },
      chromaticNumber: 3,
    },
    {
      name: 'Grid with Diagonal',
      regions: [
        { id: 'A', path: 'M0 0 H150 L0 150 Z', centroid: [50, 50] },
        { id: 'B', path: 'M150 0 H300 V150 H150 Z', centroid: [225, 75] },
        { id: 'C', path: 'M0 0 L150 0 V150 L0 150 Z', centroid: [50, 50] },
        { id: 'D', path: 'M0 150 L150 150 V300 H0 Z', centroid: [75, 225] },
        { id: 'E', path: 'M150 150 H300 V300 H150 Z', centroid: [225, 225] },
        { id: 'F', path: 'M150 0 V150 L0 150 Z', centroid: [100, 100] },
      ],
      adjacency: {
        A: ['B', 'D', 'F'],
        B: ['A', 'E', 'F'],
        D: ['A', 'E', 'F'],
        E: ['B', 'D'],
        F: ['A', 'B', 'D'],
        C: [],
      },
      chromaticNumber: 3,
    },
  ],

  // Level 4: 7 regions (chromatic number 4 — contains K4)
  [
    {
      name: 'Central Hub',
      regions: [
        { id: 'A', path: 'M100 100 H200 V200 H100 Z', centroid: [150, 150] },
        { id: 'B', path: 'M0 0 H150 V100 H100 L0 100 Z', centroid: [60, 50] },
        { id: 'C', path: 'M150 0 H300 V100 H200 V100 H150 Z', centroid: [240, 50] },
        { id: 'D', path: 'M200 100 H300 V200 H200 Z', centroid: [250, 150] },
        { id: 'E', path: 'M200 200 H300 V300 H150 V200 Z', centroid: [240, 250] },
        { id: 'F', path: 'M0 200 H100 V200 L150 300 H0 Z', centroid: [60, 250] },
        { id: 'G', path: 'M0 100 H100 V200 H0 Z', centroid: [50, 150] },
      ],
      adjacency: {
        A: ['B', 'C', 'D', 'E', 'F', 'G'],
        B: ['A', 'C', 'G'],
        C: ['A', 'B', 'D'],
        D: ['A', 'C', 'E'],
        E: ['A', 'D', 'F'],
        F: ['A', 'E', 'G'],
        G: ['A', 'B', 'F'],
      },
      chromaticNumber: 4,
    },
  ],

  // Level 5: 8 regions (chromatic number 4)
  [
    {
      name: 'Wheel Graph',
      regions: [
        { id: 'A', path: 'M110 110 H190 V190 H110 Z', centroid: [150, 150] },
        { id: 'B', path: 'M0 0 H150 V110 H110 L0 110 Z', centroid: [60, 55] },
        { id: 'C', path: 'M150 0 H300 V110 H190 V110 H150 Z', centroid: [240, 55] },
        { id: 'D', path: 'M190 110 H300 V150 H190 Z', centroid: [245, 130] },
        { id: 'E', path: 'M190 150 H300 V300 H190 Z', centroid: [245, 225] },
        { id: 'F', path: 'M110 190 H190 V300 H110 Z', centroid: [150, 245] },
        { id: 'G', path: 'M0 190 H110 V300 H0 Z', centroid: [55, 245] },
        { id: 'H', path: 'M0 110 H110 V190 H0 Z', centroid: [55, 150] },
      ],
      adjacency: {
        A: ['B', 'C', 'D', 'E', 'F', 'G', 'H'],
        B: ['A', 'C', 'H'],
        C: ['A', 'B', 'D'],
        D: ['A', 'C', 'E'],
        E: ['A', 'D', 'F'],
        F: ['A', 'E', 'G'],
        G: ['A', 'F', 'H'],
        H: ['A', 'B', 'G'],
      },
      chromaticNumber: 4,
    },
  ],

  // Level 6: 10 regions (chromatic number 4)
  [
    {
      name: 'Diamond Grid',
      regions: [
        { id: 'A', path: 'M0 0 H100 V100 H0 Z', centroid: [50, 50] },
        { id: 'B', path: 'M100 0 H200 V100 H100 Z', centroid: [150, 50] },
        { id: 'C', path: 'M200 0 H300 V100 H200 Z', centroid: [250, 50] },
        { id: 'D', path: 'M0 100 H100 V200 H0 Z', centroid: [50, 150] },
        { id: 'E', path: 'M100 100 L200 100 L150 150 Z', centroid: [150, 115] },
        { id: 'F', path: 'M100 100 L150 150 L100 200 Z', centroid: [115, 150] },
        { id: 'G', path: 'M200 100 L150 150 L200 200 Z', centroid: [185, 150] },
        { id: 'H', path: 'M100 200 L150 150 L200 200 Z', centroid: [150, 185] },
        { id: 'I', path: 'M0 200 H100 V300 H0 Z M100 200 H200 V300 H100 Z', centroid: [100, 250] },
        { id: 'J', path: 'M200 100 H300 V300 H200 Z', centroid: [250, 200] },
      ],
      adjacency: {
        A: ['B', 'D'],
        B: ['A', 'C', 'E'],
        C: ['B', 'J'],
        D: ['A', 'F', 'I'],
        E: ['B', 'F', 'G'],
        F: ['D', 'E', 'H'],
        G: ['E', 'H', 'J'],
        H: ['F', 'G', 'I'],
        I: ['D', 'H'],
        J: ['C', 'G'],
      },
      chromaticNumber: 3,
    },
    {
      name: 'Interlocking Regions',
      regions: [
        { id: 'A', path: 'M0 0 H150 V75 H0 Z', centroid: [75, 37] },
        { id: 'B', path: 'M150 0 H300 V75 H150 Z', centroid: [225, 37] },
        { id: 'C', path: 'M0 75 H100 V175 H0 Z', centroid: [50, 125] },
        { id: 'D', path: 'M100 75 H200 V175 H100 Z', centroid: [150, 125] },
        { id: 'E', path: 'M200 75 H300 V175 H200 Z', centroid: [250, 125] },
        { id: 'F', path: 'M0 175 H75 V250 H0 Z', centroid: [37, 212] },
        { id: 'G', path: 'M75 175 H150 V250 H75 Z', centroid: [112, 212] },
        { id: 'H', path: 'M150 175 H225 V250 H150 Z', centroid: [187, 212] },
        { id: 'I', path: 'M225 175 H300 V250 H225 Z', centroid: [262, 212] },
        { id: 'J', path: 'M0 250 H300 V300 H0 Z', centroid: [150, 275] },
      ],
      adjacency: {
        A: ['B', 'C', 'D'],
        B: ['A', 'D', 'E'],
        C: ['A', 'D', 'F', 'G'],
        D: ['A', 'B', 'C', 'E', 'G', 'H'],
        E: ['B', 'D', 'H', 'I'],
        F: ['C', 'G', 'J'],
        G: ['C', 'D', 'F', 'H', 'J'],
        H: ['D', 'E', 'G', 'I', 'J'],
        I: ['E', 'H', 'J'],
        J: ['F', 'G', 'H', 'I'],
      },
      chromaticNumber: 4,
    },
  ],

  // Level 7: 12 regions (chromatic number 4)
  [
    {
      name: 'Hex Grid',
      regions: [
        { id: 'A', path: 'M0 0 H100 V75 H0 Z', centroid: [50, 37] },
        { id: 'B', path: 'M100 0 H200 V75 H100 Z', centroid: [150, 37] },
        { id: 'C', path: 'M200 0 H300 V75 H200 Z', centroid: [250, 37] },
        { id: 'D', path: 'M0 75 H75 V150 H0 Z', centroid: [37, 112] },
        { id: 'E', path: 'M75 75 H150 V150 H75 Z', centroid: [112, 112] },
        { id: 'F', path: 'M150 75 H225 V150 H150 Z', centroid: [187, 112] },
        { id: 'G', path: 'M225 75 H300 V150 H225 Z', centroid: [262, 112] },
        { id: 'H', path: 'M0 150 H100 V225 H0 Z', centroid: [50, 187] },
        { id: 'I', path: 'M100 150 H200 V225 H100 Z', centroid: [150, 187] },
        { id: 'J', path: 'M200 150 H300 V225 H200 Z', centroid: [250, 187] },
        { id: 'K', path: 'M0 225 H150 V300 H0 Z', centroid: [75, 262] },
        { id: 'L', path: 'M150 225 H300 V300 H150 Z', centroid: [225, 262] },
      ],
      adjacency: {
        A: ['B', 'D', 'E'],
        B: ['A', 'C', 'E', 'F'],
        C: ['B', 'F', 'G'],
        D: ['A', 'E', 'H'],
        E: ['A', 'B', 'D', 'F', 'H', 'I'],
        F: ['B', 'C', 'E', 'G', 'I', 'J'],
        G: ['C', 'F', 'J'],
        H: ['D', 'E', 'I', 'K'],
        I: ['E', 'F', 'H', 'J', 'K', 'L'],
        J: ['F', 'G', 'I', 'L'],
        K: ['H', 'I', 'L'],
        L: ['I', 'J', 'K'],
      },
      chromaticNumber: 4,
    },
  ],

  // Level 8: 15 regions (chromatic number 4)
  [
    {
      name: 'City Blocks',
      regions: [
        { id: 'A', path: 'M0 0 H100 V60 H0 Z', centroid: [50, 30] },
        { id: 'B', path: 'M100 0 H200 V60 H100 Z', centroid: [150, 30] },
        { id: 'C', path: 'M200 0 H300 V60 H200 Z', centroid: [250, 30] },
        { id: 'D', path: 'M0 60 H60 V120 H0 Z', centroid: [30, 90] },
        { id: 'E', path: 'M60 60 H150 V120 H60 Z', centroid: [105, 90] },
        { id: 'F', path: 'M150 60 H240 V120 H150 Z', centroid: [195, 90] },
        { id: 'G', path: 'M240 60 H300 V120 H240 Z', centroid: [270, 90] },
        { id: 'H', path: 'M0 120 H100 V180 H0 Z', centroid: [50, 150] },
        { id: 'I', path: 'M100 120 H200 V180 H100 Z', centroid: [150, 150] },
        { id: 'J', path: 'M200 120 H300 V180 H200 Z', centroid: [250, 150] },
        { id: 'K', path: 'M0 180 H75 V240 H0 Z', centroid: [37, 210] },
        { id: 'L', path: 'M75 180 H175 V240 H75 Z', centroid: [125, 210] },
        { id: 'M', path: 'M175 180 H300 V240 H175 Z', centroid: [237, 210] },
        { id: 'N', path: 'M0 240 H150 V300 H0 Z', centroid: [75, 270] },
        { id: 'O', path: 'M150 240 H300 V300 H150 Z', centroid: [225, 270] },
      ],
      adjacency: {
        A: ['B', 'D', 'E'],
        B: ['A', 'C', 'E', 'F'],
        C: ['B', 'F', 'G'],
        D: ['A', 'E', 'H'],
        E: ['A', 'B', 'D', 'F', 'H', 'I'],
        F: ['B', 'C', 'E', 'G', 'I', 'J'],
        G: ['C', 'F', 'J'],
        H: ['D', 'E', 'I', 'K', 'L'],
        I: ['E', 'F', 'H', 'J', 'L', 'M'],
        J: ['F', 'G', 'I', 'M'],
        K: ['H', 'L', 'N'],
        L: ['H', 'I', 'K', 'M', 'N', 'O'],
        M: ['I', 'J', 'L', 'O'],
        N: ['K', 'L', 'O'],
        O: ['L', 'M', 'N'],
      },
      chromaticNumber: 4,
    },
  ],
]
