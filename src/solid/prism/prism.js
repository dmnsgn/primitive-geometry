/**
 * @module primitiveGeometry
 * @ignore
 */
import { rectangular } from "../../mappings.js";
import { TAU, getCellsTypedArray } from "../../utils/common.js";
import {
  computeCapVertexCount,
  computePolygonCap,
  computePolygonCorner,
} from "../../utils/revolution.js";

/**
 * @typedef {object} PrismOptions
 * @property {number} [radius=0.25]
 * @property {number} [height=1]
 * @property {import("../../../types.js").PositiveInteger} [sides=6]
 * @property {import("../../../types.js").Angle} [phiOffset=0]
 * @property {import("../../mappings.js").MappingFn} [capMapping=mappings.rectangular]
 * @property {boolean} [mergeSeam=false] `true` shares the caps' wrap column and
 *   center vertices, wrapping uvs back to 0 there.
 */

/**
 * A right prism: a regular polygon extruded with flat-shaded sides.
 *
 * @param {PrismOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 */
export function prism({
  radius = 0.25,
  height = 1,
  sides = 6,
  phiOffset = 0,
  capMapping = rectangular,
  mergeSeam = false,
} = {}) {
  const halfHeight = height / 2;

  // Shared by wall corners and cap rims so they weld bit-identically
  const angleAt = (i) => (i === sides ? 0 : i / sides) * TAU + phiOffset;

  const wallVertexCount = sides * 4;
  const capVertexCount = computeCapVertexCount(
    mergeSeam ? sides : sides + 1,
    1,
    mergeSeam,
  );
  const size = wallVertexCount + capVertexCount * 2;

  const positions = new Float32Array(size * 3);
  const normals = new Float32Array(size * 3);
  const uvs = new Float32Array(size * 2);
  const cells = new (getCellsTypedArray(size))(sides * 4 * 3);

  const indices = { vertex: 0, cell: 0 };

  const sector = TAU / sides;

  for (let i = 0; i < sides; i++) {
    const angle0 = angleAt(i);
    const angle1 = angleAt(i + 1);
    // Not (angle0 + angle1) / 2: angle1 snaps to 0 on the wrap face
    const midAngle = angle0 + sector / 2;

    const [x0, , z0] = computePolygonCorner(angle0, radius, 0);
    const [x1, , z1] = computePolygonCorner(angle1, radius, 0);

    const nx = -Math.cos(midAngle);
    const nz = Math.sin(midAngle);

    const base = indices.vertex;

    // u wraps once around the perimeter, like cylinder's
    const u0 = i / sides;
    const u1 = (i + 1) / sides;

    // CCW from outside, from the bottom-left
    for (const [px, py, pz, u, v] of [
      [x0, -halfHeight, z0, u0, 0],
      [x1, -halfHeight, z1, u1, 0],
      [x1, halfHeight, z1, u1, 1],
      [x0, halfHeight, z0, u0, 1],
    ]) {
      positions[indices.vertex * 3] = px;
      positions[indices.vertex * 3 + 1] = py;
      positions[indices.vertex * 3 + 2] = pz;

      normals[indices.vertex * 3] = nx;
      normals[indices.vertex * 3 + 2] = nz;

      uvs[indices.vertex * 2] = u;
      uvs[indices.vertex * 2 + 1] = v;

      indices.vertex++;
    }

    // Split along the TL-BR diagonal, like every other grid, so vertex shader
    // displacement creases consistently
    cells[indices.cell] = base + 3;
    cells[indices.cell + 1] = base;
    cells[indices.cell + 2] = base + 1;

    cells[indices.cell + 3] = base + 3;
    cells[indices.cell + 4] = base + 1;
    cells[indices.cell + 5] = base + 2;

    indices.cell += 6;
  }

  const geometry = { positions, normals, uvs, cells };

  computePolygonCap(geometry, indices, {
    sides,
    radius,
    y: -halfHeight,
    flip: 1,
    normalY: -1,
    angleAt,
    mapping: capMapping,
    mergeSeam,
  });
  computePolygonCap(geometry, indices, {
    sides,
    radius,
    y: halfHeight,
    flip: -1,
    normalY: 1,
    angleAt,
    mapping: capMapping,
    mergeSeam,
  });

  return geometry;
}
