import { mat3, mat4 } from "gl-matrix";

import regl from "./context.js";

const inverseModelViewMatrix = mat4.create();

class Mesh {
  constructor(geometry, material) {
    this.geometry = geometry;
    this.material = material;
    this.color = [0.8, 0.8, 0.8, 1.0];

    this.rotation = [0, 0, 0, 1];
    this.translation = [0, 0, 0];
    this.scale = [1, 1, 1];

    this.modelMatrix = mat4.create();
    this.modelViewMatrix = mat4.create();
    this.viewMatrix = mat4.create();
    this.inverseViewMatrix = mat4.create();
    this.normalMatrix = mat3.create();
    this.projectionMatrix = mat3.create();

    this.createBuffers();
  }

  createBuffers() {
    this.positions = regl.buffer(this.geometry.positions);
    if (this.geometry.normals) {
      this.normals = regl.buffer(this.geometry.normals);
    }
    if (this.geometry.uvs) {
      this.uvs = regl.buffer(this.geometry.uvs);
    }
  }

  update(camera, mode) {
    this.projectionMatrix = camera.projectionMatrix;
    this.viewMatrix = camera.viewMatrix;
    mat4.invert(this.inverseViewMatrix, camera.viewMatrix);
    this.mode = mode;

    mat4.fromRotationTranslationScale(
      this.modelMatrix,
      this.rotation,
      this.translation,
      this.scale
    );

    mat4.multiply(this.modelViewMatrix, this.viewMatrix, this.modelMatrix);

    mat4.invert(inverseModelViewMatrix, this.modelViewMatrix);
    mat3.fromMat4(this.normalMatrix, inverseModelViewMatrix);
    mat3.transpose(this.normalMatrix, this.normalMatrix);
  }
}

Mesh.prototype.drawLines = regl({
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
  uniform mat4 uInverseViewMatrix;
  uniform mat3 uNormalMatrix;

  varying vec3 vPositionWorld;
  varying vec3 vPositionView;

  void main() {
    vPositionWorld = (uModelMatrix * vec4(aPosition, 1.0)).xyz;
    vPositionView = (uViewMatrix * vec4(vPositionWorld, 1.0)).xyz;

    gl_Position = uProjectionMatrix * vec4(vPositionView, 1.0);
  }`,
  attributes: {
    aPosition: regl.this("positions"),
  },
  primitive: "lines",
  elements: regl.this("geometry.cells"),
  uniforms: {
    uColor: regl.this("color"),
    uViewMatrix: regl.this("viewMatrix"),
    uInverseViewMatrix: regl.this("inverseViewMatrix"),
    uModelMatrix: regl.this("modelMatrix"),
    uNormalMatrix: regl.this("normalMatrix"),
    uProjectionMatrix: regl.this("projectionMatrix"),
    uColorMap: regl.this("material.colorMap"),
    uMode: regl.this("mode"),
  },
});

Mesh.prototype.draw = regl({
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
  // depth: { enable: false },
  cull: {
    enable: true,
    // face: "back",
  },
  // blend: {
  //   enable: true,
  //   func: {
  //     srcRGB: "src alpha",
  //     srcAlpha: "one",
  //     dstRGB: "one minus src alpha",
  //     dstAlpha: "one",
  //   },
  // },
  attributes: {
    aPosition: regl.this("positions"),
    aNormal: regl.this("normals"),
    aUv: regl.this("uvs"),
  },
  elements: regl.this("geometry.cells"),
  uniforms: {
    uViewMatrix: regl.this("viewMatrix"),
    uInverseViewMatrix: regl.this("inverseViewMatrix"),
    uModelMatrix: regl.this("modelMatrix"),
    uNormalMatrix: regl.this("normalMatrix"),
    uProjectionMatrix: regl.this("projectionMatrix"),
    uColorMap: regl.this("material.colorMap"),
    uMode: regl.this("mode"),
  },
});

export default function createMesh(...args) {
  return new Mesh(...args);
}
