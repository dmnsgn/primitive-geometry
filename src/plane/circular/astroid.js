/** @module astroid */
import { superellipse } from "./superellipse.js";
import { lamé } from "../../mappings.js";
import { checkArguments, TAU } from "../../utils.js";

/**
 * @typedef {object} AstroidOptions
 * @property {number} [radius=0.5]
 * @property {number} [segments=32]
 * @property {number} [innerSegments=16]
 * @property {number} [theta=TAU]
 * @property {number} [thetaOffset=0]
 * @property {boolean} [mergeCentroid=true]
 * @property {Function} [mapping=mappings.lamé]
 */

/**
 * Hypocycloid with 4 cusps: a superellipse special case (m = n = 2/3).
 * @see [Wolfram MathWorld – Astroid]{@link https://mathworld.wolfram.com/Astroid.html}
 * @alias module:astroid
 * @param {AstroidOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 */
export function astroid({
  radius = 0.5,
  segments = 32,
  innerSegments = 16,
  theta = TAU,
  thetaOffset = 0,
  mergeCentroid = true,
  mapping = lamé,
} = {}) {
  checkArguments(arguments);

  return superellipse({
    sx: 1,
    sy: 1,
    radius,
    segments,
    innerSegments,
    theta,
    thetaOffset,
    mergeCentroid,
    mapping,
    m: 2 / 3,
    n: 2 / 3,
  });
}
