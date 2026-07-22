/** @module greatStellatedDodecahedron */
import { dodecahedronFaces } from "./dodecahedron.js";
import {
  assembleFaces,
  computeStarLayer,
  PENTAGRAM_RATIO,
} from "./pentagram.js";
import { polyhedron } from "../polyhedron.js";
import { PHI, checkArguments } from "../../../utils.js";

/**
 * @typedef {object} GreatStellatedDodecahedronFacesOptions
 * @property {number} [radius=0.5] Radius the star's tips touch (box half-extent)
 */

/**
 * Great stellated dodecahedron: the 3rd (outermost) stellation of the
 * dodecahedron. Each face's 5 edges, extended within its own plane, first
 * cross at a "depth 1" ring (exactly the icosahedron's vertex positions -
 * this is small stellated dodecahedron's own tips) before crossing a second,
 * further ring at "depth 2" - the true tips here. Depth 2 is a plain radial
 * scale of the dodecahedron's own vertices by `phi^3`. Each tip is flanked
 * by the two depth-1 points nearest it, not by the dodecahedron's own
 * (unstellated) vertices; adjacent faces' shared depth-1 points are welded
 * by assembleFaces.
 * @param {GreatStellatedDodecahedronFacesOptions} [options={}]
 * @returns {import("../../../../types.js").SimplicialComplexPolygon}
 */
export function greatStellatedDodecahedronFaces({ radius = 0.5 } = {}) {
  checkArguments(arguments);

  // The tips, not the dodecahedron's own vertices, are the outermost extent
  const { positions, cells: pentagons } = dodecahedronFaces({
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
 * @property {number} [radius=0.5]
 * @property {number} [subdivisions=0] Barycentric grid subdivisions per triangle
 * @property {Function} [mapping=mappings.rectangular]
 */

/**
 * @alias module:greatStellatedDodecahedron
 * @param {GreatStellatedDodecahedronOptions} [options={}]
 * @returns {import("../../../../types.js").SimplicialComplex}
 */
export function greatStellatedDodecahedron({
  radius = 0.5,
  subdivisions = 0,
  mapping,
} = {}) {
  checkArguments(arguments);

  return polyhedron(greatStellatedDodecahedronFaces({ radius }), {
    radius,
    subdivisions,
    mapping,
  });
}
