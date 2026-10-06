/**
 * @module primitiveGeometry
 * @ignore
 */
import { computeSweptArc } from "../../utils/polar.js";
import { rectangular } from "../../mappings.js";
import { concatGeometries } from "../../utils/common.js";

/**
 * @typedef {object} LuneOptions
 * @property {number} [radius=0.5] Big circle radius.
 * @property {number} [innerRadius=radius] Small circle radius.
 * @property {number} [distance=radius*0.5] Small circle center offset along +x.
 *   `distance + innerRadius > radius` for a crescent.
 * @property {import("../../../types.js").PositiveInteger} [segments=32]
 *   Columns, left to right.
 * @property {import("../../../types.js").PositiveInteger} [innerSegments=16]
 *   Rows between each half's boundaries.
 * @property {import("../../mappings.js").MappingFn} [mapping=mappings.rectangular]
 *   Use `uRatio`/`vRatio` to follow the arcs.
 */

/**
 * A lune: a big circle minus an offset small one.
 *
 * @param {LuneOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 * @see [Wolfram MathWorld – Lune]{@link https://mathworld.wolfram.com/Lune.html}
 */
export function lune({
  radius = 0.5,
  innerRadius = radius,
  distance = radius * 0.5,
  segments = 32,
  innerSegments = 16,
  mapping = rectangular,
} = {}) {
  const b = radius;
  const a = innerRadius;
  const d = distance;

  const uMin = -b;
  const uMax = (b * b - a * a + d * d) / (2 * d);
  // The near boundary kinks here: flat, then a vertical tangent
  const kink = d - a;

  const outerBound = (x) => Math.sqrt(Math.max(b * b - x * x, 0));
  const innerBound = (x) => Math.sqrt(Math.max(a * a - (x - d) ** 2, 0));

  // Shared bounding box so uvs stay continuous across pieces
  const center = [(uMin + uMax) / 2, 0];
  const sx = (uMax - uMin) / 2;
  const sy = outerBound(Math.min(Math.max(0, uMin), uMax));

  // One sweep would bifurcate past the small circle's leftmost point: each half
  // is its own band, split at the kink into a flat cap and a curved horn
  function sweepBand(mirror) {
    const pieces = [];
    const flat = (x) => (mirror ? [-outerBound(x), 0] : [0, outerBound(x)]);
    const curved = (x) =>
      mirror
        ? [-outerBound(x), -innerBound(x)]
        : [innerBound(x), outerBound(x)];

    const capEnd = Math.min(kink, uMax);
    if (capEnd > uMin) {
      pieces.push(
        computeSweptArc({
          segments,
          innerSegments,
          uMin,
          uMax: capEnd,
          mapping,
          center,
          sx,
          sy,
          bounds: flat,
          point: (x, y) => [x, y],
        }),
      );
    }

    const hornStart = Math.max(kink, uMin);
    if (hornStart < uMax) {
      pieces.push(
        computeSweptArc({
          segments,
          innerSegments,
          uMin: hornStart,
          uMax,
          mapping,
          center,
          sx,
          sy,
          bounds: curved,
          point: (x, y) => [x, y],
        }),
      );
    }

    return pieces;
  }

  return concatGeometries([...sweepBand(false), ...sweepBand(true)]);
}
