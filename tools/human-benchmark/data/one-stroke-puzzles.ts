export interface OneStrokePuzzle {
  nodes: { x: number; y: number }[]
  edges: [number, number][]
}

/**
 * All puzzles have valid Eulerian paths (0 or 2 nodes with odd degree).
 * Node coordinates fit within a 300x300 viewBox, centered and well-spaced.
 *
 * Degree verification per puzzle:
 * - Eulerian circuit: all nodes have even degree
 * - Eulerian path: exactly 2 nodes have odd degree
 */
export const ONE_STROKE_PUZZLES: OneStrokePuzzle[][] = [
  // Level 1: Triangle (3 nodes, 3 edges)
  // Degrees: 0->2, 1->2, 2->2 => all even => Eulerian circuit
  [
    {
      nodes: [
        { x: 150, y: 50 },
        { x: 50, y: 230 },
        { x: 250, y: 230 },
      ],
      edges: [
        [0, 1],
        [1, 2],
        [2, 0],
      ],
    },
  ],

  // Level 2: Square (4 nodes, 4 edges)
  // Degrees: all 2 => Eulerian circuit
  [
    {
      nodes: [
        { x: 75, y: 75 },
        { x: 225, y: 75 },
        { x: 225, y: 225 },
        { x: 75, y: 225 },
      ],
      edges: [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 0],
      ],
    },
  ],

  // Level 3: Square + one diagonal (4 nodes, 5 edges)
  // Degrees: 0->3, 1->2, 2->3, 3->2 => nodes 0,2 odd => Eulerian path
  [
    {
      nodes: [
        { x: 75, y: 75 },
        { x: 225, y: 75 },
        { x: 225, y: 225 },
        { x: 75, y: 225 },
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

  // Level 4: Pentagon (5 nodes, 5 edges)
  // All degree 2 => Eulerian circuit
  [
    {
      nodes: [
        { x: 150, y: 40 },
        { x: 255, y: 120 },
        { x: 215, y: 250 },
        { x: 85, y: 250 },
        { x: 45, y: 120 },
      ],
      edges: [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 4],
        [4, 0],
      ],
    },
  ],

  // Level 5: Envelope / house shape (5 nodes, 8 edges)
  // Square base + triangle roof
  // Nodes: 0=top, 1=roof-left, 2=roof-right, 3=bottom-left, 4=bottom-right
  // Edges: roof triangle(0-1,0-2,1-2), left wall(1-3), right wall(2-4), bottom(3-4), diagonals(1-4,2-3)
  // Degrees: 0->2, 1->4, 2->4, 3->3, 4->3 => nodes 3,4 odd => Eulerian path
  [
    {
      nodes: [
        { x: 150, y: 40 },
        { x: 60, y: 140 },
        { x: 240, y: 140 },
        { x: 60, y: 260 },
        { x: 240, y: 260 },
      ],
      edges: [
        [0, 1],
        [0, 2],
        [1, 2],
        [1, 3],
        [2, 4],
        [3, 4],
        [1, 4],
        [2, 3],
      ],
    },
  ],

  // Level 6: Star / pentagram (5 nodes, 10 edges = K5)
  // K5: all degree 4 => all even => Eulerian circuit
  [
    {
      nodes: [
        { x: 150, y: 30 },
        { x: 260, y: 110 },
        { x: 225, y: 260 },
        { x: 75, y: 260 },
        { x: 40, y: 110 },
      ],
      edges: [
        [0, 1],
        [0, 2],
        [0, 3],
        [0, 4],
        [1, 2],
        [1, 3],
        [1, 4],
        [2, 3],
        [2, 4],
        [3, 4],
      ],
    },
  ],

  // Level 7: 6-node graph (10 edges)
  // Hexagon (6 edges) + 4 diagonals
  // Hex: 0-1,1-2,2-3,3-4,4-5,5-0
  // Diagonals: 0-2, 0-3, 1-4, 3-5
  // Hexagon + inner triangle [0-2, 2-4, 4-0] + cross [1-3]
  // Degrees: 0->4, 1->3, 2->4, 3->3, 4->4, 5->2 => 2 odd (1,3) => Eulerian path
  [
    {
      nodes: [
        { x: 150, y: 30 },
        { x: 255, y: 90 },
        { x: 255, y: 210 },
        { x: 150, y: 270 },
        { x: 45, y: 210 },
        { x: 45, y: 90 },
      ],
      edges: [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 4],
        [4, 5],
        [5, 0],
        [0, 2],
        [2, 4],
        [4, 0],
        [1, 3],
      ],
    },
  ],

  // Level 8: K6 minus perfect matching (6 nodes, 12 edges)
  // K6 minus edges 0-3, 1-4, 2-5 => all degree 4 => Eulerian circuit
  [
    {
      nodes: [
        { x: 150, y: 30 },
        { x: 255, y: 90 },
        { x: 255, y: 210 },
        { x: 150, y: 270 },
        { x: 45, y: 210 },
        { x: 45, y: 90 },
      ],
      edges: [
        // K6 minus edges 0-3, 1-4, 2-5
        [0, 1],
        [0, 2],
        [0, 4],
        [0, 5],
        [1, 2],
        [1, 3],
        [1, 5],
        [2, 3],
        [2, 4],
        [3, 4],
        [3, 5],
        [4, 5],
      ],
    },
  ],

  // Level 9: 7-node star with center (12 edges)
  // Degrees: 0->3, 1->3, 2->4, 3->4, 4->4, 5->2, 6->4 => 2 odd (0,1) => Eulerian path
  [
    {
      nodes: [
        { x: 75, y: 40 },
        { x: 225, y: 40 },
        { x: 270, y: 150 },
        { x: 200, y: 265 },
        { x: 100, y: 265 },
        { x: 30, y: 150 },
        { x: 150, y: 150 },
      ],
      edges: [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 4],
        [4, 5],
        [0, 6],
        [2, 6],
        [3, 6],
        [5, 6],
        [0, 4],
        [1, 3],
        [2, 4],
      ],
    },
  ],

  // Level 10: K7 minus Hamiltonian cycle (7 nodes, 14 edges)
  // All degree 4 => Eulerian circuit
  [
    {
      nodes: [
        { x: 150, y: 25 },
        { x: 245, y: 65 },
        { x: 275, y: 165 },
        { x: 215, y: 265 },
        { x: 85, y: 265 },
        { x: 25, y: 165 },
        { x: 55, y: 65 },
      ],
      edges: [
        [0, 2],
        [0, 3],
        [0, 4],
        [0, 5],
        [1, 3],
        [1, 4],
        [1, 5],
        [1, 6],
        [2, 4],
        [2, 5],
        [2, 6],
        [3, 5],
        [3, 6],
        [4, 6],
      ],
    },
  ],

  // Level 11: 8-node graph (16 edges)
  // 8 nodes, all degree 4, Euler circuit.
  // Cube graph edges (12) + 4 face diagonals to boost degrees:
  // Cube: 0-1,1-2,2-3,3-0 (top), 4-5,5-6,6-7,7-4 (bottom), 0-4,1-5,2-6,3-7 (pillars)
  // All degree 3. Add 4 diagonals: 0-2, 4-6, 1-7, 3-5
  // 0: 1,3,4,2 => deg 4. 1: 0,2,5,7 => deg 4. 2: 1,3,6,0 => deg 4. 3: 0,2,7,5 => deg 4.
  // 4: 0,5,7,6 => deg 4. 5: 1,4,6,3 => deg 4. 6: 2,5,7,4 => deg 4. 7: 3,4,6,1 => deg 4.
  // All even! 16 edges. Euler circuit.
  [
    {
      nodes: [
        { x: 100, y: 50 },
        { x: 200, y: 50 },
        { x: 250, y: 130 },
        { x: 50, y: 130 },
        { x: 100, y: 210 },
        { x: 200, y: 210 },
        { x: 250, y: 270 },
        { x: 50, y: 270 },
      ],
      edges: [
        // Cube
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 0],
        [4, 5],
        [5, 6],
        [6, 7],
        [7, 4],
        [0, 4],
        [1, 5],
        [2, 6],
        [3, 7],
        // Face diagonals
        [0, 2],
        [4, 6],
        [1, 7],
        [3, 5],
      ],
    },
  ],

  // Level 12: Octagon + skip-1 star + 2 extras (8 nodes, 18 edges)
  // Degrees: 0->6, 1->4, 2->4, 3->5, 4->5, 5->4, 6->4, 7->4 => 2 odd (3,4) => Eulerian path
  [
    {
      nodes: [
        { x: 150, y: 25 },
        { x: 235, y: 55 },
        { x: 275, y: 140 },
        { x: 235, y: 225 },
        { x: 150, y: 260 },
        { x: 65, y: 225 },
        { x: 25, y: 140 },
        { x: 65, y: 55 },
      ],
      edges: [
        // Octagon
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 4],
        [4, 5],
        [5, 6],
        [6, 7],
        [7, 0],
        // Skip-1 star
        [0, 2],
        [1, 3],
        [2, 4],
        [3, 5],
        [4, 6],
        [5, 7],
        [6, 0],
        [7, 1],
        // Extra two edges for 18 total
        [0, 4],
        [0, 3],
      ],
    },
  ],
]
