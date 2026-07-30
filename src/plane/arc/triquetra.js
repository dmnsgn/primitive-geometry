/** @module triquetra */
import {
  computeChebyshevColumn,
  computeSweptArc,
} from "../../utils/polar.js";
import { rectangular } from "../../mappings.js";
import {
  TAU,
  concatGeometries,
  getCellsTypedArray,
} from "../../utils/common.js";

/**
 * @typedef {object} TriquetraOptions
 * @property {number} [radius=0.5] Radius of each of the 3 circles, and the
 *   side length of the equilateral triangle formed by their centers - a
 *   canonical Triquetra has no separate spacing parameter.
 * @property {number} [segments=32] Column count, swept angularly per wedge,
 *   for both the core and the petals.
 * @property {number} [innerSegments=16] Row count between the two
 *   boundaries at each column.
 * @property {Function} [mapping=mappings.rectangular] Uv mapping function.
 *   Defaults to a flat, bounding-box-relative unwrap; pass a function using
 *   `uRatio`/`vRatio` (the swept parametrization) to follow the arcs
 *   instead.
 */

/**
 * Triquetra: three mutually intersecting vesica piscis lenses, centered at
 * the vertices of an equilateral triangle of side `radius`.
 * @see [Wolfram MathWorld – Triquetra]{@link https://mathworld.wolfram.com/Triquetra.html}
 * @alias module:triquetra
 * @param {TriquetraOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 */
export function triquetra({
  radius = 0.5,
  segments = 32,
  innerSegments = 16,
  mapping = rectangular,
} = {}) {

  const r = radius;
  const R = radius / Math.sqrt(3);

  // Circle centers, at the equilateral triangle's vertices. Each is shared
  // by 2 core wedges and 2 petals below; reused as one precomputed point
  // rather than re-derived per wedge, since re-deriving it from different
  // rotated angles can disagree in the last float bit and register as a
  // crack.
  const angleC0 = (7 * Math.PI) / 6;
  const angleC1 = (11 * Math.PI) / 6;
  const angleC2 = Math.PI / 2;
  const vertices = [angleC0, angleC1, angleC2].map((angle) => [
    R * Math.cos(angle),
    R * Math.sin(angle),
  ]);
  const offsets = [0, TAU / 3, (2 * TAU) / 3];

  // Distance from the centroid to the circle centered at angle `alpha`,
  // along the ray at angle `theta`.
  const ray = (alpha, theta) => {
    const d = theta - alpha;
    return (
      R * Math.cos(d) + Math.sqrt(Math.max(r * r - R * R * Math.sin(d) ** 2, 0))
    );
  };

  // seam(theta) is the boundary a core wedge shares with its petal: the
  // distance to the "opposite" circle (the one not forming that petal).
  // Both pieces sweep the same angle range through the same formula, so the
  // seam matches exactly and the mesh never double-covers area.
  const seam = (theta) => ray(angleC2, theta);
  const outer = (theta) => Math.min(ray(angleC0, theta), ray(angleC1, theta));

  const uMin = angleC0;
  const uMax = angleC1;

  // Shared bounding box, so a uv mapping stays continuous across pieces.
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

  // A core wedge is a triangle fan from the centroid, not a 2-boundary
  // strip: computeSweptArc has no vMin/vMax band here (vMin is always 0, ie. every
  // column reaches all the way to one shared apex), so it's built directly
  // instead - mirroring computePolarGeometry's own single-apex/concentric-
  // ring fan, but sharing computeSweptArc's own Chebyshev spacing for its columns
  // to keep the outer boundary sampled at the exact same angles as the
  // petals'.
  const columnAngle = (i) => computeChebyshevColumn(i, segments, uMin, uMax);

  const core = (k) => {
    const offset = offsets[k];
    const start = vertices[k];
    const end = vertices[(k + 1) % 3];

    const cols = segments + 1;
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
      const radiusRatio = j / innerSegments;
      const ringOffset = vertexIndex;

      for (let i = 0; i <= segments; i++, vertexIndex++) {
        const theta = columnAngle(i);
        const outerV = i === 0 || i === segments ? R : seam(theta);
        const v = outerV * radiusRatio;
        const [x, y] =
          j < innerSegments
            ? [v * Math.cos(theta + offset), v * Math.sin(theta + offset)]
            : i === 0
              ? start
              : i === segments
                ? end
                : [v * Math.cos(theta + offset), v * Math.sin(theta + offset)];

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
          vRatio: radiusRatio,
        });
      }

      if (j === 1) {
        for (let i = 0; i < segments; i++, cellIndex += 3) {
          cells.set([0, ringOffset + i, ringOffset + i + 1], cellIndex);
        }
      } else {
        const prevRingOffset = ringOffset - cols;
        for (let i = 0; i < segments; i++, cellIndex += 6) {
          const a = prevRingOffset + i;
          const b = ringOffset + i;
          const c = ringOffset + i + 1;
          const d = prevRingOffset + i + 1;
          cells.set([a, b, d, b, c, d], cellIndex);
        }
      }
    }

    return { positions, normals, uvs, cells };
  };

  // Split into 6 non-overlapping wedges instead of 3 full lenses: 3 `core`
  // wedges (together the Reuleaux triangle common to all 3 disks) and 3
  // `petal`s (each lens minus the core), 120deg apart.
  return concatGeometries([
    core(0),
    core(1),
    core(2),
    petal(0),
    petal(1),
    petal(2),
  ]);
}
