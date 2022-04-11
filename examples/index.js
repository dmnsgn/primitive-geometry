import * as Primitives from "../index.js";

import { mat3, mat4 } from "gl-matrix";
import createContext from "pex-context";
import { aabb } from "pex-geom";
import AsyncPreloader from "async-preloader";
import { PerspectiveCamera, Controls } from "cameras";
import { Pane } from "tweakpane";

// Setup
const canvas = document.createElement("canvas");
document.querySelector("main").appendChild(canvas);
const ctx = createContext({ canvas, pixelRatio: devicePixelRatio });

const camera = new PerspectiveCamera({
  fov: Math.PI / 6,
  near: 0.1,
  far: 100,
  viewport: [0, 0, window.innerWidth, window.innerHeight],
});
const controls = new Controls({
  phi: Math.PI / 3,
  theta: Math.PI / 4,
  distance: 18 * (window.innerHeight / window.innerWidth),
  element: ctx.gl.canvas,
  camera,
  distanceBounds: [1, 100],
});
controls.updatePosition();
controls.target = [0, -0.5, 0];

// GUI
const modeOptions = ["texture", "normal", "flat-shaded", "uv", "wireframe"];
const CONFIG = { mode: "texture", cycle: false, bbox: false };
const pane = new Pane();
pane.addInput(CONFIG, "mode", {
  options: modeOptions.map((value) => ({
    text: value.toUpperCase(),
    value,
  })),
});
pane.addInput(CONFIG, "cycle");
pane.addInput(CONFIG, "bbox");

setInterval(() => {
  if (CONFIG.cycle) {
    CONFIG.mode =
      modeOptions[
        (modeOptions.findIndex((m) => m === CONFIG.mode) + 1) %
          modeOptions.length
      ];
    pane.refresh();
  }
}, 2000);

// Assets
const colorMap = ctx.texture2D({
  data: await AsyncPreloader.loadImage({ src: "examples/uv.jpg" }),
  flipY: true,
  wrap: ctx.Wrap.Repeat,
});

// Loop
const clearCmd = {
  pass: ctx.pass({
    clearColor: [0, 0, 0, 1],
    clearDepth: 1,
  }),
};

const drawCmd = {
  pipeline: ctx.pipeline({
    depthTest: true,
    frag: /* glsl */ `
#extension GL_OES_standard_derivatives : enable

precision mediump float;

uniform sampler2D uColorMap;
uniform float uMode;

varying vec3 vPositionWorld;
varying vec3 vPositionView;
varying vec3 vNormal;
varying vec2 vUv;

void main () {
  if (uMode == 0.0) gl_FragColor = texture2D(uColorMap, vUv);
  if (uMode == 1.0) gl_FragColor = vec4(vNormal * 0.5 + 0.5, 1.0);
  if (uMode == 2.0) {
    vec3 fdx = vec3(dFdx(vPositionWorld.x), dFdx(vPositionWorld.y), dFdx(vPositionWorld.z));
    vec3 fdy = vec3(dFdy(vPositionWorld.x), dFdy(vPositionWorld.y), dFdy(vPositionWorld.z));
    vec3 normal = normalize(cross(fdx, fdy));
    gl_FragColor = vec4(normal * 0.5 + 0.5, 1.0);
  }
  if (uMode == 3.0) gl_FragColor = vec4(vUv.xy, 0.0, 1.0);
  // if (vUv.x > 1.0 || vUv.x < 0.0 || vUv.y > 1.0 || vUv.y < 0.0) gl_FragColor = vec4(0.0,0.0,0.0,1.0);
}`,
    vert: /* glsl */ `
precision mediump float;

attribute vec3 aPosition;
attribute vec2 aUv;
attribute vec3 aNormal;

uniform mat4 uProjectionMatrix;
uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uInverseViewMatrix;
uniform mat3 uNormalMatrix;

varying vec3 vPositionWorld;
varying vec3 vPositionView;
varying vec3 vNormalView;
varying vec3 vNormal;
varying vec3 vNormalWorld;
varying vec2 vUv;

void main() {
  vNormal = aNormal;
  vUv = aUv;

  vPositionWorld = (uModelMatrix * vec4(aPosition, 1.0)).xyz;
  vPositionView = (uViewMatrix * vec4(vPositionWorld, 1.0)).xyz;

  vNormalView = uNormalMatrix * aNormal;
  vNormalWorld = normalize((uInverseViewMatrix * vec4(vNormalView, 0.0)).xyz);

  gl_Position = uProjectionMatrix * vec4(vPositionView, 1.0);
}`,
  }),
  uniforms: {
    uColorMap: colorMap,
  },
};
const drawLinesCmd = {
  pipeline: ctx.pipeline({
    depthTest: true,
    primitive: ctx.Primitive.Lines,
    frag: /* glsl */ `
precision mediump float;

uniform vec4 uColor;

void main () {
  gl_FragColor = uColor;
}`,
    vert: /* glsl */ `
  precision mediump float;

attribute vec3 aPosition;

uniform mat4 uProjectionMatrix;
uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;

varying vec3 vPositionWorld;
varying vec3 vPositionView;

void main() {
  vPositionWorld = (uModelMatrix * vec4(aPosition, 1.0)).xyz;
  vPositionView = (uViewMatrix * vec4(vPositionWorld, 1.0)).xyz;

  gl_Position = uProjectionMatrix * vec4(vPositionView, 1.0);
}`,
  }),
  uniforms: {
    uColor: [0.8, 0.8, 0.8, 1],
  },
};

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

const circle = Primitives.circle({ closed: true });
circle.positions = new Float32Array((circle.positions.length / 2) * 3).map(
  (_, index) =>
    index % 3 === 2 ? 0 : circle.positions[Math.round((index * 2) / 3)]
);
circle.edges = circle.cells;

// Circle and box are rendered as lines
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

  Primitives.tetrahedron(),
  Primitives.icosahedron(),

  Primitives.disc(),
  Primitives.annulus(),
  box,
  circle,
];

console.table(geometries);

// Create the meshes for rendering
const meshes = geometries.map((geometry) => ({
  modelMatrix: mat4.create(),
  modelViewMatrix: mat4.create(),
  normalMatrix: mat3.create(),
  rotation: [0, 0, 0, 1],
  translation: [0, 0, 0],
  scale: [1, 1, 1],
  geometry,
  bbox: aabb.getPoints(
    aabb.fromPoints(
      Array.from({ length: geometry.positions.length / 3 }, (_, index) =>
        geometry.positions.slice(index * 3, index * 3 + 3)
      )
    )
  ),
  edges: ctx.indexBuffer(
    geometry.edges || computeEdges(geometry.positions, geometry.cells)
  ),
  attributes: geometry.normals
    ? {
        aPosition: ctx.vertexBuffer(geometry.positions),
        aNormal: ctx.vertexBuffer(geometry.normals),
        aUv: ctx.vertexBuffer(geometry.uvs),
      }
    : { aPosition: ctx.vertexBuffer(geometry.positions) },
  indices: ctx.indexBuffer(geometry.cells),
}));
console.log(meshes);

const bboxCells = ctx.indexBuffer(
  // prettier-ignore
  Uint8Array.of(
    0, 1, 1, 2, 2, 3, 3, 0,
    4, 5, 5, 6, 6, 7, 7, 4,
    0, 4, 1, 5, 2, 6, 3, 7
  )
);

// Position them
const offset = 1.5;
const gridSize = Math.floor(Math.sqrt(meshes.length));

const halfSize = (gridSize - 1) * 0.5;
meshes.forEach(
  (mesh, index) =>
    (mesh.translation = [
      (index % gridSize) * offset - halfSize * offset,
      0,
      ~~(index / gridSize) * offset - halfSize * offset,
    ])
);

// Events
const onResize = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  ctx.set({ width, height });

  canvas.width = width * devicePixelRatio;
  canvas.height = height * devicePixelRatio;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
};
window.addEventListener("resize", onResize);
onResize();

const inverseModelViewMatrix = mat4.create();

// Render
ctx.frame(() => {
  controls.update();
  camera.position = controls.position;
  camera.target = controls.target;
  camera.update();

  ctx.submit(clearCmd);

  meshes.forEach((mesh) => {
    mat4.fromRotationTranslationScale(
      mesh.modelMatrix,
      mesh.rotation,
      mesh.translation,
      mesh.scale
    );

    mat4.multiply(mesh.modelViewMatrix, camera.viewMatrix, mesh.modelMatrix);

    mat4.invert(inverseModelViewMatrix, mesh.modelViewMatrix);
    mat3.fromMat4(mesh.normalMatrix, inverseModelViewMatrix);
    mat3.transpose(mesh.normalMatrix, mesh.normalMatrix);

    const isLine = !mesh.geometry.normals || CONFIG.mode === "wireframe";
    ctx.submit(!isLine ? drawCmd : drawLinesCmd, {
      attributes: mesh.attributes,
      indices: isLine ? mesh.edges : mesh.indices,
      uniforms: {
        uMode: modeOptions.findIndex((o) => o === CONFIG.mode),
        uProjectionMatrix: camera.projectionMatrix,
        uViewMatrix: camera.viewMatrix,
        uInverseViewMatrix: camera.inverseViewMatrix,
        uNormalMatrix: mesh.normalMatrix,
        uModelMatrix: mesh.modelMatrix,
      },
    });

    if (CONFIG.bbox) {
      mesh.bboxPositions ||= ctx.vertexBuffer(mesh.bbox);

      ctx.submit(drawLinesCmd, {
        attributes: { aPosition: mesh.bboxPositions },
        indices: bboxCells,
        uniforms: {
          uColor: [1, 0, 0, 1],
          uMode: modeOptions.findIndex((o) => o === CONFIG.mode),
          uProjectionMatrix: camera.projectionMatrix,
          uViewMatrix: camera.viewMatrix,
          uInverseViewMatrix: camera.inverseViewMatrix,
          uNormalMatrix: mesh.normalMatrix,
          uModelMatrix: mesh.modelMatrix,
        },
      });
    }
  });
});
