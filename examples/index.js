import * as Primitives from "../index.js";

import concatTypedArray from "concat-typed-array";
import AsyncPreloader from "async-preloader";
import { PerspectiveCamera, Controls } from "cameras";
import { Pane } from "tweakpane";

import createMesh from "./mesh.js";
import regl from "./context.js";

// Setup
const camera = new PerspectiveCamera({
  fov: Math.PI / 4,
  near: 0.1,
  far: 100,
  viewport: [0, 0, window.innerWidth, window.innerHeight],
});
const controls = new Controls({
  phi: Math.PI / 3,
  theta: Math.PI / 4,
  distance: 14 * (window.innerHeight / window.innerWidth),
  element: regl._gl.canvas,
  camera,
  distanceBounds: [1, 100],
});

const modeOptions = ["texture", "normal", "flat-shaded", "uv"];
const CONFIG = {
  mode: "flat-shaded",
};
const pane = new Pane();
pane.addInput(CONFIG, "mode", {
  options: modeOptions.map((value) => ({
    text: value.toUpperCase(),
    value,
  })),
});

// Events
const onResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
};

// Utils
async function loadTexture(src) {
  const image = await AsyncPreloader.loadImage({ src });

  const texture = regl.texture({
    data: image,
    flipY: true,
    wrap: "repeat",
  });
  texture.resize(image.width, image.height);

  return texture;
}

function computeEdges(positions, cells) {
  const edges = new (Primitives.utils.getCellsTypedArray(positions.length / 3))(
    cells.length * 2
  );

  let cellIndex = 0;

  for (let i = 0; i < cells.length; i += 4) {
    for (let j = 0; j < 4; j++) {
      const a = cells[i + j];
      const b = cells[i + ((j + 1) % 4)];
      edges[cellIndex] = Math.min(a, b);
      edges[cellIndex + 1] = Math.max(a, b);
      cellIndex += 2;
    }
  }
  return edges;
}

// Loop
let meshes = [];

const frame = () => {
  controls.update();
  camera.position = controls.position;
  camera.target = controls.target;
  camera.update();

  regl.clear({
    color: [0, 0, 0, 1],
  });
  meshes.forEach((mesh) => {
    mesh.update(
      camera,
      modeOptions.findIndex((o) => o === CONFIG.mode)
    );
    !mesh.geometry.normals ? mesh.drawLines() : mesh.draw();
  });
};

function frameCatch(frameFunc) {
  const loop = regl.frame((...args) => {
    try {
      frameFunc(...args);
    } catch (err) {
      loop.cancel();
      throw err;
    }
  });
}

(async () => {
  // I don't like performances, just give be the biggest you've got
  // Primitives.utils.setArrayType(Uint32Array);

  // Circle and box are rendered as lines
  const circle = Primitives.circle();
  circle.positions = new Float32Array((circle.positions.length / 2) * 3).map(
    (_, index) =>
      index % 3 === 2 ? 0 : circle.positions[Math.round((index * 2) / 3)]
  );
  circle.cells = concatTypedArray(
    Primitives.utils.getCellsTypedArray(circle.positions.length / 3),
    circle.cells,
    Uint8Array.of(0, circle.cells[circle.cells.length - 1])
  );

  const box = Primitives.box();
  box.cells = computeEdges(box.positions, box.cells);

  const geometries = [
    Primitives.quad(),
    Primitives.plane(),
    Primitives.cube(),
    Primitives.roundedCube(),

    Primitives.cylinder(),
    Primitives.cone(),
    Primitives.cone({ nx: 3 }),
    Primitives.capsule(),

    Primitives.sphere(),
    Primitives.icosphere(),
    Primitives.ellipsoid(),
    Primitives.torus(),

    box,
    circle,
  ];

  console.table(geometries);

  // Create the meshes for rendering
  const material = { colorMap: await loadTexture("examples/uv.jpg") };
  meshes = geometries.map((geometry) => createMesh(geometry, material));

  // Position them
  const offset = 2;
  const gridSize = Math.ceil(Math.sqrt(meshes.length));

  const halfSize = (gridSize - 1) * 0.5;
  meshes.forEach(
    (mesh, index) =>
      (mesh.translation = [
        (index % gridSize) * offset - halfSize * offset,
        0,
        ~~(index / gridSize) * offset - halfSize * offset,
      ])
  );

  onResize();

  // Render
  frameCatch(frame);
})();

window.addEventListener("resize", onResize);
