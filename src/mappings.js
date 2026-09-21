/** @module mappings */
import { HALF_PI, SQRT2, TAU } from "./utils/common.js";

/**
 * @callback MappingFn
 * @param {object} mappingOptions
 * @param {Float32Array} [mappingOptions.uvs]
 * @param {number} [mappingOptions.index]
 * @param {number} [mappingOptions.x]
 * @param {number} [mappingOptions.y]
 * @param {number} [mappingOptions.radius]
 * @param {number} [mappingOptions.nx]
 * @param {number} [mappingOptions.ny]
 * @param {number} [mappingOptions.nz]
 * @param {number} [mappingOptions.sx]
 * @param {number} [mappingOptions.sy]
 * @param {number} [mappingOptions.t]
 * @param {number} [mappingOptions.radiusRatio]
 * @param {number} [mappingOptions.thetaRatio]
 */

const safeSqrt = (x) => Math.sqrt(Math.max(x, 0));
const safeDivide = (x, y) => x / (y + Number.EPSILON);
const isNegligeable = (x) => Math.abs(x) < Number.EPSILON * 2;

const remapRectangular = (x, radius) => (x / radius + 1) / 2;
const remap = (x) => (x + 1) / 2; // From [-1, 1] to [0, 1]

export function rectangular({ uvs, index, x, y, radius, sx = 1, sy = 1 }) {
  uvs[index] = remapRectangular(x, radius * sx);
  uvs[index + 1] = remapRectangular(y, radius * sy);
}

export function polar({ uvs, index, radiusRatio, thetaRatio }) {
  uvs[index] = radiusRatio;
  uvs[index + 1] = thetaRatio;
}

// Longitude/latitude from a normalized direction vector
export function spherical({ uvs, index, nx, ny, nz }) {
  uvs[index] = -Math.atan2(nz, nx) / TAU + 0.5;
  uvs[index + 1] = Math.asin(Math.min(1, Math.max(-1, ny))) / Math.PI + 0.5;
}

// Basic
export function radial({ uvs, index, u, v }) {
  const x = safeDivide(
    // eslint-disable-next-line unicorn/prefer-modern-math-apis
    Math.sqrt(u ** 2 + v ** 2),
    Math.max(Math.abs(u), Math.abs(v)),
  );

  uvs[index] = remap(x * u);
  uvs[index + 1] = remap(x * v);
}

const FOUR_OVER_PI = 4 / Math.PI;

export function concentric({ uvs, index, u, v }) {
  const u2 = u ** 2;
  const v2 = v ** 2;
  const x = Math.sqrt(u2 + v2);

  if (u2 > v2) {
    uvs[index] = remap(x * Math.sign(u));
    uvs[index + 1] = remap(
      x * (FOUR_OVER_PI * Math.atan(safeDivide(v, Math.abs(u)))),
    );
  } else {
    uvs[index] = remap(
      x * (FOUR_OVER_PI * Math.atan(safeDivide(u, Math.abs(v)))),
    );
    uvs[index + 1] = remap(x * Math.sign(v));
  }
}
export function lamé({ uvs, index, u, v }) {
  const u2 = u ** 2;
  const v2 = v ** 2;
  uvs[index] = remap(Math.sign(u) * Math.abs(u) ** (1 - u2 - v2));
  uvs[index + 1] = remap(Math.sign(v) * Math.abs(v) ** (1 - u2 - v2));
}
export function elliptical({ uvs, index, u, v }) {
  const t = u ** 2 - v ** 2;
  const pu1 = 0.5 * safeSqrt(2 + t + 2 * SQRT2 * u);
  const pu2 = 0.5 * safeSqrt(2 + t - 2 * SQRT2 * u);
  const pv1 = 0.5 * safeSqrt(2 - t + 2 * SQRT2 * v);
  const pv2 = 0.5 * safeSqrt(2 - t - 2 * SQRT2 * v);

  uvs[index] = remap(pu1 - pu2);
  uvs[index + 1] = remap(pv1 - pv2);
}

// Radial, all variations of FG squircular:
function fixFGSingularities(uvs, index, u, v) {
  if (isNegligeable(u) || isNegligeable(v)) {
    uvs[index] = remap(u);
    uvs[index + 1] = remap(v);
  } else {
    return true;
  }
}

export function fgSquircular({ uvs, index, u, v }) {
  const ok = fixFGSingularities(uvs, index, u, v);
  if (!ok) return;
  const u2 = u ** 2;
  const v2 = v ** 2;
  const sign = Math.sign(u * v);
  const uv2Sum = u2 + v2;
  const sqrtUV = Math.sqrt(uv2Sum - safeSqrt(uv2Sum * (uv2Sum - 4 * u2 * v2)));
  uvs[index] = remap((sign / (v * SQRT2)) * sqrtUV);
  uvs[index + 1] = remap((sign / (u * SQRT2)) * sqrtUV);
}
export function twoSquircular({ uvs, index, u, v }) {
  const ok = fixFGSingularities(uvs, index, u, v);
  if (!ok) return;
  const sign = Math.sign(u * v);
  const sqrtUV = Math.sqrt(1 - safeSqrt(1 - 4 * u ** 2 * v ** 2));
  uvs[index] = remap((sign / (v * SQRT2)) * sqrtUV);
  uvs[index + 1] = remap((sign / (u * SQRT2)) * sqrtUV);
}
export function threeSquircular({ uvs, index, u, v }) {
  const ok = fixFGSingularities(uvs, index, u, v);
  if (ok) return;
  const u2 = u ** 2;
  const v2 = v ** 2;
  const sign = Math.sign(u * v);
  const sqrtUV = Math.sqrt(
    (1 - safeSqrt(1 - 4 * u ** 4 * v2 - 4 * u2 * v ** 4)) / (2 * (u2 + v2)),
  );
  uvs[index] = remap((sign / v) * sqrtUV);
  uvs[index + 1] = remap((sign / u) * sqrtUV);
}
export function cornerificTapered2({ uvs, index, u, v }) {
  const ok = fixFGSingularities(uvs, index, u, v);
  if (!ok) return;
  const u2 = u ** 2;
  const v2 = v ** 2;
  const sign = Math.sign(u * v);
  const uv2Sum = u2 + v2;
  const sqrtUV = Math.sqrt(
    (uv2Sum - Math.sqrt(uv2Sum * (uv2Sum - 4 * u2 * v2 * (2 - u2 - v2)))) /
      (2 * (2 - u2 - v2)),
  );
  uvs[index] = remap((sign / v) * sqrtUV);
  uvs[index + 1] = remap((sign / u) * sqrtUV);
}
export function tapered4({ uvs, index, u, v }) {
  const ok = fixFGSingularities(uvs, index, u, v);
  if (!ok) return;
  const u2 = u ** 2;
  const v2 = v ** 2;
  const sign = Math.sign(u * v);
  const uv2Sum = u2 + v2;
  const divider = 3 - u ** 4 - 2 * u2 * v2 - v ** 4;
  const sqrtUV = Math.sqrt(
    (uv2Sum - safeSqrt(uv2Sum * (uv2Sum - 2 * u2 * v2 * divider))) / divider,
  );
  uvs[index] = remap((sign / v) * sqrtUV);
  uvs[index + 1] = remap((sign / u) * sqrtUV);
}

// Non-axial
const FOURTH_SQRT2 = 2 ** (1 / 4);

export function nonAxial2Pinch({ uvs, index, u, v }) {
  const u2 = u ** 2;
  const v2 = v ** 2;
  const sign = Math.sign(u * v);
  const uv2Sum = u2 + v2;

  const sqrtUV =
    (uv2Sum - 2 * u2 * v2 - safeSqrt((uv2Sum - 4 * u2 * v2) * uv2Sum)) **
    (1 / 4);

  if (isNegligeable(v)) {
    uvs[index] = remap(Math.sign(u) * Math.sqrt(Math.abs(u)));
    uvs[index + 1] = remap(safeDivide(sign, u * FOURTH_SQRT2) * sqrtUV);
  } else {
    uvs[index] = remap(safeDivide(sign, v * FOURTH_SQRT2) * sqrtUV);
    uvs[index + 1] = remap(
      isNegligeable(u)
        ? Math.sign(v) * Math.sqrt(Math.abs(v))
        : safeDivide(sign, u * FOURTH_SQRT2) * sqrtUV,
    );
  }
}
export function nonAxialHalfPinch({ uvs, index, u, v }) {
  const u2 = u ** 2;
  const v2 = v ** 2;
  const sign = Math.sign(u * v);
  const uv2Sum = u2 + v2;

  const sqrtUV = Math.sqrt(
    safeDivide(1 - safeSqrt(1 - 4 * u2 * v2 * uv2Sum ** 2), 2 * uv2Sum),
  );

  if (isNegligeable(v)) {
    uvs[index] = remap(Math.sign(u) * u2);
    uvs[index + 1] = remap(safeDivide(sign, u) * sqrtUV);
  } else {
    uvs[index] = remap(safeDivide(sign, v) * sqrtUV);
    uvs[index + 1] = remap(
      isNegligeable(u) ? Math.sign(v) * v2 : safeDivide(sign, u) * sqrtUV,
    );
  }
}

// Variations of elliptical
export function squelched({ uvs, index, u, v, t }) {
  uvs[index] = [HALF_PI, TAU - HALF_PI].includes(t)
    ? 0.5
    : remap(u / Math.sqrt(1 - v ** 2));
  uvs[index + 1] = [0, TAU, Math.PI].includes(t)
    ? 0.5
    : remap(v / Math.sqrt(1 - u ** 2));
}
export function squelchedVertical({ uvs, index, u, v, t }) {
  uvs[index] = remap(u);
  uvs[index + 1] = [0, TAU, Math.PI].includes(t)
    ? 0.5
    : remap(v / Math.sqrt(1 - u ** 2));
}
export function squelchedHorizontal({ uvs, index, u, v, t }) {
  uvs[index] = [HALF_PI, TAU - HALF_PI].includes(t)
    ? 0.5
    : remap(u / Math.sqrt(1 - v ** 2));
  uvs[index + 1] = remap(v);
}
