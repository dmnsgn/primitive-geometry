const { mat3, mat4 } = require("gl-matrix");

const regl = require("./context.js");

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
    this.projectionMatrix = camera.projection;
    this.mode = mode;

    mat4.fromRotationTranslationScale(
      this.modelMatrix,
      this.rotation,
      this.translation,
      this.scale
    );

    mat4.multiply(this.modelViewMatrix, camera.view, this.modelMatrix);

    mat4.invert(inverseModelViewMatrix, this.modelViewMatrix);
    mat3.fromMat4(this.normalMatrix, inverseModelViewMatrix);
    mat3.transpose(this.normalMatrix, this.normalMatrix);
  }
}

Mesh.prototype.drawUnlit = regl({
  frag: /* glsl */ `
  precision mediump float;

  uniform vec4 uColor;

  varying vec3 vViewPosition;
  varying vec4 vWorldPosition;

  void main () {
    gl_FragColor = uColor;
  }`,
  vert: /* glsl */ `
  precision mediump float;

  attribute vec3 aPosition;

  uniform mat4 uProjectionMatrix;
  uniform mat4 uModelMatrix;
  uniform mat4 uModelViewMatrix;
  uniform mat3 uNormalMatrix;

  varying vec3 vViewPosition;
  varying vec4 vWorldPosition;

  void main() {
    vec4 modelViewPosition = uModelViewMatrix * vec4(aPosition, 1.0);
    vViewPosition = -modelViewPosition.xyz;
    vWorldPosition = uModelMatrix * vec4(aPosition, 1.0);

    gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
  }`,
  attributes: {
    aPosition: regl.this("positions")
  },
  elements: regl.this("geometry.cells"),
  uniforms: {
    uColor: regl.this("color"),
    uModelViewMatrix: regl.this("modelViewMatrix"),
    uModelMatrix: regl.this("modelMatrix"),
    uNormalMatrix: regl.this("normalMatrix"),
    uProjectionMatrix: regl.this("projectionMatrix")
  }
});

Mesh.prototype.draw = regl({
  frag: /* glsl */ `
  precision mediump float;

  uniform sampler2D uColorMap;
  uniform float uMode;

  varying vec3 vViewPosition;
  varying vec4 vWorldPosition;
  varying vec3 vNormal;
  varying vec2 vUv;

  void main () {
    if (uMode == 0.0) gl_FragColor = texture2D(uColorMap, vUv);
    if (uMode == 1.0) gl_FragColor = vec4(vNormal.xyz, 1.0);
    if (uMode == 2.0) gl_FragColor = vec4(vUv.xy, 0.0, 1.0);
  }`,
  vert: /* glsl */ `
  precision mediump float;

  attribute vec3 aPosition;
  attribute vec2 aUv;
  attribute vec3 aNormal;

  uniform mat4 uProjectionMatrix;
  uniform mat4 uModelMatrix;
  uniform mat4 uModelViewMatrix;
  uniform mat3 uNormalMatrix;

  varying vec3 vViewPosition;
  varying vec4 vWorldPosition;
  varying vec3 vNormal;
  varying vec2 vUv;

  void main() {
    vNormal = uNormalMatrix * aNormal;
    vUv = aUv;

    vec4 modelViewPosition = uModelViewMatrix * vec4(aPosition, 1.0);
    vViewPosition = -modelViewPosition.xyz;
    vWorldPosition = uModelMatrix * vec4(aPosition, 1.0);

    gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
  }`,
  attributes: {
    aPosition: regl.this("positions"),
    aNormal: regl.this("normals"),
    aUv: regl.this("uvs")
  },
  elements: regl.this("geometry.cells"),
  uniforms: {
    uModelViewMatrix: regl.this("modelViewMatrix"),
    uModelMatrix: regl.this("modelMatrix"),
    uNormalMatrix: regl.this("normalMatrix"),
    uProjectionMatrix: regl.this("projectionMatrix"),
    uColorMap: regl.this("material.colorMap"),
    uMode: regl.this("mode")
  }
});

module.exports = function createMesh(...args) {
  return new Mesh(...args);
};
