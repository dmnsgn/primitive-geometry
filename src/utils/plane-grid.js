/**
 * @module utils
 * @ignore
 */

/** @private */
export const PLANE_DIRECTIONS = {
  z: [0, 1, 2, 1, -1, 1],
  "-z": [0, 1, 2, -1, -1, -1],
  "-x": [2, 1, 0, 1, -1, -1],
  x: [2, 1, 0, -1, -1, 1],
  y: [0, 2, 1, 1, 1, 1],
  "-y": [0, 2, 1, 1, -1, -1],
};

/**
 * Piecewise sampling so region boundaries are bit-exact. n = 0 collapses the
 * straight section, cornerSegments = 0 gives a plain grid.
 *
 * @private
 */
export function getPlaneCoordinate(
  index,
  n,
  size,
  cornerRadius,
  cornerSegments,
) {
  return index < cornerSegments
    ? -size / 2 - cornerRadius + (index * cornerRadius) / cornerSegments
    : index <= cornerSegments + n
      ? -size / 2 + (n ? ((index - cornerSegments) * size) / n : 0)
      : size / 2 +
        ((index - cornerSegments - n) * cornerRadius) / cornerSegments;
}

/**
 * Remap a corner offset onto the circular arc: same angle, Chebyshev distance
 * rescaled to Euclidean.
 *
 * @private
 * @param {number} dx
 * @param {number} dy
 * @returns {[number, number]}
 */
export function remapCornerOffset(dx, dy) {
  const scale = Math.max(Math.abs(dx), Math.abs(dy)) / Math.hypot(dx, dy);
  return [dx * scale, dy * scale];
}

/**
 * Whether a grid index falls in a corner range, before 0 or after n.
 *
 * @private
 */
export function isPlaneCorner(index, n, cornerSegments) {
  return index < cornerSegments || index >= cornerSegments + n;
}

/**
 * Corner coordinate a value is beyond, or null within the straight span.
 *
 * @private
 */
export function getPlaneCornerReference(value, half) {
  return value < -half ? -half : value > half ? half : null;
}

/**
 * Whether the corner at [cx, cy] is rounded. `roundCorners` is a boolean or a
 * [-u-v, +u-v, +u+v, -u+v] array.
 *
 * @private
 */
export function isPlaneCornerRounded(cx, cy, roundCorners) {
  if (cx === null || cy === null) return false;
  if (roundCorners === true || roundCorners === false) return roundCorners;
  const index = cx < 0 ? (cy < 0 ? 0 : 3) : cy < 0 ? 1 : 2;
  return roundCorners[index];
}

/**
 * A plane as one welded grid, optionally with rounded corners. su/sv are the
 * inner face sizes. `roundCorners` is a boolean or a [-u-v, +u-v, +u+v, -u+v]
 * array.
 *
 * @private
 */
export function computePlane(
  geometry,
  indices,
  su,
  sv,
  nu,
  nv,
  direction = "z",
  pw = 0,
  uvScale = [1, 1],
  uvOffset = [0, 0],
  center = [0, 0, 0],
  ccw = true,
  cornerRadius = 0,
  cornerSegments = 0,
  roundCorners = false,
) {
  const { positions, normals, uvs, cells } = geometry;
  const [u, v, w, flipU, flipV, normal] = PLANE_DIRECTIONS[direction];

  const cols = 2 * cornerSegments + nu;
  const rows = 2 * cornerSegments + nv;

  const width = su + 2 * cornerRadius;
  const height = sv + 2 * cornerRadius;

  const vertexOffset = indices.vertex;

  // Triangle vertex slots, swapped to reverse winding when ccw is false
  const [s1, s2, s4, s5] = ccw ? [1, 2, 4, 5] : [2, 1, 5, 4];

  const writeVertex = (x0, y0) => {
    let x = x0;
    let y = y0;

    // Only reached strictly beyond both straight spans, so dx/dy are non-zero
    if (cornerRadius > 0) {
      const cx = getPlaneCornerReference(x0, su / 2);
      const cy = getPlaneCornerReference(y0, sv / 2);

      if (isPlaneCornerRounded(cx, cy, roundCorners)) {
        const [dx, dy] = remapCornerOffset(x0 - cx, y0 - cy);
        x = cx + dx;
        y = cy + dy;
      }
    }

    positions[indices.vertex * 3 + u] = x * flipU + center[u];
    positions[indices.vertex * 3 + v] = y * flipV + center[v];
    positions[indices.vertex * 3 + w] = pw + center[w];

    normals[indices.vertex * 3 + w] = normal;

    uvs[indices.vertex * 2] =
      ((x0 + width / 2) / width) * uvScale[0] + uvOffset[0];
    uvs[indices.vertex * 2 + 1] =
      (1 - (y0 + height / 2) / height) * uvScale[1] + uvOffset[1];

    indices.vertex++;
  };

  // `radial` splits the quad along its anti-diagonal, so corner quad seams
  // run radially out from the corner center
  const writeQuad = (i, j, radial) => {
    const n = vertexOffset + j * (cols + 1) + i;
    const o = n + cols + 1;

    if (radial) {
      cells[indices.cell] = n + 1;
      cells[indices.cell + s1] = n;
      cells[indices.cell + s2] = o;

      cells[indices.cell + 3] = n + 1;
      cells[indices.cell + s4] = o;
      cells[indices.cell + s5] = o + 1;
    } else {
      cells[indices.cell] = n;
      cells[indices.cell + s1] = o;
      cells[indices.cell + s2] = o + 1;

      cells[indices.cell + 3] = n;
      cells[indices.cell + s4] = o + 1;
      cells[indices.cell + s5] = n + 1;
    }

    indices.cell += 6;
  };

  for (let j = 0; j <= rows; j++) {
    const y0 = getPlaneCoordinate(j, nv, sv, cornerRadius, cornerSegments);
    const cornerV = isPlaneCorner(j, nv, cornerSegments);

    for (let i = 0; i <= cols; i++) {
      const x0 = getPlaneCoordinate(i, nu, su, cornerRadius, cornerSegments);
      const cornerU = isPlaneCorner(i, nu, cornerSegments);

      writeVertex(x0, y0);

      if (j < rows && i < cols) {
        writeQuad(
          i,
          j,
          cornerU && cornerV && i < cornerSegments !== j < cornerSegments,
        );
      }
    }
  }

  return geometry;
}
