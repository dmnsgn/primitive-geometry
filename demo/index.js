const Primitives = require("../");
const AsyncPreloader = require("async-preloader").default;
const createCamera = require("perspective-camera");
const createOrbitControls = require("orbit-controls");
const dat = require("dat.gui");

const createMesh = require("./mesh.js");
const regl = require("./context.js");

// Setup
const camera = createCamera({
  fov: Math.PI / 4,
  near: 0.1,
  far: 100,
  viewport: [0, 0, window.innerWidth, window.innerHeight]
});
const controls = createOrbitControls({
  phi: Math.PI / 3,
  theta: Math.PI / 4,
  distance: 23
});
const meshes = [];

const gui = new dat.GUI({ load: JSON, preset: "test" });
const modeOptions = ["texture", "normal", "uv"];
const options = {
  mode: "texture"
};
gui.add(options, "mode", modeOptions);

// Loop
const frame = ({ viewportWidth, viewportHeight }) => {
  controls.update();
  controls.copyInto(camera.position, camera.direction, camera.up);
  camera.update();

  regl.clear({
    color: [0, 0, 0, 1]
  });
  meshes.forEach(mesh => {
    mesh.update(camera, modeOptions.findIndex(o => o === options.mode));
    mesh.draw();
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

async function loadTexture(src) {
  const image = await AsyncPreloader.loadImage({ src });
  const bitmap = await createImageBitmap(image);

  const texture = regl.texture({ data: bitmap, flipY: false });
  texture.resize(image.width, image.height);

  return texture;
}

(async () => {
  const colorMap = await loadTexture("demo/uv.jpg");

  const material = {
    colorMap
  };

  // Create meshes
  meshes.push(
    createMesh(Primitives.quad(), material),
    createMesh(Primitives.plane(), material),
    createMesh(Primitives.cube(), material),
    createMesh(Primitives.roundedCube(1, 1, 1, 8, 8, 8, 0.2), material),
    createMesh(Primitives.capsule(), material),
    createMesh(Primitives.sphere(), material),
    createMesh(Primitives.icosphere(), material),
    createMesh(Primitives.ellipsoid(), material),
    createMesh(Primitives.torus(), material),
    createMesh(Primitives.cylinder(), material)
  );

  // Position them
  const offset = 4;
  const gridSize = 3;
  meshes.forEach(
    (mesh, index) =>
      (mesh.translation = [
        (index % gridSize) * offset,
        5,
        ~~(index / gridSize) * offset
      ])
  );

  // Render
  frameCatch(frame);
})();

window.addEventListener("resize", () => {
  camera.viewport = [0, 0, window.innerWidth, window.innerHeight];
});
