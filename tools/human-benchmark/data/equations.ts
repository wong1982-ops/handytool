export interface Equation {
  display: string
  answer: number
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function generateEquation(level: number): Equation {
  if (level <= 3) {
    const a = randInt(1, 10)
    const b = randInt(1, 10)
    return { display: `${a} + ${b}`, answer: a + b }
  }
  if (level <= 6) {
    const op = Math.random() < 0.5 ? '+' : '-'
    if (op === '+') {
      const a = randInt(1, 20)
      const b = randInt(1, 20)
      return { display: `${a} + ${b}`, answer: a + b }
    }
    const a = randInt(5, 25)
    const b = randInt(1, a)
    return { display: `${a} - ${b}`, answer: a - b }
  }
  if (level <= 9) {
    const opRoll = Math.random()
    if (opRoll < 0.33) {
      const a = randInt(5, 30)
      const b = randInt(5, 30)
      return { display: `${a} + ${b}`, answer: a + b }
    }
    if (opRoll < 0.66) {
      const a = randInt(10, 40)
      const b = randInt(1, a)
      return { display: `${a} - ${b}`, answer: a - b }
    }
    const a = randInt(2, 12)
    const b = randInt(2, 12)
    return { display: `${a} × ${b}`, answer: a * b }
  }
  const opRoll = Math.random()
  if (opRoll < 0.25) {
    const a = randInt(10, 50)
    const b = randInt(10, 50)
    return { display: `${a} + ${b}`, answer: a + b }
  }
  if (opRoll < 0.5) {
    const a = randInt(20, 60)
    const b = randInt(1, a)
    return { display: `${a} - ${b}`, answer: a - b }
  }
  if (opRoll < 0.75) {
    const a = randInt(3, 15)
    const b = randInt(3, 15)
    return { display: `${a} × ${b}`, answer: a * b }
  }
  const b = randInt(2, 12)
  const answer = randInt(2, 12)
  const a = b * answer
  return { display: `${a} ÷ ${b}`, answer }
}

export function generateDistractors(answer: number): number[] {
  const distractors = new Set<number>()
  while (distractors.size < 3) {
    const offset = randInt(1, Math.max(5, Math.abs(Math.floor(answer * 0.3))))
    const d = Math.random() < 0.5 ? answer + offset : answer - offset
    if (d !== answer && d >= 0) {
      distractors.add(d)
    }
  }
  return Array.from(distractors)
}

export function getTimeForLevel(level: number): number {
  if (level <= 3) return 5000
  if (level <= 6) return 4000
  if (level <= 9) return 4000
  return 3000
}
