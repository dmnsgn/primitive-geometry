/**
 * @module primitiveGeometry
 * @ignore
 */
import { getCellsTypedArray, normalize } from "../../utils/common.js";
import { TMP } from "../../utils/revolution.js";
import {
  PLANE_DIRECTIONS,
  computePlane,
  getPlaneCoordinate,
} from "../../utils/plane-grid.js";

/** @typedef {"all" | "x" | "y" | "z"} RoundedCubeDirection */

/**
 * @typedef {object} RoundedCubeOptions
 * @property {number} [sx=1]
 * @property {number} [sy=sx]
 * @property {number} [sz=sx]
 * @property {number} [radius=sx * 0.25]
 * @property {import("../../../types.js").PositiveInteger} [roundSegments=8]
 * @property {import("../../../types.js").PositiveInteger} [nx=1] Segments along the straight x sections.
 * @property {import("../../../types.js").PositiveInteger} [ny=nx] Segments along the straight y sections.
 * @property {import("../../../types.js").PositiveInteger} [nz=nx] Segments along the straight z sections.
 * @property {RoundedCubeDirection} [roundDirection="all"]
 */

/**
 * A cuboid with rounded edges and corners.
 *
 * @param {RoundedCubeOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 */
export function roundedCube({
  sx = 1,
  sy = sx,
  sz = sx,
  radius = sx * 0.25,
  roundSegments = 8,
  nx = 1,
  ny = nx,
  nz = nx,
  roundDirection = "all",
} = {}) {
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

  // Each face is a single welded grid (face, edges and corners share their
  // boundary vertices) so seams only remain between faces where UVs differ.
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

  // -1 when roundDirection is "all" (nothing excluded, matches no axis index)
  const excludedAxis =
    roundDirection === "all" ? -1 : "xyz".indexOf(roundDirection);
  const bounds = [widthX * 0.5, widthY * 0.5, widthZ * 0.5];

  const PLANES = [
    [widthZ, widthY, nz, ny, "x", halfSX],
    [widthZ, widthY, nz, ny, "-x", -halfSX],
    [widthX, widthZ, nx, nz, "y", halfSY],
    [widthX, widthZ, nx, nz, "-y", -halfSY],
    [widthX, widthY, nx, ny, "z", halfSZ],
    [widthX, widthY, nx, ny, "-z", -halfSZ],
  ];

  // Blend one face's flat grid vertex onto the rounded shell: clamp it into
  // the inner box, then push it back out by radius along whatever the clamp
  // took off. A vertex inside the box is untouched, so flat sections stay flat.
  const roundVertex = (vertexIndex, position) => {
    TMP[0] = position[0];
    TMP[1] = position[1];
    TMP[2] = position[2];

    for (let k = 0; k < 3; k++) {
      if (k === excludedAxis) continue;
      const bound = bounds[k];
      if (position[k] < -bound) {
        position[k] = -bound;
      } else if (position[k] > bound) {
        position[k] = bound;
      }
    }

    for (let k = 0; k < 3; k++) {
      TMP[k] = k === excludedAxis ? 0 : TMP[k] - position[k];
    }

    normalize(TMP);

    geometry.normals[vertexIndex] = TMP[0];
    geometry.normals[vertexIndex + 1] = TMP[1];
    geometry.normals[vertexIndex + 2] = TMP[2];

    geometry.positions[vertexIndex] = position[0] + radius * TMP[0];
    geometry.positions[vertexIndex + 1] = position[1] + radius * TMP[1];
    geometry.positions[vertexIndex + 2] = position[2] + radius * TMP[2];
  };

  const roundFace = (plane, startVertex) => {
    const [su, sv, nu, nv, direction, pw] = plane;
    const [u, v, w, flipU, flipV] = PLANE_DIRECTIONS[direction];

    const cols = 2 * roundSegments + nu;
    const rows = 2 * roundSegments + nv;

    for (let j = 0; j <= rows; j++) {
      const y0 = getPlaneCoordinate(j, nv, sv, radius, roundSegments);

      for (let x = 0; x <= cols; x++) {
        const x0 = getPlaneCoordinate(x, nu, su, radius, roundSegments);

        // Recomputed in double precision, not read back from the
        // Float32Array, so this vertex stays bit-identical to the matching
        // corner vertex on a neighboring face rounded by computePlane's 2D
        // corners - reading the rounded value back would drift by ~1 ULP
        // and crack their shared boundary.
        const position = [0, 0, 0];
        position[u] = x0 * flipU;
        position[v] = y0 * flipV;
        position[w] = pw;

        roundVertex((startVertex + j * (cols + 1) + x) * 3, position);
      }
    }
  };

  for (const plane of PLANES) {
    const [su, sv, nu, nv, direction, pw] = plane;
    const outOfPlaneAxis = PLANE_DIRECTIONS[direction][2];
    const startVertex = indices.vertex;

    // False when this face's own (out-of-plane) axis is the excluded one: the
    // face is flat along it, so its corners are rounded by computePlane's 2D
    // corner mapping instead of the 3D blend above.
    const axisActive = outOfPlaneAxis !== excludedAxis;

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
      !axisActive,
    );

    if (axisActive) roundFace(plane, startVertex);
  }

  return geometry;
}
