import * as Primitives from "../index.js";

import { modeOptions, setGeometries } from "./render.js";

// Utils
function computeEdges(positions, cells, stride = 3) {
  const edges = new (Primitives.utils.getCellsTypedArray(positions.length / 3))(
    cells.length * 2
  );

  let cellIndex = 0;

  for (let i = 0; i < cells.length; i += stride) {
    for (let j = 0; j < stride; j++) {
      const a = cells[i + j];
      const b = cells[i + ((j + 1) % stride)];
      edges[cellIndex] = Math.min(a, b);
      edges[cellIndex + 1] = Math.max(a, b);
      cellIndex += 2;
    }
  }
  return edges;
}

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
const geometries = [
  box,
  circle,
  quadsPlane,
  Primitives.quad(),
  Primitives.plane(),
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

const params = new URLSearchParams(window.location.search);
if (params.has("screenshot")) {
  window.screenshotItems = [...modeOptions, "bbox"];
  window.dispatchEvent(new CustomEvent("screenshot"));
}
