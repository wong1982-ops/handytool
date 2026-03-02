export interface WallSegment {
  x1: number; y1: number
  x2: number; y2: number
  /** IDs of the two rooms this wall separates (exterior = 'ext') */
  rooms: [string, string]
}

export interface RoomRegion {
  id: string
  path: string  // SVG path d-string
  label?: string
}

export interface FiveRoomsPuzzle {
  name: string
  rooms: RoomRegion[]
  walls: WallSegment[]
  solvable: boolean
}

/**
 * Five Rooms Puzzles — organized by level (each level has variant arrays).
 *
 * Dual graph analysis (rooms + exterior as nodes, walls as edges):
 * - Solvable: exactly 0 or 2 nodes have odd degree (Euler path/circuit exists)
 * - Impossible: 4+ nodes have odd degree
 *
 * Coordinates fit 300x300 viewBox. Room rectangles use 30-270 range.
 */
export const FIVE_ROOMS_PUZZLES: FiveRoomsPuzzle[][] = [
  // ===== Level 1: Two rooms side by side (very easy) =====
  // Rooms: A, B, ext
  // Walls: top-A(ext,A), bottom-A(ext,A), left-A(ext,A), right/mid(A,B),
  //        top-B(ext,B), bottom-B(ext,B), right-B(ext,B)
  // Dual degrees: ext: top-A + bottom-A + left-A + top-B + bottom-B + right-B = 6 (even)
  //               A: top-A + bottom-A + left-A + mid = 4 (even)
  //               B: top-B + bottom-B + right-B + mid = 4 (even)
  // All even => Euler circuit => solvable
  [
    {
      name: 'Two Rooms',
      solvable: true,
      rooms: [
        { id: 'A', path: 'M 30 30 L 150 30 L 150 270 L 30 270 Z', label: 'A' },
        { id: 'B', path: 'M 150 30 L 270 30 L 270 270 L 150 270 Z', label: 'B' },
      ],
      walls: [
        // Room A outer walls
        { x1: 30, y1: 30, x2: 150, y2: 30, rooms: ['ext', 'A'] },   // top-A
        { x1: 30, y1: 270, x2: 150, y2: 270, rooms: ['ext', 'A'] }, // bottom-A
        { x1: 30, y1: 30, x2: 30, y2: 270, rooms: ['ext', 'A'] },   // left-A
        // Middle wall
        { x1: 150, y1: 30, x2: 150, y2: 270, rooms: ['A', 'B'] },   // mid
        // Room B outer walls
        { x1: 150, y1: 30, x2: 270, y2: 30, rooms: ['ext', 'B'] },  // top-B
        { x1: 150, y1: 270, x2: 270, y2: 270, rooms: ['ext', 'B'] },// bottom-B
        { x1: 270, y1: 30, x2: 270, y2: 270, rooms: ['ext', 'B'] }, // right-B
      ],
    },
  ],

  // ===== Level 2: Three rooms in a row =====
  // Rooms: A, B, C, ext
  // Dual degrees:
  //   ext: top-A + bottom-A + left-A + top-B + bottom-B + top-C + bottom-C + right-C = 8 (even)
  //   A: top-A + bottom-A + left-A + wallAB = 4 (even)
  //   B: top-B + bottom-B + wallAB + wallBC = 4 (even)
  //   C: top-C + bottom-C + wallBC + right-C = 4 (even)
  // All even => Euler circuit => solvable
  [
    {
      name: 'Three in a Row',
      solvable: true,
      rooms: [
        { id: 'A', path: 'M 30 30 L 110 30 L 110 270 L 30 270 Z', label: 'A' },
        { id: 'B', path: 'M 110 30 L 190 30 L 190 270 L 110 270 Z', label: 'B' },
        { id: 'C', path: 'M 190 30 L 270 30 L 270 270 L 190 270 Z', label: 'C' },
      ],
      walls: [
        // A outer
        { x1: 30, y1: 30, x2: 110, y2: 30, rooms: ['ext', 'A'] },
        { x1: 30, y1: 270, x2: 110, y2: 270, rooms: ['ext', 'A'] },
        { x1: 30, y1: 30, x2: 30, y2: 270, rooms: ['ext', 'A'] },
        // A-B wall
        { x1: 110, y1: 30, x2: 110, y2: 270, rooms: ['A', 'B'] },
        // B outer
        { x1: 110, y1: 30, x2: 190, y2: 30, rooms: ['ext', 'B'] },
        { x1: 110, y1: 270, x2: 190, y2: 270, rooms: ['ext', 'B'] },
        // B-C wall
        { x1: 190, y1: 30, x2: 190, y2: 270, rooms: ['B', 'C'] },
        // C outer
        { x1: 190, y1: 30, x2: 270, y2: 30, rooms: ['ext', 'C'] },
        { x1: 190, y1: 270, x2: 270, y2: 270, rooms: ['ext', 'C'] },
        { x1: 270, y1: 30, x2: 270, y2: 270, rooms: ['ext', 'C'] },
      ],
    },
  ],

  // ===== Level 3: Classic Five Rooms (IMPOSSIBLE) =====
  // The classic puzzle: a rectangle divided into 5 rooms (2 top, 3 bottom or similar).
  // This is the famous unsolvable puzzle.
  //
  // Layout:
  //   +-----+-----+
  //   |  A  |  B  |
  //   +--+--+--+--+
  //   | C| D  | E |
  //   +--+-----+--+
  //
  // A: top-left, B: top-right, C: bottom-left small, D: bottom-center, E: bottom-right small
  //
  // Dual graph degrees:
  //   ext: topA + topB + leftA + leftC + bottomC + bottomD + bottomE + rightE + rightB = 9 (odd)
  //   A: topA + leftA + wallAB + wallAC + wallAD = 5 (odd)
  //   B: topB + rightB + wallAB + wallBD + wallBE = 5 (odd)
  //   C: leftC + bottomC + wallAC + wallCD = 4 (even)
  //   D: bottomD + wallAD + wallBD + wallCD + wallDE = 5 (odd)
  //   E: rightE + bottomE + wallBE + wallDE = 4 (even)
  // Odd count: ext, A, B, D = 4 nodes => IMPOSSIBLE
  [
    {
      name: 'Classic Five Rooms',
      solvable: false,
      rooms: [
        { id: 'A', path: 'M 30 30 L 150 30 L 150 150 L 30 150 Z', label: 'A' },
        { id: 'B', path: 'M 150 30 L 270 30 L 270 150 L 150 150 Z', label: 'B' },
        { id: 'C', path: 'M 30 150 L 90 150 L 90 270 L 30 270 Z', label: 'C' },
        { id: 'D', path: 'M 90 150 L 210 150 L 210 270 L 90 270 Z', label: 'D' },
        { id: 'E', path: 'M 210 150 L 270 150 L 270 270 L 210 270 Z', label: 'E' },
      ],
      walls: [
        // Outer walls
        { x1: 30, y1: 30, x2: 150, y2: 30, rooms: ['ext', 'A'] },     // top-A
        { x1: 150, y1: 30, x2: 270, y2: 30, rooms: ['ext', 'B'] },    // top-B
        { x1: 30, y1: 30, x2: 30, y2: 150, rooms: ['ext', 'A'] },     // left-A
        { x1: 30, y1: 150, x2: 30, y2: 270, rooms: ['ext', 'C'] },    // left-C
        { x1: 30, y1: 270, x2: 90, y2: 270, rooms: ['ext', 'C'] },    // bottom-C
        { x1: 90, y1: 270, x2: 210, y2: 270, rooms: ['ext', 'D'] },   // bottom-D
        { x1: 210, y1: 270, x2: 270, y2: 270, rooms: ['ext', 'E'] },  // bottom-E
        { x1: 270, y1: 150, x2: 270, y2: 270, rooms: ['ext', 'E'] },  // right-E
        { x1: 270, y1: 30, x2: 270, y2: 150, rooms: ['ext', 'B'] },   // right-B
        // Internal walls
        { x1: 150, y1: 30, x2: 150, y2: 150, rooms: ['A', 'B'] },     // A-B
        { x1: 30, y1: 150, x2: 90, y2: 150, rooms: ['A', 'C'] },      // A-C
        { x1: 90, y1: 150, x2: 150, y2: 150, rooms: ['A', 'D'] },     // A-D
        { x1: 150, y1: 150, x2: 210, y2: 150, rooms: ['B', 'D'] },    // B-D
        { x1: 210, y1: 150, x2: 270, y2: 150, rooms: ['B', 'E'] },    // B-E
        { x1: 90, y1: 150, x2: 90, y2: 270, rooms: ['C', 'D'] },      // C-D
        { x1: 210, y1: 150, x2: 210, y2: 270, rooms: ['D', 'E'] },    // D-E
      ],
    },
  ],

  // ===== Level 4: L-shaped house (4 rooms, solvable) =====
  // Layout:
  //   +------+------+
  //   |  A   |  B   |
  //   +------+------+
  //   |  C   |
  //   +------+
  //
  // Dual degrees:
  //   ext: topA + topB + leftA + rightB + wallB-bottom-right + bottomC + leftC + rightB-lower = ?
  // Let me be precise about the walls:
  //   topA(ext,A), topB(ext,B), leftA(ext,A), leftC(ext,C), bottomC(ext,C),
  //   midHoriz-right(ext,B) [bottom of B exposed to exterior],
  //   rightB(ext,B), rightA-lower... no.
  //
  // Let me redo: L-shape means rooms A,B on top row, C on bottom-left only.
  //   +-------+-------+
  //   |   A   |   B   |
  //   +-------+---+---+
  //   |   C   |  (exterior)
  //   +-------+
  //
  // Walls:
  //   topA(ext,A), topB(ext,B), leftA(ext,A), wallAB(A,B), rightB(ext,B),
  //   horizAC(A,C), horizB-bottom(ext,B) [from mid to right at y=150],
  //   leftC(ext,C), bottomC(ext,C), rightC-is-ext...
  //   Actually rightC = x=150, y=150 to y=270, but that's below B, so rooms: (C, ext)
  //
  //   ext: topA + topB + leftA + rightB + bottomB(half) + rightC + bottomC + leftC = 8 (even)
  //   A: topA + leftA + wallAB + horizAC = 4 (even)
  //   B: topB + rightB + wallAB + bottomB = 4 (even)
  //   C: horizAC + leftC + bottomC + rightC = 4 (even)
  // All even => solvable
  [
    {
      name: 'L-Shape',
      solvable: true,
      rooms: [
        { id: 'A', path: 'M 30 30 L 150 30 L 150 150 L 30 150 Z', label: 'A' },
        { id: 'B', path: 'M 150 30 L 270 30 L 270 150 L 150 150 Z', label: 'B' },
        { id: 'C', path: 'M 30 150 L 150 150 L 150 270 L 30 270 Z', label: 'C' },
      ],
      walls: [
        { x1: 30, y1: 30, x2: 150, y2: 30, rooms: ['ext', 'A'] },    // top-A
        { x1: 150, y1: 30, x2: 270, y2: 30, rooms: ['ext', 'B'] },   // top-B
        { x1: 30, y1: 30, x2: 30, y2: 150, rooms: ['ext', 'A'] },    // left-A
        { x1: 150, y1: 30, x2: 150, y2: 150, rooms: ['A', 'B'] },    // A-B
        { x1: 270, y1: 30, x2: 270, y2: 150, rooms: ['ext', 'B'] },  // right-B
        { x1: 150, y1: 150, x2: 270, y2: 150, rooms: ['ext', 'B'] }, // bottom-B
        { x1: 30, y1: 150, x2: 150, y2: 150, rooms: ['A', 'C'] },    // A-C
        { x1: 30, y1: 150, x2: 30, y2: 270, rooms: ['ext', 'C'] },   // left-C
        { x1: 30, y1: 270, x2: 150, y2: 270, rooms: ['ext', 'C'] },  // bottom-C
        { x1: 150, y1: 150, x2: 150, y2: 270, rooms: ['ext', 'C'] }, // right-C
      ],
    },
  ],

  // ===== Level 5: 2x2 grid (4 rooms, solvable) =====
  // Layout:
  //   +---+---+
  //   | A | B |
  //   +---+---+
  //   | C | D |
  //   +---+---+
  //
  // Walls (12 total):
  //   topA(ext,A), topB(ext,B), leftA(ext,A), leftC(ext,C),
  //   rightB(ext,B), rightD(ext,D), bottomC(ext,C), bottomD(ext,D),
  //   wallAB(A,B), wallCD(C,D), wallAC(A,C), wallBD(B,D)
  //
  // Dual degrees:
  //   ext: topA+topB+leftA+leftC+rightB+rightD+bottomC+bottomD = 8 (even)
  //   A: topA+leftA+wallAB+wallAC = 4 (even)
  //   B: topB+rightB+wallAB+wallBD = 4 (even)
  //   C: leftC+bottomC+wallCD+wallAC = 4 (even)
  //   D: rightD+bottomD+wallCD+wallBD = 4 (even)
  // All even => Euler circuit => solvable
  [
    {
      name: '2x2 Grid',
      solvable: true,
      rooms: [
        { id: 'A', path: 'M 30 30 L 150 30 L 150 150 L 30 150 Z', label: 'A' },
        { id: 'B', path: 'M 150 30 L 270 30 L 270 150 L 150 150 Z', label: 'B' },
        { id: 'C', path: 'M 30 150 L 150 150 L 150 270 L 30 270 Z', label: 'C' },
        { id: 'D', path: 'M 150 150 L 270 150 L 270 270 L 150 270 Z', label: 'D' },
      ],
      walls: [
        { x1: 30, y1: 30, x2: 150, y2: 30, rooms: ['ext', 'A'] },
        { x1: 150, y1: 30, x2: 270, y2: 30, rooms: ['ext', 'B'] },
        { x1: 30, y1: 30, x2: 30, y2: 150, rooms: ['ext', 'A'] },
        { x1: 270, y1: 30, x2: 270, y2: 150, rooms: ['ext', 'B'] },
        { x1: 30, y1: 150, x2: 30, y2: 270, rooms: ['ext', 'C'] },
        { x1: 270, y1: 150, x2: 270, y2: 270, rooms: ['ext', 'D'] },
        { x1: 30, y1: 270, x2: 150, y2: 270, rooms: ['ext', 'C'] },
        { x1: 150, y1: 270, x2: 270, y2: 270, rooms: ['ext', 'D'] },
        { x1: 150, y1: 30, x2: 150, y2: 150, rooms: ['A', 'B'] },
        { x1: 150, y1: 150, x2: 150, y2: 270, rooms: ['C', 'D'] },
        { x1: 30, y1: 150, x2: 150, y2: 150, rooms: ['A', 'C'] },
        { x1: 150, y1: 150, x2: 270, y2: 150, rooms: ['B', 'D'] },
      ],
    },
  ],

  // ===== Level 6: T-shape house (5 rooms, solvable) =====
  // Layout:
  //   +---+---+---+
  //   | A | B | C |
  //   +---+---+---+
  //       | D |
  //       +---+
  //
  // A: (30,30)-(110,150), B: (110,30)-(190,150), C: (190,30)-(270,150)
  // D: (110,150)-(190,270)
  //
  // Walls (13):
  //   topA(ext,A), topB(ext,B), topC(ext,C),
  //   leftA(ext,A), rightC(ext,C),
  //   bottomA(ext,A), bottomC(ext,C),
  //   leftD(ext,D), rightD(ext,D), bottomD(ext,D),
  //   wallAB(A,B), wallBC(B,C), wallBD(B,D)
  //
  // Dual degrees:
  //   ext: topA+topB+topC+leftA+rightC+bottomA+bottomC+leftD+rightD+bottomD = 10 (even)
  //   A: topA+leftA+bottomA+wallAB = 4 (even)
  //   B: topB+wallAB+wallBC+wallBD = 4 (even)
  //   C: topC+rightC+bottomC+wallBC = 4 (even)
  //   D: leftD+rightD+bottomD+wallBD = 4 (even)
  // All even => solvable
  [
    {
      name: 'T-Shape',
      solvable: true,
      rooms: [
        { id: 'A', path: 'M 30 30 L 110 30 L 110 150 L 30 150 Z', label: 'A' },
        { id: 'B', path: 'M 110 30 L 190 30 L 190 150 L 110 150 Z', label: 'B' },
        { id: 'C', path: 'M 190 30 L 270 30 L 270 150 L 190 150 Z', label: 'C' },
        { id: 'D', path: 'M 110 150 L 190 150 L 190 270 L 110 270 Z', label: 'D' },
      ],
      walls: [
        { x1: 30, y1: 30, x2: 110, y2: 30, rooms: ['ext', 'A'] },
        { x1: 110, y1: 30, x2: 190, y2: 30, rooms: ['ext', 'B'] },
        { x1: 190, y1: 30, x2: 270, y2: 30, rooms: ['ext', 'C'] },
        { x1: 30, y1: 30, x2: 30, y2: 150, rooms: ['ext', 'A'] },
        { x1: 270, y1: 30, x2: 270, y2: 150, rooms: ['ext', 'C'] },
        { x1: 30, y1: 150, x2: 110, y2: 150, rooms: ['ext', 'A'] },
        { x1: 190, y1: 150, x2: 270, y2: 150, rooms: ['ext', 'C'] },
        { x1: 110, y1: 150, x2: 110, y2: 270, rooms: ['ext', 'D'] },
        { x1: 190, y1: 150, x2: 190, y2: 270, rooms: ['ext', 'D'] },
        { x1: 110, y1: 270, x2: 190, y2: 270, rooms: ['ext', 'D'] },
        { x1: 110, y1: 30, x2: 110, y2: 150, rooms: ['A', 'B'] },
        { x1: 190, y1: 30, x2: 190, y2: 150, rooms: ['B', 'C'] },
        { x1: 110, y1: 150, x2: 190, y2: 150, rooms: ['B', 'D'] },
      ],
    },
  ],

  // ===== Level 7: 6-room cross (solvable) =====
  // Layout:
  //       +---+
  //       | A |
  //   +---+---+---+
  //   | B | C | D |
  //   +---+---+---+
  //       | E |
  //       +---+
  //
  // A: (110,30)-(190,110), B: (30,110)-(110,190), C: (110,110)-(190,190)
  // D: (190,110)-(270,190), E: (110,190)-(190,270)
  //
  // Walls (16):
  //   topA(ext,A), leftA(ext,A), rightA(ext,A),
  //   topB(ext,B), leftB(ext,B), bottomB(ext,B),
  //   topD(ext,D), rightD(ext,D), bottomD(ext,D),
  //   bottomE(ext,E), leftE(ext,E), rightE(ext,E),
  //   wallAC(A,C), wallBC(B,C), wallCD(C,D), wallCE(C,E)
  //
  // Dual degrees:
  //   ext: 12 (even)
  //   A: topA+leftA+rightA+wallAC = 4 (even)
  //   B: topB+leftB+bottomB+wallBC = 4 (even)
  //   C: wallAC+wallBC+wallCD+wallCE = 4 (even)
  //   D: topD+rightD+bottomD+wallCD = 4 (even)
  //   E: bottomE+leftE+rightE+wallCE = 4 (even)
  // All even => solvable
  [
    {
      name: 'Cross House',
      solvable: true,
      rooms: [
        { id: 'A', path: 'M 110 30 L 190 30 L 190 110 L 110 110 Z', label: 'A' },
        { id: 'B', path: 'M 30 110 L 110 110 L 110 190 L 30 190 Z', label: 'B' },
        { id: 'C', path: 'M 110 110 L 190 110 L 190 190 L 110 190 Z', label: 'C' },
        { id: 'D', path: 'M 190 110 L 270 110 L 270 190 L 190 190 Z', label: 'D' },
        { id: 'E', path: 'M 110 190 L 190 190 L 190 270 L 110 270 Z', label: 'E' },
      ],
      walls: [
        // A outer
        { x1: 110, y1: 30, x2: 190, y2: 30, rooms: ['ext', 'A'] },
        { x1: 110, y1: 30, x2: 110, y2: 110, rooms: ['ext', 'A'] },
        { x1: 190, y1: 30, x2: 190, y2: 110, rooms: ['ext', 'A'] },
        // B outer
        { x1: 30, y1: 110, x2: 110, y2: 110, rooms: ['ext', 'B'] },
        { x1: 30, y1: 110, x2: 30, y2: 190, rooms: ['ext', 'B'] },
        { x1: 30, y1: 190, x2: 110, y2: 190, rooms: ['ext', 'B'] },
        // D outer
        { x1: 190, y1: 110, x2: 270, y2: 110, rooms: ['ext', 'D'] },
        { x1: 270, y1: 110, x2: 270, y2: 190, rooms: ['ext', 'D'] },
        { x1: 190, y1: 190, x2: 270, y2: 190, rooms: ['ext', 'D'] },
        // E outer
        { x1: 110, y1: 270, x2: 190, y2: 270, rooms: ['ext', 'E'] },
        { x1: 110, y1: 190, x2: 110, y2: 270, rooms: ['ext', 'E'] },
        { x1: 190, y1: 190, x2: 190, y2: 270, rooms: ['ext', 'E'] },
        // Internal walls
        { x1: 110, y1: 110, x2: 190, y2: 110, rooms: ['A', 'C'] },
        { x1: 110, y1: 110, x2: 110, y2: 190, rooms: ['B', 'C'] },
        { x1: 190, y1: 110, x2: 190, y2: 190, rooms: ['C', 'D'] },
        { x1: 110, y1: 190, x2: 190, y2: 190, rooms: ['C', 'E'] },
      ],
    },
  ],

  // ===== Level 8: 8-room complex (solvable with Euler path) =====
  // Layout: 2x4 grid
  //   +----+----+----+----+
  //   | A  | B  | C  | D  |
  //   +----+----+----+----+
  //   | E  | F  | G  | H  |
  //   +----+----+----+----+
  //
  // Walls: 4 top, 4 bottom, 2 sides, 3 internal vertical (top), 3 internal vertical (bottom), 4 horizontal mids
  // = 4+4+2+3+3+4 = 20 walls
  //
  // Dual degrees (each room touches its outer walls + internal walls):
  //   A: top+left+wallAB+wallAE = 4 (even)
  //   B: top+wallAB+wallBC+wallBF = 4 (even)
  //   C: top+wallBC+wallCD+wallCG = 4 (even)
  //   D: top+right+wallCD+wallDH = 4 (even)
  //   E: bottom+left+wallAE+wallEF = 4 (even)
  //   F: bottom+wallEF+wallFG+wallBF = 4 (even)
  //   G: bottom+wallFG+wallGH+wallCG = 4 (even)
  //   H: bottom+right+wallDH+wallGH = 4 (even)
  //   ext: 4 top + 4 bottom + 2 sides = 10 (even)
  // All even => Euler circuit => solvable
  [
    {
      name: 'Grand Hall',
      solvable: true,
      rooms: [
        { id: 'A', path: 'M 30 30 L 90 30 L 90 150 L 30 150 Z', label: 'A' },
        { id: 'B', path: 'M 90 30 L 150 30 L 150 150 L 90 150 Z', label: 'B' },
        { id: 'C', path: 'M 150 30 L 210 30 L 210 150 L 150 150 Z', label: 'C' },
        { id: 'D', path: 'M 210 30 L 270 30 L 270 150 L 210 150 Z', label: 'D' },
        { id: 'E', path: 'M 30 150 L 90 150 L 90 270 L 30 270 Z', label: 'E' },
        { id: 'F', path: 'M 90 150 L 150 150 L 150 270 L 90 270 Z', label: 'F' },
        { id: 'G', path: 'M 150 150 L 210 150 L 210 270 L 150 270 Z', label: 'G' },
        { id: 'H', path: 'M 210 150 L 270 150 L 270 270 L 210 270 Z', label: 'H' },
      ],
      walls: [
        // Top edge
        { x1: 30, y1: 30, x2: 90, y2: 30, rooms: ['ext', 'A'] },
        { x1: 90, y1: 30, x2: 150, y2: 30, rooms: ['ext', 'B'] },
        { x1: 150, y1: 30, x2: 210, y2: 30, rooms: ['ext', 'C'] },
        { x1: 210, y1: 30, x2: 270, y2: 30, rooms: ['ext', 'D'] },
        // Bottom edge
        { x1: 30, y1: 270, x2: 90, y2: 270, rooms: ['ext', 'E'] },
        { x1: 90, y1: 270, x2: 150, y2: 270, rooms: ['ext', 'F'] },
        { x1: 150, y1: 270, x2: 210, y2: 270, rooms: ['ext', 'G'] },
        { x1: 210, y1: 270, x2: 270, y2: 270, rooms: ['ext', 'H'] },
        // Left & right edges
        { x1: 30, y1: 30, x2: 30, y2: 150, rooms: ['ext', 'A'] },
        { x1: 30, y1: 150, x2: 30, y2: 270, rooms: ['ext', 'E'] },
        { x1: 270, y1: 30, x2: 270, y2: 150, rooms: ['ext', 'D'] },
        { x1: 270, y1: 150, x2: 270, y2: 270, rooms: ['ext', 'H'] },
        // Internal vertical walls (top row)
        { x1: 90, y1: 30, x2: 90, y2: 150, rooms: ['A', 'B'] },
        { x1: 150, y1: 30, x2: 150, y2: 150, rooms: ['B', 'C'] },
        { x1: 210, y1: 30, x2: 210, y2: 150, rooms: ['C', 'D'] },
        // Internal vertical walls (bottom row)
        { x1: 90, y1: 150, x2: 90, y2: 270, rooms: ['E', 'F'] },
        { x1: 150, y1: 150, x2: 150, y2: 270, rooms: ['F', 'G'] },
        { x1: 210, y1: 150, x2: 210, y2: 270, rooms: ['G', 'H'] },
        // Internal horizontal walls (middle)
        { x1: 30, y1: 150, x2: 90, y2: 150, rooms: ['A', 'E'] },
        { x1: 90, y1: 150, x2: 150, y2: 150, rooms: ['B', 'F'] },
        { x1: 150, y1: 150, x2: 210, y2: 150, rooms: ['C', 'G'] },
        { x1: 210, y1: 150, x2: 270, y2: 150, rooms: ['D', 'H'] },
      ],
    },
  ],
]
