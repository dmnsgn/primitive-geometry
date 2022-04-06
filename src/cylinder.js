/**
 * @module cylinder
 */
import {
  checkArguments,
  getCellsTypedArray,
  normalize,
  TAU,
  TMP,
} from "./utils.js";

/**
 * @typedef {Object} CylinderOptions
 * @property {number} [height=1]
 * @property {number} [radius=0.25]
 * @property {number} [nx=16]
 * @property {number} [ny=1]
 * @property {number} [radiusApex=radius]
 * @property {number} [capSegments=1]
 * @property {boolean} [capApex=true]
 * @property {boolean} [capBase=true]
 */

/**
 * @alias module:cylinder
 * @param {CylinderOptions} [options={}]
 * @returns {import("../types.js").SimplicialComplex}
 */
function cylinder({
  height = 1,
  radius = 0.25,
  nx = 16,
  ny = 1,

  radiusApex = radius,
  capSegments = 1,
  capApex = true,
  capBase = true,
} = {}) {
  checkArguments(arguments);

  let capCount = 0;
  if (capApex) capCount++;
  if (capBase) capCount++;

  const segments = nx + 1;
  const slices = ny + 1;

  const size = segments * slices + segments * capSegments * 2 * capCount;

  const positions = new Float32Array(size * 3);
  const normals = new Float32Array(size * 3);
  const uvs = new Float32Array(size * 2);
  const cells = new (getCellsTypedArray(size))(
    (nx * ny + nx * capSegments * capCount) * 6
  );

  let vertexIndex = 0;
  let cellIndex = 0;

  const halfHeight = height / 2;
  const segmentIncrement = 1 / (segments - 1);
  const ringIncrement = 1 / (slices - 1);

  for (let i = 0; i < segments; i++) {
    const u = i * segmentIncrement;

    for (let j = 0; j < slices; j++) {
      const v = j * ringIncrement;
      const phi = u * TAU;
      const cosPhi = -Math.cos(phi);
      const sinPhi = Math.sin(phi);

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
      cells[cellIndex + 0] = (i + 0) * slices + (j + 0);
      cells[cellIndex + 1] = (i + 1) * slices + (j + 0);
      cells[cellIndex + 2] = (i + 1) * slices + (j + 1);

      cells[cellIndex + 3] = (i + 0) * slices + (j + 0);
      cells[cellIndex + 4] = (i + 1) * slices + (j + 1);
      cells[cellIndex + 5] = (i + 0) * slices + (j + 1);

      cellIndex += 6;
    }
  }

  function computeCap(flip, height, radius) {
    const index = vertexIndex;

    const segmentIncrement = 1 / (segments - 1);
    for (let r = 0; r < capSegments; r++) {
      for (let i = 0; i < segments; i++) {
        const cosPhi = -Math.cos(i * segmentIncrement * TAU);
        const sinPhi = Math.sin(i * segmentIncrement * TAU);

        // inner point
        positions[vertexIndex * 3] = (radius * cosPhi * r) / capSegments;
        positions[vertexIndex * 3 + 1] = height;
        positions[vertexIndex * 3 + 2] = (radius * sinPhi * r) / capSegments;

        normals[vertexIndex * 3] = 0;
        normals[vertexIndex * 3 + 1] = -flip;
        normals[vertexIndex * 3 + 2] = 0;

        uvs[vertexIndex * 2] = (0.5 * cosPhi * r) / capSegments + 0.5;
        uvs[vertexIndex * 2 + 1] = (0.5 * sinPhi * r) / capSegments + 0.5;

        vertexIndex++;

        // outer point
        positions[vertexIndex * 3] = (radius * cosPhi * (r + 1)) / capSegments;
        positions[vertexIndex * 3 + 1] = height;
        positions[vertexIndex * 3 + 2] =
          (radius * sinPhi * (r + 1)) / capSegments;

        normals[vertexIndex * 3] = 0;
        normals[vertexIndex * 3 + 1] = -flip;
        normals[vertexIndex * 3 + 2] = 0;

        uvs[vertexIndex * 2] = (0.5 * (cosPhi * (r + 1))) / capSegments + 0.5;
        uvs[vertexIndex * 2 + 1] =
          (0.5 * (sinPhi * (r + 1))) / capSegments + 0.5;

        vertexIndex++;
      }
    }

    for (let r = 0; r < capSegments; r++) {
      for (let i = 0; i < segments - 1; i++) {
        const n = index + r * segments * 2 + i * 2;
        const a = n + 0;
        const b = n + 1;
        const c = n + 2;
        const d = n + 3;

        if (flip === 1) {
          cells[cellIndex] = a;
          cells[cellIndex + 1] = c;
          cells[cellIndex + 2] = d;

          cells[cellIndex + 3] = a;
          cells[cellIndex + 4] = d;
          cells[cellIndex + 5] = b;
        } else {
          cells[cellIndex + 0] = a;
          cells[cellIndex + 1] = d;
          cells[cellIndex + 2] = c;

          cells[cellIndex + 3] = a;
          cells[cellIndex + 4] = b;
          cells[cellIndex + 5] = d;
        }
        cellIndex += 6;
      }
    }
  }

  if (capBase) computeCap(1, -halfHeight, radius);
  if (capApex) computeCap(-1, halfHeight, radiusApex);

  return {
    positions,
    normals,
    uvs,
    cells,
  };
}

export default cylinder;
