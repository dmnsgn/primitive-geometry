/**
 * @module primitiveGeometry
 * @ignore
 */
import { dodecahedronPolygons } from "./dodecahedron.js";
import {
  assembleFaces,
  computeStarLayer,
  PENTAGRAM_RATIO,
} from "./pentagram.js";
import { computePolyhedron } from "../../../utils/polyhedron.js";
import { PHI } from "../../../utils/common.js";

/**
 * @typedef {object} GreatStellatedDodecahedronPolygonsOptions
 * @property {number} [radius=0.5] Circumradius.
 */

/**
 * Great stellated dodecahedron faces: the dodecahedron's outermost stellation.
 *
 * @param {GreatStellatedDodecahedronPolygonsOptions} [options={}]
 * @returns {import("../../../../types.js").PolygonalComplex}
 */
export function greatStellatedDodecahedronPolygons({ radius = 0.5 } = {}) {
  // The tips, not the dodecahedron's own vertices, are the outermost extent
  const { positions, cells: pentagons } = dodecahedronPolygons({
    radius: radius / PHI ** 3,
  });

  return assembleFaces(positions, pentagons, (vertices) => {
    const tips = vertices.map((v) => v.map((x) => x * PHI ** 3));

    // Depth-1 ring at phi^2 (1 / PENTAGRAM_RATIO), this face's notches
    const notches = computeStarLayer(vertices, 1 / PENTAGRAM_RATIO);

    // Tip i is flanked by notch i (between vertex i and i + 1) and notch
    // i - 1 (between vertex i - 1 and i)
    const cells = [];
    for (let i = 0; i < 5; i++) {
      cells.push([i, 5 + ((i + 4) % 5), 5 + i]);
    }
    cells.push([5, 6, 7], [5, 7, 8], [5, 8, 9]);

    return { positions: [...tips, ...notches], cells };
  });
}

/**
 * @typedef {object} GreatStellatedDodecahedronOptions
 * @property {number} [radius=0.5] Circumradius.
 * @property {import("../../../../types.js").NonNegativeInteger} [subdivisions=0]
 * @property {import("../../../mappings.js").MappingFn} [mapping=mappings.rectangular]
 */

/**
 * Great stellated dodecahedron.
 *
 * @param {GreatStellatedDodecahedronOptions} [options={}]
 * @returns {import("../../../../types.js").SimplicialComplex}
 */
export function greatStellatedDodecahedron({
  radius = 0.5,
  subdivisions = 0,
  mapping,
} = {}) {
  return computePolyhedron(greatStellatedDodecahedronPolygons({ radius }), {
    radius,
    subdivisions,
    mapping,
  });
}
