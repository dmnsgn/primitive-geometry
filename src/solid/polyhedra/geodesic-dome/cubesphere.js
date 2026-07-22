/** @module cubesphere */
import polyhedron from "../polyhedron.js";
import { checkArguments } from "../../../utils.js";

/**
 * @typedef {object} CubesphereOptions
 * @property {number} [radius=0.5]
 * @property {number} [subdivisions=2]
 * @property {"gnomonic"|"spherical"} [projection="gnomonic"]
 * @property {Function} [mapping=mappings.spherical]
 */

/**
 * A geodesic sphere built by radially projecting and welding a subdivided
 * cube - an alternative to icosphere's topology, with cubemap-friendly UVs.
 * @alias module:cubesphere
 * @param {CubesphereOptions} [options={}]
 * @returns {import("../../../../types.js").SimplicialComplex}
 */
function cubesphere({
  radius = 0.5,
  subdivisions = 2,
  projection,
  mapping,
} = {}) {
  checkArguments(arguments);

  // prettier-ignore
  const positions = Float32Array.of(
    -radius, -radius, -radius,
    radius, -radius, -radius,
    radius, radius, -radius,
    -radius, radius, -radius,
    -radius, -radius, radius,
    radius, -radius, radius,
    radius, radius, radius,
    -radius, radius, radius,
  );
  const cells = [
    [0, 3, 2, 1],
    [4, 5, 6, 7],
    [0, 4, 7, 3],
    [1, 2, 6, 5],
    [0, 1, 5, 4],
    [3, 7, 6, 2],
  ];

  return polyhedron(
    { positions, cells },
    { radius, subdivisions, project: true, projection, mapping },
  );
}

export default cubesphere;
