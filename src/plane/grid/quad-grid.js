/**
 * @module primitiveGeometry
 * @ignore
 */

/**
 * @typedef {object} QuadGridOptions
 * @property {number} [sx=1]
 * @property {number} [sy=sx]
 * @property {import("../../../types.js").PositiveInteger} [nx=10]
 * @property {import("../../../types.js").PositiveInteger} [ny=nx]
 */

/**
 * A grid of quads.
 *
 * @param {QuadGridOptions} [options={}]
 * @returns {import("../../../types.js").PolygonalComplex}
 */
export function quadGrid({ sx = 1, sy = sx, nx = 10, ny = nx } = {}) {
  const positions = new Float32Array((nx + 1) * (ny + 1) * 3);
  const cells = [];

  let vertexIndex = 0;

  for (let row = 0; row <= ny; row++) {
    const y = -sy / 2 + (row * sy) / ny;

    for (let col = 0; col <= nx; col++) {
      const x = -sx / 2 + (col * sx) / nx;

      positions[vertexIndex * 3] = x;
      positions[vertexIndex * 3 + 1] = y;

      if (row < ny && col < nx) {
        const o = vertexIndex + nx + 1;
        cells.push([vertexIndex, vertexIndex + 1, o + 1, o]);
      }

      vertexIndex++;
    }
  }

  return { positions, cells };
}
