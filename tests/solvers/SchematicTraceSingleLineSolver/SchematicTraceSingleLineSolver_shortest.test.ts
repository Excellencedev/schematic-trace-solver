import { test, expect } from "bun:test"
import { SchematicTraceSingleLineSolver } from "lib/solvers/SchematicTraceLinesSolver/SchematicTraceSingleLineSolver/SchematicTraceSingleLineSolver"
import { calculateElbow } from "calculate-elbow"
import { generateElbowVariants } from "lib/solvers/SchematicTraceLinesSolver/SchematicTraceSingleLineSolver/generateElbowVariants"
import type { InputChip, InputProblem } from "lib/types/InputProblem"
import type { Guideline } from "lib/solvers/GuidelinesSolver/GuidelinesSolver"
import "tests/fixtures/matcher"

const pathLength = (pts: { x: number; y: number }[]) => {
  let len = 0
  for (let i = 0; i < pts.length - 1; i++) {
    const dx = pts[i + 1].x - pts[i].x
    const dy = pts[i + 1].y - pts[i].y
    len += Math.sqrt(dx * dx + dy * dy)
  }
  return len
}

test("SchematicTraceSingleLineSolver chooses shortest candidate path", async () => {
  const chipA: InputChip = {
    chipId: "A",
    center: { x: 0, y: 0 },
    width: 0.2,
    height: 0.2,
    pins: [{ pinId: "A1", x: 0, y: 0 }],
  }
  const chipB: InputChip = {
    chipId: "B",
    center: { x: 4, y: 2 },
    width: 0.2,
    height: 0.2,
    pins: [{ pinId: "B1", x: 4, y: 2 }],
  }

  const pins = [
    { pinId: "A1", x: 0, y: 0, _facingDirection: "x+" as const, chipId: "A" },
    { pinId: "B1", x: 4, y: 2, _facingDirection: "x+" as const, chipId: "B" },
  ]

  const guidelines: Guideline[] = []

  const inputProblem: InputProblem = {
    chips: [chipA, chipB],
    directConnections: [],
    netConnections: [],
    availableNetLabelOrientations: {},
  }

  const solver = new SchematicTraceSingleLineSolver({
    pins: pins as any,
    guidelines,
    inputProblem,
    chipMap: { A: chipA, B: chipB },
  })

  solver.solve()
  expect(solver.solved).toBe(true)

  const baseElbow = calculateElbow(
    { x: pins[0].x, y: pins[0].y, facingDirection: pins[0]._facingDirection },
    { x: pins[1].x, y: pins[1].y, facingDirection: pins[1]._facingDirection },
    { overshoot: 0.2 },
  )

  expect(solver.solvedTracePath).toEqual(baseElbow)

  await expect(solver).toMatchSolverSnapshot(
    import.meta.path,
    "shortest_path",
  )
})
