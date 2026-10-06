/**
 * @module utils
 * @ignore
 */

import { TAU, getCellsTypedArray, normalize, snapToZero } from "./common.js";
import { linear } from "./distribution.js";

/** @private */
export const TMP = [0, 0, 0];

/**
 * Flat disk cap fanning from a collapsed center. `point(x, y)` embeds the local
 * disk (x along cos, y along sin) in 3D, `normal` is its outward normal with
 * `flip` folded in, and `flip` picks the winding.
 *
 * @private
 */
export function computeCap(
  geometry,
  indices,
  {
    ringSegments,
    capSegments,
    capRadius,
    sx = 1,
    sy = 1,
    flip,
    angleAt,
    point,
    normal,
    mapping,
    cols = ringSegments + 1,
    mergeSeam = false,
  },
) {
  const { positions, normals, uvs, cells } = geometry;
  const start = indices.vertex;
  const centerCount = mergeSeam ? 1 : cols;

  const at = (r, j) =>
    r === 0
      ? start + (mergeSeam ? 0 : j % cols)
      : start + centerCount + (r - 1) * cols + (j % cols);

  // Same samples as the body's boundary ring, so the perimeters match
  let perimeter = 0;
  for (let j = 0; j < ringSegments; j++) {
    const a = angleAt(j);
    const b = angleAt(j + 1);
    perimeter += Math.hypot(
      capRadius * sx * (b.cos - a.cos),
      capRadius * sy * (b.sin - a.sin),
    );
  }

  const writeVertex = (radiusRatio, cos, sin, t, thetaRatio) => {
    const x = capRadius * sx * radiusRatio * cos;
    const y = capRadius * sy * radiusRatio * sin;
    const [px, py, pz] = point(x, y);

    const i = indices.vertex;

    positions[i * 3] = px;
    positions[i * 3 + 1] = py;
    positions[i * 3 + 2] = pz;

    normals[i * 3] = normal[0];
    normals[i * 3 + 1] = normal[1];
    normals[i * 3 + 2] = normal[2];

    mapping({
      uvs,
      index: i * 2,
      u: radiusRatio * cos,
      v: radiusRatio * sin,
      radius: capRadius,
      sx,
      sy,
      radiusRatio,
      thetaRatio,
      t,
      x,
      y,
      perimeter,
    });

    indices.vertex++;
  };

  for (let r = 0; r <= capSegments; r++) {
    for (let j = 0; j < (r === 0 ? centerCount : cols); j++) {
      const { cos, sin, t } = angleAt(j);
      writeVertex(r / capSegments, cos, sin, t, j / ringSegments);
    }
  }

  // flip = -1 reverses winding by swapping the two corners after the first
  const [second, third] = flip === 1 ? [1, 2] : [2, 1];
  const writeTriangle = (a, b, c) => {
    cells[indices.cell] = a;
    cells[indices.cell + second] = b;
    cells[indices.cell + third] = c;
    indices.cell += 3;
  };

  for (let r = 0; r < capSegments; r++) {
    for (let j = 0; j < ringSegments; j++) {
      const a = at(r, j);
      const b = at(r + 1, j);
      const c = at(r, j + 1);
      const d = at(r + 1, j + 1);

      // The center ring is collapsed: one triangle per wedge
      if (r > 0) writeTriangle(a, c, d);

      writeTriangle(a, d, b);
    }
  }
}

/**
 * Vertex count of a `computeCap` with the same `cols`, `capSegments` and
 * `mergeSeam`.
 *
 * @private
 */
export function computeCapVertexCount(cols, capSegments, mergeSeam = false) {
  return (mergeSeam ? 1 : cols) + capSegments * cols;
}

/**
 * Triangulate one grid quad: a/b on the previous row, c/d on the current, b/d
 * one column after. `flip` picks the winding.
 *
 * @private
 */
export function computeGridQuad(cells, indices, [a, b, c, d], flip) {
  // Split along b-c like every grid here, so vertex shader displacement creases
  // consistently
  if (flip === 1) {
    cells[indices.cell] = a;
    cells[indices.cell + 1] = c;
    cells[indices.cell + 2] = b;

    cells[indices.cell + 3] = b;
    cells[indices.cell + 4] = c;
    cells[indices.cell + 5] = d;
  } else {
    cells[indices.cell] = a;
    cells[indices.cell + 1] = b;
    cells[indices.cell + 2] = c;

    cells[indices.cell + 3] = b;
    cells[indices.cell + 4] = d;
    cells[indices.cell + 5] = c;
  }

  indices.cell += 6;
}

/**
 * Meridian rows by angular columns, revolved around y.
 *
 * - `equation({ v, cosPhi, sinPhi })` returns a vertex's `position`, `normal`,
 *   `collapsed` for rows pinched to the axis (only at v = 0 or 1), and
 *   optionally its uv `v`.
 * - `vDistribution` remaps rows along the meridian. Uv v follows it, so the
 *   texture stays put.
 * - `mergeSeam` shares the wrap column and smooth poles.
 * - `capBase`/`capApex` add flat disks at uncollapsed ends.
 *
 * @private
 */
export function computeRevolutionGeometry({
  nx = 32,
  ny = 16,
  phi = TAU,
  phiOffset = 0,
  capBase = false,
  capApex = false,
  capSegments = 1,
  capBaseSegments = capSegments,
  capApexSegments = capSegments,
  capMapping,
  vDistribution = linear,
  mergeSeam = false,
  equation,
} = {}) {
  const wrap = phi % TAU === 0;
  const cols = mergeSeam && wrap ? nx : nx + 1;

  // Probed once per row, so `collapsed` must depend on v only. Collapsed rows
  // fan with one triangle per quad.
  const collapsedAt = Array.from(
    { length: ny + 1 },
    (_, y) =>
      equation({ v: vDistribution(y / ny), cosPhi: 1, sinPhi: 0 }).collapsed,
  );
  const fans = collapsedAt.reduce(
    (sum, collapsed, y) =>
      sum + (collapsed ? (y === 0 || y === ny ? 1 : 2) : 0),
    0,
  );

  // An end already collapsed to a true point apex gets no cap
  const caps = [
    capBase &&
      !collapsedAt[0] && {
        v: 0,
        capSegments: capBaseSegments,
        flip: 1,
        normalY: -1,
      },
    capApex &&
      !collapsedAt[ny] && {
        v: 1,
        capSegments: capApexSegments,
        flip: -1,
        normalY: 1,
      },
  ].filter(Boolean);

  const normalAt = (v, cosPhi, sinPhi) =>
    normalize([...equation({ v, cosPhi, sinPhi }).normal]).map(Math.fround);

  const mergedAt = collapsedAt.map((collapsed, y) => {
    if (!mergeSeam || !collapsed) return false;
    const v = vDistribution(y / ny);
    const n0 = normalAt(v, 1, 0);
    const n1 = normalAt(v, 0, 1);
    return n0.every((n, k) => n === n1[k]);
  });

  const rowOffsets = Array.from({ length: ny + 1 });
  let bodySize = 0;
  for (let y = 0; y <= ny; y++) {
    rowOffsets[y] = bodySize;
    bodySize += mergedAt[y] ? 1 : cols;
  }
  const at = (x, y) => rowOffsets[y] + (mergedAt[y] ? 0 : x % cols);

  const capSize = caps.reduce(
    (sum, { capSegments }) =>
      sum +
      (capSegments > 0
        ? computeCapVertexCount(cols, capSegments, mergeSeam)
        : 0),
    0,
  );
  const capCellCount = caps.reduce(
    (sum, { capSegments }) =>
      sum + (capSegments > 0 ? (capSegments * 6 - 3) * nx : 0),
    0,
  );
  const size = bodySize + capSize;

  const positions = new Float32Array(size * 3);
  const normals = new Float32Array(size * 3);
  const uvs = new Float32Array(size * 2);
  const cells = new (getCellsTypedArray(size))(
    ny * nx * 6 - fans * nx * 3 + capCellCount,
  );

  let vertexIndex = 0;
  let cellIndex = 0;

  // A full turn's last column reuses the first angle exactly so it welds
  const phiAt = (x) => (wrap && x === nx ? 0 : x / nx) * phi + phiOffset;

  const writeVertex = (x, v, uOffset) => {
    const p = phiAt(x);

    const {
      position,
      normal,
      v: uvV = v,
    } = equation({ v, cosPhi: Math.cos(p), sinPhi: Math.sin(p) });

    positions[vertexIndex * 3] = position[0];
    positions[vertexIndex * 3 + 1] = position[1];
    positions[vertexIndex * 3 + 2] = position[2];

    TMP[0] = normal[0];
    TMP[1] = normal[1];
    TMP[2] = normal[2];
    normalize(TMP);

    normals[vertexIndex * 3] = TMP[0];
    normals[vertexIndex * 3 + 1] = TMP[1];
    normals[vertexIndex * 3 + 2] = TMP[2];

    uvs[vertexIndex * 2] = (x + uOffset) / nx;
    uvs[vertexIndex * 2 + 1] = uvV;
  };

  // Each half is skipped when the row it fans from is collapsed
  const writeRowQuads = (y) => {
    for (let x = 0; x < nx; x++) {
      const a = at(x, y - 1);
      const b = at(x + 1, y - 1);
      const c = at(x, y);
      const d = at(x + 1, y);

      if (!collapsedAt[y - 1]) {
        cells[cellIndex] = a;
        cells[cellIndex + 1] = b;
        cells[cellIndex + 2] = c;

        cellIndex += 3;
      }

      if (!collapsedAt[y]) {
        cells[cellIndex] = c;
        cells[cellIndex + 1] = collapsedAt[y - 1] ? a : b;
        cells[cellIndex + 2] = d;

        cellIndex += 3;
      }
    }
  };

  // A pole's u is centered between its wedge's rim columns so the uv tear is
  // symmetric. Column nx is unused, kept at u = 1.
  const writeRow = (y) => {
    const v = vDistribution(y / ny);
    const centered = collapsedAt[y] && !mergedAt[y];
    const count = mergedAt[y] ? 1 : cols;
    for (let x = 0; x < count; x++, vertexIndex++) {
      writeVertex(x, v, centered && x < nx ? 0.5 : 0);
    }
  };

  for (let y = 0; y <= ny; y++) {
    writeRow(y);
    if (y > 0) writeRowQuads(y);
  }

  const geometry = { positions, normals, uvs, cells };
  const indices = { vertex: vertexIndex, cell: cellIndex };

  // Rim extent probed from the equation, its sign folded into cos/sin so the
  // rim welds exactly while sx/sy stay positive
  const addCap = ({ v, capSegments, flip, normalY }) => {
    const atCos = equation({ v, cosPhi: 1, sinPhi: 0 });
    const atSin = equation({ v, cosPhi: 0, sinPhi: 1 });

    const xSign = atCos.position[0] < 0 ? -1 : 1;
    const zSign = atSin.position[2] < 0 ? -1 : 1;

    computeCap(geometry, indices, {
      ringSegments: nx,
      capSegments,
      capRadius: 1,
      sx: xSign * atCos.position[0],
      sy: zSign * atSin.position[2],
      flip,
      angleAt: (i) => {
        const p = phiAt(i);
        return { cos: xSign * Math.cos(p), sin: zSign * Math.sin(p), t: p };
      },
      point: (x, y) => [x, atCos.position[1], y],
      normal: [0, normalY, 0],
      mapping: capMapping,
      cols,
      mergeSeam,
    });
  };

  for (const cap of caps) addCap(cap);

  return { positions, normals, uvs, cells, indices };
}

/**
 * Polygon ring corner, with `cylinder`'s sign convention. Shared by prism walls
 * and caps so they weld bit-identically.
 *
 * @private
 */
export function computePolygonCorner(angle, radius, y) {
  return [-radius * Math.cos(angle), y, radius * Math.sin(angle)];
}

/**
 * A prism's flat polygon cap: `computeCap` sampled at its corners only.
 *
 * @private
 */
export function computePolygonCap(
  geometry,
  indices,
  { sides, radius, y, flip, normalY, angleAt, mapping, mergeSeam = false },
) {
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
    mapping,
    cols: mergeSeam ? sides : sides + 1,
    mergeSeam,
  });
}

/**
 * Revolution of a circular arc crossing the axis at both ends, with cusped
 * poles: `apple` and `lemon`. `poleCosTheta` is passed separately, as deriving
 * it from `radiusAt` misses r = 0.
 *
 * @private
 */
export function computeSpindleArcRevolution({
  a,
  halfHeight,
  thetaCross,
  poleCosTheta,
  radiusAt,
  nx,
  ny,
  phi,
  phiOffset,
  mergeSeam,
}) {
  function equation({ v, cosPhi: rawCosPhi, sinPhi: rawSinPhi }) {
    const cosPhi = snapToZero(rawCosPhi);
    const sinPhi = snapToZero(rawSinPhi);

    let cosTheta, sinTheta, r, y;
    if (v === 0 || v === 1) {
      cosTheta = poleCosTheta;
      sinTheta = (v === 0 ? -halfHeight : halfHeight) / a;
      r = 0;
      y = v === 0 ? -halfHeight : halfHeight;
    } else {
      const theta = -thetaCross + v * 2 * thetaCross;
      cosTheta = snapToZero(Math.cos(theta));
      sinTheta = snapToZero(Math.sin(theta));
      r = radiusAt(cosTheta);
      y = a * sinTheta;
    }

    return {
      position: [-cosPhi * r, y, sinPhi * r],
      // From the generating circle's off-axis center, `a` factored out
      normal: [-cosPhi * cosTheta, sinTheta, sinPhi * cosTheta],
      collapsed: r === 0,
    };
  }

  return computeRevolutionGeometry({
    nx,
    ny,
    phi,
    phiOffset,
    mergeSeam,
    equation,
  });
}

/**
 * Flat-ended surface of revolution, cappable like `cylinder`: `barrel`,
 * `funnel`, `hyperboloid`. `profile(y, v)` returns the radius and the
 * gradient's y component. Both y and v are passed so a radius law needn't
 * round-trip between them.
 *
 * @private
 */
export function computeFlatRevolutionGeometry({
  height,
  nx,
  ny,
  phi,
  phiOffset,
  capApex,
  capBase,
  capApexSegments,
  capBaseSegments,
  capMapping,
  vDistribution,
  mergeSeam,
  profile,
}) {
  const halfHeight = height / 2;

  function equation({ v, cosPhi: rawCosPhi, sinPhi }) {
    const cosPhi = -rawCosPhi;
    const y = height * v - halfHeight;
    const [r, normalY] = profile(y, v);
    const x = r * cosPhi;
    const z = r * sinPhi;

    return {
      position: [x, y, z],
      normal: [x, normalY, z],
      collapsed: false,
    };
  }

  return computeRevolutionGeometry({
    nx,
    ny,
    phi,
    phiOffset,
    capApex,
    capBase,
    capApexSegments,
    capBaseSegments,
    capMapping,
    vDistribution,
    mergeSeam,
    equation,
  });
}
