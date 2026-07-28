/** @module reuleaux */
import { concentric } from "../mappings.js";
import { checkArguments, computePolarGeometry, TAU } from "../utils.js";

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
  checkArguments(arguments);

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
      const s = t - thetaOffset;
      const phi = PIoverN * (2 * Math.floor((n * s) / TAU) + 1);
      const px = cosN * Math.cos(0.5 * (s + phi)) - Math.cos(phi);
      const py = cosN * Math.sin(0.5 * (s + phi)) - Math.sin(phi);

      return [
        rx * (px * cosOffset - py * sinOffset),
        rx * (px * sinOffset + py * cosOffset),
      ];
    },
  });
}
