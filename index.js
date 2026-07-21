/**
 * Re-export all geometries, UV mappings functions and utils.
 * @module index
 */

export { default as box } from "./src/box.js";
export { default as circle } from "./src/circle.js";

export { default as quad } from "./src/quad.js";
export { default as plane } from "./src/plane.js";
export { default as roundedRectangle } from "./src/rounded-rectangle.js";
export { default as stadium } from "./src/stadium.js";

export { default as ellipse } from "./src/ellipse.js";
export { default as disc } from "./src/disc.js";
export { default as superellipse } from "./src/superellipse.js";
export { default as squircle } from "./src/squircle.js";
export { default as annulus } from "./src/annulus.js";
export { default as reuleux } from "./src/reuleux.js";

export { default as cube } from "./src/cube.js";
export { default as roundedCube } from "./src/rounded-cube.js";

export { default as sphere } from "./src/sphere.js";
export { default as ellipsoid } from "./src/ellipsoid.js";

export { default as cylinder } from "./src/cylinder.js";
export { default as cone } from "./src/cone.js";
export { default as capsule } from "./src/capsule.js";
export { default as torus } from "./src/torus.js";

export { default as tetrahedron } from "./src/polyhedra/regular/tetrahedron.js";
export { default as octahedron } from "./src/polyhedra/regular/octahedron.js";
export { default as dodecahedron } from "./src/polyhedra/regular/dodecahedron.js";
export { default as icosahedron } from "./src/polyhedra/regular/icosahedron.js";

export { default as greatDodecahedron } from "./src/polyhedra/regular/great-dodecahedron.js";
export { default as greatIcosahedron } from "./src/polyhedra/regular/great-icosahedron.js";
export { default as smallStellatedDodecahedron } from "./src/polyhedra/regular/small-stellated-dodecahedron.js";
export { default as greatStellatedDodecahedron } from "./src/polyhedra/regular/great-stellated-dodecahedron.js";

export { default as tetrasphere } from "./src/polyhedra/geodesic-dome/tetrasphere.js";
export { default as cubesphere } from "./src/polyhedra/geodesic-dome/cubesphere.js";
export { default as octasphere } from "./src/polyhedra/geodesic-dome/octasphere.js";
export { default as dodecasphere } from "./src/polyhedra/geodesic-dome/dodecasphere.js";
export { default as icosphere } from "./src/polyhedra/geodesic-dome/icosphere.js";

export * as mappings from "./src/mappings.js";

export * as utils from "./src/utils.js";
