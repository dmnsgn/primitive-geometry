/**
 * @module primitiveGeometry
 * @ignore
 */
import { computeChebyshevColumn, computeSweptArc } from "../../utils/polar.js";
import { rectangular } from "../../mappings.js";
import {
  TAU,
  concatGeometries,
  getCellsTypedArray,
} from "../../utils/common.js";

/**
 * @typedef {object} TriquetraOptions
 * @property {number} [radius=0.5] Radius of each circle, and distance between
 *   their centers.
 * @property {import("../../../types.js").PositiveInteger} [segments=32]
 *   Angular columns per piece.
 * @property {import("../../../types.js").PositiveInteger} [innerSegments=16]
 *   Rows between the two boundaries.
 * @property {import("../../mappings.js").MappingFn} [mapping=mappings.rectangular]
 *   Use `uRatio`/`vRatio` to follow the arcs.
 */

/**
 * A triquetra: 3 interlaced lenses centered on an equilateral triangle.
 *
 * @param {TriquetraOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 * @see [Wolfram MathWorld – Triquetra]{@link https://mathworld.wolfram.com/Triquetra.html}
 */
export function triquetra({
  radius = 0.5,
  segments = 32,
  innerSegments = 16,
  mapping = rectangular,
} = {}) {
  const r = radius;
  const R = radius / Math.sqrt(3);

  // Precomputed: re-deriving the circle centers from rotated angles can disagree
  // in the last bit and crack the mesh
  const angleC0 = (7 * Math.PI) / 6;
  const angleC1 = (11 * Math.PI) / 6;
  const angleC2 = Math.PI / 2;
  const vertices = [angleC0, angleC1, angleC2].map((angle) => [
    R * Math.cos(angle),
    R * Math.sin(angle),
  ]);
  const offsets = [0, TAU / 3, (2 * TAU) / 3];

  // Distance from the centroid to circle `alpha`, along the ray at `theta`
  const ray = (alpha, theta) => {
    const d = theta - alpha;
    return (
      R * Math.cos(d) + Math.sqrt(Math.max(r * r - R * R * Math.sin(d) ** 2, 0))
    );
  };

  // Core and petal share this boundary through the same formula so it matches
  // exactly
  const seam = (theta) => ray(angleC2, theta);
  const outer = (theta) => Math.min(ray(angleC0, theta), ray(angleC1, theta));

  const uMin = angleC0;
  const uMax = angleC1;
  const cols = segments + 1;

  // Shared bounding box so uvs stay continuous across pieces
  const center = [0, 0];
  const sx = r;
  const sy = 2 * R;

  const petal = (k) => {
    const offset = offsets[k];
    const start = vertices[k];
    const end = vertices[(k + 1) % 3];

    return computeSweptArc({
      segments,
      innerSegments,
      uMin,
      uMax,
      mapping,
      center,
      sx,
      sy,
      flip: true,
      bounds: (theta) => [seam(theta), outer(theta)],
      point: (theta, v) =>
        theta === uMin
          ? start
          : theta === uMax
            ? end
            : [v * Math.cos(theta + offset), v * Math.sin(theta + offset)],
    });
  };

  // A core wedge fans from the centroid, which computeSweptArc can't build. Same
  // Chebyshev columns as the petals so their shared boundary matches.
  const columnAngle = (i) => computeChebyshevColumn(i, segments, uMin, uMax);

  // End columns' outer ring lands on a circle center: reuse its vertex
  const coreColumn = (k, i, j) => {
    const theta = columnAngle(i);
    const isEnd = i === 0 || i === segments;
    const v = (isEnd ? R : seam(theta)) * (j / innerSegments);

    if (isEnd && j === innerSegments) {
      return [theta, v, vertices[(i === 0 ? k : k + 1) % 3]];
    }

    const angle = theta + offsets[k];
    return [theta, v, [v * Math.cos(angle), v * Math.sin(angle)]];
  };

  // The first ring fans from the apex at index 0
  const writeCoreCells = (cells, cellIndex, ringOffset, isFirstRing) => {
    if (isFirstRing) {
      for (let i = 0; i < segments; i++, cellIndex += 3) {
        cells.set([0, ringOffset + i, ringOffset + i + 1], cellIndex);
      }
      return cellIndex;
    }

    const prevRingOffset = ringOffset - cols;
    for (let i = 0; i < segments; i++, cellIndex += 6) {
      const a = prevRingOffset + i;
      const b = ringOffset + i;
      const c = ringOffset + i + 1;
      const d = prevRingOffset + i + 1;
      cells.set([a, b, d, b, c, d], cellIndex);
    }
    return cellIndex;
  };

  const core = (k) => {
    const size = 1 + innerSegments * cols;
    const positions = new Float32Array(size * 3);
    const normals = new Float32Array(size * 3);
    const uvs = new Float32Array(size * 2);
    const cells = new (getCellsTypedArray(size))(
      segments * 3 + (innerSegments - 1) * segments * 6,
    );

    normals[2] = 1;
    mapping({
      uvs,
      index: 0,
      x: 0,
      y: 0,
      radius: 1,
      sx,
      sy,
      u: uMin,
      v: 0,
      uRatio: 0,
      vRatio: 0,
    });

    let vertexIndex = 1;
    let cellIndex = 0;
    for (let j = 1; j <= innerSegments; j++) {
      const ringOffset = vertexIndex;

      for (let i = 0; i <= segments; i++, vertexIndex++) {
        const [theta, v, [x, y]] = coreColumn(k, i, j);

        positions[vertexIndex * 3] = x;
        positions[vertexIndex * 3 + 1] = y;
        normals[vertexIndex * 3 + 2] = 1;

        mapping({
          uvs,
          index: vertexIndex * 2,
          x,
          y,
          radius: 1,
          sx,
          sy,
          u: theta,
          v,
          uRatio: i / segments,
          vRatio: j / innerSegments,
        });
      }

      cellIndex = writeCoreCells(cells, cellIndex, ringOffset, j === 1);
    }

    return { positions, normals, uvs, cells };
  };

  // 6 non-overlapping pieces rather than 3 overlapping lenses: 3 core wedges
  // (the shared Reuleaux triangle) and 3 petals
  return concatGeometries([
    core(0),
    core(1),
    core(2),
    petal(0),
    petal(1),
    petal(2),
  ]);
}
