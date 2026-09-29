import { describe, it } from "node:test";
import assert from "node:assert/strict";

import * as Primitives from "../index.js";

const { computeStarRatio } = Primitives.utils;

const assertClose = (actual, expected, epsilon = 1e-6) => {
  assert.equal(actual.length, expected.length);
  for (let i = 0; i < actual.length; i++) {
    assert.ok(
      Math.abs(actual[i] - expected[i]) < epsilon,
      `index ${i}: expected ${expected[i]}, got ${actual[i]}`,
    );
  }
};

// mergeCentroid + a single ring: outer ring is the last `cols` vertices, in
// vertex-index order matching the angular sample order (same convention as
// polygon.test.js/ellipse.test.js).
const outerRing = (g, cols) => {
  const n = g.positions.length / 3;
  return Array.from({ length: cols }, (_, i) => {
    const index = n - cols + i;
    return [g.positions[index * 3], g.positions[index * 3 + 1]];
  });
};

describe("ellipsePath", () => {
  it("matches ellipse's outer ring", () => {
    const segments = 24;
    const sx = 0.7;
    const sy = 0.3;
    const radius = 0.5;
    const path = Primitives.ellipsePath({ sx, sy, radius, segments });
    const filled = Primitives.ellipse({
      sx,
      sy,
      radius,
      segments,
      innerSegments: 1,
    });
    const ring = outerRing(filled, segments).flat();

    assertClose(Array.from(path.positions.filter((_, i) => i % 3 !== 2)), ring);
  });

  it("open by default: segments positions, no wrap index", () => {
    const segments = 16;
    const g = Primitives.ellipsePath({ segments });
    assert.equal(g.positions.length / 3, segments);
    assert.equal(g.cells[0].length, segments);
  });

  it("closed repeats index 0 to explicitly close the loop", () => {
    const segments = 16;
    const g = Primitives.ellipsePath({ segments, closed: true });
    assert.equal(g.cells[0].length, segments + 1);
    assert.equal(g.cells[0][segments], 0);
  });
});

describe("circlePath", () => {
  it("is ellipsePath with sx = sy = 1", () => {
    const options = { radius: 0.6, segments: 20, thetaOffset: 0.3 };
    const circle = Primitives.circlePath(options);
    const ellipse = Primitives.ellipsePath({ ...options, sx: 1, sy: 1 });
    assert.deepEqual(circle.positions, ellipse.positions);
    assert.deepEqual(circle.cells, ellipse.cells);
  });
});

describe("polygonPath", () => {
  it("matches polygon's outer ring", () => {
    const sides = 7;
    const sx = 0.6;
    const sy = 0.4;
    const radius = 0.5;
    const path = Primitives.polygonPath({ sides, sx, sy, radius });
    const filled = Primitives.polygon({
      sides,
      sx,
      sy,
      radius,
      innerSegments: 1,
    });
    const ring = outerRing(filled, sides).flat();

    assertClose(Array.from(path.positions.filter((_, i) => i % 3 !== 2)), ring);
  });

  it("edgeSegments subdivides each side", () => {
    const sides = 5;
    const edgeSegments = 3;
    const g = Primitives.polygonPath({ sides, edgeSegments });
    assert.equal(g.positions.length / 3, sides * edgeSegments);
  });
});

describe("partial theta", () => {
  it("paths reach the sweep's end, matching their filled dual's outer ring", () => {
    const options = { theta: Math.PI, thetaOffset: Math.PI / 2 };
    for (const [pathFn, fillFn, count] of [
      ["starPath", "star", 5 * 2 + 1],
      ["polygonPath", "polygon", 6 + 1],
      ["ellipsePath", "ellipse", 32 + 1],
      ["circlePath", "disc", 32 + 1],
      ["reuleauxPath", "reuleaux", 32 + 1],
    ]) {
      const path = Primitives[pathFn](options);
      const filled = Primitives[fillFn]({ ...options, innerSegments: 1 });
      const ring = outerRing(filled, count).flat();

      assert.equal(path.positions.length / 3, count, pathFn);
      assertClose(
        Array.from(path.positions.filter((_, i) => i % 3 !== 2)),
        ring,
      );
    }
  });
});

describe("starPath", () => {
  it("matches star's outer boundary", () => {
    const points = 6;
    const radius = 0.5;
    const path = Primitives.starPath({ points, radius });
    const filled = Primitives.star({ points, radius, innerSegments: 1 });
    const ring = outerRing(filled, points * 2).flat();

    assertClose(Array.from(path.positions.filter((_, i) => i % 3 !== 2)), ring);
  });

  it("matches star's outer boundary with edgeSegments", () => {
    const points = 5;
    const edgeSegments = 3;
    const path = Primitives.starPath({ points, edgeSegments });
    const filled = Primitives.star({ points, edgeSegments, innerSegments: 1 });
    const ring = outerRing(filled, points * 2 * edgeSegments).flat();

    assertClose(Array.from(path.positions.filter((_, i) => i % 3 !== 2)), ring);
  });

  it("alternates tip/notch radius", () => {
    const points = 5;
    const radius = 0.5;
    const g = Primitives.starPath({ points, radius });
    const ratio = computeStarRatio(points, 2);

    for (let i = 0; i < points * 2; i++) {
      const r = Math.hypot(g.positions[i * 3], g.positions[i * 3 + 1]);
      const expected = i % 2 === 0 ? radius : radius * ratio;
      assert.ok(Math.abs(r - expected) < 1e-6);
    }
  });
});

describe("roundedRectanglePath", () => {
  it("matches rectanglePath exactly at radius = 0", () => {
    const nx = 3;
    const ny = 2;
    const sx = 1.2;
    const sy = 0.8;
    const rounded = Primitives.roundedRectanglePath({
      sx,
      sy,
      nx,
      ny,
      radius: 0,
    });
    const rect = Primitives.rectanglePath({ sx, sy, nx, ny });

    assert.deepEqual(rounded.positions, rect.positions);
    assert.deepEqual(rounded.cells, rect.cells);
  });

  it("matches rectanglePath exactly with an empty roundedCorners selection", () => {
    const nx = 2;
    const ny = 4;
    const sx = 1;
    const sy = 1;
    const rounded = Primitives.roundedRectanglePath({
      sx,
      sy,
      nx,
      ny,
      roundedCorners: [],
    });
    const rect = Primitives.rectanglePath({ sx, sy, nx, ny });

    assert.deepEqual(rounded.positions, rect.positions);
    assert.deepEqual(rounded.cells, rect.cells);
  });

  it("rounds only the requested corner, leaving the other 3 sharp", () => {
    const sx = 1;
    const sy = 1;
    const corners = {
      "top-left": [-1, 1],
      "top-right": [1, 1],
      "bottom-right": [1, -1],
      "bottom-left": [-1, -1],
    };

    const isSharp = (g, signX, signY) => {
      const x = (signX * sx) / 2;
      const y = (signY * sy) / 2;
      for (let i = 0; i < g.positions.length; i += 3) {
        if (
          Math.abs(g.positions[i] - x) < 1e-6 &&
          Math.abs(g.positions[i + 1] - y) < 1e-6
        ) {
          return true;
        }
      }
      return false;
    };

    for (const only of Object.keys(corners)) {
      const g = Primitives.roundedRectanglePath({
        sx,
        sy,
        roundedCorners: [only],
      });
      for (const [name, [signX, signY]] of Object.entries(corners)) {
        assert.equal(
          isSharp(g, signX, signY),
          name !== only,
          `${only}: ${name} should be ${name === only ? "rounded" : "sharp"}`,
        );
      }
    }
  });

  it("every rounded-corner vertex sits exactly `radius` from its arc center", () => {
    const sx = 1;
    const sy = 0.6;
    const radius = 0.2;
    const roundSegments = 6;
    const g = Primitives.roundedRectanglePath({
      sx,
      sy,
      radius,
      roundSegments,
    });

    const centers = {
      "bottom-left": [-sx / 2 + radius, -sy / 2 + radius],
      "bottom-right": [sx / 2 - radius, -sy / 2 + radius],
      "top-right": [sx / 2 - radius, sy / 2 - radius],
      "top-left": [-sx / 2 + radius, sy / 2 - radius],
    };

    let checked = 0;
    for (let i = 0; i < g.positions.length; i += 3) {
      const px = g.positions[i];
      const py = g.positions[i + 1];
      for (const [cx, cy] of Object.values(centers)) {
        const d = Math.hypot(px - cx, py - cy);
        if (Math.abs(d - radius) < 1e-4) {
          checked++;
          break;
        }
      }
    }
    // 4 corners * roundSegments interior arc samples, plus each corner's own
    // exit point (angle = angleStart + HALF_PI), written by the edge that
    // follows it rather than the corner loop itself - still on that same arc
    assert.equal(checked, 4 * roundSegments + 4);
  });

  it("collapses a zero-size straight section, matching stadium's shape", () => {
    const sx = 1;
    const sy = 0.5;
    const radius = Math.min(sx, sy) * 0.5;
    const roundSegments = 8;
    const g = Primitives.roundedRectanglePath({
      sx,
      sy,
      radius,
      roundSegments,
    });

    // widthY collapses to 0: only the two nx-segment straight edges remain
    assert.equal(g.positions.length / 3, 4 * roundSegments + 2 * 1);
  });

  it("closed repeats index 0 to explicitly close the loop", () => {
    const g = Primitives.roundedRectanglePath({ closed: true });
    const n = g.positions.length / 3;
    assert.equal(g.cells[0].length, n + 1);
    assert.equal(g.cells[0][n], 0);
  });
});

describe("kitePath", () => {
  it("matches kite's outer boundary", () => {
    const ratio = 0.4;
    const path = Primitives.kitePath({ ratio });
    const filled = Primitives.kite({ ratio, innerSegments: 1 });
    const ring = outerRing(filled, 4).flat();

    assertClose(Array.from(path.positions.filter((_, i) => i % 3 !== 2)), ring);
  });
});

describe("rhombusPath", () => {
  it("matches rhombus's outer boundary", () => {
    const sx = 0.6;
    const sy = 0.3;
    const path = Primitives.rhombusPath({ sx, sy });
    const filled = Primitives.rhombus({ sx, sy, innerSegments: 1 });
    const ring = outerRing(filled, 4).flat();

    assertClose(Array.from(path.positions.filter((_, i) => i % 3 !== 2)), ring);
  });

  it("is polygonPath with sides = 4", () => {
    const options = { sx: 0.7, sy: 0.3, radius: 0.4 };
    const r = Primitives.rhombusPath(options);
    const p = Primitives.polygonPath({
      sides: 4,
      thetaOffset: Primitives.utils.HALF_PI,
      ...options,
    });
    assert.deepEqual(r.positions, p.positions);
  });
});

describe("lozengePath", () => {
  it("matches lozenge's outer boundary", () => {
    const path = Primitives.lozengePath();
    const filled = Primitives.lozenge({ innerSegments: 1 });
    const ring = outerRing(filled, 4).flat();

    assertClose(Array.from(path.positions.filter((_, i) => i % 3 !== 2)), ring);
  });

  it("defaults sy to sx * 2, the classic narrow diamond", () => {
    const sx = 0.3;
    const a = Primitives.lozengePath({ sx });
    const b = Primitives.rhombusPath({ sx, sy: sx * 2 });
    assert.deepEqual(a.positions, b.positions);
  });
});

describe("trapezoidPath", () => {
  it("matches trapezoid's outer boundary", () => {
    const topRatio = 0.6;
    const topOffset = 0.1;
    const path = Primitives.trapezoidPath({ topRatio, topOffset });
    const filled = Primitives.trapezoid({
      topRatio,
      topOffset,
      innerSegments: 1,
    });
    const ring = outerRing(filled, 4).flat();

    assertClose(Array.from(path.positions.filter((_, i) => i % 3 !== 2)), ring);
  });
});

describe("parallelogramPath", () => {
  it("matches parallelogram's outer boundary", () => {
    const shear = 0.2;
    const path = Primitives.parallelogramPath({ shear });
    const filled = Primitives.parallelogram({ shear, innerSegments: 1 });
    const ring = outerRing(filled, 4).flat();

    assertClose(Array.from(path.positions.filter((_, i) => i % 3 !== 2)), ring);
  });

  it("is trapezoidPath with topRatio = 1, topOffset = shear", () => {
    const sx = 0.5;
    const sy = 1;
    const shear = 0.15;
    const a = Primitives.parallelogramPath({ sx, sy, shear });
    const b = Primitives.trapezoidPath({
      sx,
      sy,
      topRatio: 1,
      topOffset: shear,
    });
    assert.deepEqual(a.positions, b.positions);
  });
});

describe("trianglePath", () => {
  it("matches triangle's outer boundary", () => {
    const apexOffset = 0.1;
    const path = Primitives.trianglePath({ apexOffset });
    const filled = Primitives.triangle({ apexOffset, innerSegments: 1 });
    const ring = outerRing(filled, 3).flat();

    assertClose(Array.from(path.positions.filter((_, i) => i % 3 !== 2)), ring);
  });
});

describe("rightTrianglePath", () => {
  it("matches rightTriangle's outer boundary", () => {
    const path = Primitives.rightTrianglePath();
    const filled = Primitives.rightTriangle({ innerSegments: 1 });
    const ring = outerRing(filled, 3).flat();

    assertClose(Array.from(path.positions.filter((_, i) => i % 3 !== 2)), ring);
  });

  it("is trianglePath with apexOffset = -sx", () => {
    const sx = 0.5;
    const sy = 1;
    const a = Primitives.rightTrianglePath({ sx, sy });
    const b = Primitives.trianglePath({ sx, sy, apexOffset: -sx });
    assert.deepEqual(a.positions, b.positions);
  });
});

describe("stadiumPath", () => {
  it("is roundedRectanglePath with radius fixed to half the shorter side", () => {
    const sx = 1;
    const sy = 0.6;
    const a = Primitives.stadiumPath({ sx, sy });
    const b = Primitives.roundedRectanglePath({
      sx,
      sy,
      radius: Math.min(sx, sy) * 0.5,
    });
    assert.deepEqual(a.positions, b.positions);
  });

  it("collapses the shorter axis's straight section, matching stadium's vertex count", () => {
    const roundSegments = 8;
    const g = Primitives.stadiumPath({ roundSegments });
    assert.equal(g.positions.length / 3, 4 * roundSegments + 2 * 1);
  });
});

describe("reuleauxPath", () => {
  it("matches reuleaux's outer ring", () => {
    const segments = 24;
    const n = 5;
    const path = Primitives.reuleauxPath({ segments, n });
    const filled = Primitives.reuleaux({ segments, n, innerSegments: 1 });
    const ring = outerRing(filled, segments).flat();

    assertClose(Array.from(path.positions.filter((_, i) => i % 3 !== 2)), ring);
  });

  it("thetaOffset rotates the whole shape", () => {
    const segments = 12;
    const thetaOffset = Math.PI / 2;
    const g0 = Primitives.reuleauxPath({ radius: 1, segments });
    const gOffset = Primitives.reuleauxPath({
      radius: 1,
      segments,
      thetaOffset,
    });

    const wrap = (a) =>
      ((a % Primitives.utils.TAU) + Primitives.utils.TAU) %
      Primitives.utils.TAU;
    const angles = (g) => {
      const out = [];
      for (let i = 0; i < g.positions.length; i += 3) {
        if (
          Math.abs(Math.hypot(g.positions[i], g.positions[i + 1]) - 1) < 1e-4
        ) {
          out.push(wrap(Math.atan2(g.positions[i + 1], g.positions[i])));
        }
      }
      return out.sort((a, b) => a - b);
    };

    const before = angles(g0);
    const after = angles(gOffset);
    assert.equal(before.length, 3);
    assert.equal(after.length, 3);
    for (let i = 0; i < 3; i++) {
      assert.ok(Math.abs(wrap(after[i] - before[i]) - thetaOffset) < 1e-6);
    }
  });
});

describe("crossPath", () => {
  it("matches cross's outer boundary", () => {
    const radius = 0.5;
    const armWidth = 0.1;
    const edgeSegments = 2;
    const path = Primitives.crossPath({ radius, armWidth, edgeSegments });
    const filled = Primitives.cross({
      radius,
      armWidth,
      edgeSegments,
      innerSegments: 1,
    });
    const ring = outerRing(filled, 12 * edgeSegments).flat();

    assertClose(Array.from(path.positions.filter((_, i) => i % 3 !== 2)), ring);
  });

  it("defaults armWidth to radius / 3, the 5-equal-squares Greek cross", () => {
    const radius = 0.5;
    const g = Primitives.crossPath({ radius });

    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;
    for (let i = 0; i < g.positions.length; i += 3) {
      minX = Math.min(minX, g.positions[i]);
      maxX = Math.max(maxX, g.positions[i]);
      minY = Math.min(minY, g.positions[i + 1]);
      maxY = Math.max(maxY, g.positions[i + 1]);
    }
    assertClose([minX, maxX, minY, maxY], [-radius, radius, -radius, radius]);
  });

  it("closed repeats index 0 to explicitly close the loop", () => {
    const g = Primitives.crossPath({ closed: true });
    const n = g.positions.length / 3;
    assert.equal(g.cells[0].length, n + 1);
    assert.equal(g.cells[0][n], 0);
  });
});

describe("superellipsePath", () => {
  it("matches superellipse's outer ring", () => {
    const segments = 24;
    const sx = 0.7;
    const sy = 0.3;
    const m = 3;
    const path = Primitives.superellipsePath({ sx, sy, segments, m });
    const filled = Primitives.superellipse({
      sx,
      sy,
      segments,
      m,
      innerSegments: 1,
    });
    const ring = outerRing(filled, segments).flat();

    assertClose(Array.from(path.positions.filter((_, i) => i % 3 !== 2)), ring);
  });

  it("m = n = 2 is an ellipse", () => {
    const options = { sx: 0.6, sy: 0.4, segments: 16 };
    const a = Primitives.superellipsePath({ ...options, m: 2, n: 2 });
    const b = Primitives.ellipsePath(options);
    assertClose(Array.from(a.positions), Array.from(b.positions), 1e-4);
  });
});

describe("astroidPath", () => {
  it("matches astroid's outer ring", () => {
    const segments = 16;
    const path = Primitives.astroidPath({ segments });
    const filled = Primitives.astroid({ segments, innerSegments: 1 });
    const ring = outerRing(filled, segments).flat();

    assertClose(Array.from(path.positions.filter((_, i) => i % 3 !== 2)), ring);
  });

  it("is superellipsePath with m = n = 2 / 3", () => {
    const options = { radius: 0.4, segments: 12 };
    const a = Primitives.astroidPath(options);
    const b = Primitives.superellipsePath({
      sx: 1,
      sy: 1,
      m: 2 / 3,
      n: 2 / 3,
      ...options,
    });
    assert.deepEqual(a.positions, b.positions);
  });
});

describe("squirclePath", () => {
  it("matches squircle's outer ring", () => {
    const segments = 32;
    const squareness = 0.6;
    const path = Primitives.squirclePath({ segments, squareness });
    const filled = Primitives.squircle({
      segments,
      squareness,
      innerSegments: 1,
    });
    const ring = outerRing(filled, segments).flat();

    assertClose(Array.from(path.positions.filter((_, i) => i % 3 !== 2)), ring);
  });
});

describe("annulusPath", () => {
  it("is 2 disjoint loops: outer ellipsePath then inner ellipsePath", () => {
    const sx = 0.8;
    const sy = 0.5;
    const radius = 0.5;
    const innerRadius = 0.2;
    const segments = 16;
    const g = Primitives.annulusPath({ sx, sy, radius, innerRadius, segments });

    assert.equal(g.cells.length, 2);
    assert.equal(g.cells[0].length, segments);
    assert.equal(g.cells[1].length, segments);

    const outer = Primitives.ellipsePath({ sx, sy, radius, segments });
    const inner = Primitives.ellipsePath({
      sx,
      sy,
      radius: innerRadius,
      segments,
    });

    assertClose(
      Array.from(g.positions.slice(0, outer.positions.length)),
      Array.from(outer.positions),
    );
    assertClose(
      Array.from(g.positions.slice(outer.positions.length)),
      Array.from(inner.positions),
    );
    // Inner cell indices are offset past the outer loop's own vertex count
    assert.deepEqual(
      Array.from(g.cells[1]),
      inner.cells[0].map((i) => i + segments),
    );
  });

  it("closed repeats each loop's own first index, not a shared global 0", () => {
    const segments = 12;
    const g = Primitives.annulusPath({ segments, closed: true });

    assert.equal(g.cells[0].length, segments + 1);
    assert.equal(g.cells[0][segments], 0);
    assert.equal(g.cells[1].length, segments + 1);
    assert.equal(g.cells[1][segments], segments);
  });
});
