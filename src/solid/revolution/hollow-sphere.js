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
 * Flat wall closing a theta cut, on the bands' nx grid so its rims weld. flip
 * picks the start or end cap.
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
 * Flat wall closing a phi cut, on the bands' ny grid so its rims weld. flip
 * picks the start or end cap.
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

  // Theta is the row-stride axis here, so flip is inverted relative to thetaCap
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
 * @property {import("../../../types.js").PositiveInteger} [capSegments=1]
 *   Radial segments per cut cap.
 * @property {import("../../../types.js").PolarAngle} [theta=Math.PI / 2]
 *   Meridian sweep length, clamped like `ellipsoid`'s.
 * @property {import("../../../types.js").PolarAngle} [thetaOffset=Math.PI / 4]
 *   Meridian sweep start, clamped like `ellipsoid`'s.
 * @property {import("../../../types.js").Angle} [phi=TAU]
 * @property {import("../../../types.js").Angle} [phiOffset=0]
 * @property {boolean} [mergeSeam=false] `true` shares the full turn's wrap
 *   column and smooth poles' vertices, wrapping uvs back to 0 there.
 */

/**
 * A spherical shell. Defaults to a band, exposing the cavity.
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
