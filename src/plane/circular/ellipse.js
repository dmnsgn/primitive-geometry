/** @module ellipse */
import { elliptical } from "../../mappings.js";
import { checkArguments, getCellsTypedArray, TAU } from "../../utils.js";

/**
 * @typedef {object} EllipseOptions
 * @property {number} [sx=1]
 * @property {number} [sy=0.5]
 * @property {number} [radius=0.5]
 * @property {number} [segments=32]
 * @property {number} [innerSegments=16]
 * @property {number} [theta=TAU]
 * @property {number} [thetaOffset=0]
 * @property {boolean} [mergeCentroid=true]
 * @property {Function} [mapping=mappings.elliptical]
 */

/**
 * Closed for a full revolution (theta multiple of TAU): the last column of
 * vertices is shared with the first so the wrap edge is welded.
 * @alias module:ellipse
 * @param {EllipseOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 */
function ellipse({
  sx = 1,
  sy = 0.5,
  radius = 0.5,
  segments = 32,
  innerSegments = 16,
  theta = TAU,
  thetaOffset = 0,
  innerRadius = 0,
  mergeCentroid = true,
  mapping = elliptical,
  equation = ({ rx, ry, cosTheta, sinTheta }) => [rx * cosTheta, ry * sinTheta],
} = {}) {
  checkArguments(arguments);

  const closed = theta !== 0 && theta % TAU === 0;
  const cols = segments + (closed ? 0 : 1);

  const size = mergeCentroid
    ? 1 + innerSegments * cols
    : (innerSegments + 1) * cols;

  const positions = new Float32Array(size * 3);
  const normals = new Float32Array(size * 3);
  const uvs = new Float32Array(size * 2);
  const cells = new (getCellsTypedArray(size))(
    mergeCentroid
      ? segments * 3 + (innerSegments - 1) * segments * 6
      : innerSegments * segments * 6,
  );

  if (mergeCentroid) {
    normals[2] = 1;
    uvs[0] = 0.5;
    uvs[1] = 0.5;
  }

  let vertexIndex = mergeCentroid ? 1 : 0;
  let cellIndex = 0;

  for (let j = mergeCentroid ? 1 : 0; j <= innerSegments; j++) {
    const radiusRatio = j / innerSegments;

    const r = innerRadius + (radius - innerRadius) * radiusRatio;

    const ringOffset = vertexIndex;

    for (let i = 0; i < cols; i++, vertexIndex++) {
      const thetaRatio = i / segments;
      const t = thetaOffset + thetaRatio * theta;

      const cosTheta = Math.cos(t);
      const sinTheta = Math.sin(t);

      const [x, y] = equation({
        rx: sx * r,
        ry: sy * r,
        cosTheta,
        sinTheta,
        s: radiusRatio,
        t,
      });

      positions[vertexIndex * 3] = x;
      positions[vertexIndex * 3 + 1] = y;

      normals[vertexIndex * 3 + 2] = 1;

      mapping({
        uvs,
        index: vertexIndex * 2,
        u: radiusRatio * cosTheta,
        v: radiusRatio * sinTheta,
        radius,
        radiusRatio,
        thetaRatio,
        t,
        // For rectangular
        x,
        y,
        sx,
        sy,
      });

      if (i < segments) {
        // Next column, sharing the first one on the wrap for closed shapes
        const i1 = (i + 1) % cols;

        if (mergeCentroid && j === 1) {
          cells[cellIndex] = ringOffset + i;
          cells[cellIndex + 1] = ringOffset + i1;

          cellIndex += 3;
        } else if (j > (mergeCentroid ? 1 : 0)) {
          const a = ringOffset - cols + i;
          const b = ringOffset + i;
          const c = ringOffset + i1;
          const d = ringOffset - cols + i1;

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
