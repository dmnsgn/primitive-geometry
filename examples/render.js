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
const ctx = createContext({
  type: "webgl",
  canvas,
  pixelRatio: devicePixelRatio,
});

const camera = new PerspectiveCamera({
  fov: Math.PI / 4,
  near: 0.1,
  far: 100,
  viewport: [0, 0, window.innerWidth, window.innerHeight],
});
const controls = new Controls({
  // position: [0, 0, 4],
  // distance: 6 * (window.innerHeight / window.innerWidth),
  phi: Math.PI / 3,
  theta: Math.PI / 4,
  distance: 15 * (window.innerHeight / window.innerWidth),
  element: ctx.gl.canvas,
  camera,
  distanceBounds: [1, 100],
});
controls.updatePosition();
controls.target = [0, 0, 0];

// GUI
const params = new URLSearchParams(window.location.search);
const modeOptions = ["texture", "normal", "flat-shaded", "uv", "wireframe"];

const CONFIG = {
  mode: params.get("mode") || "texture",
  cycle: false,
  axes: true,
  bbox: params.get("mode") === "bbox",
};
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
  if (vUv.x > 1.0 || vUv.x < 0.0 || vUv.y > 1.0 || vUv.y < 0.0) gl_FragColor.a = 0.1;
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
    vert: /* glsl */ `
  precision mediump float;

attribute vec3 aPosition;
attribute vec3 aColor;

uniform mat4 uProjectionMatrix;
uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;

varying vec3 vPositionWorld;
varying vec3 vPositionView;
varying vec3 vColor;

void main() {
  vPositionWorld = (uModelMatrix * vec4(aPosition, 1.0)).xyz;
  vPositionView = (uViewMatrix * vec4(vPositionWorld, 1.0)).xyz;
  vColor = aColor;

  gl_Position = uProjectionMatrix * vec4(vPositionView, 1.0);
}`,
    frag: /* glsl */ `
precision mediump float;

uniform vec4 uColor;

varying vec3 vColor;

void main () {
  gl_FragColor = vec4(vColor, 1.0);
}`,
  }),
  uniforms: { uColor: [0.8, 0.8, 0.8, 1] },
};

const bboxCells = ctx.indexBuffer(
  // prettier-ignore
  Uint8Array.of(
    0, 1, 1, 2, 2, 3, 3, 0,
    4, 5, 5, 6, 6, 7, 7, 4,
    0, 4, 1, 5, 2, 6, 3, 7
  )
);

const drawAxesCmd = {
  ...drawLinesCmd,
  attributes: {
    aPosition: ctx.vertexBuffer(
      // prettier-ignore
      Float32Array.of(
        0, 0, 0,
        1, 0, 0,
        0, 0, 0,
        0, 1, 0,
        0, 0, 0,
        0, 0, 1,
      )
    ),
    aColor: ctx.vertexBuffer(
      // prettier-ignore
      Float32Array.of(
        1, 0, 0,
        1, 0.5, 0.5,
        0, 1, 0,
        0.5, 1, 0.5,
        0, 0, 1,
        0.5, 0.5, 1,
      )
    ),
  },
  indices: ctx.indexBuffer(Uint8Array.of(0, 1, 2, 3, 4, 5)),
  uniforms: { uColor: [0.8, 0.8, 0.8, 1], uModelMatrix: mat4.create() },
};

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

let meshes = [];

// Render
ctx.frame(() => {
  controls.update();
  camera.position = controls.position;
  camera.target = controls.target;
  camera.update();

  ctx.submit(clearCmd);

  if (CONFIG.axes) {
    ctx.submit(drawAxesCmd, {
      uniforms: {
        uProjectionMatrix: camera.projectionMatrix,
        uViewMatrix: camera.viewMatrix,
      },
    });
  }

  meshes.filter(Boolean).forEach((mesh) => {
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

    const isLine =
      !mesh.geometry.normals || mesh.quads || CONFIG.mode === "wireframe";
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
      mesh.bboxColors ||= ctx.vertexBuffer(mesh.bbox.map((p) => p * 0.5 + 0.5));

      ctx.submit(drawLinesCmd, {
        attributes: {
          aPosition: mesh.bboxPositions,
          aColor: mesh.bboxColors,
        },
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
  });
});

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

const setGeometries = (geometries) => {
  console.table(geometries);

  // Create the meshes for rendering
  meshes = geometries.map(
    (geometry) =>
      geometry && {
        modelMatrix: mat4.create(),
        modelViewMatrix: mat4.create(),
        normalMatrix: mat3.create(),
        rotation: [0, 0, 0, 1],
        translation: [0, 0, 0],
        scale: [1, 1, 1],
        geometry,
        quads: geometry.quads,
        bbox: aabb
          .getCorners(
            aabb.fromPoints(
              aabb.create(),
              Array.from(
                { length: geometry.positions.length / 3 },
                (_, index) => geometry.positions.slice(index * 3, index * 3 + 3)
              )
            )
          )
          .flat(),
        edges: ctx.indexBuffer(
          geometry.edges || computeEdges(geometry.positions, geometry.cells)
        ),
        attributes: geometry.normals
          ? {
              aPosition: ctx.vertexBuffer(geometry.positions),
              aNormal: ctx.vertexBuffer(geometry.normals),
              aUv: ctx.vertexBuffer(geometry.uvs),
              aColor: ctx.vertexBuffer(
                geometry.normals.map((p) => p * 0.5 + 0.5)
              ),
            }
          : {
              aPosition: ctx.vertexBuffer(geometry.positions),
              aColor: ctx.vertexBuffer(
                geometry.positions.map((p) => p * 0.5 + 0.5)
              ),
            },
        indices: ctx.indexBuffer(geometry.cells),
      }
  );
  console.log(meshes);

  // Position them
  const offset = 1.5;
  const { gridSize } = meshes.reduce(
    (current, mesh) => {
      if (mesh) {
        current.count++;
      } else {
        current.count = 0;
      }
      current.gridSize = Math.max(current.gridSize, current.count);
      return current;
    },
    { gridSize: 0, count: 0 }
  );

  const halfSize = (gridSize - 1) * 0.5;
  let i = 0;
  meshes.forEach((mesh) => {
    if (!mesh) {
      if (i % gridSize !== 0) i += gridSize - (i % gridSize);
      return;
    }
    mesh.translation = [
      (i % gridSize) * offset - halfSize * offset,
      0,
      ~~(i / gridSize) * offset,
    ];
    i++;
  });
  const halfGridSize = meshes.at(-1).translation[2] * 0.5;
  meshes.forEach((mesh) => mesh && (mesh.translation[2] -= halfGridSize));
};

export { CONFIG, setGeometries, modeOptions, pane, controls, camera };
