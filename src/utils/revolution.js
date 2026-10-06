/**
 * @module utils
 * @ignore
 */

import { TAU, getCellsTypedArray, normalize, snapToZero } from "./common.js";
import { linear } from "./distribution.js";

/** @private */
export const TMP = [0, 0, 0];

/**
 * Fan-triangulated flat disk cap shared by revolution solids (cylinder/cone,
 * torus): capSegments + 1 concentric rings of `cols` angular samples
 * (ringSegments + 1, or ringSegments when the caller merges a full turn's wrap
 * column). The innermost ring collapses to a point - a single vertex with
 * mergeSeam - and fans with a single triangle per quad instead of two,
 * skipping the degenerate one.
 *
 * The disk is defined in the caller's own local 2D coordinates: x along the
 * angular sample's cosine, y along its sine, both scaled by capRadius *
 * radiusRatio, then independently by sx/sy for an elliptical cap. `point(x, y)`
 * embeds those into the solid's 3D space; `normal` is that embedding's flat
 * outward normal. Both are the caller's responsibility, since the two solids
 * embed their cap plane differently (cylinder: axis-aligned; torus: offset and
 * rotated by its phi angle). A flat disk's normal only depends on the plane it
 * sits in, not its in-plane shape - so sx/sy don't affect `normal`, only the
 * position/uv scale.
 *
 * `flip` (1 or -1) selects which of a cap pair (base/apex, start/end) this is,
 * driving winding order. `normal` must already have flip folded in, so it
 * points outward, ie. away from the solid.
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

  // Summed from the same samples as the outer ring, so it's the length of the
  // body's own boundary ring the cap welds onto
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

      // The innermost ring is collapsed at the center: fan with a single
      // triangle, skipping the degenerate one
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
 * Triangulate one quad of a row-major vertex grid: a/b on the previous row, c/d
 * on the current one, b/d one column after a/c.
 *
 * Splits along the b-c diagonal, matching `computePlane`/
 * `computePolarGeometry`/`computeRevolutionGeometry`, so displacement in a
 * vertex shader creases consistently across the library. flip (1 or -1) picks
 * the winding, same convention as `computeCap`. Which value maps to "outward"
 * depends on how the caller's row/col axes relate to its own surface normal -
 * callers work that out for themselves (see torus.js/hollow-sphere.js).
 *
 * @private
 */
export function computeGridQuad(cells, indices, [a, b, c, d], flip) {
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
 * A grid of meridian rings (v = 0..1, row-major/outer) by nx + 1 angular
 * columns (phi, inner), revolved around the y-axis. The last column reuses the
 * first's angle when phi is a multiple of TAU, so their positions match
 * bit-identically, same rule as every other revolution solid. mergeSeam shares
 * them instead (nx columns), along with collapsed rings whose normal doesn't
 * depend on phi (a smooth pole, not a cone's apex).
 *
 * `equation({ v, cosPhi, sinPhi })` computes one vertex's analytic
 * position/normal, already embedding whatever axis-scale or ellipse the caller
 * needs (eg. cylinder's per-end sx/sz, ellipsoid's rx/ry/rz), plus whether the
 * whole v-ring is pinched to a point on the axis (a pole or an apex).
 * `collapsed` must depend on v only: it's probed once per row (at cosPhi = 1,
 * sinPhi = 0) to size and fan-triangulate the mesh before the main fill. This
 * generalizes ellipsoid's original pole handling to any meridian curve, not
 * just an ellipse's sin/cos one. A pole is only supported at v = 0 or v = 1 -
 * the meridian curve must not cross the axis anywhere in between - so callers
 * with a bounded theta/thetaOffset (eg. ellipsoid) clamp them so their sweep
 * can't.
 *
 * `vDistribution(t)` remaps the row's linear index fraction `t` (0..1, evenly
 * spaced) to the actual `v` fed into `equation` - `linear` (the default) is the
 * identity, `chebyshev` clusters rows toward both ends of the sweep. This
 * changes vertex positions, not just texturing: a row's `v` drives its position
 * through `equation`, so redistributing `v` moves where rows actually sit along
 * the meridian (see distribution.js).
 *
 * The uv v-coordinate defaults to the redistributed `v`, not the row fraction
 * `t`, so the texture stays put on the surface whatever `vDistribution` does:
 * it only changes tessellation. `equation` may return its own `v` to override
 * just the uv (eg. capsule.js's meridian arc length, since its sections get
 * independent row counts); structural v (row spacing, pole detection) is
 * unaffected, since it's only ever read from the input parameter, never the
 * return value.
 *
 * CapBase/capApex add a flat disk at v = 0/v = 1, skipped when that end is
 * already collapsed to a true point apex (same convention cylinder/cone use
 * today). position.x/z are always linear in (cosPhi, sinPhi) with no cross
 * term, for an axis-aligned surface of revolution (the defining property of
 * this whole family). So each cap's radius/ellipse-scale is reconstructed by
 * probing `equation` at that end rather than requiring the caller to pass it
 * separately: `equation(v, 1, 0).position` and `equation(v, 0, 1).position`
 * give the rim's x/z extent directly, positive or negative depending on the
 * shape's own sign convention (eg. cylinder's cosPhi = -cos(p)). capRadius is
 * fixed at 1, and the sign is folded into a per-cap cos/sin flip instead of
 * `Math.abs`-ing it away blindly - so the reconstructed rim still lands exactly
 * on the body's own boundary ring (bit-identical, the same "seam" convention as
 * every other welded boundary here), while keeping the cap's sx/sy positive for
 * mapping functions that divide by them (eg. `rectangular`).
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

  // Rings collapsed to a point (poles, apexes) fan with a single triangle per
  // quad instead of two, skipping the degenerate one
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

  const hasCapBase = capBase && !collapsedAt[0];
  const hasCapApex = capApex && !collapsedAt[ny];
  const capBaseCount = hasCapBase ? capBaseSegments : 0;
  const capApexCount = hasCapApex ? capApexSegments : 0;
  const capFans = (capBaseCount > 0 ? 1 : 0) + (capApexCount > 0 ? 1 : 0);

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

  const capSize = (count) =>
    count > 0 ? computeCapVertexCount(cols, count, mergeSeam) : 0;
  const size = bodySize + capSize(capBaseCount) + capSize(capApexCount);

  const positions = new Float32Array(size * 3);
  const normals = new Float32Array(size * 3);
  const uvs = new Float32Array(size * 2);
  const cells = new (getCellsTypedArray(size))(
    ny * nx * 6 -
      fans * nx * 3 +
      (capBaseCount + capApexCount) * nx * 6 -
      capFans * nx * 3,
  );

  let vertexIndex = 0;
  let cellIndex = 0;

  // The last column reuses the first angle exactly on a full revolution, so
  // the wrap welds instead of landing a hair away from it
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

  // Quads between the row just written and the one before it, each half
  // skipped when the ring it fans from is collapsed
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

  for (let y = 0; y <= ny; y++) {
    const v = vDistribution(y / ny);

    // A collapsed ring has one vertex per wedge: centering its u between the
    // wedge's two rim columns keeps the pole's uv tear symmetric. Fans pick
    // pole column x for wedge x, from either side, leaving column nx unused
    // (kept at u = 1 so it stays in range).
    const centered = collapsedAt[y] && !mergedAt[y];
    const count = mergedAt[y] ? 1 : cols;
    for (let x = 0; x < count; x++, vertexIndex++) {
      writeVertex(x, v, centered && x < nx ? 0.5 : 0);
    }

    if (y > 0) writeRowQuads(y);
  }

  const geometry = { positions, normals, uvs, cells };
  const indices = { vertex: vertexIndex, cell: cellIndex };

  // The rim's x/z extent, probed from the equation itself rather than passed
  // in; its sign is folded into the cap's own cos/sin so the reconstructed rim
  // lands bit-exactly on the body's boundary ring while sx/sy stay positive.
  const addCap = (v, capSegments, flip, normalY) => {
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

  if (hasCapBase) addCap(0, capBaseSegments, 1, -1);
  if (hasCapApex) addCap(1, capApexSegments, -1, 1);

  return { positions, normals, uvs, cells, indices };
}

/**
 * A point on a regular sides-gon ring at the given angle/radius/height - same
 * x/z sign convention as `cylinder`'s own `equation()`, so a prism, antiprism
 * and cylinder built with the same radius/phiOffset share a corner. Shared by
 * prism/antiprism's own wall corners and cap rims (see `computePolygonCap`), so
 * a wall corner's position is computed by the exact same expression as its
 * coincident cap vertex - required for them to weld bit-identically
 * (`analyze()`'s crack check), not just approximately.
 *
 * @private
 */
export function computePolygonCorner(angle, radius, y) {
  return [-radius * Math.cos(angle), y, radius * Math.sin(angle)];
}

/**
 * A prism/antiprism's flat sides-gon cap: `computeCap`'s own `sides + 1` angle
 * samples with no further interpolation between them trace a straight sides-gon
 * boundary, not an arc (see `prism.js`'s own doc comment for why). Shared by
 * `prism` (whose bottom/top ends sample the same `angleAt`) and `antiprism`
 * (whose top ring is rotated by half a sector, so each end supplies its own).
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
 * A spindle-torus generating-circle revolution: the meridian is an arc of a
 * circle (radius `a`, offset from the axis) that crosses the revolution axis at
 * its own two endpoints. This produces cusped poles - not smooth tangent points
 * like a sphere's - each with its own per-column normal. Shared by `apple` (the
 * major, more-than-half-circle arc) and `lemon` (the minor,
 * less-than-half-circle arc of the same construction, opposite sign
 * convention); see each file's own doc comment for the halfHeight domain that
 * distinguishes them. This helper takes `a`/`thetaCross`/
 * `poleCosTheta`/`radiusAt` as given rather than re-deriving them, since the
 * two files' sign conventions for the circle's own axis offset are mirrored.
 *
 * `radiusAt(cosTheta)` computes the meridian's radius away from the poles.
 * `poleCosTheta` is the same circle's cosTheta at r = 0, used for the pole's
 * own normal. It's kept separate from `radiusAt`, since deriving it via
 * `radiusAt`'s own formula wouldn't reliably round-trip to exactly 0 in
 * floating point - leaving the pole undetected as collapsed (see apple.js's own
 * comment on its equation for the full reasoning).
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
      // Direction from the generating circle's own (off-axis) center, not
      // from the revolution axis - unlike a sphere/ellipsoid, position and
      // normal direction aren't simply proportional here. `a` is left out
      // (normalize() erases positive scalar multiples), same "factor out
      // the radius" trick cylinder/cone's tangent-cross-product normals use.
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
 * A flat-ended surface of revolution around the y axis, both ends open rings
 * cappable exactly like `cylinder`'s. Shared plumbing for
 * `barrel`/`funnel`/`hyperboloid`, which only differ in their own radius law
 * (parabolic/exponential/hyperbolic). `profile(y, v)` returns `[r, normalY]`:
 * the meridian's radius at that height, and the y-component of the implicit
 * surface's gradient there (x/z components are always `x`/`z` themselves for
 * this whole family, since none of their defining equations has an x/y or z/y
 * cross term). Both `y` and the raw sweep parameter `v` are passed through, so
 * a caller whose own radius law is naturally written in terms of one or the
 * other (eg. funnel's exponential, in `v`) doesn't have to round-trip through
 * the other and risk a 1-ULP drift.
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
