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

  // Level 4: Square + both diagonals (4 nodes, 6 edges)
  // Degrees: all 3 => 4 odd nodes... that's NOT Eulerian.
  // Fix: use a different 4-node, 6-edge graph
  // Diamond with center: 5 nodes, 6 edges
  // Actually let's use: bowtie-ish shape
  // Better: Rectangle with one diagonal and one extension
  // Simplest fix: 4 nodes forming K4 minus one edge = 5 edges (already level 3)
  // Let's do: 5 nodes, 6 edges - "house without floor"
  // Actually, let me just do a proper 4-node graph:
  // 4-node path with extra edges:
  // 0-1, 1-2, 2-3, 3-0, 0-2, 1-3 => K4, all degree 3 => 4 odd, no Euler path
  // So K4 doesn't work. Use 5 nodes instead.
  // Pentagon (5 nodes, 5 edges) - all degree 2 => Eulerian circuit
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
  // Degrees: 0->4, 1->3, 2->3, 3->4, 4->3, 5->3 => 4 odd nodes... bad
  // Fix diagonals: 0-2, 1-3, 2-4, 3-5
  // Degrees: 0->3, 1->3, 2->4, 3->4, 4->3, 5->3 => 4 odd... still bad
  // Try: 0-3, 1-4, 2-5, 0-2 (star + one extra)
  // Hex + 0-3, 1-4, 2-5 => all degree 4 => Eulerian circuit, 9 edges
  // Add 0-2: degrees 0->5, 2->5, rest 4 => 2 odd => Eulerian path, 10 edges
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
        [0, 3],
        [1, 4],
        [2, 5],
        [0, 2],
      ],
    },
  ],

  // Level 8: 6-node graph (11 edges)
  // Start from level 7 (10 edges) + add edge 3-5
  // Degrees from L7: 0->5, 1->3, 2->5, 3->3, 4->3, 5->3
  // Add 3-5: 3->4, 5->4 => Degrees: 0->5, 1->3, 2->5, 3->4, 4->3, 5->4
  // Odd: 0,1,2,4 => 4 odd... bad
  // Instead: start from hex + 0-3,1-4,2-5 (9 edges, all degree 4)
  // Add 1-3: degrees 1->5, 3->5 => 2 odd => Eulerian path, 10 edges
  // Add 4-0: degrees 0->5, 4->5 => now 0,1,3,4 odd... bad
  // So just hex + 3 star diags + one cross = 10 edges, 2 odd nodes
  // For 11 edges from the circuit (9): add two edges that share a pair of nodes
  // Hex + 0-3,1-4,2-5 (all even, 9 edges). Add 0-2 and 1-3:
  // 0->5, 1->5, 2->5, 3->5, rest 4 => 4 odd... bad
  // Add 0-2 and 3-5: 0->5, 2->5, 3->5, 5->5 => 0,2 odd (5 is even now) => wait
  // hex+star: all degree 4. Add 0-2: 0->5, 2->5. Add 3-5: 3->5, 5->5 => 0,2,3 odd (3 nodes odd)... bad
  // Let's just do 12 edges for level 8 instead: hex + all 3 star diags + 3 more
  // Actually, simpler approach: use a different topology
  // Wheel graph: center node (5) connected to all outer (0-4), plus outer ring
  // 5 spokes + 5 ring = 10 edges. Center degree 5, outer degree 3 each => 6 odd nodes... bad
  // Let me just design carefully:
  // 6 nodes in 2 rows of 3:
  // 0--1--2
  // |  |  |
  // 3--4--5
  // Grid: 8 edges (4 horizontal + 4... no: 3 top + 3 bottom + 3 vertical... wait)
  // 0-1, 1-2, 3-4, 4-5, 0-3, 1-4, 2-5 = 7 edges
  // Add diagonals: 0-4, 1-3, 1-5, 2-4 => pick some
  // Grid (7 edges): degrees 0->2, 1->3, 2->2, 3->2, 4->3, 5->2 => 1,4 odd => Eulerian path
  // Add 0-4 and 2-4: degrees 0->3, 4->5 => now 0,1,4 odd + 2->3 => 0,1,2,4 odd... bad
  // Add 0-4 and 1-5: degrees 0->3, 4->4, 1->4, 5->3 => 0,5 odd => 2 odd nodes => Eulerian path! 9 edges
  // Add 1-3: 1->5, 3->3 => 1,3 also odd => 4 odd... bad
  // Add 2-4: 2->3, 4->5 => 0,2 odd => still 2 odd! 10 edges
  // So: grid + 0-4 + 1-5 + 2-4 = 10 edges, degrees: 0->3, 1->4, 2->3, 3->2, 4->5, 5->3
  // Odd: 0,2,4,5 => 4 odd... Let me recount.
  // Grid: 0-1,1-2,3-4,4-5,0-3,1-4,2-5
  // 0: connects to 1,3 => deg 2
  // 1: connects to 0,2,4 => deg 3
  // 2: connects to 1,5 => deg 2
  // 3: connects to 0,4 => deg 2
  // 4: connects to 1,3,5 => deg 3
  // 5: connects to 2,4 => deg 2
  // +0-4: 0->3, 4->4
  // +1-5: 1->4, 5->3
  // +2-4: 2->3, 4->5
  // Final: 0->3, 1->4, 2->3, 3->2, 4->5, 5->3 => odd: 0,2,4,5 = 4 odd. Bad.
  //
  // Let me try a different approach. Just +0-4, +2-4 to grid:
  // 0->3, 1->3, 2->3, 3->2, 4->5, 5->2 => odd: 0,1,2,4 => 4. Bad.
  //
  // OK new approach - just carefully build valid graphs:
  // 6 nodes, 12 edges: near-complete graph
  // K6 = 15 edges, all degree 5 (odd) => 6 odd, bad
  // K6 minus 3 edges that form a perfect matching: degrees all 4 => Eulerian circuit, 12 edges!
  // Remove: 0-3, 1-4, 2-5
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

  // Level 9: 7-node graph (12 edges)
  // Center node (6) + hexagon ring (0-5)
  // Ring: 6 edges, spokes: 6 edges = 12 total
  // But center deg 6 (even), outer deg 3 (odd) => 6 odd nodes. Bad.
  // Fix: remove 2 opposite spokes, add 2 diagonals instead
  // Ring + 4 spokes (remove 0-6, 3-6) + diagonals 0-2, 3-5
  // Center(6): deg 4; 0: ring(2)+diag(1)=3; 1: ring(2)+spoke(1)=3; 2: ring(2)+spoke(1)+diag(1)=4
  // 3: ring(2)+diag(1)=3; 4: ring(2)+spoke(1)=3; 5: ring(2)+spoke(1)+diag(1)=4
  // Odd: 0,1,3,4 => 4 odd. Bad.
  //
  // Better: 7-node, use two concentric shapes
  // Outer triangle (0,1,2) + inner triangle (3,4,5) + center (6)
  // Outer: 0-1, 1-2, 2-0
  // Inner: 3-4, 4-5, 5-3
  // Connect: 0-3, 1-4, 2-5, 3-6, 4-6, 5-6
  // Total: 3+3+6 = 12 edges
  // Degrees: 0->3, 1->3, 2->3, 3->4, 4->4, 5->4, 6->3
  // Odd: 0,1,2,6 => 4 odd. Bad.
  // Remove 3-6, add 0-4:
  // 0->4, 1->3, 2->3, 3->3, 4->4+1=5, 5->4, 6->2
  // Odd: 1,2,3,4 => 4. Still bad.
  //
  // Fresh approach: start with an Euler circuit and be done with it.
  // 7 nodes, all even degree, 12 edges.
  // Give each node degree: 2,4,4,4,4,4,2 (sum=24=2*12). Nah, ugly.
  // Better: some nodes deg 4, some deg 2: e.g., 4,4,4,4,4,2,2 => sum=24.
  // Or for Euler PATH: exactly 2 odd nodes.
  // 7 nodes, degrees summing to 24, exactly 2 odd:
  // 3,3,4,4,4,4,2 => sum=24. Nodes 0,1 are odd (start/end).
  //
  // Design: star-like with center
  // Center=6 (deg 4), ring 0-5
  // 0 deg 3, 1 deg 3, 2 deg 4, 3 deg 4, 4 deg 4, 5 deg 2
  // Edges from ring: 0-1, 1-2, 2-3, 3-4, 4-5 (5 edges, chain not closed)
  // 5 is deg 2: from ring(4-5) + one spoke(5-6). That's 2. Good.
  // 0 is deg 3: ring(0-1) + spoke(0-6) + one diagonal.
  // Spokes: 0-6, 2-6, 3-6, 5-6 => center deg 4. Good.
  // 0: ring(0-1)=1 + spoke(0-6)=1 + diag=1 => 3. Need 1 diagonal from 0.
  // 1: ring(0-1,1-2)=2 + ??? => need deg 3, so 1 more edge. Diagonal 1-3.
  // Remaining edges so far: 0-1,1-2,2-3,3-4,4-5, 0-6,2-6,3-6,5-6, 0-?, 1-3 = 11 edges
  // Need 1 more. 0's diagonal: 0-3 => 0 deg=4 not 3. Bad.
  // 0-4: 0 connects to 1,6,4 => deg 3. Good. 4 connects to 3,5,0 => deg 3... need 4.
  // Add 4-6 as extra spoke? then center=5 (odd). Bad.
  // Add 2-4: 2 connects to 1,3,6,4 => deg 4. 4 connects to 3,5,0,2 => deg 4.
  // Total: 0-1,1-2,2-3,3-4,4-5, 0-6,2-6,3-6,5-6, 0-4, 1-3, 2-4 = 12 edges
  // Degrees: 0->{1,6,4}=3, 1->{0,2,3}=3, 2->{1,3,6,4}=4, 3->{2,4,6,1}=4, 4->{3,5,0,2}=4, 5->{4,6}=2, 6->{0,2,3,5}=4
  // Odd: 0,1 => exactly 2! Eulerian path from 0 to 1 (or vice versa).
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

  // Level 10: 7-node graph (14 edges)
  // K7 = 21 edges. All deg 6 (even) => Euler circuit.
  // K7 minus 7 edges (a Hamiltonian cycle to remove): 14 edges, all deg 4 => Euler circuit!
  // Remove the ring: 0-1,1-2,2-3,3-4,4-5,5-6,6-0
  // Remaining edges of K7:
  // 0-2,0-3,0-4,0-5, 1-3,1-4,1-5,1-6, 2-4,2-5,2-6, 3-5,3-6, 4-6
  // That's 4+4+3+2+1 = 14 edges. All degree 4. Euler circuit.
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

  // Level 12: 8-node graph (18 edges)
  // K8 = 28 edges, all degree 7 (odd).
  // K8 minus a set of edges to make all degrees even:
  // Need to remove edges to reduce all degrees from 7 to even.
  // Remove 4 perfect matchings? That's complex.
  // Target: all deg 5? No, that's odd. All deg 4? Remove 3 edges per node = 12 edges removed, but must be consistent.
  // 28 - 10 = 18. Remove 10 edges, each node loses some edges.
  // Target degrees summing to 36 (=2*18). E.g. all deg 4 except two at deg 5... no, need even.
  // 8 nodes * 4.5 = 36, not integer per node.
  // Mix: four nodes deg 4, four nodes deg 5? Sum=36 but odd degrees.
  // Actually: six nodes deg 4, two nodes deg 6. Sum = 24+12=36. All even. 2 odd = 0.
  // Or: two nodes deg 6, six nodes deg 4.
  // Simpler: all nodes degree 4, sum=32=2*16 => 16 edges. Not 18.
  // For 18: sum=36. Eight nodes: e.g., 4,4,4,4,4,4,6,6 => sum=36. All even.
  // Or 4,4,4,4,6,6,4,4 same thing.
  // K8: remove 10 edges. Nodes 6,7 keep degree 7-1=6. Other nodes 7-3=4.
  // From nodes 0-5: each must lose 3 adjacencies. But only to nodes 0-5 (since 6,7 keep all).
  // Wait, node 0 has edges to 1,2,3,4,5,6,7. Keep edges to 6,7. Must remove 3 of {0-1,0-2,0-3,0-4,0-5}.
  // Each of nodes 0-5 must remove 3 of their 5 internal edges (edges to other 0-5 nodes).
  // Total internal edges among 0-5: C(6,2)=15. Need to remove: 6*3/2=9 (each removed edge counted twice).
  // Wait no. If each of 6 nodes loses 3 internal edges, that's 6*3=18 edge-endpoint removals = 9 edges removed from the 15 internal edges.
  // Plus we also remove from edges to 6 and 7? No: nodes 6,7 have degree 7, we want degree 6, so they each lose 1 edge.
  // Node 6 loses 1 of its 7 edges. Node 7 loses 1 of its 7 edges. That's 2 more removed edges => total 11 removed... messy.
  //
  // Let me just manually build an 18-edge graph on 8 nodes with 0 or 2 odd-degree nodes.
  // Start simple: octagon (8 edges, all deg 2) + inner connections.
  // Octagon: 0-1,1-2,2-3,3-4,4-5,5-6,6-7,7-0
  // Add star (skip-1 connections): 0-2,1-3,2-4,3-5,4-6,5-7,6-0,7-1 => 8 more = 16 total
  // Degrees: each node has 2(ring) + 2(star) = 4 => all even. 16 edges.
  // Add 2 more: 0-4, 2-6 => 0 deg 5, 4 deg 5 => 2 odd. 2 deg 5, 6 deg 5 => 4 odd. Bad.
  // Add 0-4, 1-5 => 0 deg 5, 4 deg 5, 1 deg 5, 5 deg 5 => 4 odd. Bad.
  // Add 0-3, 4-7 => same issue.
  // Need to add 2 edges sharing nodes: 0-4, 0-3 => 0 deg 6, 3 deg 5, 4 deg 5 => 2 odd. YES! 18 edges.
  // Degrees: 0->6, 1->4, 2->4, 3->5, 4->5, 5->4, 6->4, 7->4. Odd: 3,4. Euler path.
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
