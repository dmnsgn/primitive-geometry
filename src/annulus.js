/** @module annulus */
import { checkArguments, getCellsTypedArray, TAU } from "./utils.js";

/**
 * @typedef {Object} AnnulusOptions
 * @property {number} [radius=0.5]
 * @property {number} [segments=32]
 * @property {number} [theta=TAU]
 * @property {number} [innerRadius=radius * 0.5]
 * @property {number} [innerSegments=1]
 */

/**
 * @alias module:annulus
 * @param {AnnulusOptions} [options={}]
 * @returns {import("../types.js").BasicSimplicialComplex}
 */
function annulus({
  radius = 0.5,
  segments = 32,
  theta = TAU,
  innerRadius = radius * 0.5,
  innerSegments = 1,
} = {}) {
  checkArguments(arguments);

  const size = (segments + 1) * (innerSegments + 1);

  const positions = new Float32Array(size * 3);
  const normals = new Float32Array(size * 3);
  const uvs = new Float32Array(size * 2);
  const cells = new (getCellsTypedArray(size))(size * 6);

  let vertexIndex = 0;
  let cellIndex = 0;

  for (let j = 0; j <= innerSegments; j++) {
    const r = innerRadius + (radius - innerRadius) * (j / innerSegments);

    for (let i = 0; i <= segments; i++, vertexIndex++) {
      const t = (i / segments) * theta;

      positions[vertexIndex * 3] = r * Math.cos(t);
      positions[vertexIndex * 3 + 1] = r * Math.sin(t);

      normals[vertexIndex * 3 + 2] = 1;

      uvs[vertexIndex * 2] = (positions[vertexIndex * 3] / radius + 1) / 2;
      uvs[vertexIndex * 2 + 1] =
        (positions[vertexIndex * 3 + 1] / radius + 1) / 2;

      if (i < segments && j < innerSegments) {
        const a = j * (segments + 1) + i;
        const b = a + segments + 1;
        const c = a + segments + 2;
        const d = a + 1;

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

  return { positions, normals, uvs, cells };
}

export default annulus;
