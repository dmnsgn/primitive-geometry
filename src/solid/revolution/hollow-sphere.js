/**
 * @module primitiveGeometry
 * @ignore
 */
import {
  TAU,
  clampMeridianSweep,
  concatGeometries,
  getCellsTypedArray,
  invert,
  normalize,
} from "../../utils/common.js";
import { TMP, computeGridQuad } from "../../utils/revolution.js";
import { sphere } from "./sphere.js";
import { sphereDirection } from "./ellipsoid.js";

/**
 * Flat annular wall at a fixed meridian angle t (a theta cut, ie. where the
 * theta sweep stops short of a pole): r sweeps innerRadius -> radius, phi
 * sweeps the same phiOffset/phi range as the outer/inner bands, sampled on the
 * exact same nx grid so its rim welds bit-identically to theirs. flip (1 or -1)
 * picks which of the 2 possible caps this is (t = the sweep's start or end),
 * driving both the outward normal (the +-theta tangent of `sphereDirection`)
 * and winding.
 *
 * @private
 */
function thetaCap({
  t,
  phi,
  phiOffset,
  nx,
  capSegments,
  radius,
  innerRadius,
  flip,
  mergeSeam,
}) {
  const wrap = phi % TAU === 0;
  const cols = mergeSeam && wrap ? nx : nx + 1;
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

    for (let i = 0; i < cols; i++, indices.vertex++) {
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
    }
  }

  const at = (i, j) => j * cols + (i % cols);
  for (let j = 1; j <= capSegments; j++) {
    for (let i = 1; i <= nx; i++) {
      computeGridQuad(
        cells,
        indices,
        [at(i - 1, j - 1), at(i, j - 1), at(i - 1, j), at(i, j)],
        flip,
      );
    }
  }

  return { positions, normals, uvs, cells };
}

/**
 * Flat annular wall at a fixed equatorial angle p (a phi cut, ie. where the phi
 * sweep is a partial revolution): r sweeps innerRadius -> radius, theta sweeps
 * the same clamped thetaOffset/theta range as the outer/inner bands, sampled on
 * the exact same ny grid so its rim welds bit-identically to theirs. flip (1 or
 * -1) picks which of the 2 possible caps this is (p = the sweep's start or
 * end), driving both the outward normal (the +-phi tangent of
 * `sphereDirection`) and winding.
 *
 * @private
 */
function phiCap({
  p,
  theta,
  thetaOffset,
  ny,
  capSegments,
  radius,
  innerRadius,
  flip,
}) {
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
    }
  }

  // flip is inverted relative to thetaCap: with i (theta) as the row-stride
  // axis here instead of phi, the same flip value maps to the opposite
  // winding for an outward normal
  const at = (i, j) => j * rows + i;
  for (let j = 1; j <= capSegments; j++) {
    for (let i = 1; i <= ny; i++) {
      computeGridQuad(
        cells,
        indices,
        [at(i - 1, j - 1), at(i, j - 1), at(i - 1, j), at(i, j)],
        -flip,
      );
    }
  }

  return { positions, normals, uvs, cells };
}

/**
 * @typedef {object} HollowSphereOptions
 * @property {number} [radius=0.5]
 * @property {number} [innerRadius=radius*0.5]
 * @property {import("../../../types.js").PositiveInteger} [nx=32]
 * @property {import("../../../types.js").PositiveInteger} [ny=16]
 * @property {import("../../../types.js").PositiveInteger} [capSegments=1] Radial segments of each cut cap
 * @property {import("../../../types.js").PolarAngle} [theta=Math.PI / 2] Meridian sweep length, silently
 *   clamped like `ellipsoid`'s
 * @property {import("../../../types.js").PolarAngle} [thetaOffset=Math.PI / 4] Meridian sweep start, silently
 *   clamped like `ellipsoid`'s
 * @property {import("../../../types.js").Angle} [phi=TAU]
 * @property {import("../../../types.js").Angle} [phiOffset=0]
 * @property {boolean} [mergeSeam=false] `true` shares the full turn's wrap
 *   column and smooth poles' vertices, wrapping uvs back to 0 there.
 */

/**
 * A sphere with a smaller, concentric sphere hollowed out of it: a shell of
 * uniform wall thickness. Defaults to a quarter band (theta/thetaOffset) rather
 * than a full sphere, since a closed hollow sphere looks identical to a plain
 * `sphere` from outside - the partial default exposes the cavity and cut caps
 * immediately.
 *
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
  mergeSeam = false,
} = {}) {
  const [clampedTheta, clampedThetaOffset] = clampMeridianSweep(
    theta,
    thetaOffset,
  );
  const thetaStart = clampedThetaOffset;
  const thetaEnd = clampedThetaOffset + clampedTheta;

  const pieces = [
    sphere({ radius, nx, ny, theta, thetaOffset, phi, phiOffset, mergeSeam }),
    invert(
      sphere({
        radius: innerRadius,
        nx,
        ny,
        theta,
        thetaOffset,
        phi,
        mergeSeam,
        phiOffset,
      }),
    ),
  ];

  if (thetaStart % Math.PI !== 0) {
    pieces.push(
      thetaCap({
        t: thetaStart,
        phi,
        mergeSeam,
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
        mergeSeam,
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
