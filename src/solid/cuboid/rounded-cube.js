/** @module roundedCube */
import {
  checkArguments,
  computePlane,
  getCellsTypedArray,
  normalize,
  TMP,
} from "../../utils.js";

/**
 * @typedef {object} RoundedCubeOptions
 * @property {number} [sx=1]
 * @property {number} [sy=sx]
 * @property {number} [sz=sx]
 * @property {number} [radius=sx * 0.25]
 * @property {number} [roundSegments=8]
 * @property {number} [edgeSegments=1]
 * @property {number} [nx=edgeSegments]
 * @property {number} [ny=nx]
 * @property {number} [nz=nx]
 */

/**
 * Each face is a single welded grid (face, edges and corners share their
 * boundary vertices) so seams only remain between faces where UVs differ.
 * nx/ny/nz subdivide both the inner faces and the straight edge sections
 * (edgeSegments is their default for backwards compatibility).
 * @alias module:roundedCube
 * @param {RoundedCubeOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 */
export function roundedCube({
  sx = 1,
  sy = sx,
  sz = sx,
  radius = sx * 0.25,
  roundSegments = 8,
  edgeSegments = 1,
  nx = edgeSegments,
  ny = nx,
  nz = nx,
} = {}) {
  checkArguments(arguments);

  const r2 = radius * 2;
  const widthX = sx - r2;
  const widthY = sy - r2;
  const widthZ = sz - r2;

  // Collapse zero-size straight sections into a single welded column so they
  // don't produce degenerate cells (eg. radius = half size)
  if (widthX === 0) nx = 0;
  if (widthY === 0) ny = 0;
  if (widthZ === 0) nz = 0;

  const colsX = 2 * roundSegments + nx;
  const colsY = 2 * roundSegments + ny;
  const colsZ = 2 * roundSegments + nz;

  const size =
    ((colsX + 1) * (colsY + 1) +
      (colsZ + 1) * (colsY + 1) +
      (colsX + 1) * (colsZ + 1)) *
    2;

  const geometry = {
    positions: new Float32Array(size * 3),
    normals: new Float32Array(size * 3),
    uvs: new Float32Array(size * 2),
    cells: new (getCellsTypedArray(size))(
      (colsX * colsY + colsZ * colsY + colsX * colsZ) * 2 * 6,
    ),
  };

  const halfSX = sx * 0.5;
  const halfSY = sy * 0.5;
  const halfSZ = sz * 0.5;

  const indices = { vertex: 0, cell: 0 };

  const PLANES = [
    [widthX, widthY, nx, ny, "z", halfSZ],
    [widthX, widthY, nx, ny, "-z", -halfSZ],
    [widthZ, widthY, nz, ny, "-x", -halfSX],
    [widthZ, widthY, nz, ny, "x", halfSX],
    [widthX, widthZ, nx, nz, "y", halfSY],
    [widthX, widthZ, nx, nz, "-y", -halfSY],
  ];

  for (let i = 0; i < PLANES.length; i++) {
    const [su, sv, nu, nv, direction, pw] = PLANES[i];

    computePlane(
      geometry,
      indices,
      su,
      sv,
      nu,
      nv,
      direction,
      pw,
      [1, 1],
      [0, 0],
      [0, 0, 0],
      true,
      radius,
      roundSegments,
    );
  }

  const rx = widthX * 0.5;
  const ry = widthY * 0.5;
  const rz = widthZ * 0.5;

  for (let i = 0; i < geometry.positions.length; i += 3) {
    const position = [
      geometry.positions[i],
      geometry.positions[i + 1],
      geometry.positions[i + 2],
    ];
    TMP[0] = position[0];
    TMP[1] = position[1];
    TMP[2] = position[2];

    if (position[0] < -rx) {
      position[0] = -rx;
    } else if (position[0] > rx) {
      position[0] = rx;
    }

    if (position[1] < -ry) {
      position[1] = -ry;
    } else if (position[1] > ry) {
      position[1] = ry;
    }

    if (position[2] < -rz) {
      position[2] = -rz;
    } else if (position[2] > rz) {
      position[2] = rz;
    }

    TMP[0] -= position[0];
    TMP[1] -= position[1];
    TMP[2] -= position[2];

    normalize(TMP);

    geometry.normals[i] = TMP[0];
    geometry.normals[i + 1] = TMP[1];
    geometry.normals[i + 2] = TMP[2];

    geometry.positions[i] = position[0] + radius * TMP[0];
    geometry.positions[i + 1] = position[1] + radius * TMP[1];
    geometry.positions[i + 2] = position[2] + radius * TMP[2];
  }

  return geometry;
}
