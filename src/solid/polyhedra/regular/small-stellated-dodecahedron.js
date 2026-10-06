/**
 * @module primitiveGeometry
 * @ignore
 */
import { greatDodecahedronPolygons } from "./great-dodecahedron.js";
import { assembleFaces, computePentagram } from "./pentagram.js";
import { computePolyhedron } from "../../../utils/polyhedron.js";

/**
 * @typedef {object} SmallStellatedDodecahedronPolygonsOptions
 * @property {number} [radius=0.5] Radius of the shared icosahedron vertices
 */

/**
 * Small stellated dodecahedron faces: the great dodecahedron's, as pentagrams.
 *
 * @param {SmallStellatedDodecahedronPolygonsOptions} [options={}]
 * @returns {import("../../../../types.js").PolygonalComplex}
 */
export function smallStellatedDodecahedronPolygons({ radius = 0.5 } = {}) {
  const { positions, cells: pentagons } = greatDodecahedronPolygons({ radius });

  return assembleFaces(positions, pentagons, (points) =>
    computePentagram(points),
  );
}

/**
 * @typedef {object} SmallStellatedDodecahedronOptions
 * @property {number} [radius=0.5]
 * @property {import("../../../../types.js").NonNegativeInteger} [subdivisions=0]
 * @property {import("../../../mappings.js").MappingFn} [mapping=mappings.rectangular]
 */

/**
 * Small stellated dodecahedron.
 *
 * @param {SmallStellatedDodecahedronOptions} [options={}]
 * @returns {import("../../../../types.js").SimplicialComplex}
 */
export function smallStellatedDodecahedron({
  radius = 0.5,
  subdivisions = 0,
  mapping,
} = {}) {
  return computePolyhedron(smallStellatedDodecahedronPolygons({ radius }), {
    radius,
    subdivisions,
    mapping,
  });
}
