/** @module dodecasphere */
import polyhedron from "../polyhedron.js";
import { computeDodecahedron } from "../regular/dodecahedron.js";
import { checkArguments } from "../../utils.js";

/**
 * @typedef {object} DodecasphereOptions
 * @property {number} [radius=0.5]
 * @property {number} [subdivisions=2]
 * @property {"gnomonic"|"spherical"} [projection="gnomonic"]
 * @property {Function} [mapping=mappings.spherical]
 */

/**
 * A geodesic sphere built by radially projecting and welding a subdivided dodecahedron
 * @alias module:dodecasphere
 * @param {DodecasphereOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 */
function dodecasphere({
  radius = 0.5,
  subdivisions = 2,
  projection,
  mapping,
} = {}) {
  checkArguments(arguments);

  return polyhedron(computeDodecahedron(radius), {
    radius,
    subdivisions,
    project: true,
    projection,
    mapping,
  });
}

export default dodecasphere;
