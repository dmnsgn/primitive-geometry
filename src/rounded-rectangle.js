/** @module roundedRectangle */
import {
  checkArguments,
  computePlane,
  getCellsTypedArray,
  TMP,
} from "./utils.js";

/**
 * @typedef {object} RoundedRectangleOptions
 * @property {number} [sx=1]
 * @property {number} [sy=sx]
 * @property {number} [radius=sx * 0.25]
 * @property {number} [roundSegments=8]
 * @property {number} [edgeSegments=1]
 * @property {number} [nx=edgeSegments]
 * @property {number} [ny=nx]
 */

/**
 * Built as a single welded grid so face, edges and corners share their
 * boundary vertices: no duplicated seams nor T-junctions. nx/ny subdivide both
 * the inner face and the straight edge sections (edgeSegments is their default
 * for backwards compatibility).
 * @alias module:roundedRectangle
 * @param {RoundedRectangleOptions} [options={}]
 * @returns {import("../types.js").SimplicialComplex}
 */
function roundedRectangle({
  sx = 1,
  sy = sx,
  radius = sx * 0.25,
  roundSegments = 8,
  edgeSegments = 1,
  nx = edgeSegments,
  ny = nx,
} = {}) {
  checkArguments(arguments);

  const r2 = radius * 2;
  const widthX = sx - r2;
  const widthY = sy - r2;

  // Collapse zero-size straight sections into a single welded column so they
  // don't produce degenerate cells (eg. stadium)
  if (widthX === 0) nx = 0;
  if (widthY === 0) ny = 0;

  const cols = 2 * roundSegments + nx;
  const rows = 2 * roundSegments + ny;

  const size = (cols + 1) * (rows + 1);

  const geometry = {
    positions: new Float32Array(size * 3),
    normals: new Float32Array(size * 3),
    uvs: new Float32Array(size * 2),
    cells: new (getCellsTypedArray(size))(cols * rows * 6),
  };

  const indices = { vertex: 0, cell: 0 };

  computePlane(
    geometry,
    indices,
    widthX,
    widthY,
    nx,
    ny,
    "z",
    0,
    false,
    [1, 1],
    [0, 0],
    [0, 0, 0],
    true,
    radius,
    roundSegments,
  );

  const rx = widthX * 0.5;
  const ry = widthY * 0.5;

  for (let i = 0; i < geometry.positions.length; i += 3) {
    const position = [
      geometry.positions[i],
      geometry.positions[i + 1],
      geometry.positions[i + 2],
    ];
    TMP[0] = position[0];
    TMP[1] = position[1];
    TMP[2] = position[2];

    let needsRounding = false;

    if (position[0] < -rx) {
      if (position[1] < -ry) {
        position[0] = -rx;
        position[1] = -ry;
        needsRounding = true;
      } else if (position[1] > ry) {
        position[0] = -rx;
        position[1] = ry;
        needsRounding = true;
      }
    } else if (position[0] > rx) {
      if (position[1] < -ry) {
        position[0] = rx;
        position[1] = -ry;
        needsRounding = true;
      } else if (position[1] > ry) {
        position[0] = rx;
        position[1] = ry;
        needsRounding = true;
      }
    }

    TMP[0] -= position[0];
    TMP[1] -= position[1];

    geometry.normals[i + 2] = 1;

    if (needsRounding) {
      const x =
        Math.hypot(TMP[0], TMP[1]) /
        Math.max(Math.abs(TMP[0]), Math.abs(TMP[1]));

      geometry.positions[i] = position[0] + TMP[0] / x;
      geometry.positions[i + 1] = position[1] + TMP[1] / x;
    }
  }

  return geometry;
}

export default roundedRectangle;
