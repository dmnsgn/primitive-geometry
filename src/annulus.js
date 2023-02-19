/** @module annulus */
import { concentric } from "./mappings.js";
import { checkArguments, getCellsTypedArray, TAU } from "./utils.js";

/**
 * @typedef {Object} AnnulusOptions
 * @property {number} [radius=0.5]
 * @property {number} [segments=32]
 * @property {number} [innerSegments=16]
 * @property {number} [theta=TAU]
 * @property {number} [thetaOffset=0]
 * @property {number} [innerRadius=radius * 0.5]
 * @property {Function} [mapping=mappings.concentric]
 */

/**
 * @alias module:annulus
 * @param {AnnulusOptions} [options={}]
 * @returns {import("../types.js").SimplicialComplex}
 */
function annulus({
  radius = 0.5,
  segments = 32,
  innerSegments = 16,
  theta = TAU,
  thetaOffset = 0,
  innerRadius = radius * 0.5,
  mapping = concentric,
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

    const s = (j + 1) / (innerSegments + 1);

    for (let i = 0; i <= segments; i++, vertexIndex++) {
      const t = (i / segments) * theta + thetaOffset;

      const cosTheta = Math.cos(t);
      const sinTheta = Math.sin(t);

      const x = r * cosTheta;
      const y = r * sinTheta;

      positions[vertexIndex * 3] = x;
      positions[vertexIndex * 3 + 1] = y;

      normals[vertexIndex * 3 + 2] = 1;

      mapping({
        uvs,
        index: vertexIndex * 2,
        u: s * cosTheta,
        v: s * sinTheta,
        radius,
        t,
        x,
        y,
      });

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
