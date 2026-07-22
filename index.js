/**
 * Re-export all geometries, UV mappings functions and utils.
 * @module index
 */

export { default as box } from "./src/solid/cuboid/box.js";
export { default as circle } from "./src/plane/circular/circle.js";

export { default as quad } from "./src/plane/quadrilateral/quad.js";
export { default as plane } from "./src/plane/quadrilateral/plane.js";
export { default as roundedRectangle } from "./src/plane/quadrilateral/rounded-rectangle.js";
export { default as stadium } from "./src/plane/quadrilateral/stadium.js";

export { default as ellipse } from "./src/plane/circular/ellipse.js";
export { default as disc } from "./src/plane/circular/disc.js";
export { default as superellipse } from "./src/plane/circular/superellipse.js";
export { default as squircle } from "./src/plane/circular/squircle.js";
export { default as annulus } from "./src/plane/circular/annulus.js";
export { default as reuleux } from "./src/plane/reuleux.js";
export { default as star } from "./src/plane/star.js";

export { default as cube } from "./src/solid/cuboid/cube.js";
export { default as roundedCube } from "./src/solid/cuboid/rounded-cube.js";

export { default as sphere } from "./src/solid/revolution/sphere.js";
export { default as ellipsoid } from "./src/solid/revolution/ellipsoid.js";

export { default as cylinder } from "./src/solid/revolution/cylinder.js";
export { default as cone } from "./src/solid/revolution/cone.js";
export { default as capsule } from "./src/solid/revolution/capsule.js";
export { default as torus } from "./src/solid/revolution/torus.js";

export { default as tetrahedron } from "./src/solid/polyhedra/regular/tetrahedron.js";
export { default as octahedron } from "./src/solid/polyhedra/regular/octahedron.js";
export { default as dodecahedron } from "./src/solid/polyhedra/regular/dodecahedron.js";
export { default as icosahedron } from "./src/solid/polyhedra/regular/icosahedron.js";

export { default as greatDodecahedron } from "./src/solid/polyhedra/regular/great-dodecahedron.js";
export { default as greatIcosahedron } from "./src/solid/polyhedra/regular/great-icosahedron.js";
export { default as smallStellatedDodecahedron } from "./src/solid/polyhedra/regular/small-stellated-dodecahedron.js";
export { default as greatStellatedDodecahedron } from "./src/solid/polyhedra/regular/great-stellated-dodecahedron.js";

export { default as tetrasphere } from "./src/solid/polyhedra/geodesic-dome/tetrasphere.js";
export { default as cubesphere } from "./src/solid/polyhedra/geodesic-dome/cubesphere.js";
export { default as octasphere } from "./src/solid/polyhedra/geodesic-dome/octasphere.js";
export { default as dodecasphere } from "./src/solid/polyhedra/geodesic-dome/dodecasphere.js";
export { default as icosphere } from "./src/solid/polyhedra/geodesic-dome/icosphere.js";

export * as mappings from "./src/mappings.js";

export * as utils from "./src/utils.js";
