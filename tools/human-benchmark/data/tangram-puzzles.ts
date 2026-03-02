export interface TangramPiece {
  id: string
  color: string
  /** Polygon points at solution position (relative to 400x400 viewBox) */
  solutionPoints: [number, number][]
  /** Solution rotation (0-7, in 45° increments) */
  solutionRotation: number
  /** Solution flip (only relevant for parallelogram) */
  solutionFlip: boolean
}

export interface TangramPuzzle {
  name: string
  /** SVG path d-attribute for the target silhouette (outline of all pieces combined) */
  silhouettePath: string
  pieces: TangramPiece[]
  difficulty: number // 1-3
}

// Standard tangram piece colors
const COLORS = {
  largeTri1: '#E74C3C',
  largeTri2: '#3498DB',
  mediumTri: '#F39C12',
  smallTri1: '#2ECC71',
  smallTri2: '#9B59B6',
  square: '#E67E22',
  parallelogram: '#1ABC9C',
}

/**
 * Tangram puzzles organized by level.
 *
 * Coordinate system: 400x400 viewBox, grid-aligned to multiples of 25/50.
 * Levels 1-2: 3 pieces (simple shapes)
 * Levels 3-4: 4-5 pieces (medium)
 * Levels 5-7: 6 pieces (complex)
 * Levels 8+: all 7 pieces (full tangram)
 */
export const TANGRAM_PUZZLES: TangramPuzzle[][] = [
  // Level 1: Simple 3-piece shapes
  [
    {
      name: 'Arrow',
      silhouettePath: 'M 100,50 L 300,50 L 300,200 L 200,200 L 200,350 L 100,200 Z',
      difficulty: 1,
      pieces: [
        {
          id: 'large-tri-1',
          color: COLORS.largeTri1,
          solutionPoints: [[100, 50], [300, 50], [100, 200]],
          solutionRotation: 0,
          solutionFlip: false,
        },
        {
          id: 'large-tri-2',
          color: COLORS.largeTri2,
          solutionPoints: [[300, 50], [300, 200], [200, 200]],
          solutionRotation: 0,
          solutionFlip: false,
        },
        {
          id: 'small-tri-1',
          color: COLORS.smallTri1,
          solutionPoints: [[100, 200], [200, 200], [200, 350]],
          solutionRotation: 0,
          solutionFlip: false,
        },
      ],
    },
  ],

  // Level 2: Simple 3-piece shapes
  [
    {
      name: 'Sail',
      silhouettePath: 'M 100,50 L 300,200 L 100,350 Z',
      difficulty: 1,
      pieces: [
        {
          id: 'large-tri-1',
          color: COLORS.largeTri1,
          solutionPoints: [[100, 50], [300, 200], [100, 200]],
          solutionRotation: 0,
          solutionFlip: false,
        },
        {
          id: 'small-tri-1',
          color: COLORS.smallTri1,
          solutionPoints: [[100, 200], [200, 275], [100, 275]],
          solutionRotation: 0,
          solutionFlip: false,
        },
        {
          id: 'small-tri-2',
          color: COLORS.smallTri2,
          solutionPoints: [[100, 275], [200, 275], [100, 350]],
          solutionRotation: 0,
          solutionFlip: false,
        },
      ],
    },
  ],

  // Level 3: 4-piece shapes — Kite
  [
    {
      name: 'Kite',
      silhouettePath: 'M 200,50 L 325,200 L 200,375 L 75,200 Z',
      difficulty: 2,
      pieces: [
        {
          id: 'large-tri-1',
          color: COLORS.largeTri1,
          solutionPoints: [[200, 50], [325, 200], [200, 200]],
          solutionRotation: 0,
          solutionFlip: false,
        },
        {
          id: 'large-tri-2',
          color: COLORS.largeTri2,
          solutionPoints: [[200, 50], [200, 200], [75, 200]],
          solutionRotation: 0,
          solutionFlip: false,
        },
        {
          id: 'small-tri-1',
          color: COLORS.smallTri1,
          solutionPoints: [[75, 200], [200, 200], [200, 375]],
          solutionRotation: 0,
          solutionFlip: false,
        },
        {
          id: 'small-tri-2',
          color: COLORS.smallTri2,
          solutionPoints: [[200, 200], [325, 200], [200, 375]],
          solutionRotation: 0,
          solutionFlip: false,
        },
      ],
    },
  ],

  // Level 4: 5-piece shapes
  [
    {
      name: 'House',
      silhouettePath: 'M 200,50 L 350,150 L 350,350 L 50,350 L 50,150 Z',
      difficulty: 2,
      pieces: [
        {
          id: 'large-tri-1',
          color: COLORS.largeTri1,
          solutionPoints: [[200, 50], [350, 150], [50, 150]],
          solutionRotation: 0,
          solutionFlip: false,
        },
        {
          id: 'large-tri-2',
          color: COLORS.largeTri2,
          solutionPoints: [[50, 150], [200, 150], [50, 350]],
          solutionRotation: 0,
          solutionFlip: false,
        },
        {
          id: 'medium-tri',
          color: COLORS.mediumTri,
          solutionPoints: [[200, 150], [350, 150], [350, 250]],
          solutionRotation: 0,
          solutionFlip: false,
        },
        {
          id: 'small-tri-1',
          color: COLORS.smallTri1,
          solutionPoints: [[50, 350], [200, 150], [200, 350]],
          solutionRotation: 0,
          solutionFlip: false,
        },
        {
          id: 'square',
          color: COLORS.square,
          solutionPoints: [[200, 250], [350, 250], [350, 350], [200, 350]],
          solutionRotation: 0,
          solutionFlip: false,
        },
      ],
    },
  ],

  // Level 5: 6-piece shapes
  [
    {
      name: 'Boat',
      silhouettePath: 'M 50,150 L 200,50 L 350,150 L 375,250 L 25,250 Z',
      difficulty: 2,
      pieces: [
        {
          id: 'large-tri-1',
          color: COLORS.largeTri1,
          solutionPoints: [[50, 150], [200, 50], [200, 150]],
          solutionRotation: 0,
          solutionFlip: false,
        },
        {
          id: 'large-tri-2',
          color: COLORS.largeTri2,
          solutionPoints: [[200, 50], [350, 150], [200, 150]],
          solutionRotation: 0,
          solutionFlip: false,
        },
        {
          id: 'medium-tri',
          color: COLORS.mediumTri,
          solutionPoints: [[50, 150], [200, 150], [125, 250]],
          solutionRotation: 0,
          solutionFlip: false,
        },
        {
          id: 'small-tri-1',
          color: COLORS.smallTri1,
          solutionPoints: [[200, 150], [275, 250], [200, 250]],
          solutionRotation: 0,
          solutionFlip: false,
        },
        {
          id: 'small-tri-2',
          color: COLORS.smallTri2,
          solutionPoints: [[275, 250], [350, 150], [350, 250]],
          solutionRotation: 0,
          solutionFlip: false,
        },
        {
          id: 'parallelogram',
          color: COLORS.parallelogram,
          solutionPoints: [[25, 250], [50, 150], [125, 250], [100, 250]],
          solutionRotation: 0,
          solutionFlip: false,
        },
      ],
    },
  ],

  // Level 6: 6-piece shapes
  [
    {
      name: 'Fish',
      silhouettePath: 'M 50,200 L 150,100 L 250,100 L 350,50 L 350,350 L 250,300 L 150,300 Z',
      difficulty: 2,
      pieces: [
        {
          id: 'large-tri-1',
          color: COLORS.largeTri1,
          solutionPoints: [[150, 100], [250, 100], [250, 300]],
          solutionRotation: 0,
          solutionFlip: false,
        },
        {
          id: 'large-tri-2',
          color: COLORS.largeTri2,
          solutionPoints: [[250, 100], [350, 50], [350, 350]],
          solutionRotation: 0,
          solutionFlip: false,
        },
        {
          id: 'medium-tri',
          color: COLORS.mediumTri,
          solutionPoints: [[150, 100], [250, 300], [150, 300]],
          solutionRotation: 0,
          solutionFlip: false,
        },
        {
          id: 'small-tri-1',
          color: COLORS.smallTri1,
          solutionPoints: [[250, 100], [350, 350], [250, 300]],
          solutionRotation: 0,
          solutionFlip: false,
        },
        {
          id: 'small-tri-2',
          color: COLORS.smallTri2,
          solutionPoints: [[50, 200], [150, 100], [150, 200]],
          solutionRotation: 0,
          solutionFlip: false,
        },
        {
          id: 'square',
          color: COLORS.square,
          solutionPoints: [[50, 200], [150, 200], [150, 300], [50, 300]],
          solutionRotation: 0,
          solutionFlip: false,
        },
      ],
    },
  ],

  // Level 7: 6-piece shapes
  [
    {
      name: 'Diamond',
      silhouettePath: 'M 200,25 L 375,200 L 200,375 L 25,200 Z',
      difficulty: 3,
      pieces: [
        {
          id: 'large-tri-1',
          color: COLORS.largeTri1,
          solutionPoints: [[200, 25], [375, 200], [200, 200]],
          solutionRotation: 0,
          solutionFlip: false,
        },
        {
          id: 'large-tri-2',
          color: COLORS.largeTri2,
          solutionPoints: [[200, 25], [200, 200], [25, 200]],
          solutionRotation: 0,
          solutionFlip: false,
        },
        {
          id: 'medium-tri',
          color: COLORS.mediumTri,
          solutionPoints: [[25, 200], [200, 200], [200, 375]],
          solutionRotation: 0,
          solutionFlip: false,
        },
        {
          id: 'small-tri-1',
          color: COLORS.smallTri1,
          solutionPoints: [[200, 200], [375, 200], [287, 287]],
          solutionRotation: 0,
          solutionFlip: false,
        },
        {
          id: 'small-tri-2',
          color: COLORS.smallTri2,
          solutionPoints: [[287, 287], [200, 375], [200, 287]],
          solutionRotation: 0,
          solutionFlip: false,
        },
        {
          id: 'parallelogram',
          color: COLORS.parallelogram,
          solutionPoints: [[200, 287], [200, 375], [287, 287], [287, 200]],
          solutionRotation: 0,
          solutionFlip: false,
        },
      ],
    },
  ],

  // Level 8: Full 7-piece tangram — Square
  [
    {
      name: 'Square',
      silhouettePath: 'M 50,50 L 350,50 L 350,350 L 50,350 Z',
      difficulty: 3,
      pieces: [
        {
          id: 'large-tri-1',
          color: COLORS.largeTri1,
          solutionPoints: [[50, 50], [350, 50], [50, 350]],
          solutionRotation: 0,
          solutionFlip: false,
        },
        {
          id: 'large-tri-2',
          color: COLORS.largeTri2,
          solutionPoints: [[350, 50], [350, 350], [200, 200]],
          solutionRotation: 0,
          solutionFlip: false,
        },
        {
          id: 'medium-tri',
          color: COLORS.mediumTri,
          solutionPoints: [[50, 350], [200, 200], [200, 350]],
          solutionRotation: 0,
          solutionFlip: false,
        },
        {
          id: 'small-tri-1',
          color: COLORS.smallTri1,
          solutionPoints: [[200, 200], [275, 125], [275, 275]],
          solutionRotation: 0,
          solutionFlip: false,
        },
        {
          id: 'small-tri-2',
          color: COLORS.smallTri2,
          solutionPoints: [[200, 350], [275, 275], [350, 350]],
          solutionRotation: 0,
          solutionFlip: false,
        },
        {
          id: 'square',
          color: COLORS.square,
          solutionPoints: [[125, 275], [200, 200], [275, 275], [200, 350]],
          solutionRotation: 1, // rotated 45°
          solutionFlip: false,
        },
        {
          id: 'parallelogram',
          color: COLORS.parallelogram,
          solutionPoints: [[275, 125], [350, 50], [350, 200], [275, 275]],
          solutionRotation: 0,
          solutionFlip: false,
        },
      ],
    },
  ],

  // Level 9: Full 7-piece — Cat
  [
    {
      name: 'Cat',
      silhouettePath: 'M 100,50 L 150,50 L 200,100 L 250,50 L 300,50 L 300,200 L 350,200 L 350,350 L 50,350 L 50,200 L 100,200 Z',
      difficulty: 3,
      pieces: [
        {
          id: 'large-tri-1',
          color: COLORS.largeTri1,
          solutionPoints: [[50, 200], [350, 200], [50, 350]],
          solutionRotation: 0,
          solutionFlip: false,
        },
        {
          id: 'large-tri-2',
          color: COLORS.largeTri2,
          solutionPoints: [[350, 200], [350, 350], [200, 350]],
          solutionRotation: 0,
          solutionFlip: false,
        },
        {
          id: 'medium-tri',
          color: COLORS.mediumTri,
          solutionPoints: [[50, 350], [200, 350], [200, 200]],
          solutionRotation: 0,
          solutionFlip: false,
        },
        {
          id: 'small-tri-1',
          color: COLORS.smallTri1,
          solutionPoints: [[100, 50], [150, 50], [100, 200]],
          solutionRotation: 0,
          solutionFlip: false,
        },
        {
          id: 'small-tri-2',
          color: COLORS.smallTri2,
          solutionPoints: [[250, 50], [300, 50], [300, 200]],
          solutionRotation: 0,
          solutionFlip: false,
        },
        {
          id: 'square',
          color: COLORS.square,
          solutionPoints: [[150, 50], [200, 100], [250, 50], [200, 0]],
          solutionRotation: 1,
          solutionFlip: false,
        },
        {
          id: 'parallelogram',
          color: COLORS.parallelogram,
          solutionPoints: [[100, 200], [200, 200], [300, 200], [200, 150]],
          solutionRotation: 0,
          solutionFlip: false,
        },
      ],
    },
  ],

  // Level 10: Full 7-piece — Runner
  [
    {
      name: 'Runner',
      silhouettePath: 'M 150,25 L 250,25 L 250,125 L 325,200 L 350,350 L 250,350 L 200,250 L 150,350 L 50,350 L 100,200 L 150,125 Z',
      difficulty: 3,
      pieces: [
        {
          id: 'large-tri-1',
          color: COLORS.largeTri1,
          solutionPoints: [[150, 25], [250, 25], [150, 125]],
          solutionRotation: 0,
          solutionFlip: false,
        },
        {
          id: 'large-tri-2',
          color: COLORS.largeTri2,
          solutionPoints: [[250, 25], [250, 125], [325, 200]],
          solutionRotation: 0,
          solutionFlip: false,
        },
        {
          id: 'medium-tri',
          color: COLORS.mediumTri,
          solutionPoints: [[250, 350], [200, 250], [350, 350]],
          solutionRotation: 0,
          solutionFlip: false,
        },
        {
          id: 'small-tri-1',
          color: COLORS.smallTri1,
          solutionPoints: [[150, 125], [100, 200], [150, 200]],
          solutionRotation: 0,
          solutionFlip: false,
        },
        {
          id: 'small-tri-2',
          color: COLORS.smallTri2,
          solutionPoints: [[150, 350], [50, 350], [100, 200]],
          solutionRotation: 0,
          solutionFlip: false,
        },
        {
          id: 'square',
          color: COLORS.square,
          solutionPoints: [[200, 250], [150, 350], [100, 200], [150, 200]],
          solutionRotation: 0,
          solutionFlip: false,
        },
        {
          id: 'parallelogram',
          color: COLORS.parallelogram,
          solutionPoints: [[250, 125], [325, 200], [350, 350], [250, 350]],
          solutionRotation: 0,
          solutionFlip: false,
        },
      ],
    },
  ],
]
