import * as Primitives from "../index.js";

import { modeOptions, setGeometries } from "./render.js";

const params = new URLSearchParams(window.location.search);

// I don't like performances, just give me the biggest you've got
// Primitives.utils.setTypedArrayType(Uint32Array);

const named = (name, geometry) => Object.assign(geometry, { name });

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
      named("rectanglePath", Primitives.rectanglePath()),
      named("squarePath", Primitives.squarePath()),
      named("circlePath", Primitives.circlePath()),
      null,
      named("quadGrid", Primitives.quadGrid()),
      named("triangularGrid", Primitives.triangularGrid()),
      named("hexagonalGrid", Primitives.hexagonalGrid()),
      null,
      named("quad", Primitives.quad()),
      named("plane", Primitives.plane()),
      named("roundedRectangle", Primitives.roundedRectangle()),
      named("stadium", Primitives.stadium()),
      named("kite", Primitives.kite()),
      named("rhombus", Primitives.rhombus()),
      named("lozenge", Primitives.lozenge()),
      null,
      named("arbelos", Primitives.arbelos()),
      named("lens", Primitives.lens()),
      named("lune", Primitives.lune()),
      named("salinon", Primitives.salinon()),
      named("triquetra", Primitives.triquetra()),
      named("yinYang", Primitives.yinYang()),
      null,
      named("ellipse", Primitives.ellipse()),
      named("disc", Primitives.disc()),
      named("superellipse", Primitives.superellipse()),
      named("squircle", Primitives.squircle()),
      named("annulus", Primitives.annulus()),
      null,
      named("polygon", Primitives.polygon()),
      named("reuleaux", Primitives.reuleaux()),
      named("star", Primitives.star()),
      named("cross", Primitives.cross()),
      null,
      [
        named("cube", Primitives.cube()),
        named("cubeFaces", Primitives.cubeFaces()),
      ],
      named("roundedCube", Primitives.roundedCube()),
      null,
      null,
      named("sphere", Primitives.sphere()),
      named("icosphere", Primitives.icosphere()),
      named("ellipsoid", Primitives.ellipsoid()),
      null,
      named("cylinder", Primitives.cylinder()),
      named("cone", Primitives.cone()),
      named("bicone", Primitives.bicone()),
      named("doubleCone", Primitives.doubleCone()),
      named("capsule", Primitives.capsule()),
      named("torus", Primitives.torus()),
      null,
      [
        named("tetrahedron", Primitives.tetrahedron()),
        named("tetrahedronFaces", Primitives.tetrahedronFaces()),
      ],
      [
        named("hexahedron", Primitives.hexahedron()),
        named("hexahedronFaces", Primitives.hexahedronFaces()),
      ],
      [
        named("octahedron", Primitives.octahedron()),
        named("octahedronFaces", Primitives.octahedronFaces()),
      ],
      [
        named("dodecahedron", Primitives.dodecahedron()),
        named("dodecahedronFaces", Primitives.dodecahedronFaces()),
      ],
      [
        named("icosahedron", Primitives.icosahedron()),
        named("icosahedronFaces", Primitives.icosahedronFaces()),
      ],
      null,
      named("tetrasphere", Primitives.tetrasphere()),
      named("hexasphere", Primitives.hexasphere()),
      named("octasphere", Primitives.octasphere()),
      named("dodecasphere", Primitives.dodecasphere()),
      named("icosphere", Primitives.icosphere()),
      null,
      [
        named("greatDodecahedron", Primitives.greatDodecahedron()),
        named("greatDodecahedronFaces", Primitives.greatDodecahedronFaces()),
      ],
      [
        named("greatIcosahedron", Primitives.greatIcosahedron()),
        named("greatIcosahedronFaces", Primitives.greatIcosahedronFaces()),
      ],
      [
        named(
          "smallStellatedDodecahedron",
          Primitives.smallStellatedDodecahedron(),
        ),
        named(
          "smallStellatedDodecahedronFaces",
          Primitives.smallStellatedDodecahedronFaces(),
        ),
      ],
      [
        named(
          "greatStellatedDodecahedron",
          Primitives.greatStellatedDodecahedron(),
        ),
        named(
          "greatStellatedDodecahedronFaces",
          Primitives.greatStellatedDodecahedronFaces(),
        ),
      ],
    ];

setGeometries(geometries);

if (params.has("screenshot")) {
  window.screenshotItems = [...modeOptions, "bbox"];
  window.dispatchEvent(new CustomEvent("screenshot"));
}
