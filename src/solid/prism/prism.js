/** @module prism */
import { rectangular } from "../../mappings.js";
import {
  checkArguments,
  computeCap,
  getCellsTypedArray,
  TAU,
} from "../../utils.js";

/**
 * @typedef {object} PrismOptions
 * @property {number} [radius=0.25]
 * @property {number} [height=1]
 * @property {number} [sides=6]
 * @property {number} [phiOffset=0]
 * @property {Function} [capMapping=mappings.rectangular]
 */

// Same x/z sign convention as cylinder.js's own equation(), so a prism and a
// cylinder built with the same radius/phiOffset share a corner.
const corner = (angle, radius, y) => [
  -radius * Math.cos(angle),
  y,
  radius * Math.sin(angle),
];

/**
 * Right prism: a regular sides-gon extruded into sides flat rectangular
 * side faces, each with its own hard-edged normal - unlike cylinder's smooth
 * per-vertex normal, which just makes a large-nx cylinder look faceted
 * rather than actually being one. The 2 flat sides-gon caps reuse
 * computeCap, same as cylinder/torus's own end caps.
 * @alias module:prism
 * @param {PrismOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 */
export function prism({
  radius = 0.25,
  height = 1,
  sides = 6,
  phiOffset = 0,
  capMapping = rectangular,
} = {}) {
  checkArguments(arguments);

  const halfHeight = height / 2;

  // Shared by both the wall corners and the cap rim below, so a wall
  // corner's position is computed by the exact same expression as its
  // coincident cap vertex - required for them to weld bit-identically
  // (analyze()'s crack check), not just approximately.
  const angleAt = (i) => (i === sides ? 0 : i / sides) * TAU + phiOffset;

  const wallVertexCount = sides * 4;
  const capVertexCount = (sides + 1) * 2;
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
    // angle0 + sector/2, not (angle0 + angle1) / 2: angle1 snaps to 0 on the
    // wrap face, which would average to the opposite side of the polygon
    // instead of that face's own true midpoint
    const midAngle = angle0 + sector / 2;

    const [x0, , z0] = corner(angle0, radius, 0);
    const [x1, , z1] = corner(angle1, radius, 0);

    const nx = -Math.cos(midAngle);
    const nz = Math.sin(midAngle);

    const base = indices.vertex;

    // Bottom-left, bottom-right, top-right, top-left: CCW as seen from
    // outside (nx, 0, nz), matching every other quad face in this library
    for (const [px, py, pz, u, v] of [
      [x0, -halfHeight, z0, 0, 1],
      [x1, -halfHeight, z1, 1, 1],
      [x1, halfHeight, z1, 1, 0],
      [x0, halfHeight, z0, 0, 0],
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

    // Anchored on the last (TL) corner, same as triangulateFaces's own
    // BL/BR/TR/TL fan: splits along the TL-BR diagonal, matching
    // computePlane/computePolarGeometry/computeRevolutionGeometry so
    // displacement in a vertex shader creases consistently across the library
    cells[indices.cell] = base + 3;
    cells[indices.cell + 1] = base;
    cells[indices.cell + 2] = base + 1;

    cells[indices.cell + 3] = base + 3;
    cells[indices.cell + 4] = base + 1;
    cells[indices.cell + 5] = base + 2;

    indices.cell += 6;
  }

  const geometry = { positions, normals, uvs, cells };

  // angleAt/point/normal glue around the shared cap builder, same pattern
  // as torus.js/computeRevolutionGeometry's own end caps: sides + 1 angle
  // samples with no further interpolation between them traces a straight
  // sides-gon boundary, not an arc.
  const buildCap = (y, flip, normalY) => {
    computeCap(geometry, indices, {
      ringSegments: sides,
      capSegments: 1,
      capRadius: radius,
      flip,
      angleAt: (i) => {
        const p = angleAt(i);
        return { cos: -Math.cos(p), sin: Math.sin(p), t: p };
      },
      point: (x, z) => [x, y, z],
      normal: [0, normalY, 0],
      mapping: capMapping,
    });
  };

  buildCap(-halfHeight, 1, -1);
  buildCap(halfHeight, -1, 1);

  return geometry;
}
