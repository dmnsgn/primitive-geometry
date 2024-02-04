/** @module mappings */
import { HALF_PI, SQRT2, TAU } from "./utils.js";

const safeSqrt = (x) => Math.sqrt(Math.max(x, 0));
const isNegligeable = (x) => Math.abs(x) < Number.EPSILON * 2;

const remapRectangular = (x, radius) => (x / radius + 1) / 2;
const remap = (x) => (x + 1) / 2; // From [-1, 1] to [0, 1]

export function rectangular({ uvs, index, x, y, radius, sx = 1, sy = 1 }) {
  uvs[index] = remapRectangular(x, radius * sx);
  uvs[index + 1] = remapRectangular(y, radius * sy);
}

// Basic
export function radial({ uvs, index, u, v, radius }) {
  const x = Math.sqrt(u ** 2 + v ** 2) / Math.max(Math.abs(u), Math.abs(v));

  uvs[index] = remap(x * u, radius);
  uvs[index + 1] = remap(x * v, radius);
}

const FOUR_OVER_PI = 4 / Math.PI;

export function concentric({ uvs, index, u, v, radius }) {
  const u2 = u ** 2;
  const v2 = v ** 2;
  const x = Math.sqrt(u2 + v2);

  if (u2 > v2) {
    uvs[index] = remap(x * Math.sign(u), radius);
    uvs[index + 1] = remap(
      x * (FOUR_OVER_PI * Math.atan(v / Math.abs(u))),
      radius,
    );
  } else {
    uvs[index] = remap(
      x * (FOUR_OVER_PI * Math.atan(u / (Math.abs(v) + Number.EPSILON))),
      radius,
    );
    uvs[index + 1] = remap(x * Math.sign(v), radius);
  }
}
export function lamé({ uvs, index, u, v, radius }) {
  const u2 = u ** 2;
  const v2 = v ** 2;
  uvs[index] = remap(Math.sign(u) * Math.abs(u) ** (1 - u2 - v2), radius);
  uvs[index + 1] = remap(Math.sign(v) * Math.abs(v) ** (1 - u2 - v2), radius);
}
export function elliptical({ uvs, index, u, v, radius }) {
  const t = u ** 2 - v ** 2;
  const pu1 = 0.5 * safeSqrt(2 + t + 2 * SQRT2 * u);
  const pu2 = 0.5 * safeSqrt(2 + t - 2 * SQRT2 * u);
  const pv1 = 0.5 * safeSqrt(2 - t + 2 * SQRT2 * v);
  const pv2 = 0.5 * safeSqrt(2 - t - 2 * SQRT2 * v);

  uvs[index] = remap(pu1 - pu2, radius);
  uvs[index + 1] = remap(pv1 - pv2, radius);
}

// Radial, all variations of FG squircular:
function fixFGSingularities(uvs, index, u, v, radius) {
  if (isNegligeable(u) || isNegligeable(v)) {
    uvs[index] = remap(u, radius);
    uvs[index + 1] = remap(v, radius);
  } else {
    return true;
  }
}

export function fgSquircular({ uvs, index, u, v, radius }) {
  const ok = fixFGSingularities(uvs, index, u, v, radius);
  if (ok) {
    const u2 = u ** 2;
    const v2 = v ** 2;
    const sign = Math.sign(u * v);
    const uv2Sum = u2 + v2;
    const sqrtUV = Math.sqrt(
      uv2Sum - safeSqrt(uv2Sum * (uv2Sum - 4 * u2 * v2)),
    );
    uvs[index] = remap((sign / (v * SQRT2)) * sqrtUV, radius);
    uvs[index + 1] = remap((sign / (u * SQRT2)) * sqrtUV, radius);
  }
}
export function twoSquircular({ uvs, index, u, v, radius }) {
  const ok = fixFGSingularities(uvs, index, u, v, radius);
  if (ok) {
    const sign = Math.sign(u * v);
    const sqrtUV = Math.sqrt(1 - safeSqrt(1 - 4 * u ** 2 * v ** 2));
    uvs[index] = remap((sign / (v * SQRT2)) * sqrtUV, radius);
    uvs[index + 1] = remap((sign / (u * SQRT2)) * sqrtUV, radius);
  }
}
export function threeSquircular({ uvs, index, u, v, radius }) {
  const ok = fixFGSingularities(uvs, index, u, v, radius);
  if (ok) {
    const u2 = u ** 2;
    const v2 = v ** 2;
    const sign = Math.sign(u * v);
    const sqrtUV = Math.sqrt(
      (1 - safeSqrt(1 - 4 * u ** 4 * v2 - 4 * u2 * v ** 4)) / (2 * (u2 + v2)),
    );
    uvs[index] = remap((sign / v) * sqrtUV, radius);
    uvs[index + 1] = remap((sign / u) * sqrtUV, radius);
  }
}
export function cornerificTapered2({ uvs, index, u, v, radius }) {
  const ok = fixFGSingularities(uvs, index, u, v, radius);
  if (ok) {
    const u2 = u ** 2;
    const v2 = v ** 2;
    const sign = Math.sign(u * v);
    const uv2Sum = u2 + v2;
    const sqrtUV = Math.sqrt(
      (uv2Sum - Math.sqrt(uv2Sum * (uv2Sum - 4 * u2 * v2 * (2 - u2 - v2)))) /
        (2 * (2 - u2 - v2)),
    );
    uvs[index] = remap((sign / v) * sqrtUV, radius);
    uvs[index + 1] = remap((sign / u) * sqrtUV, radius);
  }
}
export function tapered4({ uvs, index, u, v, radius }) {
  const ok = fixFGSingularities(uvs, index, u, v, radius);
  if (ok) {
    const u2 = u ** 2;
    const v2 = v ** 2;
    const sign = Math.sign(u * v);
    const uv2Sum = u2 + v2;
    const divider = 3 - u ** 4 - 2 * u2 * v2 - v ** 4;
    const sqrtUV = Math.sqrt(
      (uv2Sum - safeSqrt(uv2Sum * (uv2Sum - 2 * u2 * v2 * divider))) / divider,
    );
    uvs[index] = remap((sign / v) * sqrtUV, radius);
    uvs[index + 1] = remap((sign / u) * sqrtUV, radius);
  }
}

// Non-axial
const FOURTH_SQRT2 = 2 ** (1 / 4);

export function nonAxial2Pinch({ uvs, index, u, v, radius }) {
  const u2 = u ** 2;
  const v2 = v ** 2;
  const sign = Math.sign(u * v);
  const uv2Sum = u2 + v2;

  const sqrtUV =
    (uv2Sum - 2 * u2 * v2 - safeSqrt((uv2Sum - 4 * u2 * v2) * uv2Sum)) **
    (1 / 4);

  if (isNegligeable(v)) {
    uvs[index] = remap(Math.sign(u) * Math.sqrt(Math.abs(u)), radius);
    uvs[index + 1] = remap((sign / (u * FOURTH_SQRT2)) * sqrtUV, radius);
  } else {
    uvs[index] = remap((sign / (v * FOURTH_SQRT2)) * sqrtUV, radius);
    uvs[index + 1] = remap(
      isNegligeable(u)
        ? Math.sign(v) * Math.sqrt(Math.abs(v))
        : (sign / (u * FOURTH_SQRT2)) * sqrtUV,
      radius,
    );
  }
}
export function nonAxialHalfPinch({ uvs, index, u, v, radius }) {
  const u2 = u ** 2;
  const v2 = v ** 2;
  const sign = Math.sign(u * v);
  const uv2Sum = u2 + v2;

  const sqrtUV = Math.sqrt(
    (1 - safeSqrt(1 - 4 * u2 * v2 * uv2Sum ** 2)) / (2 * uv2Sum),
  );

  if (isNegligeable(v)) {
    uvs[index] = remap(Math.sign(u) * u2, radius);
    uvs[index + 1] = remap((sign / u) * sqrtUV, radius);
  } else {
    uvs[index] = remap((sign / v) * sqrtUV, radius);
    uvs[index + 1] = remap(
      isNegligeable(u) ? Math.sign(v) * v2 : (sign / u) * sqrtUV,
      radius,
    );
  }
}

// Variations of elliptical
export function squelched({ uvs, index, u, v, radius, t }) {
  uvs[index] = [HALF_PI, TAU - HALF_PI].includes(t)
    ? 0.5
    : remap(u / Math.sqrt(1 - v ** 2), radius);
  uvs[index + 1] = [0, TAU, Math.PI].includes(t)
    ? 0.5
    : remap(v / Math.sqrt(1 - u ** 2), radius);
}
export function squelchedVertical({ uvs, index, u, v, radius, t }) {
  uvs[index] = remap(u, radius);
  uvs[index + 1] = [0, TAU, Math.PI].includes(t)
    ? 0.5
    : remap(v / Math.sqrt(1 - u ** 2), radius);
}
export function squelchedHorizontal({ uvs, index, u, v, radius, t }) {
  uvs[index] = [HALF_PI, TAU - HALF_PI].includes(t)
    ? 0.5
    : remap(u / Math.sqrt(1 - v ** 2), radius);
  uvs[index + 1] = remap(v, radius);
}
