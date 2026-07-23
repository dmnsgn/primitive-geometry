/** @module torus */
import { rectangular } from "../../mappings.js";
import {
  checkArguments,
  computeCap,
  getCellsTypedArray,
  normalize,
  TAU,
  TMP,
} from "../../utils.js";

/**
 * @typedef {object} TorusOptions
 * @property {number} [radius=0.4]
 * @property {number} [segments=64]
 * @property {number} [minorRadius=0.1]
 * @property {number} [minorSegments=32]
 * @property {number} [theta=TAU]
 * @property {number} [thetaOffset=0]
 * @property {number} [phi=TAU]
 * @property {number} [phiOffset=0]
 * @property {number} [capSegments=1]
 * @property {boolean} [capStart=true]
 * @property {boolean} [capEnd=true]
 * @property {number} [capStartSegments=capSegments]
 * @property {number} [capEndSegments=capSegments]
 * @property {Function} [capMapping=mappings.rectangular]
 */

/**
 * @alias module:torus
 * @param {TorusOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 */
export function torus({
  radius = 0.4,
  segments = 64,

  minorRadius = 0.1,
  minorSegments = 32,
  theta = TAU,
  thetaOffset = 0,
  phi = TAU,
  phiOffset = 0,

  capSegments = 1,
  capStart = true,
  capEnd = true,
  capStartSegments = capSegments,
  capEndSegments = capSegments,
  capMapping = rectangular,
} = {}) {
  checkArguments(arguments);

  // Wrap the last column/ring to the exact first angle for full revolutions
  const wrapPhi = phi % TAU === 0;
  const wrapTheta = theta % TAU === 0;

  // A full phi revolution has no seam to cap
  const hasCapStart = capStart && !wrapPhi && capStartSegments > 0;
  const hasCapEnd = capEnd && !wrapPhi && capEndSegments > 0;

  const m = minorSegments + 1;
  const capCount =
    (hasCapStart ? capStartSegments : 0) + (hasCapEnd ? capEndSegments : 0);

  const size = m * (segments + 1) + m * 2 * capCount;

  const positions = new Float32Array(size * 3);
  const normals = new Float32Array(size * 3);
  const uvs = new Float32Array(size * 2);

  // Each cap's innermost ring is collapsed to a point: fan with a single
  // triangle per segment instead of two, skipping the degenerate one
  const capFans = (hasCapStart ? 1 : 0) + (hasCapEnd ? 1 : 0);

  const cells = new (getCellsTypedArray(size))(
    minorSegments * segments * 6 +
      minorSegments * capCount * 6 -
      minorSegments * capFans * 3,
  );

  let vertexIndex = 0;
  let cellIndex = 0;

  for (let j = 0; j <= minorSegments; j++) {
    const v = j / minorSegments;

    const t = (wrapTheta && j === minorSegments ? 0 : v) * theta + thetaOffset;
    const cosTheta = -Math.cos(t);
    const sinTheta = Math.sin(t);

    for (let i = 0; i <= segments; i++, vertexIndex++) {
      const u = i / segments;

      const p = (wrapPhi && i === segments ? 0 : u) * phi + phiOffset;
      const cosPhi = -Math.cos(p);
      const sinPhi = Math.sin(p);

      TMP[0] = (radius + minorRadius * cosTheta) * cosPhi;
      TMP[1] = (radius + minorRadius * cosTheta) * sinPhi;
      TMP[2] = minorRadius * sinTheta;

      positions[vertexIndex * 3] = TMP[0];
      positions[vertexIndex * 3 + 1] = TMP[1];
      positions[vertexIndex * 3 + 2] = TMP[2];

      TMP[0] -= radius * cosPhi;
      TMP[1] -= radius * sinPhi;

      normalize(TMP);

      normals[vertexIndex * 3] = TMP[0];
      normals[vertexIndex * 3 + 1] = TMP[1];
      normals[vertexIndex * 3 + 2] = TMP[2];

      uvs[vertexIndex * 2] = u;
      uvs[vertexIndex * 2 + 1] = v;

      if (j > 0 && i > 0) {
        const a = (segments + 1) * j + i - 1;
        const b = (segments + 1) * (j - 1) + i - 1;
        const c = (segments + 1) * (j - 1) + i;
        const d = (segments + 1) * j + i;

        cells[cellIndex] = a;
        cells[cellIndex + 1] = b;
        cells[cellIndex + 2] = d;

        cells[cellIndex + 3] = b;
        cells[cellIndex + 4] = c;
        cells[cellIndex + 5] = d;

        cellIndex += 6;
      }
    }
  }

  const indices = { vertex: vertexIndex, cell: cellIndex };

  const angleAt = (j) => {
    const v = j / minorSegments;
    const t = (wrapTheta && j === minorSegments ? 0 : v) * theta + thetaOffset;
    return { cos: -Math.cos(t), sin: Math.sin(t), t };
  };

  // Basis for the cap's local 2D plane at a fixed phi angle: x runs along
  // the meridian's cos direction (rotated by phi), y along the torus axis
  const capPoint = (pAngle) => {
    const cosPhi = -Math.cos(pAngle);
    const sinPhi = Math.sin(pAngle);
    return {
      point: (x, y) => [(radius + x) * cosPhi, (radius + x) * sinPhi, y],
      // Outward normal of that plane (flip already folded in), derived from
      // basisA x basisB with basisA = (cosPhi, sinPhi, 0), basisB = (0, 0, 1)
      normalFor: (flip) => [sinPhi * flip, -cosPhi * flip, 0],
    };
  };

  const geometry = { positions, normals, uvs, cells };

  if (hasCapStart) {
    const { point, normalFor } = capPoint(phiOffset);
    computeCap(geometry, indices, {
      ringSegments: minorSegments,
      capSegments: capStartSegments,
      capRadius: minorRadius,
      flip: 1,
      angleAt,
      point,
      normal: normalFor(1),
      mapping: capMapping,
    });
  }

  if (hasCapEnd) {
    const { point, normalFor } = capPoint(phiOffset + phi);
    computeCap(geometry, indices, {
      ringSegments: minorSegments,
      capSegments: capEndSegments,
      capRadius: minorRadius,
      flip: -1,
      angleAt,
      point,
      normal: normalFor(-1),
      mapping: capMapping,
    });
  }

  return geometry;
}
