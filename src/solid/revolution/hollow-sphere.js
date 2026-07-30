/** @module hollowSphere */
import {
  clampMeridianSweep,
  computeGridQuad,
  concatGeometries,
  getCellsTypedArray,
  invert,
  normalize,
  TAU,
  TMP,
} from "../../utils.js";
import { sphere } from "./sphere.js";
import { sphereDirection } from "./ellipsoid.js";

/**
 * Flat annular wall at a fixed meridian angle t (a theta cut, ie. where the
 * theta sweep stops short of a pole): r sweeps innerRadius -> radius,
 * phi sweeps the same phiOffset/phi range as the outer/inner bands, sampled
 * on the exact same nx grid (so its rim welds bit-identically to theirs).
 * flip (1 or -1) picks which of the 2 possible caps this is (t = the sweep's
 * start or end), driving both the outward normal (the +-theta tangent of
 * `sphereDirection`) and winding.
 * @private
 */
function thetaCap({ t, phi, phiOffset, nx, capSegments, radius, innerRadius, flip }) {
  const wrap = phi % TAU === 0;
  const cols = nx + 1;
  const size = (capSegments + 1) * cols;

  const positions = new Float32Array(size * 3);
  const normals = new Float32Array(size * 3);
  const uvs = new Float32Array(size * 2);
  const cells = new (getCellsTypedArray(size))(capSegments * nx * 6);

  const cosT = Math.cos(t);
  const sinT = Math.sin(t);

  const indices = { vertex: 0, cell: 0 };

  for (let j = 0; j <= capSegments; j++) {
    const r = innerRadius + (radius - innerRadius) * (j / capSegments);

    for (let i = 0; i <= nx; i++, indices.vertex++) {
      const u = i / nx;
      const p = (wrap && i === nx ? 0 : u) * phi + phiOffset;
      const cosPhi = Math.cos(p);
      const sinPhi = Math.sin(p);
      const [dx, dy, dz] = sphereDirection(t, cosPhi, sinPhi);

      positions[indices.vertex * 3] = r * dx;
      positions[indices.vertex * 3 + 1] = r * dy;
      positions[indices.vertex * 3 + 2] = r * dz;

      // d/dt of sphereDirection's (dx, dy, dz), the +theta tangent
      TMP[0] = flip * -cosPhi * cosT;
      TMP[1] = flip * sinT;
      TMP[2] = flip * sinPhi * cosT;
      normalize(TMP);

      normals[indices.vertex * 3] = TMP[0];
      normals[indices.vertex * 3 + 1] = TMP[1];
      normals[indices.vertex * 3 + 2] = TMP[2];

      uvs[indices.vertex * 2] = u;
      uvs[indices.vertex * 2 + 1] = j / capSegments;

      if (j > 0 && i > 0) computeGridQuad(cells, indices, cols, flip);
    }
  }

  return { positions, normals, uvs, cells };
}

/**
 * Flat annular wall at a fixed equatorial angle p (a phi cut, ie. where the
 * phi sweep is a partial revolution): r sweeps innerRadius -> radius, theta
 * sweeps the same clamped thetaOffset/theta range as the outer/inner bands,
 * sampled on the exact same ny grid (so its rim welds bit-identically to
 * theirs). flip (1 or -1) picks which of the 2 possible caps this is (p =
 * the sweep's start or end), driving both the outward normal (the +-phi
 * tangent of `sphereDirection`) and winding.
 * @private
 */
function phiCap({ p, theta, thetaOffset, ny, capSegments, radius, innerRadius, flip }) {
  const rows = ny + 1;
  const size = (capSegments + 1) * rows;

  const positions = new Float32Array(size * 3);
  const normals = new Float32Array(size * 3);
  const uvs = new Float32Array(size * 2);
  const cells = new (getCellsTypedArray(size))(capSegments * ny * 6);

  const cosP = Math.cos(p);
  const sinP = Math.sin(p);

  const indices = { vertex: 0, cell: 0 };

  for (let j = 0; j <= capSegments; j++) {
    const r = innerRadius + (radius - innerRadius) * (j / capSegments);

    for (let i = 0; i <= ny; i++, indices.vertex++) {
      const v = i / ny;
      const t = thetaOffset + theta * v;
      const sinT = Math.sin(t);
      const [dx, dy, dz] = sphereDirection(t, cosP, sinP);

      positions[indices.vertex * 3] = r * dx;
      positions[indices.vertex * 3 + 1] = r * dy;
      positions[indices.vertex * 3 + 2] = r * dz;

      // d/dp of sphereDirection's (dx, dy, dz), the +phi tangent
      TMP[0] = flip * sinP * sinT;
      TMP[1] = 0;
      TMP[2] = flip * cosP * sinT;
      normalize(TMP);

      normals[indices.vertex * 3] = TMP[0];
      normals[indices.vertex * 3 + 1] = TMP[1];
      normals[indices.vertex * 3 + 2] = TMP[2];

      uvs[indices.vertex * 2] = v;
      uvs[indices.vertex * 2 + 1] = j / capSegments;

      // flip is inverted relative to thetaCap: with i (theta) as the
      // row-stride axis here instead of phi, the same flip value maps to
      // the opposite winding for an outward normal
      if (j > 0 && i > 0) computeGridQuad(cells, indices, rows, -flip);
    }
  }

  return { positions, normals, uvs, cells };
}

/**
 * @typedef {object} HollowSphereOptions
 * @property {number} [radius=0.5]
 * @property {number} [innerRadius=radius*0.5]
 * @property {number} [nx=32]
 * @property {number} [ny=16]
 * @property {number} [capSegments=1] Radial segments of each cut cap
 * @property {number} [theta=Math.PI / 2] Meridian sweep length, silently clamped
 * like `ellipsoid`'s
 * @property {number} [thetaOffset=Math.PI / 4] Meridian sweep start, silently clamped
 * like `ellipsoid`'s
 * @property {number} [phi=TAU]
 * @property {number} [phiOffset=0]
 */

/**
 * A sphere with a smaller, concentric sphere hollowed out of it: a shell of
 * uniform wall thickness. Just `sphere` called twice, once at radius for the
 * outer surface and once at innerRadius `invert`-ed to face into the cavity
 * - plus, whenever theta/phi cut the sweep short of a full sphere, a flat
 * annular cap at each cut closing the gap between the two: a cone-like
 * `thetaCap` where the sweep stops short of a pole, a flat `phiCap` where
 * it's short of a full revolution. Both reuse `ellipsoid`'s own
 * `sphereDirection` so their rims land bit-identically on the bands they
 * weld to, the same trick `computeCap` uses for revolution solids in
 * general.
 *
 * Defaults to a quarter band (theta/thetaOffset), not a full sphere: a
 * closed hollow sphere looks identical to a plain `sphere` from outside, so
 * a full sphere default would hide the whole point of the shape. The
 * partial default exposes the cavity and both cut caps immediately.
 * @alias module:hollowSphere
 * @param {HollowSphereOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 */
export function hollowSphere({
  radius = 0.5,
  innerRadius = radius * 0.5,
  nx = 32,
  ny = 16,
  capSegments = 1,
  theta = Math.PI / 2,
  thetaOffset = Math.PI / 4,
  phi = TAU,
  phiOffset = 0,
} = {}) {

  const [clampedTheta, clampedThetaOffset] = clampMeridianSweep(
    theta,
    thetaOffset,
  );
  const thetaStart = clampedThetaOffset;
  const thetaEnd = clampedThetaOffset + clampedTheta;

  const pieces = [
    sphere({ radius, nx, ny, theta, thetaOffset, phi, phiOffset }),
    invert(sphere({ radius: innerRadius, nx, ny, theta, thetaOffset, phi, phiOffset })),
  ];

  if (thetaStart % Math.PI !== 0) {
    pieces.push(
      thetaCap({
        t: thetaStart,
        phi,
        phiOffset,
        nx,
        capSegments,
        radius,
        innerRadius,
        flip: -1,
      }),
    );
  }

  if (thetaEnd % Math.PI !== 0) {
    pieces.push(
      thetaCap({
        t: thetaEnd,
        phi,
        phiOffset,
        nx,
        capSegments,
        radius,
        innerRadius,
        flip: 1,
      }),
    );
  }

  if (phi % TAU !== 0) {
    pieces.push(
      phiCap({
        p: phiOffset,
        theta: clampedTheta,
        thetaOffset: clampedThetaOffset,
        ny,
        capSegments,
        radius,
        innerRadius,
        flip: -1,
      }),
      phiCap({
        p: phiOffset + phi,
        theta: clampedTheta,
        thetaOffset: clampedThetaOffset,
        ny,
        capSegments,
        radius,
        innerRadius,
        flip: 1,
      }),
    );
  }

  return concatGeometries(pieces);
}
