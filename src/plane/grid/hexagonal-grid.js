/** @module hexagonalGrid */

import { checkArguments, SQRT3 } from "../../utils.js";

// Vertex-welding cache keys quantize x/y relative to dx (each hex's own
// scale) rather than to an absolute epsilon, so welding stays reliable
// regardless of sx/nx
const WELD_KEY_SCALE = 1e9;

/**
 * @typedef {object} HexagonalGridOptions
 * @property {number} [sx=1]
 * @property {number} [nx=10]
 * @property {number} [ny=10]
 * @property {boolean} [inscribed=true]
 */

/**
 * Hexagonal grid tiling regular hexagons
 * @alias module:hexagonalGrid
 * @param {HexagonalGridOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplexPolygon}
 */
export function hexagonalGrid({
  sx = 1,
  nx = 10,
  ny = 10,
  inscribed = true,
} = {}) {
  checkArguments(arguments);

  const dx = sx / nx;
  const r = dx / SQRT3;
  const dy = 1.5 * r;
  const leftBound = -dx / 2;
  const rightBound = (nx - 1) * dx + dx / 2;
  const topBound = (ny - 1) * dy + r / 2;
  const bottomBound = -r / 2;

  // prettier-ignore
  const cornerOffsets = [
    [0, r], [-dx / 2, r / 2], [-dx / 2, -r / 2],
    [0, -r], [dx / 2, -r / 2], [dx / 2, r / 2],
  ];

  const centerX =
    (leftBound + rightBound + (inscribed || ny === 1 ? 0 : dx / 2)) / 2;
  const centerY = (bottomBound + topBound) / 2;

  const cache = new Map();
  const positions = [];
  const cells = [];

  const getVertex = (x, y) => {
    const key = `${Math.round((x / dx) * WELD_KEY_SCALE)}_${Math.round((y / dx) * WELD_KEY_SCALE)}`;
    let index = cache.get(key);
    if (index === undefined) {
      index = positions.length / 3;
      positions.push(x - centerX, y - centerY, 0);
      cache.set(key, index);
    }
    return index;
  };

  const corner = (row, col, k) => {
    const rowOffset = (row % 2) * (dx / 2);

    let x = col * dx + rowOffset + cornerOffsets[k][0];
    let y = row * dy + cornerOffsets[k][1];

    if (inscribed) {
      if (rowOffset > 0 && col === nx - 1 && (k === 4 || k === 5)) {
        x = rightBound;
      }
      if (row === ny - 1 && k === 0) y = topBound;
      else if (row === 0 && k === 3) y = bottomBound;
    }

    return getVertex(x, y);
  };

  for (let row = 0; row < ny; row++) {
    const rowOffset = (row % 2) * (dx / 2);

    for (let col = 0; col < nx; col++) {
      const face = [];
      for (let k = 0; k < 6; k++) face.push(corner(row, col, k));
      cells.push(face);
    }

    if (inscribed && rowOffset > 0) {
      if (row <= ny - 2) {
        cells.push([
          corner(row - 1, 0, 1),
          corner(row - 1, 0, 0),
          corner(row, 0, 1),
          corner(row + 1, 0, 2),
        ]);
      } else {
        cells.push([
          corner(row - 1, 0, 1),
          corner(row - 1, 0, 0),
          corner(row, 0, 1),
          getVertex(leftBound, topBound),
        ]);
      }
    }
  }

  return { positions: Float32Array.from(positions), cells };
}
