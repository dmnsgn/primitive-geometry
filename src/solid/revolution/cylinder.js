/** @module cylinder */
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
 * @typedef {object} CylinderOptions
 * @property {number} [height=1]
 * @property {number} [radius=0.25]
 * @property {number} [nx=16]
 * @property {number} [ny=1]
 * @property {number} [radiusApex=radius]
 * @property {number} [capSegments=1]
 * @property {boolean} [capApex=true]
 * @property {boolean} [capBase=true]
 * @property {number} [phi=TAU]
 * @property {Function} [capMapping=mappings.rectangular]
 */

/**
 * @alias module:cylinder
 * @param {CylinderOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 */
export function cylinder({
  height = 1,
  radius = 0.25,
  nx = 16,
  ny = 1,

  radiusApex = radius,
  capSegments = 1,
  capApex = true,
  capBase = true,
  capBaseSegments = capSegments,
  phi = TAU,
  capMapping = rectangular,
} = {}) {
  checkArguments(arguments);

  let capCount = 0;
  if (capApex) capCount += capSegments;
  if (capBase) capCount += capBaseSegments;

  const segments = nx + 1;
  const slices = ny + 1;

  const size = segments * slices + segments * 2 * capCount;

  // Rings collapsed to a point (cone apex/base, cap centers) fan with a
  // single triangle per quad instead of two, skipping the degenerate one
  const apexFan = radiusApex === 0;
  const baseFan = radius === 0;
  const fans =
    (apexFan ? 1 : 0) +
    (baseFan ? 1 : 0) +
    (capApex && capSegments > 0 ? 1 : 0) +
    (capBase && capBaseSegments > 0 ? 1 : 0);

  const positions = new Float32Array(size * 3);
  const normals = new Float32Array(size * 3);
  const uvs = new Float32Array(size * 2);
  const cells = new (getCellsTypedArray(size))(
    (nx * ny + nx * capCount) * 6 - fans * nx * 3,
  );

  let vertexIndex = 0;
  let cellIndex = 0;

  const halfHeight = height / 2;
  const segmentIncrement = 1 / (segments - 1);
  const ringIncrement = 1 / (slices - 1);

  // Wrap the last column to the exact first column angle for full revolutions
  const wrap = phi % TAU === 0;

  for (let i = 0; i < segments; i++) {
    const u = i * segmentIncrement;
    const p = (wrap && i === segments - 1 ? 0 : u) * phi;
    const cosPhi = -Math.cos(p);
    const sinPhi = Math.sin(p);

    for (let j = 0; j < slices; j++) {
      const v = j * ringIncrement;

      const r = radius * (1 - v) + radiusApex * v;
      positions[vertexIndex * 3] = r * cosPhi;
      positions[vertexIndex * 3 + 1] = height * v - halfHeight;
      positions[vertexIndex * 3 + 2] = r * sinPhi;

      TMP[0] = height * cosPhi;
      TMP[1] = radius - radiusApex;
      TMP[2] = height * sinPhi;
      normalize(TMP);

      normals[vertexIndex * 3] = TMP[0];
      normals[vertexIndex * 3 + 1] = TMP[1];
      normals[vertexIndex * 3 + 2] = TMP[2];

      uvs[vertexIndex * 2] = u;
      uvs[vertexIndex * 2 + 1] = v;

      vertexIndex++;
    }
  }

  for (let j = 0; j < slices - 1; j++) {
    for (let i = 0; i < segments - 1; i++) {
      if (!(baseFan && j === 0)) {
        cells[cellIndex] = (i + 0) * slices + (j + 0);
        cells[cellIndex + 1] = (i + 1) * slices + (j + 0);
        cells[cellIndex + 2] = (i + 1) * slices + (j + 1);

        cellIndex += 3;
      }

      if (!(apexFan && j === slices - 2)) {
        cells[cellIndex] = (i + 0) * slices + (j + 0);
        cells[cellIndex + 1] = (i + 1) * slices + (j + 1);
        cells[cellIndex + 2] = (i + 0) * slices + (j + 1);

        cellIndex += 3;
      }
    }
  }

  const indices = { vertex: vertexIndex, cell: cellIndex };

  const angleAt = (i) => {
    const u = i / nx;
    const p = (wrap && i === nx ? 0 : u) * phi;
    return { cos: -Math.cos(p), sin: Math.sin(p), t: p };
  };

  const geometry = { positions, normals, uvs, cells };

  if (capBase) {
    computeCap(geometry, indices, {
      ringSegments: nx,
      capSegments: capBaseSegments,
      capRadius: radius,
      flip: 1,
      angleAt,
      point: (x, y) => [x, -halfHeight, y],
      normal: [0, -1, 0],
      mapping: capMapping,
    });
  }

  if (capApex) {
    computeCap(geometry, indices, {
      ringSegments: nx,
      capSegments,
      capRadius: radiusApex,
      flip: -1,
      angleAt,
      point: (x, y) => [x, halfHeight, y],
      normal: [0, 1, 0],
      mapping: capMapping,
    });
  }

  return geometry;
}
