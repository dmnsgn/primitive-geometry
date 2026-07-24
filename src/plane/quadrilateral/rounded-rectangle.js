/** @module roundedRectangle */
import {
  checkArguments,
  computePlane,
  getCellsTypedArray,
} from "../../utils.js";

/**
 * @typedef {"top-left" | "top-right" | "bottom-right" | "bottom-left"} RoundedRectangleCorner
 */

/**
 * @typedef {object} RoundedRectangleOptions
 * @property {number} [sx=1]
 * @property {number} [sy=sx]
 * @property {number} [radius=sx * 0.25]
 * @property {number} [roundSegments=8]
 * @property {number} [edgeSegments=1]
 * @property {number} [nx=edgeSegments]
 * @property {number} [ny=nx]
 * @property {RoundedRectangleCorner[]} [roundedCorners=["top-left", "top-right", "bottom-right", "bottom-left"]]
 */

const CORNER_ORDER = ["top-left", "top-right", "bottom-right", "bottom-left"];

/**
 * Built as a single welded grid so face, edges and corners share their
 * boundary vertices: no duplicated seams nor T-junctions. nx/ny subdivide both
 * the inner face and the straight edge sections (edgeSegments is their default
 * for backwards compatibility).
 * @alias module:roundedRectangle
 * @param {RoundedRectangleOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 */
export function roundedRectangle({
  sx = 1,
  sy = sx,
  radius = sx * 0.25,
  roundSegments = 8,
  edgeSegments = 1,
  nx = edgeSegments,
  ny = nx,
  roundedCorners = CORNER_ORDER,
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
    [1, 1],
    [0, 0],
    [0, 0, 0],
    true,
    radius,
    roundSegments,
    CORNER_ORDER.map((corner) => roundedCorners.includes(corner)),
  );

  return geometry;
}
