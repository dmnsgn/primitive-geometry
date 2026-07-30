/** @module antiprism */
import { rectangular } from "../../mappings.js";
import {
  computePolygonCap,
  computePolygonCorner,
  getCellsTypedArray,
  TAU,
} from "../../utils.js";

/**
 * @typedef {object} AntiprismOptions
 * @property {number} [radius=0.25]
 * @property {number} [height=1]
 * @property {number} [sides=6]
 * @property {number} [phiOffset=0]
 * @property {Function} [capMapping=mappings.rectangular]
 */

/**
 * Antiprism: like prism, but the top sides-gon is rotated by half a sector
 * relative to the bottom one, so the two rings connect through a zigzag band
 * of 2 * sides flat triangles (each with its own hard-edged normal) instead
 * of prism's sides flat rectangles. The 2 end caps are otherwise identical
 * to prism's own (see prism.js for why computeCap's sides + 1 angle samples
 * trace a straight sides-gon, not an arc) - just with the top one rotated to
 * match its own ring.
 * @alias module:antiprism
 * @param {AntiprismOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 */
export function antiprism({
  radius = 0.25,
  height = 1,
  sides = 6,
  phiOffset = 0,
  capMapping = rectangular,
} = {}) {

  const halfHeight = height / 2;
  const topOffset = phiOffset + TAU / sides / 2;

  // Shared by the band corners and the cap rims below, so a corner's
  // position is computed by the exact same expression as its coincident cap
  // vertex - required for them to weld bit-identically (analyze()'s crack
  // check), not just approximately.
  const bottomAngleAt = (i) => (i === sides ? 0 : i / sides) * TAU + phiOffset;
  const topAngleAt = (i) => (i === sides ? 0 : i / sides) * TAU + topOffset;

  const bandVertexCount = sides * 2 * 3;
  const capVertexCount = (sides + 1) * 2;
  const size = bandVertexCount + capVertexCount * 2;

  const positions = new Float32Array(size * 3);
  const normals = new Float32Array(size * 3);
  const uvs = new Float32Array(size * 2);
  // 2 * sides band triangles + 2 * sides cap triangles (sides per cap)
  const cells = new (getCellsTypedArray(size))(sides * 4 * 3);

  const indices = { vertex: 0, cell: 0 };

  const writeTriangle = (a, b, c, uvA, uvB, uvC) => {
    const ux = b[0] - a[0];
    const uy = b[1] - a[1];
    const uz = b[2] - a[2];
    const vx = c[0] - a[0];
    const vy = c[1] - a[1];
    const vz = c[2] - a[2];

    const nx = uy * vz - uz * vy;
    const ny = uz * vx - ux * vz;
    const nz = ux * vy - uy * vx;
    const length = Math.hypot(nx, ny, nz);

    const base = indices.vertex;

    for (const [[px, py, pz], [u, v]] of [
      [a, uvA],
      [b, uvB],
      [c, uvC],
    ]) {
      positions[indices.vertex * 3] = px;
      positions[indices.vertex * 3 + 1] = py;
      positions[indices.vertex * 3 + 2] = pz;

      normals[indices.vertex * 3] = nx / length;
      normals[indices.vertex * 3 + 1] = ny / length;
      normals[indices.vertex * 3 + 2] = nz / length;

      uvs[indices.vertex * 2] = u;
      uvs[indices.vertex * 2 + 1] = v;

      indices.vertex++;
    }

    cells[indices.cell] = base;
    cells[indices.cell + 1] = base + 1;
    cells[indices.cell + 2] = base + 2;

    indices.cell += 3;
  };

  for (let i = 0; i < sides; i++) {
    const bottomA = computePolygonCorner(bottomAngleAt(i), radius, -halfHeight);
    const bottomB = computePolygonCorner(
      bottomAngleAt(i + 1),
      radius,
      -halfHeight,
    );
    const topA = computePolygonCorner(topAngleAt(i), radius, halfHeight);
    const topB = computePolygonCorner(topAngleAt(i + 1), radius, halfHeight);

    const u0 = i / sides;
    const u1 = (i + 1) / sides;
    const uMid = (u0 + u1) / 2;

    // Base on the bottom ring's edge, apex on the top ring (directly above
    // that edge's own midpoint, since the top ring is offset by half a
    // sector)
    writeTriangle(
      bottomA,
      bottomB,
      topA,
      [u0, 1],
      [u1, 1],
      [uMid, 0],
    );
    // Base on the top ring's edge, apex on the bottom ring
    writeTriangle(
      topB,
      topA,
      bottomB,
      [u1, 0],
      [u0, 0],
      [u1, 1],
    );
  }

  const geometry = { positions, normals, uvs, cells };

  computePolygonCap(geometry, indices, {
    sides,
    radius,
    y: -halfHeight,
    flip: 1,
    normalY: -1,
    angleAt: bottomAngleAt,
    mapping: capMapping,
  });
  computePolygonCap(geometry, indices, {
    sides,
    radius,
    y: halfHeight,
    flip: -1,
    normalY: 1,
    angleAt: topAngleAt,
    mapping: capMapping,
  });

  return geometry;
}
