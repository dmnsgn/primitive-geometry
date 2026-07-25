/**
 * Re-export all geometries, UV mappings functions and utils.
 * @module index
 */

export { rectanglePath } from "./src/plane/quadrilateral/rectangle-path.js";
export { squarePath } from "./src/plane/quadrilateral/square-path.js";
export { circlePath } from "./src/plane/circular/circle-path.js";

export { quadGrid } from "./src/plane/grid/quad-grid.js";
export { triangularGrid } from "./src/plane/grid/triangular-grid.js";
export { hexagonalGrid } from "./src/plane/grid/hexagonal-grid.js";

export { quad } from "./src/plane/quadrilateral/quad.js";
export { plane } from "./src/plane/quadrilateral/plane.js";
export { roundedRectangle } from "./src/plane/quadrilateral/rounded-rectangle.js";
export { stadium } from "./src/plane/quadrilateral/stadium.js";
export { kite } from "./src/plane/quadrilateral/kite.js";
export { rhombus } from "./src/plane/quadrilateral/rhombus.js";
export { lozenge } from "./src/plane/quadrilateral/lozenge.js";

export { arbelos } from "./src/plane/arc/arbelos.js";
export { lens } from "./src/plane/arc/lens.js";
export { lune } from "./src/plane/arc/lune.js";
export { salinon } from "./src/plane/arc/salinon.js";
export { triquetra } from "./src/plane/arc/triquetra.js";
export { yinYang } from "./src/plane/arc/yin-yang.js";

export { ellipse } from "./src/plane/circular/ellipse.js";
export { disc } from "./src/plane/circular/disc.js";
export { superellipse } from "./src/plane/circular/superellipse.js";
export { squircle } from "./src/plane/circular/squircle.js";
export { annulus } from "./src/plane/circular/annulus.js";

export { polygon } from "./src/plane/polygon.js";
export { reuleaux } from "./src/plane/reuleaux.js";
export { star } from "./src/plane/star.js";
export { cross } from "./src/plane/cross.js";

export { cube, cubeFaces, box } from "./src/solid/cuboid/cube.js";
export { roundedCube } from "./src/solid/cuboid/rounded-cube.js";

export { sphere } from "./src/solid/revolution/sphere.js";
export { ellipsoid } from "./src/solid/revolution/ellipsoid.js";

export { cylinder } from "./src/solid/revolution/cylinder.js";
export { cone } from "./src/solid/revolution/cone.js";
export { capsule } from "./src/solid/revolution/capsule.js";
export { torus } from "./src/solid/revolution/torus.js";

export {
  tetrahedron,
  tetrahedronFaces,
} from "./src/solid/polyhedra/regular/tetrahedron.js";
export {
  hexahedron,
  hexahedronFaces,
} from "./src/solid/polyhedra/regular/hexahedron.js";
export {
  octahedron,
  octahedronFaces,
} from "./src/solid/polyhedra/regular/octahedron.js";
export {
  dodecahedron,
  dodecahedronFaces,
} from "./src/solid/polyhedra/regular/dodecahedron.js";
export {
  icosahedron,
  icosahedronFaces,
} from "./src/solid/polyhedra/regular/icosahedron.js";

export {
  greatDodecahedron,
  greatDodecahedronFaces,
} from "./src/solid/polyhedra/regular/great-dodecahedron.js";
export {
  greatIcosahedron,
  greatIcosahedronFaces,
} from "./src/solid/polyhedra/regular/great-icosahedron.js";
export {
  smallStellatedDodecahedron,
  smallStellatedDodecahedronFaces,
} from "./src/solid/polyhedra/regular/small-stellated-dodecahedron.js";
export {
  greatStellatedDodecahedron,
  greatStellatedDodecahedronFaces,
} from "./src/solid/polyhedra/regular/great-stellated-dodecahedron.js";

export { tetrasphere } from "./src/solid/polyhedra/geodesic-dome/tetrasphere.js";
export { hexasphere } from "./src/solid/polyhedra/geodesic-dome/hexasphere.js";
export { octasphere } from "./src/solid/polyhedra/geodesic-dome/octasphere.js";
export { dodecasphere } from "./src/solid/polyhedra/geodesic-dome/dodecasphere.js";
export { icosphere } from "./src/solid/polyhedra/geodesic-dome/icosphere.js";

export * as mappings from "./src/mappings.js";

export * as utils from "./src/utils.js";
