/** @module ellipsoid */
import {
  checkArguments,
  getCellsTypedArray,
  normalize,
  TAU,
  TMP,
} from "../../utils.js";

/**
 * @typedef {object} EllipsoidOptions
 * @property {number} [radius=0.5]
 * @property {number} [nx=32]
 * @property {number} [ny=16]
 * @property {number} [rx=1]
 * @property {number} [ry=0.5]
 * @property {number} [rz=ry]
 * @property {number} [theta=Math.PI]
 * @property {number} [thetaOffset=0]
 * @property {number} [phi=TAU]
 * @property {number} [phiOffset=0]
 */

/**
 * Default to an oblate spheroid.
 * @alias module:ellipsoid
 * @param {EllipsoidOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 */
function ellipsoid({
  radius = 1,
  nx = 32,
  ny = 16,
  rx = 0.5,
  ry = 0.25,
  rz = ry,
  theta = Math.PI,
  thetaOffset = 0,
  phi = TAU,
  phiOffset = 0,
} = {}) {
  checkArguments(arguments);

  const size = (ny + 1) * (nx + 1);

  // Rows collapsed at a pole (multiples of PI) fan with a single triangle per
  // quad instead of two, skipping the degenerate one
  let fans = 0;
  for (let y = 0; y <= ny; y++) {
    if (((y / ny) * theta + thetaOffset) % Math.PI === 0) {
      fans += y === 0 || y === ny ? 1 : 2;
    }
  }

  const positions = new Float32Array(size * 3);
  const normals = new Float32Array(size * 3);
  const uvs = new Float32Array(size * 2);
  const cells = new (getCellsTypedArray(size))(ny * nx * 6 - fans * nx * 3);

  let vertexIndex = 0;
  let cellIndex = 0;

  // Wrap the last column to the exact first column angle for full revolutions
  const wrap = phi % TAU === 0;

  let prevCollapsed = false;

  for (let y = 0; y <= ny; y++) {
    const v = y / ny;
    const t = v * theta + thetaOffset;
    const cosTheta = Math.cos(t);
    // Ensure poles weld exactly at multiples of PI
    const sinTheta = t % Math.PI === 0 ? 0 : Math.sin(t);
    const collapsed = sinTheta === 0;

    for (let x = 0; x <= nx; x++) {
      const u = x / nx;
      const p = (wrap && x === nx ? 0 : u) * phi + phiOffset;
      const cosPhi = Math.cos(p);
      const sinPhi = Math.sin(p);

      TMP[0] = -rx * cosPhi * sinTheta;
      TMP[1] = -ry * cosTheta;
      TMP[2] = rz * sinPhi * sinTheta;

      positions[vertexIndex * 3] = radius * TMP[0];
      positions[vertexIndex * 3 + 1] = radius * TMP[1];
      positions[vertexIndex * 3 + 2] = radius * TMP[2];

      normalize(TMP);

      normals[vertexIndex * 3] = TMP[0];
      normals[vertexIndex * 3 + 1] = TMP[1];
      normals[vertexIndex * 3 + 2] = TMP[2];

      uvs[vertexIndex * 2] = u;
      uvs[vertexIndex * 2 + 1] = v;

      vertexIndex++;
    }

    if (y > 0) {
      const rowOffset = vertexIndex - 2 * (nx + 1);

      for (let x = 0; x < nx; x++) {
        const a = rowOffset + x;
        const b = a + 1;
        const c = a + nx + 1;
        const d = a + nx + 2;

        if (!prevCollapsed) {
          cells[cellIndex] = a;
          cells[cellIndex + 1] = b;
          cells[cellIndex + 2] = c;

          cellIndex += 3;
        }

        if (!collapsed) {
          cells[cellIndex] = c;
          cells[cellIndex + 1] = b;
          cells[cellIndex + 2] = d;

          cellIndex += 3;
        }
      }
    }

    prevCollapsed = collapsed;
  }

  return {
    positions,
    normals,
    uvs,
    cells,
  };
}

export default ellipsoid;
