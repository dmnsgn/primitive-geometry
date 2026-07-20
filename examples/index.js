import * as Primitives from "../index.js";

import { modeOptions, setGeometries, computeEdges } from "./render.js";

const params = new URLSearchParams(window.location.search);

// I don't like performances, just give me the biggest you've got
// Primitives.utils.setTypedArrayType(Uint32Array);

const named = (name, geometry) => Object.assign(geometry, { name });

const box = named("box", Primitives.box());
box.edges = computeEdges(box.positions, box.cells, 4);

const quadsPlane = named(
  "plane (quads)",
  Primitives.plane({ nx: 10, quads: true }),
);
quadsPlane.edges = computeEdges(quadsPlane.positions, quadsPlane.cells, 4);
quadsPlane.quads = true;

const circle = named("circle", Primitives.circle({ closed: true }));
circle.edges = circle.cells;

// Box and plane of quads are rendered as lines
const geometries =
  params.has("geometry") && Primitives[params.get("geometry")]
    ? [named(params.get("geometry"), Primitives[params.get("geometry")]())]
    : [
        box,
        circle,
        quadsPlane,
        named("quad", Primitives.quad()),
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
        named("reuleux", Primitives.reuleux()),
        null,
        named("cube", Primitives.cube()),
        named("roundedCube", Primitives.roundedCube()),
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
        named("icosahedron", Primitives.icosahedron()),
      ];

setGeometries(geometries);

if (params.has("screenshot")) {
  window.screenshotItems = [...modeOptions, "bbox"];
  window.dispatchEvent(new CustomEvent("screenshot"));
}
