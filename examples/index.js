import * as Primitives from "../index.js";

import { modeOptions, setGeometries } from "./render.js";

const params = new URLSearchParams(location.search);

// I don't like performances, just give me the biggest you've got
// Primitives.utils.setTypedArrayType(Uint32Array);

const named = (name, geometry) => Object.assign(geometry, { name });

const geometries = params.has("geometry")
  ? [
      params
        .get("geometry")
        .split(",")
        .map(
          (geometry) =>
            Primitives[geometry] && named(geometry, Primitives[geometry]({theta: Math.PI,thetaOffset: Math.PI/2})),
        )
        .filter(Boolean),
    ]
  : [
      // Plane
      [
        named("quadGrid", Primitives.quadGrid()),
        named("triangularGrid", Primitives.triangularGrid()),
        named("hexagonalGrid", Primitives.hexagonalGrid()),
        null,
        [
          named("triangle", Primitives.triangle()),
          named("trianglePath", Primitives.trianglePath()),
        ],
        [
          named("rightTriangle", Primitives.rightTriangle()),
          named("rightTrianglePath", Primitives.rightTrianglePath()),
        ],
        null,
        [
          named("quad", Primitives.quad()),
          named("squarePath", Primitives.squarePath()),
        ],
        [
          named("plane", Primitives.plane()),
          named("rectanglePath", Primitives.rectanglePath()),
        ],
        [
          named("roundedRectangle", Primitives.roundedRectangle()),
          named("roundedRectanglePath", Primitives.roundedRectanglePath()),
        ],
        [
          named("stadium", Primitives.stadium()),
          named("stadiumPath", Primitives.stadiumPath()),
        ],
        null,
        [
          named("kite", Primitives.kite()),
          named("kitePath", Primitives.kitePath()),
        ],
        [
          named("rhombus", Primitives.rhombus()),
          named("rhombusPath", Primitives.rhombusPath()),
        ],
        [
          named("lozenge", Primitives.lozenge()),
          named("lozengePath", Primitives.lozengePath()),
        ],
        [
          named("trapezoid", Primitives.trapezoid()),
          named("trapezoidPath", Primitives.trapezoidPath()),
        ],
        [
          named("parallelogram", Primitives.parallelogram()),
          named("parallelogramPath", Primitives.parallelogramPath()),
        ],
        null,
        named("arbelos", Primitives.arbelos()),
        named("lens", Primitives.lens()),
        named("lune", Primitives.lune()),
        named("salinon", Primitives.salinon()),
        named("triquetra", Primitives.triquetra()),
        named("yinYang", Primitives.yinYang()),
        null,
        [
          named("ellipse", Primitives.ellipse()),
          named("ellipsePath", Primitives.ellipsePath()),
        ],
        [
          named("disc", Primitives.disc()),
          named("circlePath", Primitives.circlePath()),
        ],
        [
          named("superellipse", Primitives.superellipse()),
          named("superellipsePath", Primitives.superellipsePath()),
        ],
        [
          named("squircle", Primitives.squircle()),
          named("squirclePath", Primitives.squirclePath()),
        ],
        [
          named("astroid", Primitives.astroid()),
          named("astroidPath", Primitives.astroidPath()),
        ],
        [
          named("annulus", Primitives.annulus()),
          named("annulusPath", Primitives.annulusPath()),
        ],
        null,
        [
          named("polygon", Primitives.polygon()),
          named("polygonPath", Primitives.polygonPath()),
        ],
        [
          named("reuleaux", Primitives.reuleaux()),
          named("reuleauxPath", Primitives.reuleauxPath()),
        ],
        [
          named("star", Primitives.star()),
          named("starPath", Primitives.starPath()),
        ],
        [
          named("cross", Primitives.cross()),
          named("crossPath", Primitives.crossPath()),
        ],
      ],
      // Solid
      [
        [
          named("cube", Primitives.cube()),
          named("cubeFaces", Primitives.cubeFaces()),
        ],
        named("hollowCube", Primitives.hollowCube()),
        named("roundedCube", Primitives.roundedCube()),
        null,
        null,
        named("sphere", Primitives.sphere()),
        named("hollowSphere", Primitives.hollowSphere()),
        named("ellipsoid", Primitives.ellipsoid()),
        named("superellipsoid", Primitives.superellipsoid()),
        named("astroidalEllipsoid", Primitives.astroidalEllipsoid()),
        named("superegg", Primitives.superegg()),
        null,
        named("cylinder", Primitives.cylinder()),
        named("hollowCylinder", Primitives.hollowCylinder()),
        named("roundedCylinder", Primitives.roundedCylinder()),
        null,
        named("cone", Primitives.cone()),
        named("bicone", Primitives.bicone()),
        named("sphericon", Primitives.sphericon()),
        named("doubleCone", Primitives.doubleCone()),
        named("capsule", Primitives.capsule()),
        null,
        named("torus", Primitives.torus()),
        named("apple", Primitives.apple()),
        named("lemon", Primitives.lemon()),
        named("sphericalRing", Primitives.sphericalRing()),
        null,
        named("prism", Primitives.prism()),
        named("antiprism", Primitives.antiprism()),
        null,
        named("barrel", Primitives.barrel()),
        named("hyperboloid", Primitives.hyperboloid()),
        named("paraboloid", Primitives.paraboloid()),
        named("funnel", Primitives.funnel()),
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
      ],
    ];

setGeometries(geometries);

if (params.has("screenshot")) {
  if (params.has("geometry")) {
    document.querySelector("h1").textContent = params.get("geometry");
    globalThis.screenshotItems = Object.keys(Primitives).filter(
      (entry) => !["utils", "mappings"].includes(entry),
    );
  } else {
    document.querySelector("h1").style.display = "none";
    globalThis.screenshotItems = [...modeOptions, "bbox"];
  }
  globalThis.dispatchEvent(new CustomEvent("screenshot"));
}
