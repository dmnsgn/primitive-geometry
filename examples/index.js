import * as Primitives from "../index.js";

import { modeOptions, setGeometries, computeEdges } from "./render.js";

const params = new URLSearchParams(window.location.search);

// I don't like performances, just give me the biggest you've got
// Primitives.utils.setTypedArrayType(Uint32Array);

const named = (name, geometry) => Object.assign(geometry, { name });

const quadsPlane = named(
  "plane (quads)",
  Primitives.plane({ nx: 10, quads: true }),
);
quadsPlane.edges = computeEdges(quadsPlane.positions, quadsPlane.cells, {
  stride: 4,
});
quadsPlane.quads = true;

const geometries = params.has("geometry")
  ? params
      .get("geometry")
      .split(",")
      .map(
        (geometry) =>
          Primitives[geometry] && named(geometry, Primitives[geometry]()),
      )
      .filter(Boolean)
  : [
      named("square", Primitives.square()),
      named("rectangle", Primitives.rectangle()),
      named("circle", Primitives.circle()),
      quadsPlane, // -> grid
      null,
      named("plane", Primitives.plane()),
      named("roundedRectangle", Primitives.roundedRectangle()),
      named("stadium", Primitives.stadium()),
      null,
      named("ellipse", Primitives.ellipse()),
      named("disc", Primitives.disc()),
      named("superellipse", Primitives.superellipse()),
      named("squircle", Primitives.squircle()),
      named("annulus", Primitives.annulus()),
      named("reuleaux", Primitives.reuleaux()),
      named("star", Primitives.star()),
      null,
      named("cube", Primitives.cube()),
      named("roundedCube", Primitives.roundedCube()),
      null,
      named("cubeFaces", Primitives.cubeFaces()),
      null,
      named("sphere", Primitives.sphere()),
      named("icosphere", Primitives.icosphere()),
      named("ellipsoid", Primitives.ellipsoid()),
      null,
      named("cylinder", Primitives.cylinder()),
      named("cone", Primitives.cone()),
      named("capsule", Primitives.capsule()),
      named("torus", Primitives.torus()),
      null,
      named("tetrahedron", Primitives.tetrahedron()),
      named("hexahedron", Primitives.hexahedron()),
      named("octahedron", Primitives.octahedron()),
      named("dodecahedron", Primitives.dodecahedron()),
      named("icosahedron", Primitives.icosahedron()),
      null,
      named("tetrahedronFaces", Primitives.tetrahedronFaces()),
      named("hexahedronFaces", Primitives.hexahedronFaces()),
      named("octahedronFaces", Primitives.octahedronFaces()),
      named("dodecahedronFaces", Primitives.dodecahedronFaces()),
      named("icosahedronFaces", Primitives.icosahedronFaces()),
      null,
      named("tetrasphere", Primitives.tetrasphere()),
      named("cubesphere", Primitives.cubesphere()),
      named("octasphere", Primitives.octasphere()),
      named("dodecasphere", Primitives.dodecasphere()),
      named("icosphere", Primitives.icosphere()),
      null,
      named("greatDodecahedron", Primitives.greatDodecahedron()),
      named("greatIcosahedron", Primitives.greatIcosahedron()),
      named(
        "smallStellatedDodecahedron",
        Primitives.smallStellatedDodecahedron(),
      ),
      named(
        "greatStellatedDodecahedron",
        Primitives.greatStellatedDodecahedron(),
      ),
      null,
      named("greatDodecahedronFaces", Primitives.greatDodecahedronFaces()),
      named("greatIcosahedronFaces", Primitives.greatIcosahedronFaces()),
      named(
        "smallStellatedDodecahedronFaces",
        Primitives.smallStellatedDodecahedronFaces(),
      ),
      named(
        "greatStellatedDodecahedronFaces",
        Primitives.greatStellatedDodecahedronFaces(),
      ),
    ];

setGeometries(geometries);

if (params.has("screenshot")) {
  window.screenshotItems = [...modeOptions, "bbox"];
  window.dispatchEvent(new CustomEvent("screenshot"));
}
