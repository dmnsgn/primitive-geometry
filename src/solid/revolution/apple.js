/** @module apple */
import {
  checkArguments,
  clamp,
  computeRevolutionGeometry,
  snapToZero,
  TAU,
} from "../../utils.js";

/**
 * @typedef {object} AppleOptions
 * @property {number} [radius=0.5] Equatorial (belly) radius
 * @property {number} [height=radius] Full height between the two dimple
 * points, silently clamped to (0, radius*2] - the generating circle's own
 * radius must exceed its offset from the axis (see below), which fails past
 * that bound
 * @property {number} [nx=32]
 * @property {number} [ny=16]
 * @property {number} [phi=TAU]
 * @property {number} [phiOffset=0]
 */

/**
 * MathWorld's Apple Surface: "more than half of a circular arc rotated
 * about an axis passing through the [arc's] endpoints" - the outer lobe of
 * a spindle torus (a torus whose tube radius exceeds its center-offset
 * radius, so the tube crosses the revolution axis instead of clearing it).
 * The generating circle (radius `a`, center offset `d` from the axis, with
 * a > d - the spindle condition) touches the axis at its own two endpoints,
 * producing the poles as true cusps (dimples), not smooth tangent points
 * like a sphere's - each pole's normal varies per column exactly like
 * `cone`'s apex does, for the same reason (a cusp has no single tangent
 * plane).
 * @see [Wolfram MathWorld – Apple Surface]{@link https://mathworld.wolfram.com/AppleSurface.html}
 * @alias module:apple
 * @param {AppleOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 */
export function apple({
  radius = 0.5,
  height = radius,
  nx = 32,
  ny = 16,
  phi = TAU,
  phiOffset = 0,
} = {}) {
  checkArguments(arguments);

  const halfHeight = clamp(height, 0, radius * 2) / 2;

  // Solve the generating circle's radius (a) and axis offset (d) from
  // radius = a + d (equatorial extent) and halfHeight² = a² - d² (pole
  // extent, ie. how far the arc's two axis-crossings sit from the equator):
  // (a - d)(a + d) = halfHeight² and a + d = radius give a - d directly.
  const aMinusD = (halfHeight * halfHeight) / radius;
  const a = (radius + aMinusD) / 2;
  const d = radius - a;

  const thetaCross = Math.acos(-d / a);

  function equation({ v, cosPhi: rawCosPhi, sinPhi: rawSinPhi }) {
    const cosPhi = snapToZero(rawCosPhi);
    const sinPhi = snapToZero(rawSinPhi);

    let cosTheta, sinTheta, r, y;
    if (v === 0 || v === 1) {
      // r = d + a·cosTheta with cosTheta = -d/a is only *mathematically*
      // exactly 0 - a/(-d/a) doesn't reliably round-trip to -d in floating
      // point, which left the pole undetected as collapsed (computed r a
      // few ULPs off 0) and a degenerate fan triangle behind. Set r/y
      // directly at the poles instead of deriving them from cosTheta/
      // sinTheta, which still feed into the normal below.
      cosTheta = -d / a;
      sinTheta = v === 0 ? -halfHeight / a : halfHeight / a;
      r = 0;
      y = v === 0 ? -halfHeight : halfHeight;
    } else {
      const theta = -thetaCross + v * 2 * thetaCross;
      cosTheta = snapToZero(Math.cos(theta));
      sinTheta = snapToZero(Math.sin(theta));
      r = d + a * cosTheta;
      y = a * sinTheta;
    }

    return {
      position: [-cosPhi * r, y, sinPhi * r],
      // Direction from the generating circle's own (off-axis) center, not
      // from the revolution axis - unlike a sphere/ellipsoid, position and
      // normal direction aren't simply proportional here. `a` is left out
      // (normalize() erases positive scalar multiples), same "factor out
      // the radius" trick cylinder/cone's tangent-cross-product normals use.
      normal: [-cosPhi * cosTheta, sinTheta, sinPhi * cosTheta],
      collapsed: r === 0,
    };
  }

  const { positions, normals, uvs, cells } = computeRevolutionGeometry({
    nx,
    ny,
    phi,
    phiOffset,
    equation,
  });

  return { positions, normals, uvs, cells };
}
