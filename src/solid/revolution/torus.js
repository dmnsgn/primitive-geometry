/**
 * @module primitiveGeometry
 * @ignore
 */
import { rectangular } from "../../mappings.js";
import { TAU, getCellsTypedArray, normalize } from "../../utils/common.js";
import {
  TMP,
  computeCap,
  computeCapVertexCount,
  computeGridQuad,
} from "../../utils/revolution.js";

/**
 * @typedef {object} TorusOptions
 * @property {number} [radius=0.4]
 * @property {import("../../../types.js").PositiveInteger} [segments=64]
 * @property {number} [minorRadius=0.1]
 * @property {import("../../../types.js").PositiveInteger} [minorSegments=32]
 * @property {import("../../../types.js").Angle} [theta=TAU]
 * @property {import("../../../types.js").Angle} [thetaOffset=0]
 * @property {import("../../../types.js").Angle} [phi=TAU]
 * @property {import("../../../types.js").Angle} [phiOffset=0]
 * @property {boolean} [capStart=true]
 * @property {boolean} [capEnd=true]
 * @property {import("../../../types.js").PositiveInteger} [capStartSegments=1]
 * @property {import("../../../types.js").PositiveInteger} [capEndSegments=1]
 * @property {import("../../mappings.js").MappingFn} [capMapping=mappings.rectangular]
 * @property {number} [sx=1] Major sweep x scale (footprint), elliptical when !=
 *   sy
 * @property {number} [sy=1] Major sweep y scale (footprint), elliptical when !=
 *   sx
 * @property {number} [minorSx=1] Tube radial scale (meridian cross-section),
 *   elliptical when != minorSy
 * @property {number} [minorSy=1] Tube z scale (meridian cross-section),
 *   elliptical when != minorSx
 * @property {boolean} [mergeSeam=false] `true` shares the full turn's wrap
 *   column and smooth poles' vertices, wrapping uvs back to 0 there.
 */

/**
 * Ring torus by default. Other shapes fall out of the same parameters: a
 * partial/open torus (phi < TAU, optionally capped via capStart/capEnd), an
 * elliptical torus (sx != sy, an oval/racetrack footprint), and a tube with an
 * elliptical cross-section (minorSx != minorSy, like a flattened or
 * spindle-shaped bagel).
 *
 * @param {TorusOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 */
export function torus({
  radius = 0.4,
  segments = 64,

  minorRadius = 0.1,
  minorSegments = 32,
  theta = TAU,
  thetaOffset = 0,
  phi = TAU,
  phiOffset = 0,

  capStart = true,
  capEnd = true,
  capStartSegments = 1,
  capEndSegments = 1,
  capMapping = rectangular,

  sx = 1,
  sy = 1,
  minorSx = 1,
  minorSy = 1,
  mergeSeam = false,
} = {}) {
  // Wrap the last column/ring to the exact first angle for full revolutions
  const wrapPhi = phi % TAU === 0;
  const wrapTheta = theta % TAU === 0;

  // A full phi revolution has no seam to cap
  const hasCapStart = capStart && !wrapPhi && capStartSegments > 0;
  const hasCapEnd = capEnd && !wrapPhi && capEndSegments > 0;

  const cols = mergeSeam && wrapPhi ? segments : segments + 1;
  const rows = mergeSeam && wrapTheta ? minorSegments : minorSegments + 1;
  const at = (i, j) => (j % rows) * cols + (i % cols);

  const capCount =
    (hasCapStart ? capStartSegments : 0) + (hasCapEnd ? capEndSegments : 0);
  const capSize = (has, count) =>
    has ? computeCapVertexCount(rows, count, mergeSeam) : 0;

  const size =
    rows * cols +
    capSize(hasCapStart, capStartSegments) +
    capSize(hasCapEnd, capEndSegments);

  const positions = new Float32Array(size * 3);
  const normals = new Float32Array(size * 3);
  const uvs = new Float32Array(size * 2);

  // Each cap's innermost ring is collapsed to a point: fan with a single
  // triangle per segment instead of two, skipping the degenerate one
  const capFans = (hasCapStart ? 1 : 0) + (hasCapEnd ? 1 : 0);

  const cells = new (getCellsTypedArray(size))(
    minorSegments * segments * 6 +
      minorSegments * capCount * 6 -
      minorSegments * capFans * 3,
  );

  const indices = { vertex: 0, cell: 0 };

  // Last ring/column reuses the first angle exactly on a full revolution, so
  // the wrap welds instead of landing a hair away from it
  const angleAt = (j) => {
    const v = j / minorSegments;
    const t = (wrapTheta && j === minorSegments ? 0 : v) * theta + thetaOffset;
    return { cos: -Math.cos(t), sin: Math.sin(t), t };
  };
  const phiAngleAt = (i) =>
    (wrapPhi && i === segments ? 0 : i / segments) * phi + phiOffset;

  for (let j = 0; j < rows; j++) {
    const v = j / minorSegments;
    const { cos: cosTheta, sin: sinTheta } = angleAt(j);

    for (let i = 0; i < cols; i++, indices.vertex++) {
      const u = i / segments;

      const p = phiAngleAt(i);
      const cosPhi = -Math.cos(p);
      const sinPhi = Math.sin(p);

      const radial = radius + minorRadius * minorSx * cosTheta;

      positions[indices.vertex * 3] = sx * radial * cosPhi;
      positions[indices.vertex * 3 + 1] = sy * radial * sinPhi;
      positions[indices.vertex * 3 + 2] = minorRadius * minorSy * sinTheta;

      // sx/sy (footprint) and minorSx/minorSy (tube cross-section) together
      // scale the standard torus by a constant diagonal matrix, so its
      // normal (radially outward from the meridian's own center, ie.
      // cosTheta*cosPhi, cosTheta*sinPhi, sinTheta) needs the matching
      // inverse-scale correction; multiplying by the complementary pair
      // (rather than dividing by the vertex's own scale) avoids a division
      // by zero and is equivalent up to the positive common factor
      // sx*sy*minorSx*minorSy. Reduces to the plain radial direction when
      // sx = sy = minorSx = minorSy = 1.
      TMP[0] = sy * minorSy * cosTheta * cosPhi;
      TMP[1] = sx * minorSy * cosTheta * sinPhi;
      TMP[2] = sx * sy * minorSx * sinTheta;

      normalize(TMP);

      normals[indices.vertex * 3] = TMP[0];
      normals[indices.vertex * 3 + 1] = TMP[1];
      normals[indices.vertex * 3 + 2] = TMP[2];

      uvs[indices.vertex * 2] = u;
      uvs[indices.vertex * 2 + 1] = v;
    }
  }

  // flip=-1: with i (phi) as the row-stride axis, this is the winding that
  // keeps the b-c split facing the same way as the original a-d split it
  // replaces
  for (let j = 1; j <= minorSegments; j++) {
    for (let i = 1; i <= segments; i++) {
      computeGridQuad(
        cells,
        indices,
        [at(i - 1, j - 1), at(i, j - 1), at(i - 1, j), at(i, j)],
        -1,
      );
    }
  }

  // Basis for the cap's local 2D plane at a fixed phi angle: local x runs
  // along the meridian's radial (cos) direction, local y along the torus
  // axis - both already scaled by minorSx/minorSy upstream, via computeCap's
  // own sx/sy below. The footprint scale (sx, sy) only affects the final
  // world X/Y, applied here as a constant linear map of that plane, so the
  // cap stays flat.
  const capPoint = (pAngle) => {
    const cosPhi = -Math.cos(pAngle);
    const sinPhi = Math.sin(pAngle);
    return {
      point: (x, y) => [
        sx * (radius + x) * cosPhi,
        sy * (radius + x) * sinPhi,
        y,
      ],
      // Outward normal of that plane (flip already folded in), derived from
      // basisA x basisB with basisA = (sx*cosPhi, sy*sinPhi, 0), basisB = (0, 0, 1)
      normalFor: (flip) => [sy * sinPhi * flip, -sx * cosPhi * flip, 0],
    };
  };

  const geometry = { positions, normals, uvs, cells };

  if (hasCapStart) {
    const { point, normalFor } = capPoint(phiOffset);
    computeCap(geometry, indices, {
      ringSegments: minorSegments,
      capSegments: capStartSegments,
      capRadius: minorRadius,
      sx: minorSx,
      sy: minorSy,
      flip: -1,
      angleAt,
      point,
      normal: normalFor(-1),
      mapping: capMapping,
      cols: rows,
      mergeSeam,
    });
  }

  if (hasCapEnd) {
    const { point, normalFor } = capPoint(phiOffset + phi);
    computeCap(geometry, indices, {
      ringSegments: minorSegments,
      capSegments: capEndSegments,
      capRadius: minorRadius,
      sx: minorSx,
      sy: minorSy,
      flip: 1,
      angleAt,
      point,
      normal: normalFor(1),
      mapping: capMapping,
      cols: rows,
      mergeSeam,
    });
  }

  return geometry;
}
