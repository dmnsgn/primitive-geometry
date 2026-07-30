/**
 * Re-export all geometries, UV mappings functions and utils.
 * @module index
 */

// Plane
export { quadGrid } from "./src/plane/grid/quad-grid.js";
export { triangularGrid } from "./src/plane/grid/triangular-grid.js";
export { hexagonalGrid } from "./src/plane/grid/hexagonal-grid.js";

export { triangle, trianglePath } from "./src/plane/triangular/triangle.js";
export {
  rightTriangle,
  rightTrianglePath,
} from "./src/plane/triangular/right-triangle.js";

export { quad, squarePath } from "./src/plane/quadrilateral/quad.js";
export { plane, rectanglePath } from "./src/plane/quadrilateral/plane.js";
export {
  roundedRectangle,
  roundedRectanglePath,
} from "./src/plane/quadrilateral/rounded-rectangle.js";
export { stadium, stadiumPath } from "./src/plane/quadrilateral/stadium.js";

export { kite, kitePath } from "./src/plane/quadrilateral/kite.js";
export { rhombus, rhombusPath } from "./src/plane/quadrilateral/rhombus.js";
export { lozenge, lozengePath } from "./src/plane/quadrilateral/lozenge.js";
export {
  trapezoid,
  trapezoidPath,
} from "./src/plane/quadrilateral/trapezoid.js";
export {
  parallelogram,
  parallelogramPath,
} from "./src/plane/quadrilateral/parallelogram.js";

export { arbelos } from "./src/plane/arc/arbelos.js";
export { lens } from "./src/plane/arc/lens.js";
export { lune } from "./src/plane/arc/lune.js";
export { salinon } from "./src/plane/arc/salinon.js";
export { triquetra } from "./src/plane/arc/triquetra.js";
export { yinYang } from "./src/plane/arc/yin-yang.js";

export { ellipse, ellipsePath } from "./src/plane/circular/ellipse.js";
export { disc, circlePath } from "./src/plane/circular/disc.js";
export {
  superellipse,
  superellipsePath,
} from "./src/plane/circular/superellipse.js";
export { squircle, squirclePath } from "./src/plane/circular/squircle.js";
export { astroid, astroidPath } from "./src/plane/circular/astroid.js";
export { annulus, annulusPath } from "./src/plane/circular/annulus.js";

export { polygon, polygonPath } from "./src/plane/polygon.js";
export { reuleaux, reuleauxPath } from "./src/plane/reuleaux.js";
export { star, starPath } from "./src/plane/star.js";
export { cross, crossPath } from "./src/plane/cross.js";

// Solid
export { cube, cubeFaces, box } from "./src/solid/cuboid/cube.js";
export { hollowCube } from "./src/solid/cuboid/hollow-cube.js";
export { roundedCube } from "./src/solid/cuboid/rounded-cube.js";

export { sphere } from "./src/solid/revolution/sphere.js";
export { hollowSphere } from "./src/solid/revolution/hollow-sphere.js";
export { ellipsoid } from "./src/solid/revolution/ellipsoid.js";
export { superellipsoid } from "./src/solid/revolution/superellipsoid.js";
export { astroidalEllipsoid } from "./src/solid/revolution/astroidal-ellipsoid.js";
export { superegg } from "./src/solid/revolution/superegg.js";

export { cylinder } from "./src/solid/revolution/cylinder.js";
export { hollowCylinder } from "./src/solid/revolution/hollow-cylinder.js";
export { roundedCylinder } from "./src/solid/revolution/rounded-cylinder.js";

export { cone } from "./src/solid/revolution/cone.js";
export { bicone } from "./src/solid/revolution/bicone.js";
export { sphericon } from "./src/solid/revolution/sphericon.js";
export { doubleCone } from "./src/solid/revolution/double-cone.js";
export { capsule } from "./src/solid/revolution/capsule.js";

export { torus } from "./src/solid/revolution/torus.js";
export { apple } from "./src/solid/revolution/apple.js";
export { lemon } from "./src/solid/revolution/lemon.js";
export { sphericalRing } from "./src/solid/revolution/spherical-ring.js";

export { prism } from "./src/solid/prism/prism.js";
export { antiprism } from "./src/solid/prism/antiprism.js";

export { paraboloid } from "./src/solid/revolution/paraboloid.js";
export { hyperboloid } from "./src/solid/revolution/hyperboloid.js";
export { barrel } from "./src/solid/revolution/barrel.js";
export { funnel } from "./src/solid/revolution/funnel.js";

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

// Utils
export * as mappings from "./src/mappings.js";

export * as utils from "./src/utils.js";
