/** @module lune */
import { sweptArc } from "./swept-arc.js";
import { rectangular } from "../../mappings.js";
import { concatGeometries } from "../../utils.js";

/**
 * @typedef {object} LuneOptions
 * @property {number} [radius=0.5] Radius of the big circle (`b` in
 *   MathWorld's notation), centered at the origin.
 * @property {number} [innerRadius=radius] Radius of the small circle
 *   (`a`), whose disk is subtracted from the big one. Must be `< radius`.
 * @property {number} [distance=radius*0.5] Offset of the small circle's
 *   center from the origin, along +x (`c`). For a proper crescent (both
 *   arcs contributing to the boundary) `distance + innerRadius` must exceed
 *   `radius`, ie. the small circle actually pokes through the big one's
 *   edge rather than sitting fully inside it.
 * @property {number} [segments=32] Column count, swept left to right.
 * @property {number} [innerSegments=16] Row count between the two halves'
 *   near/far boundary at each column.
 * @property {Function} [mapping=mappings.rectangular] Uv mapping function.
 *   Defaults to a flat, bounding-box-relative unwrap; pass a function using
 *   `uRatio`/`vRatio` (the swept parametrization) to follow the arcs
 *   instead.
 */

/**
 * Lune: a crescent, the region inside the big circle and outside the offset
 * small one.
 *
 * Quirks:
 * - A single top/bottom sweep would bifurcate into two disconnected bands
 *   past the small circle's own leftmost point (its disk only removes a
 *   middle sliver there, not the full band). Built as two independent
 *   sweeps split along y = 0 instead, each a band whose near boundary is
 *   `0` until the small circle encroaches, then its own arc.
 * - That near boundary has a kink at `x = distance - innerRadius` (flat,
 *   then a vertical tangent), so each band is further split into a flat
 *   "cap" sweep up to that x and a curved "horn" sweep from it.
 * - Both collapse to a point at the far left tip and at the crossing point.
 * @see [Wolfram MathWorld – Lune]{@link https://mathworld.wolfram.com/Lune.html}
 * @alias module:lune
 * @param {LuneOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
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
  const kink = d - a;

  const outerBound = (x) => Math.sqrt(Math.max(b * b - x * x, 0));
  const innerBound = (x) => Math.sqrt(Math.max(a * a - (x - d) ** 2, 0));

  // Shared bounding box, so a uv mapping stays continuous across pieces.
  const center = [(uMin + uMax) / 2, 0];
  const sx = (uMax - uMin) / 2;
  const sy = outerBound(Math.min(Math.max(0, uMin), uMax));

  // Builds one band's cap+horn pieces; mirror flips top/bottom.
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
        sweptArc({
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
        sweptArc({
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
