/** @module ellipse */
import { elliptical } from "./mappings.js";
import { checkArguments, getCellsTypedArray, TAU } from "./utils.js";

/**
 * @typedef {Object} EllipseOptions
 * @property {number} [sx=1]
 * @property {number} [sy=0.5]
 * @property {number} [radius=0.5]
 * @property {number} [segments=32]
 * @property {number} [innerSegments=16]
 * @property {number} [theta=TAU]
 * @property {number} [thetaOffset=0]
 * @property {Function} [mapping=mappings.elliptical]
 */

/**
 * @alias module:ellipse
 * @param {EllipseOptions} [options={}]
 * @returns {import("../types.js").BasicSimplicialComplex}
 */
function ellipse({
  sx = 1,
  sy = 0.5,
  radius = 0.5,
  segments = 32,
  innerSegments = 16,
  theta = TAU,
  thetaOffset = 0,
  mapping = elliptical,
  equation = ({ rx, ry, cosTheta, sinTheta }) => [rx * cosTheta, ry * sinTheta],
} = {}) {
  checkArguments(arguments);

  const size = 1 + (segments + 1) + (innerSegments - 1) * (segments + 1);

  const positions = new Float32Array(size * 3);
  const normals = new Float32Array(size * 3);
  const uvs = new Float32Array(size * 2);
  const cells = new (getCellsTypedArray(size))(
    segments * 3 + (innerSegments - 1) * segments * 6
  );

  normals[2] = 1;
  uvs[0] = 0.5;
  uvs[1] = 0.5;

  let vertexIndex = 1;
  let cellIndex = 0;

  for (let j = 0; j < innerSegments; j++) {
    const s = (j + 1) / innerSegments;
    const r = radius * s;

    for (let i = 0; i <= segments; i++, vertexIndex++) {
      const t = (i / segments) * theta + thetaOffset;

      const cosTheta = Math.cos(t);
      const sinTheta = Math.sin(t);

      const [x, y] = equation({
        rx: sx * r,
        ry: sy * r,
        cosTheta,
        sinTheta,
        s,
        t,
      });

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
        // For rectangular
        x,
        y,
        sx,
        sy,
      });

      if (i < segments) {
        if (j === 0) {
          cells[cellIndex] = i + 1;
          cells[cellIndex + 1] = i + 2;

          cellIndex += 3;
        } else if (j < innerSegments) {
          const a = 1 + (j - 1) * (segments + 1) + i;
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
  }

  return { positions, normals, uvs, cells };
}

export default ellipse;
