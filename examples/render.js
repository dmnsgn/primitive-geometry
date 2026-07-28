/* eslint-disable unicorn/no-top-level-side-effects */
import * as Primitives from "../index.js";

import { mat3, mat4 } from "gl-matrix";
import createContext from "pex-context";
import { aabb } from "pex-geom";
import AsyncPreloader from "async-preloader";
import typedArrayInterleave from "typed-array-interleave";
import { PerspectiveCamera, Controls } from "cameras";
import { Pane } from "tweakpane";

const params = new URLSearchParams(location.search);

// Setup
const canvas = document.createElement("canvas");
document.querySelector("main").append(canvas);
const ctx = createContext({
  canvas,
  pixelRatio: devicePixelRatio,
});

const hasGeometry = params.has("geometry");
const camera = new PerspectiveCamera({
  fov: Math.PI / 8,
  near: 0.1,
  far: 100,
  viewport: [0, 0, window.innerWidth, window.innerHeight],
});
const controls = new Controls({
  ...(hasGeometry
    ? {
        position: [0, 0, 4.16],
      }
    : {
        phi: Math.PI / 4,
        theta: Math.PI / 8,
        distance: 60 * (window.innerHeight / window.innerWidth),
      }),
  element: ctx.gl.canvas,
  camera,
  distanceBounds: [1, 100],
});
controls.updatePosition();

// GUI
const modeOptions = ["texture", "normal", "flat-shaded", "uv", "wireframe"];

const CONFIG = {
  mode: params.get("mode") || "texture",
  cycle: false,
  axes: true,
  bbox: params.get("bbox") !== "false",
  normals: params.get("normals") !== "false",
  seams: params.get("seams") !== "false",
};
const pane = new Pane();
pane.addBinding(CONFIG, "mode", {
  options: modeOptions.map((value) => ({
    text: value.toUpperCase(),
    value,
  })),
});
pane.addBinding(CONFIG, "cycle");
pane.addBinding(CONFIG, "bbox");
pane.addBinding(CONFIG, "normals");
pane.addBinding(CONFIG, "seams");

setInterval(() => {
  if (!CONFIG.cycle) {
    return;
  }

  CONFIG.mode =
    modeOptions[(modeOptions.indexOf(CONFIG.mode) + 1) % modeOptions.length];
  pane.refresh();
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
    cullFace: false,
    vert: /* glsl */ `#version 300 es
precision mediump float;

uniform mat4 uProjectionMatrix;
uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uInverseViewMatrix;
uniform mat3 uNormalMatrix;

in vec3 aPosition;
in vec2 aUv;
in vec3 aNormal;

out vec3 vPositionWorld;
out vec3 vPositionView;
out vec3 vNormalView;
out vec3 vNormal;
out vec3 vNormalWorld;
out vec2 vUv;

void main() {
  vNormal = aNormal;
  vUv = aUv;

  vPositionWorld = (uModelMatrix * vec4(aPosition, 1.0)).xyz;
  vPositionView = (uViewMatrix * vec4(vPositionWorld, 1.0)).xyz;

  vNormalView = uNormalMatrix * aNormal;
  vNormalWorld = normalize((uInverseViewMatrix * vec4(vNormalView, 0.0)).xyz);

  gl_Position = uProjectionMatrix * vec4(vPositionView, 1.0);
}`,
    frag: /* glsl */ `#version 300 es
precision mediump float;

uniform sampler2D uColorMap;
uniform float uMode;

in vec3 vPositionWorld;
in vec3 vPositionView;
in vec3 vNormal;
in vec2 vUv;

out vec4 fragColor;

void main () {
  if (uMode == 0.0) fragColor = texture(uColorMap, vUv);
  if (uMode == 1.0) fragColor = vec4(vNormal * 0.5 + 0.5, 1.0);
  if (uMode == 2.0) {
    vec3 fdx = vec3(dFdx(vPositionWorld.x), dFdx(vPositionWorld.y), dFdx(vPositionWorld.z));
    vec3 fdy = vec3(dFdy(vPositionWorld.x), dFdy(vPositionWorld.y), dFdy(vPositionWorld.z));
    vec3 normal = normalize(cross(fdx, fdy));
    fragColor = vec4(normal * 0.5 + 0.5, 1.0);
  }
  if (uMode == 3.0) fragColor = vec4(vUv.xy, 0.0, 1.0);
  if (vUv.x > 1.0 || vUv.x < 0.0 || vUv.y > 1.0 || vUv.y < 0.0) fragColor.a = 0.1;
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
    blend: true,
    blendSrcRGBFactor: ctx.BlendFactor.SrcAlpha,
    blendSrcAlphaFactor: ctx.BlendFactor.One,
    blendDstRGBFactor: ctx.BlendFactor.OneMinusSrcAlpha,
    blendDstAlphaFactor: ctx.BlendFactor.One,
    vert: /* glsl */ `#version 300 es
precision mediump float;

uniform mat4 uProjectionMatrix;
uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;

in vec3 aPosition;
in vec3 aColor;

out vec3 vPositionWorld;
out vec3 vPositionView;
out vec3 vColor;

void main() {
  vPositionWorld = (uModelMatrix * vec4(aPosition, 1.0)).xyz;
  vPositionView = (uViewMatrix * vec4(vPositionWorld, 1.0)).xyz;
  vColor = aColor;

  gl_Position = uProjectionMatrix * vec4(vPositionView, 1.0);
}`,
    frag: /* glsl */ `#version 300 es
precision mediump float;

uniform float uOpacity;

in vec3 vColor;

out vec4 fragColor;

void main () {
  fragColor = vec4(vColor, uOpacity);
}`,
  }),
  uniforms: { uOpacity: 1 },
};

const bboxCells = ctx.indexBuffer(
  // prettier-ignore
  Uint8Array.of(
    0, 1, 1, 2, 2, 3, 3, 0,
    4, 5, 5, 6, 6, 7, 7, 4,
    0, 4, 1, 5, 2, 6, 3, 7
  ),
);
const unitBox = Primitives.box();
unitBox.edges = computeEdges(unitBox.positions, unitBox.cells);

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
      ),
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
      ),
    ),
  },
  indices: ctx.indexBuffer(Uint8Array.of(0, 1, 2, 3, 4, 5)),
  uniforms: { uModelMatrix: mat4.create() },
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
      mesh.scale,
    );

    mat4.multiply(mesh.modelViewMatrix, camera.viewMatrix, mesh.modelMatrix);

    mat4.invert(inverseModelViewMatrix, mesh.modelViewMatrix);
    mat3.fromMat4(mesh.normalMatrix, inverseModelViewMatrix);
    mat3.transpose(mesh.normalMatrix, mesh.normalMatrix);

    const isLine =
      !mesh.geometry.normals || mesh.quads || CONFIG.mode === "wireframe";
    ctx.submit(isLine ? drawLinesCmd : drawCmd, {
      attributes: mesh.attributes,
      indices: isLine ? mesh.edges : mesh.indices,
      uniforms: {
        uMode: modeOptions.indexOf(CONFIG.mode),
        uProjectionMatrix: camera.projectionMatrix,
        uViewMatrix: camera.viewMatrix,
        uInverseViewMatrix: camera.inverseViewMatrix,
        uNormalMatrix: mesh.normalMatrix,
        uModelMatrix: mesh.modelMatrix,
      },
    });

    if (CONFIG.bbox) {
      unitBox.positionsBuffer ||= ctx.vertexBuffer(unitBox.positions);
      unitBox.colorsBuffer ||= ctx.vertexBuffer(unitBox.positions.map(() => 1));
      unitBox.indicesBuffer ||= ctx.indexBuffer(unitBox.edges);
      ctx.submit(drawLinesCmd, {
        attributes: {
          aPosition: unitBox.positionsBuffer,
          aColor: unitBox.colorsBuffer,
        },
        indices: unitBox.indicesBuffer,
        uniforms: {
          uOpacity: 0.2,
          uMode: modeOptions.indexOf(CONFIG.mode),
          uProjectionMatrix: camera.projectionMatrix,
          uViewMatrix: camera.viewMatrix,
          uInverseViewMatrix: camera.inverseViewMatrix,
          uNormalMatrix: mesh.normalMatrix,
          uModelMatrix: mesh.modelMatrix,
        },
      });

      mesh.bboxPositions ||= ctx.vertexBuffer(mesh.bbox);
      mesh.bboxColors ||= ctx.vertexBuffer(mesh.bbox.map((p) => p * 0.5 + 0.5));

      ctx.submit(drawLinesCmd, {
        attributes: {
          aPosition: mesh.bboxPositions,
          aColor: mesh.bboxColors,
        },
        indices: bboxCells,
        uniforms: {
          uMode: modeOptions.indexOf(CONFIG.mode),
          uProjectionMatrix: camera.projectionMatrix,
          uViewMatrix: camera.viewMatrix,
          uInverseViewMatrix: camera.inverseViewMatrix,
          uNormalMatrix: mesh.normalMatrix,
          uModelMatrix: mesh.modelMatrix,
        },
      });
    }

    if (CONFIG.normals && mesh.geometry.normals && !mesh.quads) {
      mesh.normalsAttributes ||= {
        aPosition: ctx.vertexBuffer(
          typedArrayInterleave(
            Float32Array,
            [3, 3],
            mesh.geometry.positions,
            mesh.geometry.positions.map(
              (p, i) => p + mesh.geometry.normals[i] * 0.1,
            ),
          ),
        ),
        aColor: ctx.vertexBuffer(
          typedArrayInterleave(
            Float32Array,
            [3, 3],
            mesh.geometry.normals.map((p) => p * 0.5 + 0.5),
            mesh.geometry.normals.map((p) => p * 0.5 + 0.5),
          ),
        ),
      };

      mesh.normalsIndices ||= ctx.indexBuffer(
        new Uint32Array((mesh.geometry.positions.length / 3) * 2).map(
          (_, i) => i,
        ),
      );

      ctx.submit(drawLinesCmd, {
        attributes: mesh.normalsAttributes,
        indices: mesh.normalsIndices,
        uniforms: {
          uMode: modeOptions.indexOf(CONFIG.mode),
          uProjectionMatrix: camera.projectionMatrix,
          uViewMatrix: camera.viewMatrix,
          uInverseViewMatrix: camera.inverseViewMatrix,
          uNormalMatrix: mesh.normalMatrix,
          uModelMatrix: mesh.modelMatrix,
        },
      });
    }

    if (CONFIG.seams && mesh.seams) {
      ctx.submit(drawLinesCmd, {
        attributes: mesh.seams.attributes,
        indices: mesh.seams.indices,
        uniforms: {
          uProjectionMatrix: camera.projectionMatrix,
          uViewMatrix: camera.viewMatrix,
          uModelMatrix: mesh.modelMatrix,
        },
      });
    }

    ctx.submit(isLine ? drawLinesCmd : drawCmd, {
      attributes: mesh.attributes,
      indices: isLine ? mesh.edges : mesh.indices,
      uniforms: {
        uMode: modeOptions.indexOf(CONFIG.mode),
        uProjectionMatrix: camera.projectionMatrix,
        uViewMatrix: camera.viewMatrix,
        uInverseViewMatrix: camera.inverseViewMatrix,
        uNormalMatrix: mesh.normalMatrix,
        uModelMatrix: mesh.modelMatrix,
      },
    });
  });
});

// Classify edges to visualise discontinuities:
// - boundary (cyan): edge used by a single cell with no coincident partner,
//   expected on open shapes (theta/phi arcs, plane...)
// - seam (yellow): coincident duplicated edges, bit-identical positions,
//   expected where attributes differ on purpose (UV atlas/wrap...)
// - crack (magenta): coincident duplicated edges with non-identical positions,
//   always a defect
function computeDiscontinuities(geometry, epsilon = 1e-4) {
  const { positions, normals, cells } = geometry;
  const vertexCount = positions.length / 3;

  const edgeCounts = new Map();
  for (let i = 0; i < cells.length; i += 3) {
    for (let j = 0; j < 3; j++) {
      const a = cells[i + j];
      const b = cells[i + ((j + 1) % 3)];
      if (a === b) continue;
      const key = a < b ? a * vertexCount + b : b * vertexCount + a;
      edgeCounts.set(key, (edgeCounts.get(key) || 0) + 1);
    }
  }

  const quantize = (index) =>
    [0, 1, 2]
      .map((i) => Math.round(positions[index * 3 + i] / epsilon))
      .join(",");
  const equals = (a, b) =>
    positions[a * 3] === positions[b * 3] &&
    positions[a * 3 + 1] === positions[b * 3 + 1] &&
    positions[a * 3 + 2] === positions[b * 3 + 2];

  const groups = new Map();
  for (const [key, count] of edgeCounts) {
    if (count !== 1) continue;
    const a = Math.floor(key / vertexCount);
    const b = key % vertexCount;
    const ka = quantize(a);
    const kb = quantize(b);
    const groupKey = ka < kb ? `${ka}|${kb}` : `${kb}|${ka}`;
    if (!groups.has(groupKey)) groups.set(groupKey, []);
    groups.get(groupKey).push([a, b]);
  }

  const TYPE_COLORS = [
    [0, 1, 1],
    [1, 1, 0],
    [1, 0, 1],
  ];
  const stats = { boundaries: 0, seams: 0, cracks: 0 };
  const lines = [];

  for (const edges of groups.values()) {
    let type = 0;
    if (edges.length > 1) {
      const [ra, rb] = edges[0];
      const isCrack = edges
        .slice(1)
        .some(
          ([a, b]) =>
            !(equals(a, ra) || equals(a, rb)) ||
            !(equals(b, ra) || equals(b, rb)),
        );
      type = isCrack ? 2 : 1;
    }
    stats[type === 0 ? "boundaries" : type === 1 ? "seams" : "cracks"] +=
      edges.length;
    for (const edge of edges) lines.push([edge, type]);
  }

  const linePositions = new Float32Array(lines.length * 2 * 3);
  const lineColors = new Float32Array(lines.length * 2 * 3);
  for (const [index, [[a, b], type]] of lines.entries()) {
    for (const [end, v] of [a, b].entries()) {
      const offset = (index * 2 + end) * 3;
      for (let i = 0; i < 3; i++) {
        // Nudge along the normal to avoid z-fighting with the surface
        linePositions[offset + i] =
          positions[v * 3 + i] + (normals?.[v * 3 + i] || 0) * 2e-3;
        lineColors[offset + i] = TYPE_COLORS[type][i];
      }
    }
  }

  return { positions: linePositions, colors: lineColors, stats };
}

// `cells` is either a flat typed array of fixed-size groups (`stride` per
// face, the SimplicialComplex convention), a SimplicialComplexPolygon-style
// array of closed n-gon faces (self-describing, `stride` ignored, each face
// implicitly wraps its last index back to its first), or - when `path` is
// set - a SimplicialComplexPath-style array of open polylines (no
// wraparound; a closed loop instead repeats its first index at the end).
function computeEdges(positions, cells, { stride = 3, path = false } = {}) {
  const isFlatArray = ArrayBuffer.isView(cells);

  const edgeCount = isFlatArray
    ? cells.length
    : path
      ? cells.reduce((sum, chain) => sum + chain.length - 1, 0)
      : cells.reduce((sum, face) => sum + face.length, 0);

  const edges = new (Primitives.utils.getCellsTypedArray(positions.length / 3))(
    edgeCount * 2,
  );

  let cellIndex = 0;
  const pushEdge = (a, b) => {
    edges[cellIndex] = Math.min(a, b);
    edges[cellIndex + 1] = Math.max(a, b);
    cellIndex += 2;
  };

  if (isFlatArray) {
    for (let i = 0; i < cells.length; i += stride) {
      for (let j = 0; j < stride; j++) {
        pushEdge(cells[i + j], cells[i + ((j + 1) % stride)]);
      }
    }
  } else if (path) {
    for (const chain of cells) {
      for (let j = 0; j < chain.length - 1; j++) {
        pushEdge(chain[j], chain[j + 1]);
      }
    }
  } else {
    for (const face of cells) {
      for (let j = 0; j < face.length; j++) {
        pushEdge(face[j], face[(j + 1) % face.length]);
      }
    }
  }

  return edges;
}

const createMesh = (geometry) => ({
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
        Array.from({ length: geometry.positions.length / 3 }, (_, index) =>
          geometry.positions.slice(index * 3, index * 3 + 3),
        ),
      ),
    )
    .flat(),
  edges: ctx.indexBuffer(
    geometry.edges || computeEdges(geometry.positions, geometry.cells),
  ),
  attributes: geometry.normals
    ? {
        aPosition: ctx.vertexBuffer(geometry.positions),
        aNormal: ctx.vertexBuffer(geometry.normals),
        aUv: ctx.vertexBuffer(geometry.uvs),
        aColor: ctx.vertexBuffer(geometry.normals.map((p) => p * 0.5 + 0.5)),
      }
    : {
        aPosition: ctx.vertexBuffer(geometry.positions),
        aColor: ctx.vertexBuffer(geometry.positions.map((p) => p * 0.5 + 0.5)),
      },
  indices: ctx.indexBuffer(geometry.cells),
});

const setGeometries = (geometryGroups) => {
  console.table(geometryGroups);

  // Each entry is either null (grid break), a single geometry, or an array of
  // geometries to stack on the y axis at the same x/z grid position.
  const toSlots = (entries) =>
    entries.map((entry) =>
      entry === null ? null : Array.isArray(entry) ? entry : [entry],
    );

  // Create the meshes for rendering, grouped by group then by slot for
  // positioning
  const groupMeshSlots = geometryGroups.map((entries) =>
    toSlots(entries).map((slot) => slot && slot.map(createMesh)),
  );
  meshes = groupMeshSlots.flatMap((meshSlots) =>
    meshSlots.flatMap((slot) => slot || [null]),
  );
  console.log(meshes);

  meshes.filter(Boolean).forEach((mesh) => {
    const { geometry } = mesh;
    if (!geometry.normals || geometry.quads) return;

    const seams = computeDiscontinuities(geometry);
    mesh.seamStats = seams.stats;

    if (seams.positions.length) {
      mesh.seams = {
        attributes: {
          aPosition: ctx.vertexBuffer(seams.positions),
          aColor: ctx.vertexBuffer(seams.colors),
        },
        indices: ctx.indexBuffer(
          new Uint32Array(seams.positions.length / 3).map((_, i) => i),
        ),
      };
    }
  });

  console.table(
    meshes.filter(Boolean).map(({ geometry, seamStats }) => ({
      name: geometry.name,
      vertices: geometry.positions.length / 3,
      ...seamStats,
    })),
  );

  // Position each group on its own z-row grid, placed side by side along the
  // x axis (each column reserves gridSize * offset, so groups never
  // overlap), then center the whole arrangement around x = 0. Y stays 0 -
  // only a slot's own nested meshes still stack on y.
  const offset = 1.5;
  const groupLayouts = groupMeshSlots.map((meshSlots) => {
    const { gridSize } = meshSlots.reduce(
      (current, slot) => {
        if (slot) {
          current.count++;
        } else {
          current.count = 0;
        }
        current.gridSize = Math.max(current.gridSize, current.count);
        return current;
      },
      { gridSize: 0, count: 0 },
    );
    return { meshSlots, gridSize };
  });

  const totalWidth = groupLayouts.reduce(
    (sum, { gridSize }) => sum + gridSize * offset,
    0,
  );
  let groupStartX = -totalWidth * 0.5 + offset * 0.5;

  for (const { meshSlots, gridSize } of groupLayouts) {
    let i = 0;
    for (const slot of meshSlots) {
      if (!slot) {
        if (i % gridSize !== 0) i += gridSize - (i % gridSize);
        continue;
      }
      const x = groupStartX + (i % gridSize) * offset;
      const z = Math.trunc(i / gridSize) * offset;
      // Stack a slot's meshes on the y axis, starting at y = 0
      for (const [level, mesh] of slot.entries()) {
        mesh.translation = [x, -level * offset, z];
      }
      i++;
    }

    const lastSlot = meshSlots.findLast(Boolean);
    const halfGridSize = lastSlot.at(-1).translation[2] * 0.5;
    for (const slot of meshSlots) {
      if (!slot) continue;
      for (const mesh of slot) mesh.translation[2] -= halfGridSize;
    }

    groupStartX += gridSize * offset;
  }
};

export {
  CONFIG,
  setGeometries,
  computeEdges,
  computeDiscontinuities,
  modeOptions,
  pane,
  controls,
  camera,
};
