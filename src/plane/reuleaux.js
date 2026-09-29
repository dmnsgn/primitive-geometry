/**
 * @module primitiveGeometry
 * @ignore
 */
import { concentric } from "../mappings.js";
import { TAU } from "../utils/common.js";
import {
  computePolarGeometry,
  computePolarPathGeometry,
} from "../utils/polar.js";

/**
 * @typedef {object} ReuleauxOptions
 * @property {number} [sides=3]
 * @property {number} [radius=0.5]
 * @property {number} [segments=32]
 * @property {number} [innerSegments=16]
 * @property {number} [innerRadius=0]
 * @property {number} [theta=TAU]
 * @property {number} [thetaOffset=0]
 * @property {boolean} [mergeCentroid=innerRadius===0]
 * @property {import("../mappings.js").MappingFn} [mapping=mappings.concentric]
 */

// Reuleaux polygon boundary point at angle t, unit radius - shared by
// reuleaux's radial fill (scaled by rx per ring) and reuleauxPath's outline
// (scaled by radius directly, no ring interpolation).
function computeReuleauxEdge(
  sides,
  cosSides,
  PIoverSides,
  thetaOffset,
  cosOffset,
  sinOffset,
  t,
) {
  const s = t - thetaOffset;
  const phi = PIoverSides * (2 * Math.floor((sides * s) / TAU) + 1);
  const px = cosSides * Math.cos(0.5 * (s + phi)) - Math.cos(phi);
  const py = cosSides * Math.sin(0.5 * (s + phi)) - Math.sin(phi);

  return [px * cosOffset - py * sinOffset, px * sinOffset + py * cosOffset];
}

/**
 * A Reuleaux polygon: a constant-width curve built from `sides` circular arcs,
 * each centered on the opposite vertex.
 *
 * @param {ReuleauxOptions} [options={}]
 * @returns {import("../../types.js").SimplicialComplex}
 * @see [Parametric equations for regular and Reuleaux polygons]{@link https://tpfto.wordpress.com/2011/09/15/parametric-equations-for-regular-and-reuleaux-polygons/}
 */
export function reuleaux({
  sides = 3,
  radius = 0.5,
  segments = 32,
  innerSegments = 16,
  innerRadius = 0,
  theta = TAU,
  thetaOffset = 0,
  mergeCentroid = innerRadius === 0,
  mapping = concentric,
} = {}) {
  const cosSides = 2 * Math.cos(Math.PI / (2 * sides));
  const PIoverSides = Math.PI / sides;
  const cosOffset = Math.cos(thetaOffset);
  const sinOffset = Math.sin(thetaOffset);

  return computePolarGeometry({
    sx: 1,
    sy: 1,
    radius,
    segments,
    innerSegments,
    innerRadius,
    theta,
    thetaOffset,
    mergeCentroid,
    mapping,
    equation: ({ rx, t }) => {
      const [x, y] = computeReuleauxEdge(
        sides,
        cosSides,
        PIoverSides,
        thetaOffset,
        cosOffset,
        sinOffset,
        t,
      );
      return [rx * x, rx * y];
    },
  });
}

/**
 * @typedef {object} ReuleauxPathOptions
 * @property {number} [sides=3]
 * @property {number} [radius=0.5]
 * @property {number} [segments=32]
 * @property {number} [theta=TAU]
 * @property {number} [thetaOffset=0]
 * @property {boolean} [closed=false]
 */

/**
 * Outline dual of `reuleaux`: same parametric boundary, sampled directly with
 * no radial fill.
 *
 * @param {ReuleauxPathOptions} [options={}]
 * @returns {import("../../types.js").SimplicialComplexPath}
 */
export function reuleauxPath({
  sides = 3,
  radius = 0.5,
  segments = 32,
  theta = TAU,
  thetaOffset = 0,
  closed = false,
} = {}) {
  const cosSides = 2 * Math.cos(Math.PI / (2 * sides));
  const PIoverSides = Math.PI / sides;
  const cosOffset = Math.cos(thetaOffset);
  const sinOffset = Math.sin(thetaOffset);

  return computePolarPathGeometry({
    segments,
    theta,
    thetaOffset,
    closed,
    equation: (t) => {
      const [x, y] = computeReuleauxEdge(
        sides,
        cosSides,
        PIoverSides,
        thetaOffset,
        cosOffset,
        sinOffset,
        t,
      );
      return [radius * x, radius * y];
    },
  });
}
