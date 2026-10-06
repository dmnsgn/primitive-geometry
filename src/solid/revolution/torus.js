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
 * @property {number} [sx=1] Footprint x scale.
 * @property {number} [sy=1] Footprint y scale.
 * @property {number} [minorSx=1] Tube radial scale.
 * @property {number} [minorSy=1] Tube z scale.
 * @property {boolean} [mergeSeam=false] `true` shares the full turn's wrap
 *   column and smooth poles' vertices, wrapping uvs back to 0 there.
 */

/**
 * A ring torus.
 *
 * Special cases: open torus (phi < TAU), elliptical torus (sx != sy),
 * elliptical tube (minorSx != minorSy).
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
  const wrapPhi = phi % TAU === 0;
  const wrapTheta = theta % TAU === 0;

  // A full turn has no seam to cap
  const caps = wrapPhi
    ? []
    : [
        capStart && {
          pAngle: phiOffset,
          capSegments: capStartSegments,
          flip: -1,
        },
        capEnd && {
          pAngle: phiOffset + phi,
          capSegments: capEndSegments,
          flip: 1,
        },
      ].filter((cap) => cap && cap.capSegments > 0);

  const cols = mergeSeam && wrapPhi ? segments : segments + 1;
  const rows = mergeSeam && wrapTheta ? minorSegments : minorSegments + 1;
  const at = (i, j) => (j % rows) * cols + (i % cols);

  const size = caps.reduce(
    (sum, { capSegments }) =>
      sum + computeCapVertexCount(rows, capSegments, mergeSeam),
    rows * cols,
  );

  const positions = new Float32Array(size * 3);
  const normals = new Float32Array(size * 3);
  const uvs = new Float32Array(size * 2);

  // Caps fan from a collapsed center: one triangle per segment on that ring
  const cells = new (getCellsTypedArray(size))(
    caps.reduce(
      (sum, { capSegments }) => sum + minorSegments * (capSegments * 6 - 3),
      minorSegments * segments * 6,
    ),
  );

  const indices = { vertex: 0, cell: 0 };

  // A full turn's last ring/column reuses the first angle exactly so it welds
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

      // Inverse-scaled normal: multiplied by the complementary scales rather
      // than divided by its own, so a zero scale can't divide by zero
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

  // Outward winding with phi as the row-stride axis
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

  // Cap plane at a fixed phi: x radial, y along the torus axis. computeCap
  // applies minorSx/minorSy, sx/sy are applied here as a linear map so the cap
  // stays flat.
  const capPoint = (pAngle) => {
    const cosPhi = -Math.cos(pAngle);
    const sinPhi = Math.sin(pAngle);
    return {
      point: (x, y) => [
        sx * (radius + x) * cosPhi,
        sy * (radius + x) * sinPhi,
        y,
      ],
      // (sx * cosPhi, sy * sinPhi, 0) x (0, 0, 1), oriented by flip
      normalFor: (flip) => [sy * sinPhi * flip, -sx * cosPhi * flip, 0],
    };
  };

  const geometry = { positions, normals, uvs, cells };

  for (const { pAngle, capSegments, flip } of caps) {
    const { point, normalFor } = capPoint(pAngle);
    computeCap(geometry, indices, {
      ringSegments: minorSegments,
      capSegments,
      capRadius: minorRadius,
      sx: minorSx,
      sy: minorSy,
      flip,
      angleAt,
      point,
      normal: normalFor(flip),
      mapping: capMapping,
      cols: rows,
      mergeSeam,
    });
  }

  return geometry;
}
