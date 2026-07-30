/** @module reuleaux */
import { concentric } from "../mappings.js";
import {
  computePolarGeometry,
  computePolarPathGeometry,
  TAU,
} from "../utils.js";

/**
 * @typedef {object} ReuleauxOptions
 * @property {number} [radius=0.5]
 * @property {number} [segments=32]
 * @property {number} [innerSegments=16]
 * @property {number} [theta=TAU]
 * @property {number} [thetaOffset=0]
 * @property {boolean} [mergeCentroid=true]
 * @property {Function} [mapping=mappings.concentric]
 * @property {number} [n=3]
 */

// Reuleaux polygon boundary point at angle t, unit radius - shared by
// reuleaux's radial fill (scaled by rx per ring) and reuleauxPath's outline
// (scaled by radius directly, no ring interpolation).
function computeReuleauxEdge(n, cosN, PIoverN, thetaOffset, cosOffset, sinOffset, t) {
  const s = t - thetaOffset;
  const phi = PIoverN * (2 * Math.floor((n * s) / TAU) + 1);
  const px = cosN * Math.cos(0.5 * (s + phi)) - Math.cos(phi);
  const py = cosN * Math.sin(0.5 * (s + phi)) - Math.sin(phi);

  return [px * cosOffset - py * sinOffset, px * sinOffset + py * cosOffset];
}

/**
 * @see [Parametric equations for regular and Reuleaux polygons]{@link https://tpfto.wordpress.com/2011/09/15/parametric-equations-for-regular-and-reuleaux-polygons/}
 *
 * @alias module:reuleaux
 * @param {ReuleauxOptions} [options={}]
 * @returns {import("../../types.js").SimplicialComplex}
 */
export function reuleaux({
  radius = 0.5,
  segments = 32,
  innerSegments = 16,
  theta = TAU,
  thetaOffset = 0,
  mergeCentroid = true,
  mapping = concentric,
  n = 3,
} = {}) {
  const cosN = 2 * Math.cos(Math.PI / (2 * n));
  const PIoverN = Math.PI / n;
  const cosOffset = Math.cos(thetaOffset);
  const sinOffset = Math.sin(thetaOffset);

  return computePolarGeometry({
    sx: 1,
    sy: 1,
    radius,
    segments,
    innerSegments,
    theta,
    thetaOffset,
    mergeCentroid,
    mapping,
    equation: ({ rx, t }) => {
      const [x, y] = computeReuleauxEdge(
        n,
        cosN,
        PIoverN,
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
 * @property {number} [radius=0.5]
 * @property {number} [segments=32]
 * @property {number} [theta=TAU]
 * @property {number} [thetaOffset=0]
 * @property {number} [n=3]
 * @property {boolean} [closed=false]
 */

/**
 * Outline dual of `reuleaux`: same parametric boundary, sampled directly
 * with no radial fill.
 * @alias module:reuleauxPath
 * @param {ReuleauxPathOptions} [options={}]
 * @returns {import("../../types.js").SimplicialComplexPath}
 */
export function reuleauxPath({
  radius = 0.5,
  segments = 32,
  theta = TAU,
  thetaOffset = 0,
  n = 3,
  closed = false,
} = {}) {
  const cosN = 2 * Math.cos(Math.PI / (2 * n));
  const PIoverN = Math.PI / n;
  const cosOffset = Math.cos(thetaOffset);
  const sinOffset = Math.sin(thetaOffset);

  return computePolarPathGeometry({
    segments,
    theta,
    thetaOffset,
    closed,
    equation: (t) => {
      const [x, y] = computeReuleauxEdge(
        n,
        cosN,
        PIoverN,
        thetaOffset,
        cosOffset,
        sinOffset,
        t,
      );
      return [radius * x, radius * y];
    },
  });
}
