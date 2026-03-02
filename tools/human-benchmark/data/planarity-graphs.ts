export interface PlanarityGraph {
  /** Planar node positions (solution - no crossings) */
  solutionPositions: [number, number][]
  /** Scrambled starting positions (creates crossings) */
  startPositions: [number, number][]
  edges: [number, number][]
}

/**
 * Each level is an array of graph variants (pick one at random).
 * All graphs are planar — solution positions have zero crossings.
 * Positions are within a 300x300 viewBox, staying in 20-280 range.
 *
 * Construction strategy:
 * - Fan triangulations: all diagonals from one vertex (guaranteed no chord crossings)
 * - Grid-based graphs: nodes on a grid with only adjacent connections
 * - Wheel graphs: center node + outer ring
 * - Nested polygons: concentric rings with radial spokes
 */
export const PLANARITY_GRAPHS: PlanarityGraph[][] = [
  // Level 1: 4 nodes, 4 edges (square — cycle only)
  [
    {
      solutionPositions: [
        [80, 80],
        [220, 80],
        [220, 220],
        [80, 220],
      ],
      startPositions: [
        [80, 60],
        [220, 240],
        [80, 240],
        [220, 60],
      ],
      edges: [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 0],
      ],
    },
    {
      solutionPositions: [
        [150, 40],
        [260, 150],
        [150, 260],
        [40, 150],
      ],
      startPositions: [
        [60, 60],
        [240, 240],
        [60, 240],
        [240, 60],
      ],
      edges: [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 0],
      ],
    },
  ],

  // Level 2: 4 nodes, 5 edges (square + one diagonal — fan from node 0)
  [
    {
      solutionPositions: [
        [150, 40],
        [260, 200],
        [150, 260],
        [40, 200],
      ],
      startPositions: [
        [220, 80],
        [80, 80],
        [220, 220],
        [80, 220],
      ],
      edges: [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 0],
        [0, 2],
      ],
    },
  ],

  // Level 3: 5 nodes, 7 edges (pentagon + fan from node 0: diagonals 0-2, 0-3)
  [
    {
      solutionPositions: [
        [150, 30],
        [270, 110],
        [220, 260],
        [80, 260],
        [30, 110],
      ],
      startPositions: [
        [250, 50],
        [50, 50],
        [250, 250],
        [50, 250],
        [150, 150],
      ],
      edges: [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 4],
        [4, 0],
        [0, 2],
        [0, 3],
      ],
    },
  ],

  // Level 4: 6 nodes, 9 edges (hexagon + fan from 0: diags 0-2, 0-3, 0-4)
  [
    {
      solutionPositions: [
        [150, 30],
        [270, 100],
        [270, 220],
        [150, 270],
        [30, 220],
        [30, 100],
      ],
      startPositions: [
        [240, 40],
        [60, 40],
        [150, 150],
        [60, 260],
        [240, 260],
        [150, 60],
      ],
      edges: [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 4],
        [4, 5],
        [5, 0],
        [0, 2],
        [0, 3],
        [0, 4],
      ],
    },
  ],

  // Level 5: 7 nodes, 11 edges (wheel graph W6: center node 6 + hexagon 0-5)
  [
    {
      solutionPositions: [
        [150, 30],
        [268, 90],
        [268, 210],
        [150, 270],
        [32, 210],
        [32, 90],
        [150, 150],
      ],
      startPositions: [
        [230, 50],
        [70, 250],
        [70, 50],
        [230, 250],
        [150, 100],
        [250, 150],
        [50, 150],
      ],
      edges: [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 4],
        [4, 5],
        [5, 0],
        [0, 6],
        [1, 6],
        [2, 6],
        [3, 6],
        [4, 6],
      ],
    },
  ],

  // Level 6: 8 nodes, 13 edges (wheel W7: center 7 + heptagon 0-6)
  [
    {
      solutionPositions: [
        [150, 25],
        [250, 55],
        [278, 155],
        [228, 255],
        [72, 255],
        [22, 155],
        [50, 55],
        [150, 150],
      ],
      startPositions: [
        [220, 40],
        [80, 220],
        [220, 220],
        [80, 40],
        [260, 150],
        [40, 150],
        [150, 260],
        [150, 40],
      ],
      edges: [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 4],
        [4, 5],
        [5, 6],
        [6, 0],
        [0, 7],
        [1, 7],
        [2, 7],
        [3, 7],
        [4, 7],
        [5, 7],
      ],
    },
  ],

  // Level 7: 9 nodes, 15 edges
  // Nested triangles with radial connections + extra triangulation
  // Outer: 0,1,2  Mid: 3,4,5  Inner: 6,7,8
  [
    {
      solutionPositions: [
        [150, 25],   // 0 top
        [270, 250],  // 1 bottom-right
        [30, 250],   // 2 bottom-left
        [150, 80],   // 3 mid-top
        [230, 210],  // 4 mid-bottom-right
        [70, 210],   // 5 mid-bottom-left
        [150, 130],  // 6 inner-top
        [190, 190],  // 7 inner-bottom-right
        [110, 190],  // 8 inner-bottom-left
      ],
      startPositions: [
        [200, 30],
        [100, 240],
        [250, 150],
        [50, 50],
        [250, 250],
        [50, 150],
        [200, 250],
        [150, 130],
        [100, 50],
      ],
      edges: [
        // Outer triangle
        [0, 1],
        [1, 2],
        [2, 0],
        // Outer to mid
        [0, 3],
        [1, 4],
        [2, 5],
        // Mid triangle
        [3, 4],
        [4, 5],
        [5, 3],
        // Mid to inner
        [3, 6],
        [4, 7],
        [5, 8],
        // Inner triangle
        [6, 7],
        [7, 8],
        [8, 6],
      ],
    },
  ],

  // Level 8: 10 nodes, 18 edges
  // Wheel W8 (center=9, octagon 0-7) + 2 extra fan chords from 0
  [
    {
      solutionPositions: [
        [150, 25],   // 0
        [240, 45],   // 1
        [278, 130],  // 2
        [265, 225],  // 3
        [195, 275],  // 4
        [105, 275],  // 5
        [35, 225],   // 6
        [22, 130],   // 7
        [60, 45],    // 8
        [150, 155],  // 9 center
      ],
      startPositions: [
        [200, 30],
        [50, 200],
        [250, 200],
        [100, 30],
        [200, 260],
        [100, 260],
        [260, 100],
        [40, 100],
        [150, 150],
        [150, 50],
      ],
      edges: [
        // Nonagon 0-8
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 4],
        [4, 5],
        [5, 6],
        [6, 7],
        [7, 8],
        [8, 0],
        // Spokes to center
        [0, 9],
        [1, 9],
        [2, 9],
        [3, 9],
        [4, 9],
        [5, 9],
        [6, 9],
        [7, 9],
        [8, 9],
      ],
    },
  ],

  // Level 9: 12 nodes, 22 edges
  // Two nested hexagons with radial spokes + triangulation
  // Outer hex: 0-5, Inner hex: 6-11
  [
    {
      solutionPositions: [
        [150, 22],   // 0
        [261, 86],   // 1
        [261, 214],  // 2
        [150, 278],  // 3
        [39, 214],   // 4
        [39, 86],    // 5
        [150, 75],   // 6
        [215, 112],  // 7
        [215, 188],  // 8
        [150, 225],  // 9
        [85, 188],   // 10
        [85, 112],   // 11
      ],
      startPositions: [
        [230, 40],
        [70, 230],
        [230, 230],
        [70, 40],
        [270, 150],
        [30, 150],
        [150, 270],
        [150, 30],
        [200, 120],
        [100, 190],
        [200, 190],
        [100, 120],
      ],
      edges: [
        // Outer hexagon
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 4],
        [4, 5],
        [5, 0],
        // Radial spokes
        [0, 6],
        [1, 7],
        [2, 8],
        [3, 9],
        [4, 10],
        [5, 11],
        // Inner hexagon
        [6, 7],
        [7, 8],
        [8, 9],
        [9, 10],
        [10, 11],
        [11, 6],
        // Triangulation: connect each outer vertex to next inner vertex
        [0, 7],
        [1, 8],
        [2, 9],
        [3, 10],
      ],
    },
  ],

  // Level 10: 15 nodes, 28 edges
  // Wheel W14: center node 14 + 14-gon 0-13
  [
    {
      solutionPositions: [
        [150, 22],   // 0
        [207, 26],   // 1
        [253, 50],   // 2
        [278, 93],   // 3
        [280, 145],  // 4
        [260, 197],  // 5
        [222, 240],  // 6
        [172, 275],  // 7
        [120, 275],  // 8
        [72, 248],   // 9
        [36, 205],   // 10
        [22, 155],   // 11
        [28, 100],   // 12
        [56, 52],    // 13
        [150, 150],  // 14 center
      ],
      startPositions: [
        [240, 30],
        [60, 250],
        [240, 180],
        [60, 80],
        [180, 260],
        [120, 40],
        [270, 130],
        [30, 180],
        [180, 50],
        [120, 220],
        [260, 250],
        [40, 40],
        [200, 130],
        [100, 150],
        [150, 150],
      ],
      edges: [
        // Outer 14-gon
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 4],
        [4, 5],
        [5, 6],
        [6, 7],
        [7, 8],
        [8, 9],
        [9, 10],
        [10, 11],
        [11, 12],
        [12, 13],
        [13, 0],
        // Spokes to center
        [0, 14],
        [1, 14],
        [2, 14],
        [3, 14],
        [4, 14],
        [5, 14],
        [6, 14],
        [7, 14],
        [8, 14],
        [9, 14],
        [10, 14],
        [11, 14],
        [12, 14],
        [13, 14],
      ],
    },
  ],
]
