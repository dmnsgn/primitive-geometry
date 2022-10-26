/** @module roundedRectangle */
import {
  checkArguments,
  computePlane,
  getCellsTypedArray,
  TMP,
} from "./utils.js";

/**
 * @typedef {Object} RoundedCubeOptions
 * @property {number} [sx=1]
 * @property {number} [sy=sx]
 * @property {number} [nx=1]
 * @property {number} [ny=nx]
 * @property {number} [radius=sx * 0.25]
 * @property {number} [roundSegments=8]
 * @property {number} [edgeSegments=1]
 */

/**
 * @alias module:roundedRectangle
 * @param {RoundedCubeOptions} [options={}]
 * @returns {import("../types.js").SimplicialComplex}
 */
function roundedRectangle({
  sx = 1,
  sy = sx,
  nx = 1,
  ny = nx,
  radius = sx * 0.25,
  roundSegments = 8,
  edgeSegments = 1,
} = {}) {
  checkArguments(arguments);

  const size =
    (nx + 1) * (ny + 1) +
    (roundSegments + 1) * (roundSegments + 1) * 4 +
    (roundSegments + 1) * (edgeSegments + 1) * 4;

  const geometry = {
    positions: new Float32Array(size * 3),
    normals: new Float32Array(size * 3),
    uvs: new Float32Array(size * 2),
    cells: new (getCellsTypedArray(size))(
      (nx * ny +
        roundSegments * roundSegments * 4 +
        roundSegments * edgeSegments * 4) *
        6
    ),
  };

  const r2 = radius * 2;
  const widthX = sx - r2;
  const widthY = sy - r2;

  const faceSX = widthX / sx;
  const faceSY = widthY / sy;

  const radiusSX = radius / sx;
  const radiusSY = radius / sy;

  const indices = { vertex: 0, cell: 0 };

  const uvOffsetCorner = (su, sv) => [
    [radius / (su + r2), 0],
    [1 - radius / (su + r2), 0],
    [1, 1 - radius / (sv + r2)],
    [0, 1 - radius / (sv + r2)],
  ];
  const uvOffsetStart = (_, sv) => [0, radius / (sv + r2)];
  const uvOffsetEnd = (su, sv) => [1 - radius / (su + r2), radius / (sv + r2)];

  const [su, sv, nu, nv, direction, pw, uvScale, uvOffset, center] = [
    widthX,
    widthY,
    nx,
    ny,
    "z",
    0,
    [faceSX, faceSY],
    [radiusSX, radiusSY],
    (x, y) => [x, y, 0],
  ];

  // Plane face
  computePlane(
    geometry,
    indices,
    su,
    sv,
    nu,
    nv,
    direction,
    pw,
    false,
    uvScale,
    uvOffset
  );

  // Corner order: ccw uv-like order and L/B (0) R/T (2)
  // 0,1 -- 1,1
  //  |  --  |
  // 0,0 -- 1,0
  for (let i = 0; i < 4; i++) {
    const ceil = Math.ceil(i / 2) % 2;
    const floor = Math.floor(i / 2) % 2;

    const x = (ceil === 0 ? -1 : 1) * (su + radius) * 0.5;
    const y = (floor === 0 ? -1 : 1) * (sv + radius) * 0.5;

    // Flip for quad seams to be radial
    const flip = i % 2 === 0;

    // Corners
    computePlane(
      geometry,
      indices,
      radius,
      radius,
      roundSegments,
      roundSegments,
      flip ? "-z" : "z",
      pw,
      false,
      [(flip ? -1 : 1) * (radius / (su + r2)), radius / (sv + r2)],
      uvOffsetCorner(su, sv)[i],
      center(x, y),
      !flip
    );

    // Edges
    if (i === 0 || i === 2) {
      // Left / Right
      computePlane(
        geometry,
        indices,
        radius,
        sv,
        roundSegments,
        edgeSegments,
        direction,
        pw,
        false,
        [uvOffset[0], uvScale[1]],
        ceil === 0 ? uvOffsetStart(su, sv) : uvOffsetEnd(su, sv),
        center(x, 0)
      );
      // Bottom/Top
      computePlane(
        geometry,
        indices,
        su,
        radius,
        edgeSegments,
        roundSegments,
        direction,
        pw,
        false,
        [uvScale[0], uvOffset[1]],
        floor === 0
          ? [...uvOffsetStart(sv, su)].reverse()
          : [...uvOffsetEnd(sv, su)].reverse(),
        center(0, y)
      );
    }
  }

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
        Math.sqrt(TMP[0] ** 2 + TMP[1] ** 2) /
        Math.max(Math.abs(TMP[0]), Math.abs(TMP[1]));

      geometry.positions[i] = position[0] + TMP[0] / x;
      geometry.positions[i + 1] = position[1] + TMP[1] / x;
    }
  }

  return geometry;
}

export default roundedRectangle;
