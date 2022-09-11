/** @module roundedCube */
import {
  checkArguments,
  computePlane,
  getCellsTypedArray,
  normalize,
  TMP,
} from "./utils.js";

/**
 * @typedef {Object} RoundedCubeOptions
 * @property {number} [sx=1]
 * @property {number} [sy=sx]
 * @property {number} [sz=sx]
 * @property {number} [nx=1]
 * @property {number} [ny=nx]
 * @property {number} [nz=nx]
 * @property {number} [radius=sx * 0.25]
 * @property {number} [roundSegments=8]
 * @property {number} [edgeSegments=1]
 */

/**
 * @alias module:roundedCube
 * @param {RoundedCubeOptions} [options={}]
 * @returns {import("../types.js").SimplicialComplex}
 */
function roundedCube({
  sx = 1,
  sy = sx,
  sz = sx,
  nx = 1,
  ny = nx,
  nz = nx,
  radius = sx * 0.25,
  roundSegments = 8,
  edgeSegments = 1,
} = {}) {
  checkArguments(arguments);

  const size =
    (nx + 1) * (ny + 1) * 2 +
    (nx + 1) * (nz + 1) * 2 +
    (nz + 1) * (ny + 1) * 2 +
    (roundSegments + 1) * (roundSegments + 1) * 24 +
    (roundSegments + 1) * (edgeSegments + 1) * 24;

  const geometry = {
    positions: new Float32Array(size * 3),
    normals: new Float32Array(size * 3),
    uvs: new Float32Array(size * 2),
    cells: new (getCellsTypedArray(size))(
      (nx * ny * 2 +
        nx * nz * 2 +
        nz * ny * 2 +
        roundSegments * roundSegments * 24 +
        roundSegments * edgeSegments * 24) *
        6
    ),
  };

  const halfSX = sx * 0.5;
  const halfSY = sy * 0.5;
  const halfSZ = sz * 0.5;

  const r2 = radius * 2;
  const widthX = sx - r2;
  const widthY = sy - r2;
  const widthZ = sz - r2;

  const faceSX = widthX / sx;
  const faceSY = widthY / sy;
  const faceSZ = widthZ / sz;

  const radiusSX = radius / sx;
  const radiusSY = radius / sy;
  const radiusSZ = radius / sz;

  const indices = { vertex: 0, cell: 0 };

  const PLANES = [
    [
      widthX,
      widthY,
      nx,
      ny,
      "z",
      halfSZ,
      [faceSX, faceSY],
      [radiusSX, radiusSY],
      (x, y) => [x, y, 0],
    ],
    [
      widthX,
      widthY,
      nx,
      ny,
      "-z",
      -halfSZ,
      [faceSX, faceSY],
      [radiusSX, radiusSY],
      (x, y) => [-x, y, 0],
    ],
    [
      widthZ,
      widthY,
      nz,
      ny,
      "-x",
      -halfSX,
      [faceSZ, faceSY],
      [radiusSZ, radiusSY],
      (x, y) => [0, y, x],
    ],
    [
      widthZ,
      widthY,
      nz,
      ny,
      "x",
      halfSX,
      [faceSZ, faceSY],
      [radiusSZ, radiusSY],
      (x, y) => [0, y, -x],
    ],
    [
      widthX,
      widthZ,
      nx,
      nz,
      "y",
      halfSY,
      [faceSX, faceSZ],
      [radiusSX, radiusSZ],
      (x, y) => [x, 0, -y],
    ],
    [
      widthX,
      widthZ,
      nx,
      nz,
      "-y",
      -halfSY,
      [faceSX, faceSZ],
      [radiusSX, radiusSZ],
      (x, y) => [x, 0, y],
    ],
  ];

  const uvOffsetCorner = (su, sv) => [
    [0, 0],
    [1 - radius / (su + r2), 0],
    [1 - radius / (su + r2), 1 - radius / (sv + r2)],
    [0, 1 - radius / (sv + r2)],
  ];
  const uvOffsetStart = (_, sv) => [0, radius / (sv + r2)];
  const uvOffsetEnd = (su, sv) => [1 - radius / (su + r2), radius / (sv + r2)];

  for (let j = 0; j < PLANES.length; j++) {
    const [su, sv, nu, nv, direction, pw, uvScale, uvOffset, center] =
      PLANES[j];

    // Cube faces
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

      // Corners
      computePlane(
        geometry,
        indices,
        radius,
        radius,
        roundSegments,
        roundSegments,
        direction,
        pw,
        false,
        [radius / (su + r2), radius / (sv + r2)],
        uvOffsetCorner(su, sv)[i],
        center(x, y)
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

export default roundedCube;
