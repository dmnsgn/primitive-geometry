/**
 * @module torus
 */
import {
  checkArguments,
  getCellsTypedArray,
  normalize,
  TAU,
  TMP,
} from "./utils.js";

/**
 * @typedef {Object} TorusOptions
 * @property {number} [radius=0.4]
 * @property {number} [segments=64]
 * @property {number} [minorRadius=0.1]
 * @property {number} [minorSegments=32]
 * @property {number} [theta=TAU]
 * @property {number} [phi=TAU]
 */

/**
 * @alias module:torus
 * @param {TorusOptions} [options={}]
 * @returns {import("../types.js").SimplicialComplex}
 */
function torus({
  radius = 0.4,
  segments = 64,

  minorRadius = 0.1,
  minorSegments = 32,
  theta = TAU,
  phi = TAU,
} = {}) {
  checkArguments(arguments);

  const size = (minorSegments + 1) * (segments + 1);

  const positions = new Float32Array(size * 3);
  const normals = new Float32Array(size * 3);
  const uvs = new Float32Array(size * 2);
  const cells = new (getCellsTypedArray(size))(minorSegments * segments * 6);

  let vertexIndex = 0;
  let cellIndex = 0;

  for (let j = 0; j <= minorSegments; j++) {
    const v = j / minorSegments;

    for (let i = 0; i <= segments; i++, vertexIndex++) {
      const u = i / segments;

      const p = u * phi;
      const cosPhi = -Math.cos(p);
      const sinPhi = Math.sin(p);

      const t = v * theta;
      const cosTheta = -Math.cos(t);
      const sinTheta = Math.sin(t);

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

  return {
    positions,
    normals,
    uvs,
    cells,
  };
}

export default torus;
