/**
 * @module capsule
 */
import { checkArguments, getCellsTypedArray, TAU } from "./utils.js";

/**
 * @typedef {Object} CapsuleOptions
 * @property {number} [height=1]
 * @property {number} [radius=0.25]
 * @property {number} [nx=16]
 * @property {number} [ny=32]
 * @property {number} [phi=TAU]
 */

/**
 * @alias module:capsule
 * @param {CapsuleOptions} [options={}]
 * @returns {import("../types.js").SimplicialComplex}
 */

function capsule({
  height = 0.5,
  radius = 0.25,
  nx = 16,
  ny = 32,
  phi = TAU,
} = {}) {
  checkArguments(arguments);

  const ringsBody = ny + 1;
  const ringsTotal = ny + ringsBody;

  const size = ringsTotal * nx;

  const positions = new Float32Array(size * 3);
  const normals = new Float32Array(size * 3);
  const uvs = new Float32Array(size * 2);
  const cells = new (getCellsTypedArray(size))((ringsTotal - 1) * (nx - 1) * 6);

  let vertexIndex = 0;
  let cellIndex = 0;

  const segmentIncrement = 1 / (nx - 1);
  const ringIncrement = 1 / (ny - 1);
  const bodyIncrement = 1 / (ringsBody - 1);

  function computeRing(r, y, dy) {
    for (let s = 0; s < nx; s++, vertexIndex++) {
      const x = -Math.cos(s * segmentIncrement * phi) * r;
      const z = Math.sin(s * segmentIncrement * phi) * r;

      const py = radius * y + height * dy;

      positions[vertexIndex * 3] = radius * x;
      positions[vertexIndex * 3 + 1] = py;
      positions[vertexIndex * 3 + 2] = radius * z;

      normals[vertexIndex * 3] = x;
      normals[vertexIndex * 3 + 1] = y;
      normals[vertexIndex * 3 + 2] = z;

      uvs[vertexIndex * 2] = s * segmentIncrement;
      uvs[vertexIndex * 2 + 1] = 1 - (0.5 - py / (2 * radius + height));
    }
  }

  for (let r = 0; r < ny / 2; r++) {
    computeRing(
      Math.sin(Math.PI * r * ringIncrement),
      Math.sin(Math.PI * (r * ringIncrement - 0.5)),
      -0.5
    );
  }

  for (let r = 0; r < ringsBody; r++) {
    computeRing(1, 0, r * bodyIncrement - 0.5);
  }

  for (let r = ny / 2; r < ny; r++) {
    computeRing(
      Math.sin(Math.PI * r * ringIncrement),
      Math.sin(Math.PI * (r * ringIncrement - 0.5)),
      0.5
    );
  }

  for (let r = 0; r < ringsTotal - 1; r++) {
    for (let s = 0; s < nx - 1; s++) {
      const a = r * nx;
      const b = (r + 1) * nx;
      const s1 = s + 1;
      cells[cellIndex] = a + s;
      cells[cellIndex + 1] = a + s1;
      cells[cellIndex + 2] = b + s1;

      cells[cellIndex + 3] = a + s;
      cells[cellIndex + 4] = b + s1;
      cells[cellIndex + 5] = b + s;

      cellIndex += 6;
    }
  }

  return {
    positions,
    normals,
    uvs,
    cells,
  };
}

export default capsule;
