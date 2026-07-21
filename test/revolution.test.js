import { describe, it } from "node:test";
import assert from "node:assert/strict";

import * as Primitives from "../index.js";
import { analyze, inwardTriangles } from "./helpers.js";

const TAU = Math.PI * 2;

describe("cylinder", () => {
  it("welds the wrap column exactly, including inexact 1/nx", () => {
    for (const nx of [16, 15]) {
      const result = analyze(Primitives.cylinder({ nx }));
      assert.equal(result.cracks, 0, `nx=${nx}`);
      assert.equal(result.degenerate, 0, `nx=${nx}`);
    }
  });

  it("fans cap centers with a single triangle per quad", () => {
    const nx = 16;
    const ny = 1;
    const capSegments = 3;
    const g = Primitives.cylinder({ nx, ny, capSegments });

    // Sides + two caps, minus one fan per cap innermost ring
    assert.equal(
      g.cells.length / 3,
      nx * ny * 2 + 2 * (nx * capSegments * 2 - nx),
    );
    assert.equal(analyze(g).degenerate, 0);
  });

  it("faces outward", () => {
    assert.equal(inwardTriangles(Primitives.cylinder()), 0);
  });
});

describe("cone", () => {
  it("fans the apex without merging its per-column normals and uvs", () => {
    const nx = 16;
    const ny = 1;
    const g = Primitives.cone({ nx, ny });

    // Side quads emit a single triangle at the apex row; base cap fans too
    assert.equal(g.cells.length / 3, nx * ny * 2 - nx + nx);

    const { normals, uvs, positions } = g;
    // Apex duplicates: same position, distinct normals and uvs per column
    const apex = [];
    for (let i = 0; i < positions.length / 3; i++) {
      if (positions[i * 3 + 1] === 0.5 && positions[i * 3] === 0) apex.push(i);
    }
    assert.ok(apex.length > 1, "apex duplicates are kept");
    const [a, b] = apex;
    assert.notEqual(normals[a * 3], normals[b * 3]);
    assert.notEqual(uvs[a * 2], uvs[b * 2]);

    const result = analyze(g);
    assert.equal(result.degenerate, 0);
    assert.equal(result.cracks, 0);
    assert.equal(inwardTriangles(g), 0);
  });
});

describe("capsule", () => {
  it("welds the wrap column and both poles", () => {
    for (const nx of [16, 15]) {
      const result = analyze(Primitives.capsule({ nx }));
      assert.equal(result.cracks, 0, `nx=${nx}`);
      assert.equal(result.degenerate, 0, `nx=${nx}`);
    }
  });

  it("fans pole rings with a single triangle per quad", () => {
    const nx = 16;
    const ny = 1;
    const roundSegments = 16;
    const g = Primitives.capsule({ nx, ny, roundSegments });

    const ringsTotal = roundSegments * 2 + ny + 1;
    assert.equal(
      g.cells.length / 3,
      (ringsTotal - 1) * (nx - 1) * 2 - 2 * (nx - 1),
    );
  });

  it("keeps a full grid without caps (roundSegments = 0)", () => {
    const nx = 16;
    const ny = 1;
    const g = Primitives.capsule({ nx, ny, roundSegments: 0 });

    assert.equal(g.cells.length / 3, (ny + 1 - 1) * (nx - 1) * 2);
    const result = analyze(g);
    assert.equal(result.degenerate, 0);
    assert.equal(result.unused, 0);
  });
});

describe("ellipsoid", () => {
  it("welds the wrap column and poles, including inexact 1/nx", () => {
    for (const nx of [32, 15]) {
      const result = analyze(Primitives.sphere({ nx }));
      assert.equal(result.cracks, 0, `nx=${nx}`);
      assert.equal(result.degenerate, 0, `nx=${nx}`);
    }
  });

  it("fans pole rows with a single triangle per quad", () => {
    const nx = 32;
    const ny = 16;
    // Default theta = PI: poles at both ends
    const g = Primitives.ellipsoid({ nx, ny });
    assert.equal(g.cells.length / 3, ny * nx * 2 - 2 * nx);
  });

  it("fans a mid-sweep pole (theta = TAU)", () => {
    const nx = 32;
    const ny = 16;
    const g = Primitives.ellipsoid({ nx, ny, theta: TAU });

    // Poles at both ends (1 fan each) and in the middle (2 fans)
    assert.equal(g.cells.length / 3, ny * nx * 2 - 4 * nx);
    assert.equal(analyze(g).degenerate, 0);
  });

  it("keeps the full grid when no row lands on a pole", () => {
    const nx = 32;
    const ny = 16;
    const g = Primitives.ellipsoid({ nx, ny, thetaOffset: 0.3 });

    assert.equal(g.cells.length / 3, ny * nx * 2);
    const result = analyze(g);
    assert.equal(result.degenerate, 0);
    assert.equal(result.unused, 0);
  });

  it("fans a single pole (theta = PI / 2)", () => {
    const nx = 32;
    const ny = 16;
    const g = Primitives.ellipsoid({ nx, ny, theta: Math.PI / 2 });
    assert.equal(g.cells.length / 3, ny * nx * 2 - nx);
  });

  it("faces outward", () => {
    assert.equal(inwardTriangles(Primitives.sphere()), 0);
  });
});

describe("torus", () => {
  it("welds both wrap seams, including inexact 1/segments", () => {
    for (const segments of [64, 15]) {
      const result = analyze(
        Primitives.torus({ segments, minorSegments: segments }),
      );
      assert.equal(result.cracks, 0, `segments=${segments}`);
      assert.equal(result.degenerate, 0, `segments=${segments}`);
    }
  });

  it("welds with phi/theta offsets", () => {
    const result = analyze(
      Primitives.torus({ phiOffset: 0.4, thetaOffset: 1.1 }),
    );
    assert.equal(result.cracks, 0);
  });
});
