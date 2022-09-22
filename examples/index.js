import * as Primitives from "../index.js";

import { modeOptions, setGeometries, computeEdges } from "./render.js";

const params = new URLSearchParams(window.location.search);

// I don't like performances, just give me the biggest you've got
// Primitives.utils.setTypedArrayType(Uint32Array);

const box = Primitives.box();
box.edges = computeEdges(box.positions, box.cells, 4);

const quadsPlane = Primitives.plane({ nx: 10, quads: true });
quadsPlane.edges = computeEdges(quadsPlane.positions, quadsPlane.cells, 4);
quadsPlane.quads = true;

const circle = Primitives.circle({ closed: true });
circle.positions = new Float32Array((circle.positions.length / 2) * 3).map(
  (_, index) =>
    index % 3 === 2 ? 0 : circle.positions[Math.round((index * 2) / 3)]
);
circle.edges = circle.cells;

// Circle and box are rendered as lines
const geometries =
  params.has("geometry") && Primitives[params.get("geometry")]
    ? [Primitives[params.get("geometry")]()]
    : [
        box,
        circle,
        quadsPlane,
        Primitives.quad(),
        null,
        Primitives.plane(),
        Primitives.roundedRectangle(),
        Primitives.stadium(),
        null,
        Primitives.ellipse(),
        Primitives.disc(),
        Primitives.superellipse(),
        Primitives.squircle(),
        Primitives.annulus(),
        Primitives.reuleux(),
        null,
        Primitives.cube(),
        Primitives.roundedCube(),
        null,
        Primitives.sphere(),
        Primitives.icosphere(),
        Primitives.ellipsoid(),
        null,
        Primitives.cylinder(),
        Primitives.cone(),
        Primitives.capsule(),
        Primitives.torus(),
        null,
        Primitives.tetrahedron(),
        Primitives.icosahedron(),
      ];

setGeometries(geometries);

if (params.has("screenshot")) {
  window.screenshotItems = [...modeOptions, "bbox"];
  window.dispatchEvent(new CustomEvent("screenshot"));
}
