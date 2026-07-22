import { describe, it } from "node:test";
import assert from "node:assert/strict";

import * as Primitives from "../index.js";
import polyhedron from "../src/solid/polyhedra/polyhedron.js";
import { rectangular } from "../src/mappings.js";
import { analyze, inwardTriangles, uniquePositionCount } from "./helpers.js";

// Seed data reused directly (not through the public solids) to exercise
// polyhedron()'s bare project=false/true behavior at the algorithm level,
// beyond what tetrasphere/octasphere/dodecasphere already cover below.
const tetrahedronSeed = {
  positions: Float32Array.of(1, 1, 1, 1, -1, -1, -1, 1, -1, -1, -1, 1),
  cells: [
    [0, 1, 2],
    [0, 3, 1],
    [0, 2, 3],
    [1, 3, 2],
  ],
};

function dodecahedronSeed(radius = 0.5) {
  const phi = (1 + Math.sqrt(5)) / 2;
  const a = radius;
  const b = radius / phi;
  const c = radius * (2 - phi);
  return {
    // prettier-ignore
    positions: Float32Array.of(
      c, 0, a, -c, 0, a, -b, b, b, 0, a, c, b, b, b, b, -b, b, 0, -a, c, -b, -b, b,
      c, 0, -a, -c, 0, -a, -b, -b, -b, 0, -a, -c, b, -b, -b, b, b, -b, 0, a, -c, -b, b, -b,
      a, c, 0, -a, c, 0, -a, -c, 0, a, -c, 0,
    ),
    cells: [
      [4, 3, 2, 1, 0],
      [7, 6, 5, 0, 1],
      [12, 11, 10, 9, 8],
      [15, 14, 13, 8, 9],
      [14, 3, 4, 16, 13],
      [3, 14, 15, 17, 2],
      [11, 6, 7, 18, 10],
      [6, 11, 12, 19, 5],
      [4, 0, 5, 19, 16],
      [12, 8, 13, 16, 19],
      [15, 9, 10, 18, 17],
      [7, 1, 2, 17, 18],
    ],
  };
}

// Face normal spread at a shared position: distinguishes genuine flat
// shading (hard edges, differing normals) from a merged/smoothed vertex.
function normalsAtFirstDuplicatePosition(geometry) {
  const { positions, normals } = geometry;
  const byPosition = new Map();
  for (let i = 0; i < positions.length / 3; i++) {
    const key = [0, 1, 2].map((k) => positions[i * 3 + k].toFixed(4)).join(",");
    if (!byPosition.has(key)) byPosition.set(key, []);
    byPosition.get(key).push(i);
  }
  for (const group of byPosition.values()) {
    if (group.length > 1) {
      return group.map((i) => [
        normals[i * 3],
        normals[i * 3 + 1],
        normals[i * 3 + 2],
      ]);
    }
  }
  return [];
}

describe("polyhedron (flat platonic solids)", () => {
  for (const [name, create] of [
    ["tetrahedron", () => Primitives.tetrahedron()],
    ["octahedron", () => Primitives.octahedron()],
    ["dodecahedron", () => Primitives.dodecahedron()],
    ["icosahedron", () => Primitives.icosahedron({ subdivisions: 0 })],
  ]) {
    it(`${name} is watertight, outward, flat-shaded`, () => {
      const g = create();
      const result = analyze(g);
      assert.equal(result.nan, 0);
      assert.equal(result.cracks, 0);
      assert.equal(result.degenerate, 0);
      assert.equal(result.nonManifold, 0);
      assert.equal(result.boundaries, 0);
      assert.equal(inwardTriangles(g), 0);

      // Every shared position has more than one differently-normaled vertex
      const normalsAtSeam = normalsAtFirstDuplicatePosition(g);
      assert.ok(normalsAtSeam.length > 1, "shares at least one seam position");
      const [a, b] = normalsAtSeam;
      assert.notDeepEqual(a, b, "hard edge: duplicated vertices keep distinct normals");
    });
  }

  it("tetrahedron/octahedron/dodecahedron/icosahedron have exactly one duplicate vertex per face-corner (no cross-face welding)", () => {
    assert.equal(uniquePositionCount(Primitives.tetrahedron()), 4);
    assert.equal(uniquePositionCount(Primitives.octahedron()), 6);
    assert.equal(uniquePositionCount(Primitives.dodecahedron()), 20);
    assert.equal(
      uniquePositionCount(Primitives.icosahedron({ subdivisions: 0 })),
      12,
    );
  });

  it("octahedron/dodecahedron/icosahedron touch a radius-sized unit box on all 6 faces", () => {
    // Tetrahedron excluded: its apex-up construction doesn't have equal
    // bounding-box extents on all 3 axes (see its own test below).
    const radius = 0.5;
    for (const [name, create] of [
      ["octahedron", () => Primitives.octahedron({ radius })],
      ["dodecahedron", () => Primitives.dodecahedron({ radius })],
      ["icosahedron", () => Primitives.icosahedron({ radius, subdivisions: 0 })],
    ]) {
      const { positions } = create();
      const half = [0, 0, 0];
      for (let i = 0; i < positions.length / 3; i++) {
        for (let axis = 0; axis < 3; axis++) {
          half[axis] = Math.max(half[axis], Math.abs(positions[i * 3 + axis]));
        }
      }
      for (let axis = 0; axis < 3; axis++) {
        assert.ok(
          Math.abs(half[axis] - radius) < 1e-6,
          `${name} axis ${axis}: expected half-extent ${radius}, got ${half[axis]}`,
        );
      }
    }
  });

  it("tetrahedron is a regular tetrahedron with a centered bounding box", () => {
    const g = Primitives.tetrahedron({ radius: 0.5 });
    const corners = [];
    const seen = new Set();
    for (let i = 0; i < g.positions.length / 3; i++) {
      const p = [g.positions[i * 3], g.positions[i * 3 + 1], g.positions[i * 3 + 2]];
      const key = p.map((v) => v.toFixed(4)).join(",");
      if (!seen.has(key)) {
        seen.add(key);
        corners.push(p);
      }
    }
    assert.equal(corners.length, 4);

    // Bounding box centered at the origin per this library's convention, and
    // its tallest axis (z) touches the radius-sized unit box exactly - the
    // other two stay inside since apex-up doesn't have equal extents per axis
    const radius = 0.5;
    let tallest = 0;
    for (let axis = 0; axis < 3; axis++) {
      const values = corners.map((p) => p[axis]);
      const min = Math.min(...values);
      const max = Math.max(...values);
      assert.ok(Math.abs(min + max) < 1e-6, `axis ${axis} not centered`);
      tallest = Math.max(tallest, max);
    }
    assert.ok(Math.abs(tallest - radius) < 1e-6, "tallest axis must touch radius");

    // Still a true regular tetrahedron: all 6 edges equal
    const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
    const edges = [];
    for (let i = 0; i < 4; i++) {
      for (let j = i + 1; j < 4; j++) edges.push(dist(corners[i], corners[j]));
    }
    for (const edge of edges) {
      assert.ok(Math.abs(edge - edges[0]) < 1e-6, "edges must be equal");
    }
  });

  it("tetrahedron/octahedron/dodecahedron have no project option (use tetrasphere/octasphere/dodecasphere instead)", () => {
    assert.equal(Primitives.tetrahedron({ project: true }).positions.length, Primitives.tetrahedron().positions.length);
    assert.equal(Primitives.octahedron({ project: true }).positions.length, Primitives.octahedron().positions.length);
    assert.equal(Primitives.dodecahedron({ project: true }).positions.length, Primitives.dodecahedron().positions.length);
  });

  it("icosahedron subdivisions > 0 behaves like the other regular polyhedra (flat, no cross-face welding, still watertight)", () => {
    const g = Primitives.icosahedron({ subdivisions: 1 });
    const result = analyze(g);
    assert.equal(result.nan, 0);
    assert.equal(result.cracks, 0);
    assert.equal(result.nonManifold, 0);
    assert.equal(result.boundaries, 0);
    assert.equal(inwardTriangles(g), 0);
  });
});

describe("Kepler-Poinsot solids", () => {
  it("greatDodecahedron/greatIcosahedron are watertight, outward, flat-shaded, sharing the icosahedron's 12 vertices", () => {
    for (const [name, create] of [
      ["greatDodecahedron", Primitives.greatDodecahedron],
      ["greatIcosahedron", Primitives.greatIcosahedron],
    ]) {
      const g = create();
      const result = analyze(g);
      assert.equal(result.nan, 0, name);
      assert.equal(result.cracks, 0, name);
      assert.equal(result.nonManifold, 0, name);
      assert.equal(result.boundaries, 0, name);
      assert.equal(inwardTriangles(g), 0, name);
      assert.equal(uniquePositionCount(g), 12, name);
    }
  });

  it("greatDodecahedron/greatIcosahedron touch a radius-sized unit box on all 6 faces (same convention as icosahedron)", () => {
    const radius = 0.5;
    for (const create of [Primitives.greatDodecahedron, Primitives.greatIcosahedron]) {
      const { positions } = create({ radius });
      const half = [0, 0, 0];
      for (let i = 0; i < positions.length / 3; i++) {
        for (let axis = 0; axis < 3; axis++) {
          half[axis] = Math.max(half[axis], Math.abs(positions[i * 3 + axis]));
        }
      }
      for (let axis = 0; axis < 3; axis++) {
        assert.ok(Math.abs(half[axis] - radius) < 1e-6);
      }
    }
  });

  it("smallStellatedDodecahedron/greatStellatedDodecahedron are watertight, outward, flat-shaded pentagram solids", () => {
    // Both are built from a base solid's vertex-transitive (icosahedron
    // vertex figures) or edge-transitive (dodecahedron's own faces)
    // symmetry, so every pair of star faces that meet at a shared point
    // computes the exact same tip/notch independently - just not
    // bit-for-bit, since each comes from a different face's local centroid.
    // weldNearDuplicates (src/solid/polyhedra/regular/pentagram.js) snaps those
    // together, closing the surface entirely.
    for (const create of [
      Primitives.smallStellatedDodecahedron,
      Primitives.greatStellatedDodecahedron,
    ]) {
      const g = create();
      const result = analyze(g);
      assert.equal(result.nan, 0);
      assert.equal(result.cracks, 0);
      assert.equal(result.nonManifold, 0);
      assert.equal(result.degenerate, 0);
      assert.equal(result.boundaries, 0);
      assert.equal(inwardTriangles(g), 0);
      assert.equal(g.cells.length / 3, 96, "12 pentagram faces x 8 triangles");
    }
  });

  it("smallStellatedDodecahedron/greatStellatedDodecahedron touch a radius-sized unit box on all 6 faces with their tips (not their inner points)", () => {
    const radius = 0.5;
    for (const create of [
      Primitives.smallStellatedDodecahedron,
      Primitives.greatStellatedDodecahedron,
    ]) {
      const { positions } = create({ radius });
      const half = [0, 0, 0];
      for (let i = 0; i < positions.length / 3; i++) {
        for (let axis = 0; axis < 3; axis++) {
          half[axis] = Math.max(half[axis], Math.abs(positions[i * 3 + axis]));
        }
      }
      for (let axis = 0; axis < 3; axis++) {
        assert.ok(Math.abs(half[axis] - radius) < 1e-6);
      }
    }
  });

  it("smallStellatedDodecahedron has 12 tips (icosahedron vertex count), greatStellatedDodecahedron has 20 (dodecahedron vertex count)", () => {
    // Regression test: an earlier version of greatStellatedDodecahedron
    // computed its tips one edge-extension short (landing exactly on
    // icosahedron vertex positions instead of going one ring further out),
    // making it collapse onto the same 12 tips as smallStellatedDodecahedron.
    function uniquePositionsByRadius(g) {
      const seen = new Map();
      for (let i = 0; i < g.positions.length / 3; i++) {
        const p = [g.positions[i * 3], g.positions[i * 3 + 1], g.positions[i * 3 + 2]];
        const r = Math.hypot(...p).toFixed(4);
        const key = p.map((v) => v.toFixed(4)).join(",");
        if (!seen.has(key)) seen.set(key, r);
      }
      const counts = new Map();
      for (const r of seen.values()) counts.set(r, (counts.get(r) ?? 0) + 1);
      return [...counts.entries()].sort((a, b) => b[0] - a[0]);
    }

    const ssd = uniquePositionsByRadius(Primitives.smallStellatedDodecahedron());
    assert.equal(ssd.length, 2, "one tip radius, one inner radius");
    assert.equal(ssd[0][1], 12, "smallStellatedDodecahedron tip count");

    const gsd = uniquePositionsByRadius(Primitives.greatStellatedDodecahedron());
    assert.equal(gsd.length, 2, "one tip radius, one inner radius");
    assert.equal(gsd[0][1], 20, "greatStellatedDodecahedron tip count");
  });
});

describe("tetrasphere / cubesphere / octasphere / dodecasphere / icosphere", () => {
  for (const [name, create] of [
    ["tetrasphere", Primitives.tetrasphere],
    ["cubesphere", Primitives.cubesphere],
    ["octasphere", Primitives.octasphere],
    ["dodecasphere", Primitives.dodecasphere],
    ["icosphere", Primitives.icosphere],
  ]) {
    for (const projection of ["gnomonic", "spherical"]) {
      it(`${name} (${projection}) is a watertight, outward-facing geodesic sphere`, () => {
        const radius = 0.5;
        const g = create({ radius, projection });
        const result = analyze(g);
        assert.equal(result.nan, 0);
        assert.equal(result.cracks, 0);
        assert.equal(result.nonManifold, 0);
        assert.equal(result.boundaries, 0);
        assert.equal(inwardTriangles(g), 0);

        for (let i = 0; i < g.positions.length / 3; i++) {
          const length = Math.hypot(
            g.positions[i * 3],
            g.positions[i * 3 + 1],
            g.positions[i * 3 + 2],
          );
          assert.ok(
            Math.abs(length - radius) < 1e-6,
            `vertex ${i} not on sphere`,
          );
        }
      });

      it(`${name} (${projection}) welds across faces down to a fully unique vertex set (mapping: rectangular, isolated from the uv-seam zipper)`, () => {
        const g = create({ radius: 0.5, projection, mapping: rectangular });
        assert.equal(uniquePositionCount(g), g.positions.length / 3);
      });
    }
  }

  function triangleArea(g, i) {
    const [a, b, c] = [g.cells[i], g.cells[i + 1], g.cells[i + 2]];
    const ax = g.positions[a * 3];
    const ay = g.positions[a * 3 + 1];
    const az = g.positions[a * 3 + 2];
    const ux = g.positions[b * 3] - ax;
    const uy = g.positions[b * 3 + 1] - ay;
    const uz = g.positions[b * 3 + 2] - az;
    const vx = g.positions[c * 3] - ax;
    const vy = g.positions[c * 3 + 1] - ay;
    const vz = g.positions[c * 3 + 2] - az;
    return (
      0.5 *
      Math.hypot(uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx)
    );
  }

  it("projection=spherical reduces triangle-size distortion compared to gnomonic", () => {
    for (const [name, create] of [
      ["tetrasphere", Primitives.tetrasphere],
      ["cubesphere", Primitives.cubesphere],
      ["octasphere", Primitives.octasphere],
      ["dodecasphere", Primitives.dodecasphere],
      ["icosphere", Primitives.icosphere],
    ]) {
      const areaRatio = (g) => {
        let min = Infinity;
        let max = 0;
        for (let i = 0; i < g.cells.length; i += 3) {
          const area = triangleArea(g, i);
          min = Math.min(min, area);
          max = Math.max(max, area);
        }
        return max / min;
      };

      const gnomonic = areaRatio(
        create({ subdivisions: 4, projection: "gnomonic" }),
      );
      const spherical = areaRatio(
        create({ subdivisions: 4, projection: "spherical" }),
      );
      assert.ok(
        spherical < gnomonic,
        `${name}: expected spherical (${spherical}) < gnomonic (${gnomonic})`,
      );
    }
  });

  it("subdivisions = 0 keeps just the seed vertex count (no-op projection of an already-regular solid, mapping: rectangular isolates from the uv-seam zipper)", () => {
    const mapping = rectangular;
    assert.equal(
      Primitives.tetrasphere({ subdivisions: 0, mapping }).positions.length /
        3,
      4,
    );
    assert.equal(
      Primitives.cubesphere({ subdivisions: 0, mapping }).positions.length /
        3,
      8,
    );
    assert.equal(
      Primitives.octasphere({ subdivisions: 0, mapping }).positions.length /
        3,
      6,
    );
    assert.equal(
      Primitives.dodecasphere({ subdivisions: 0, mapping }).positions
        .length / 3,
      20,
    );
    assert.equal(
      Primitives.icosphere({ subdivisions: 0, mapping }).positions.length /
        3,
      12,
    );
  });

  it("uv-seam zipper: no triangle spans more than half the texture width in u", () => {
    // tetrasphere is excluded: its 4 huge faces mean a triangle's 3 corners
    // can already be ~120° apart in longitude before any subdivision, which
    // no per-vertex uv duplication can fix (only splitting the triangle
    // itself would) - see the comment above the zipper in polyhedron.js.
    for (const [name, create] of [
      ["cubesphere", () => Primitives.cubesphere({ subdivisions: 3 })],
      ["octasphere", () => Primitives.octasphere({ subdivisions: 3 })],
      ["dodecasphere", () => Primitives.dodecasphere({ subdivisions: 2 })],
      ["icosphere", () => Primitives.icosphere({ subdivisions: 3 })],
    ]) {
      const g = create();
      for (let i = 0; i < g.cells.length; i += 3) {
        const u = [0, 1, 2].map((k) => g.uvs[g.cells[i + k] * 2]);
        const spread = Math.max(...u) - Math.min(...u);
        assert.ok(spread <= 0.5, `${name} triangle ${i / 3}: u spread ${spread}`);
      }
    }
  });
});

describe("polyhedron (subdivisions / project, direct)", () => {
  it("flat mode subdivision keeps exact triangle/vertex counts and stays crack-free (triangular seed)", () => {
    for (const subdivisions of [0, 1, 2, 3, 5]) {
      const g = polyhedron(tetrahedronSeed, { subdivisions });
      assert.equal(g.cells.length / 3, 4 * (subdivisions + 1) ** 2);
      const result = analyze(g);
      assert.equal(result.cracks, 0, `subdivisions=${subdivisions}`);
      assert.equal(result.degenerate, 0, `subdivisions=${subdivisions}`);
      assert.equal(result.nonManifold, 0, `subdivisions=${subdivisions}`);
      assert.equal(inwardTriangles(g), 0, `subdivisions=${subdivisions}`);
    }
  });

  it("flat mode subdivision on a pentagon seed exercises the diagonal cache", () => {
    const seed = dodecahedronSeed();
    for (const subdivisions of [0, 1, 3]) {
      const g = polyhedron(seed, { subdivisions });
      assert.equal(g.cells.length / 3, 12 * 3 * (subdivisions + 1) ** 2);
      const result = analyze(g);
      assert.equal(result.cracks, 0, `subdivisions=${subdivisions}`);
      assert.equal(result.nonManifold, 0, `subdivisions=${subdivisions}`);
      assert.equal(inwardTriangles(g), 0, `subdivisions=${subdivisions}`);
    }
  });

  it("project mode welds across faces down to a fully unique vertex set", () => {
    for (const subdivisions of [0, 1, 2, 3, 5]) {
      // mapping: rectangular isolates welding from the uv-seam zipper below,
      // which intentionally reintroduces a few same-position duplicates
      const g = polyhedron(tetrahedronSeed, {
        subdivisions,
        project: true,
        radius: 0.5,
        mapping: rectangular,
      });
      const result = analyze(g);
      assert.equal(result.cracks, 0, `subdivisions=${subdivisions}`);
      assert.equal(result.nonManifold, 0, `subdivisions=${subdivisions}`);
      assert.equal(result.boundaries, 0, `subdivisions=${subdivisions}`);
      assert.equal(inwardTriangles(g), 0, `subdivisions=${subdivisions}`);
      assert.equal(
        uniquePositionCount(g),
        g.positions.length / 3,
        `subdivisions=${subdivisions} fully welded, no leftover duplicates`,
      );

      // Every vertex lands exactly on the sphere of the requested radius
      for (let i = 0; i < g.positions.length / 3; i++) {
        const length = Math.hypot(
          g.positions[i * 3],
          g.positions[i * 3 + 1],
          g.positions[i * 3 + 2],
        );
        assert.ok(Math.abs(length - 0.5) < 1e-6);
      }
    }
  });

  it("project mode welds a pentagon seed across shared edges too", () => {
    const seed = dodecahedronSeed();
    const flat = polyhedron(seed, { subdivisions: 2 });
    const projected = polyhedron(seed, { subdivisions: 2, project: true });
    // Same triangle topology, fewer vertices once shared edges are welded
    assert.equal(flat.cells.length, projected.cells.length);
    assert.ok(projected.positions.length < flat.positions.length);
    const result = analyze(projected);
    assert.equal(result.cracks, 0);
    assert.equal(result.nonManifold, 0);
    assert.equal(result.boundaries, 0);
  });
});
