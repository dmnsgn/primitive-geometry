import { describe, it } from "node:test";
import assert from "node:assert/strict";

import * as Primitives from "../index.js";
import { analyze, flippedNormalTriangles } from "./helpers.js";

describe("prism", () => {
  it("allocates vertices/cells exactly: sides flat quads + 2 sides-gon caps", () => {
    const sides = 7;
    const g = Primitives.prism({ sides });

    assert.equal(g.positions.length / 3, sides * 4 + (sides + 1) * 2 * 2);
    assert.equal(g.cells.length / 3, sides * 2 + sides * 2);
  });

  it("is watertight and correctly wound across a range of side counts", () => {
    for (const sides of [3, 4, 5, 6, 8, 15]) {
      const g = Primitives.prism({ sides });
      const result = analyze(g);
      const label = `sides=${sides}`;
      assert.equal(result.cracks, 0, label);
      assert.equal(result.degenerate, 0, label);
      assert.equal(result.nonManifold, 0, label);
      // The fan center's own wrap-column duplicate (1 per cap) is never
      // referenced by a cell - same benign pattern as torus's capped case
      assert.equal(result.unused, 2, label);
      assert.equal(flippedNormalTriangles(g), 0, label);
    }
  });

  it("gives every side face a single hard-edged (flat, not smoothed) normal", () => {
    const sides = 6;
    const g = Primitives.prism({ sides });
    const { normals } = g;

    for (let face = 0; face < sides; face++) {
      const base = face * 4;
      const [nx, , nz] = [
        normals[base * 3],
        normals[base * 3 + 1],
        normals[base * 3 + 2],
      ];
      for (let corner = 1; corner < 4; corner++) {
        const i = (base + corner) * 3;
        assert.ok(Math.abs(normals[i] - nx) < 1e-6, `face ${face}`);
        assert.equal(normals[i + 1], 0, `face ${face}`);
        assert.ok(Math.abs(normals[i + 2] - nz) < 1e-6, `face ${face}`);
      }
    }
  });

  it("caps sit exactly at +/- height / 2", () => {
    const height = 1.5;
    const g = Primitives.prism({ height });

    let minY = Infinity;
    let maxY = -Infinity;
    for (let i = 0; i < g.positions.length / 3; i++) {
      minY = Math.min(minY, g.positions[i * 3 + 1]);
      maxY = Math.max(maxY, g.positions[i * 3 + 1]);
    }
    assert.ok(Math.abs(minY + height / 2) < 1e-6);
    assert.ok(Math.abs(maxY - height / 2) < 1e-6);
  });

  it("side walls: v runs 0 (bottom) to 1 (top), u wraps continuously around the whole perimeter - same convention as cylinder, not a per-face 0..1 tile", () => {
    const sides = 6;
    const g = Primitives.prism({ sides });

    for (let face = 0; face < sides; face++) {
      const base = face * 4;
      // Bottom-left, bottom-right, top-right, top-left (see prism.js's own
      // vertex order comment)
      assert.equal(g.uvs[base * 2 + 1], 0, `face ${face} bottom-left v`);
      assert.equal(g.uvs[(base + 1) * 2 + 1], 0, `face ${face} bottom-right v`);
      assert.equal(g.uvs[(base + 2) * 2 + 1], 1, `face ${face} top-right v`);
      assert.equal(g.uvs[(base + 3) * 2 + 1], 1, `face ${face} top-left v`);

      assert.ok(
        Math.abs(g.uvs[base * 2] - face / sides) < 1e-6,
        `face ${face} bottom-left u`,
      );
      assert.ok(
        Math.abs(g.uvs[(base + 1) * 2] - (face + 1) / sides) < 1e-6,
        `face ${face} bottom-right u`,
      );
    }

    // Last face's u wraps exactly to 1, not back down to 0
    assert.equal(g.uvs[((sides - 1) * 4 + 1) * 2], 1);
  });

  it("radius matches cylinder's own corner at the same phiOffset", () => {
    const radius = 0.4;
    const sides = 6;
    const phiOffset = 0.3;
    const g = Primitives.prism({ radius, sides, phiOffset });
    const c = Primitives.cylinder({
      radiusBase: radius,
      radiusApex: radius,
      nx: sides,
      phi: Math.PI * 2,
      phiOffset,
      capBase: false,
      capApex: false,
      ny: 1,
    });

    // prism's first wall corner (vertex 0) should land on the cylinder's
    // own base ring at the same angular sample
    assert.ok(Math.abs(g.positions[0] - c.positions[0]) < 1e-5);
    assert.ok(Math.abs(g.positions[2] - c.positions[2]) < 1e-5);
  });
});

describe("antiprism", () => {
  it("allocates vertices/cells exactly: 2 * sides flat triangles + 2 sides-gon caps", () => {
    const sides = 7;
    const g = Primitives.antiprism({ sides });

    assert.equal(g.positions.length / 3, sides * 2 * 3 + (sides + 1) * 2 * 2);
    assert.equal(g.cells.length / 3, sides * 2 + sides * 2);
  });

  it("is watertight and correctly wound across a range of side counts", () => {
    for (const sides of [3, 4, 5, 6, 8, 15]) {
      const g = Primitives.antiprism({ sides });
      const result = analyze(g);
      const label = `sides=${sides}`;
      assert.equal(result.cracks, 0, label);
      assert.equal(result.degenerate, 0, label);
      assert.equal(result.nonManifold, 0, label);
      assert.equal(result.unused, 2, label);
      assert.equal(flippedNormalTriangles(g), 0, label);
    }
  });

  it("rotates the top ring by half a sector relative to the bottom one", () => {
    const sides = 6;
    const radius = 0.3;
    const g = Primitives.antiprism({ sides, radius });

    let maxY = -Infinity;
    let topX = null;
    let topZ = null;
    for (let i = 0; i < g.positions.length / 3; i++) {
      const y = g.positions[i * 3 + 1];
      if (y > maxY - 1e-6) {
        if (y > maxY) maxY = y;
      }
    }
    for (let i = 0; i < g.positions.length / 3; i++) {
      const y = g.positions[i * 3 + 1];
      if (Math.abs(y - maxY) < 1e-6) {
        topX = g.positions[i * 3];
        topZ = g.positions[i * 3 + 2];
        break;
      }
    }
    const angle = Math.atan2(topZ, -topX);
    const sector = (Math.PI * 2) / sides;
    const nearestBottomCorner = Math.round(angle / sector) * sector;
    const offset = Math.abs(angle - nearestBottomCorner);
    assert.ok(Math.abs(offset - sector / 2) < 1e-4);
  });

  it("band: v = 0 at the bottom ring, 1 at the top ring, u wraps continuously around the whole perimeter - same convention as cylinder", () => {
    const sides = 6;
    const halfHeight = 0.5;
    const g = Primitives.antiprism({ sides, height: 1 });

    const bandVertexCount = sides * 2 * 3;
    let maxU = 0;
    for (let i = 0; i < bandVertexCount; i++) {
      const y = g.positions[i * 3 + 1];
      const [u, v] = [g.uvs[i * 2], g.uvs[i * 2 + 1]];
      if (Math.abs(y + halfHeight) < 1e-6) assert.equal(v, 0, `vertex ${i}`);
      if (Math.abs(y - halfHeight) < 1e-6) assert.equal(v, 1, `vertex ${i}`);
      maxU = Math.max(maxU, u);
    }

    // Wraps exactly to 1 at the seam, not tiled 0..1 per triangle
    assert.equal(maxU, 1);
  });

  it("caps sit exactly at +/- height / 2", () => {
    const height = 1.5;
    const g = Primitives.antiprism({ height });

    let minY = Infinity;
    let maxY = -Infinity;
    for (let i = 0; i < g.positions.length / 3; i++) {
      minY = Math.min(minY, g.positions[i * 3 + 1]);
      maxY = Math.max(maxY, g.positions[i * 3 + 1]);
    }
    assert.ok(Math.abs(minY + height / 2) < 1e-6);
    assert.ok(Math.abs(maxY - height / 2) < 1e-6);
  });
});
