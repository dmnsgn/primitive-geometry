import './common/web.dom-collections.iterator-6ff37229.js';
import './common/set-to-string-tag-f46d73c4.js';

/**
 * @module aabb
 */

/**
 * @typedef {number[][]} aabb An axis-aligned bounding box defined by two min and max 3D points.
 */

/**
 * Creates a new bounding box.
 * @returns {aabb}
 */
function create() {
  // [min, max]
  return [[Infinity, Infinity, Infinity], [-Infinity, -Infinity, -Infinity]];
}
/**
 * Reset a bounding box.
 * @param {aabb} a
 * @returns {rect}
 */

function empty(a) {
  a[0][0] = Infinity;
  a[0][1] = Infinity;
  a[0][2] = Infinity;
  a[1][0] = -Infinity;
  a[1][1] = -Infinity;
  a[1][2] = -Infinity;
  return a;
}
/**
 * Copies a bounding box.
 * @param {aabb} a
 * @returns {aabb}
 */

function copy(a) {
  return [a[0].slice(), a[1].slice()];
}
/**
 * Sets a bounding box to another.
 * @param {aabb} a
 * @param {aabb} b
 * @returns {aabb}
 */

function set(a, b) {
  a[0][0] = b[0][0];
  a[0][1] = b[0][1];
  a[0][2] = b[0][2];
  a[1][0] = b[1][0];
  a[1][1] = b[1][1];
  a[1][2] = b[1][2];
  return a;
}
/**
 * Checks if a bounding box is empty.
 * @param {aabb} aabb
 * @returns {boolean}
 */

function isEmpty(a) {
  return a[0][0] > a[1][0] || a[0][1] > a[1][1] || a[0][2] > a[1][2];
}
/**
 * Creates a bounding box from a list of points.
 * @param {import("pex-math").vec3[]} points
 * @returns {aabb}
 */

function fromPoints(points) {
  return setPoints(create(), points);
}
/**
 * Updates a bounding box from a list of points.
 * @param {aabb} a
 * @param {import("pex-math").vec3[]} points
 * @returns {aabb}
 */

function setPoints(a, points) {
  for (let i = 0; i < points.length; i++) {
    includePoint(a, points[i]);
  }

  return a;
}
/**
 * @private
 */

function setVec3(v = [], x, y, z) {
  v[0] = x;
  v[1] = y;
  v[2] = z;
  return v;
}
/**
 * Returns a list of 8 points from a bounding box.
 * @param {aabb} aabb
 * @param {import("pex-math").vec3[]} points
 * @returns {import("pex-math").vec3[]}
 */


function getPoints(a, points = []) {
  points[0] = setVec3(points[0], a[0][0], a[0][1], a[0][2]);
  points[1] = setVec3(points[1], a[1][0], a[0][1], a[0][2]);
  points[2] = setVec3(points[2], a[1][0], a[0][1], a[1][2]);
  points[3] = setVec3(points[3], a[0][0], a[0][1], a[1][2]);
  points[4] = setVec3(points[4], a[0][0], a[1][1], a[0][2]);
  points[5] = setVec3(points[5], a[1][0], a[1][1], a[0][2]);
  points[6] = setVec3(points[6], a[1][0], a[1][1], a[1][2]);
  points[7] = setVec3(points[7], a[0][0], a[1][1], a[1][2]);
  return points;
}
/**
 * Returns the center of a bounding box.
 * @param {aabb} a
 * @param {import("pex-math").vec3} out
 * @returns {import("pex-math").vec3}
 */

function center(a, out = [0, 0, 0]) {
  out[0] = (a[0][0] + a[1][0]) / 2;
  out[1] = (a[0][1] + a[1][1]) / 2;
  out[2] = (a[0][2] + a[1][2]) / 2;
  return out;
}
/**
 * Returns the size of a bounding box.
 * @param {aabb} a
 * @param {import("pex-math").vec3} out
 * @returns {import("pex-math").vec3}
 */

function size(a, out = [0, 0, 0]) {
  out[0] = Math.abs(a[1][0] - a[0][0]);
  out[1] = Math.abs(a[1][1] - a[0][1]);
  out[2] = Math.abs(a[1][2] - a[0][2]);
  return out;
}
/**
 * Checks if a point is inside a bounding box.
 * @param {bbox} a
 * @param {import("pex-math").vec3} p
 * @returns {boolean}
 */

function containsPoint(a, [x, y, z]) {
  return x >= a[0][0] && x <= a[1][0] && y >= a[0][1] && y <= a[1][1] && z >= a[0][2] && z <= a[1][2];
}
/**
 * Includes a bounding box in another.
 * @param {aabb} a
 * @param {aabb} b
 * @returns {aabb}
 */

function includeAABB(a, b) {
  if (isEmpty(a)) {
    set(a, b);
  } else if (isEmpty(b)) ; else {
    a[0][0] = Math.min(a[0][0], b[0][0]);
    a[0][1] = Math.min(a[0][1], b[0][1]);
    a[0][2] = Math.min(a[0][2], b[0][2]);
    a[1][0] = Math.max(a[1][0], b[1][0]);
    a[1][1] = Math.max(a[1][1], b[1][1]);
    a[1][2] = Math.max(a[1][2], b[1][2]);
  }

  return a;
}
/**
 * Includes a point in a bounding box.
 * @param {aabb} a
 * @param {import("pex-math").vec3} p
 * @returns {import("pex-math").vec3}
 */

function includePoint(a, p) {
  a[0][0] = Math.min(a[0][0], p[0]);
  a[0][1] = Math.min(a[0][1], p[1]);
  a[0][2] = Math.min(a[0][2], p[2]);
  a[1][0] = Math.max(a[1][0], p[0]);
  a[1][1] = Math.max(a[1][1], p[1]);
  a[1][2] = Math.max(a[1][2], p[2]);
  return a;
}

var aabb = /*#__PURE__*/Object.freeze({
  __proto__: null,
  create: create,
  empty: empty,
  copy: copy,
  set: set,
  isEmpty: isEmpty,
  fromPoints: fromPoints,
  setPoints: setPoints,
  getPoints: getPoints,
  center: center,
  size: size,
  containsPoint: containsPoint,
  includeAABB: includeAABB,
  includePoint: includePoint
});

/**
 * @module vec3
 */
/**
 * Returns a new vec3 at 0, 0, 0.
 * @returns {vec3}
 */

function create$1() {
  return [0, 0, 0];
}
/**
 * Sets a vector to another vector.
 * @param {vec3} a
 * @param {vec3} b
 * @returns {vec3}
 */

function set$1(a, b) {
  a[0] = b[0];
  a[1] = b[1];
  a[2] = b[2];
  return a;
}
/**
 * Adds a vector to another.
 * @param {vec3} a
 * @param {vec3} b
 * @returns {vec3}
 */

function add(a, b) {
  a[0] += b[0];
  a[1] += b[1];
  a[2] += b[2];
  return a;
}
/**
 * Subtracts a vector from another.
 * @param {vec3} a
 * @param {vec3} b
 * @returns {vec3}
 */

function sub(a, b) {
  a[0] -= b[0];
  a[1] -= b[1];
  a[2] -= b[2];
  return a;
}
/**
 * Scales a vector by a number.
 * @param {vec3} a
 * @param {number} n
 * @returns {vec3}
 */

function scale(a, n) {
  a[0] *= n;
  a[1] *= n;
  a[2] *= n;
  return a;
}
/**
 * Calculates the dot product of two vectors.
 * @param {vec3} a
 * @param {vec3} b
 * @returns {number}
 */

function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
/**
 * Calculates the cross product of two vectors.
 * @param {vec3} a
 * @param {vec3} b
 * @returns {vec3}
 */

function cross(a, b) {
  const x = a[0];
  const y = a[1];
  const z = a[2];
  const vx = b[0];
  const vy = b[1];
  const vz = b[2];
  a[0] = y * vz - vy * z;
  a[1] = z * vx - vz * x;
  a[2] = x * vy - vx * y;
  return a;
}
/**
 * Calculates the length of a vector.
 * @param {vec3} a
 * @returns {number}
 */

function length(a) {
  const x = a[0];
  const y = a[1];
  const z = a[2];
  return Math.sqrt(x * x + y * y + z * z);
}
/**
 * Normalises a vector.
 * @param {vec3} a
 * @returns {vec3}
 */

function normalize(a) {
  const x = a[0];
  const y = a[1];
  const z = a[2];
  let l = Math.sqrt(x * x + y * y + z * z);
  l = 1 / (l || 1);
  a[0] *= l;
  a[1] *= l;
  a[2] *= l;
  return a;
}

/**
 * @typedef {number[][]} ray A ray defined by a starting 3D point origin and a 3D direction vector.
 */

/**
 * Enum for different intersections values
 * @readonly
 * @enum {number}
 */

const INTERSECTIONS = Object.freeze({
  INTERSECT: 1,
  NO_INTERSECT: 0,
  SAME_PLANE: -1,
  PARALLEL: -2,
  TRIANGLE_DEGENERATE: -2
});
const TEMP_0 = create$1();
const TEMP_1 = create$1();
const TEMP_2 = create$1();
const TEMP_3 = create$1();
const TEMP_4 = create$1();
const TEMP_5 = create$1();
const TEMP_6 = create$1();
const TEMP_7 = create$1();
const EPSILON = 1e-6;
/**
 * Creates a new ray
 * @returns {ray}
 */

function create$2() {
  return [[0, 0, 0], [0, 0, 1]];
}
/**
 * Determines if a ray intersect a plane
 * https://www.cs.princeton.edu/courses/archive/fall00/cs426/lectures/raycast/sld017.htm
 * @param {ray} ray
 * @param {import("pex-math").vec3} point
 * @param {import("pex-math").vec3} normal
 * @param {import("pex-math").vec3} out
 * @returns {number}
 */

function hitTestPlane(ray, point, normal, out = create$1()) {
  const origin = set$1(TEMP_0, ray[0]);
  const direction = set$1(TEMP_1, ray[1]);
  const dotDirectionNormal = dot(direction, normal);
  if (dotDirectionNormal === 0) return INTERSECTIONS.SAME_PLANE;
  point = set$1(TEMP_2, point);
  const t = dot(sub(point, origin), normal) / dotDirectionNormal;
  if (t < 0) return INTERSECTIONS.PARALLEL;
  set$1(out, add(origin, scale(direction, t)));
  return INTERSECTIONS.INTERSECT;
}
/**
 * Determines if a ray intersect a triangle
 * http://geomalgorithms.com/a06-_intersect-2.html#intersect3D_RayTriangle()
 * @param {ray} ray
 * @param {triangle} triangle
 * @param {import("pex-math").vec3} out
 * @returns {number}
 */

function hitTestTriangle([origin, direction], [p0, p1, p2], out = create$1()) {
  // get triangle edge vectors and plane normal
  const u = sub(set$1(TEMP_0, p1), p0);
  const v = sub(set$1(TEMP_1, p2), p0);
  const n = cross(set$1(TEMP_2, u), v);
  if (length(n) < EPSILON) return INTERSECTIONS.TRIANGLE_DEGENERATE; // ray vectors

  const w0 = sub(set$1(TEMP_3, origin), p0); // params to calc ray-plane intersect

  const a = -dot(n, w0);
  const b = dot(n, direction);

  if (Math.abs(b) < EPSILON) {
    if (a === 0) return INTERSECTIONS.SAME_PLANE;
    return INTERSECTIONS.NO_INTERSECT;
  } // get intersect point of ray with triangle plane


  const r = a / b; // ray goes away from triangle

  if (r < -EPSILON) return INTERSECTIONS.NO_INTERSECT; // for a segment, also test if (r > 1.0) => no intersect
  // intersect point of ray and plane

  const I = add(set$1(TEMP_4, origin), scale(set$1(TEMP_5, direction), r));
  const uu = dot(u, u);
  const uv = dot(u, v);
  const vv = dot(v, v);
  const w = sub(set$1(TEMP_6, I), p0);
  const wu = dot(w, u);
  const wv = dot(w, v);
  const D = uv * uv - uu * vv; // get and test parametric coords

  const s = (uv * wv - vv * wu) / D;
  if (s < -EPSILON || s > 1.0 + EPSILON) return INTERSECTIONS.NO_INTERSECT;
  const t = (uv * wu - uu * wv) / D;
  if (t < -EPSILON || s + t > 1.0 + EPSILON) return INTERSECTIONS.NO_INTERSECT;
  set$1(out, u);
  scale(out, s);
  add(out, scale(set$1(TEMP_7, v), t));
  add(out, p0);
  return INTERSECTIONS.INTERSECT;
}
/**
 * Determines if a ray intersect an AABB bounding box
 * http://gamedev.stackexchange.com/questions/18436/most-efficient-aabb-vs-ray-collision-algorithms
 * @param {ray} ray
 * @param {aabb} aabb
 * @returns {boolean}
 */

function hitTestAABB([origin, direction], aabb) {
  const dirFracx = 1.0 / direction[0];
  const dirFracy = 1.0 / direction[1];
  const dirFracz = 1.0 / direction[2];
  const min = aabb[0];
  const max = aabb[1];
  const minx = min[0];
  const miny = min[1];
  const minz = min[2];
  const maxx = max[0];
  const maxy = max[1];
  const maxz = max[2];
  const t1 = (minx - origin[0]) * dirFracx;
  const t2 = (maxx - origin[0]) * dirFracx;
  const t3 = (miny - origin[1]) * dirFracy;
  const t4 = (maxy - origin[1]) * dirFracy;
  const t5 = (minz - origin[2]) * dirFracz;
  const t6 = (maxz - origin[2]) * dirFracz;
  const tmin = Math.max(Math.max(Math.min(t1, t2), Math.min(t3, t4)), Math.min(t5, t6));
  const tmax = Math.min(Math.min(Math.max(t1, t2), Math.max(t3, t4)), Math.max(t5, t6));
  return !(tmax < 0 || tmin > tmax);
}
/**
 * Alias for {@link hitTestAABB}
 * @function
 */

const intersectsAABB = hitTestAABB;

var ray = /*#__PURE__*/Object.freeze({
  __proto__: null,
  INTERSECTIONS: INTERSECTIONS,
  create: create$2,
  hitTestPlane: hitTestPlane,
  hitTestTriangle: hitTestTriangle,
  hitTestAABB: hitTestAABB,
  intersectsAABB: intersectsAABB
});

/**
 * @module plane
 */
/**
 * @typedef {number[][]} plane A plane defined by a 3D point and a normal vector perpendicular to the plane’s surface.
 */

const TEMP_0$1 = create$1();
/**
 * Creates a new plane
 * @returns {plane}
 */

function create$3() {
  return [[0, 0, 0], [0, 1, 0]];
}
/**
 * Set the point of intersection betweeen a plane and a ray if it exists to out.
 * @param {plane} plane
 * @param {ray} ray
 * @param {import("pex-math").vec3} out
 * @returns {number}
 */

function getRayIntersection(plane, ray, out) {
  return hitTestPlane(ray, plane[0], plane[1], out);
}
/**
 * Returns on which side a point is.
 * @param {plane} plane
 * @param {import("pex-math").vec3} point
 * @returns {number}
 */

function side(plane, point) {
  const planePoint = plane[0];
  const planeNormal = plane[1];
  set$1(TEMP_0$1, planePoint);
  sub(TEMP_0$1, point);
  normalize(TEMP_0$1);
  const dot$1 = dot(TEMP_0$1, planeNormal);
  if (dot$1 > 0) return 1;
  if (dot$1 < 0) return -1;
  return 0;
}

var plane = /*#__PURE__*/Object.freeze({
  __proto__: null,
  create: create$3,
  getRayIntersection: getRayIntersection,
  side: side
});

/**
 * @module rect
 */

/**
 * @typedef {number[][]} rect A rectangle defined by two diagonally opposite 2D points.
 */

/**
 * Creates a new rectangle.
 * @returns {rect}
 */
function create$4() {
  return [[Infinity, Infinity], [-Infinity, -Infinity]];
}
/**
 * Reset a rectangle.
 * @param {rect} a
 * @returns {rect}
 */

function empty$1(a) {
  a[0][0] = a[0][1] = Infinity;
  a[1][0] = a[1][1] = -Infinity;
  return a;
}
/**
 * Copies a rectangle.
 * @param {rect} b
 * @returns {rect}
 */

function copy$1(a) {
  return [a[0].slice(), a[1].slice()];
}
/**
 * Sets a rectangle to another.
 * @param {rect} a
 * @param {rect} b
 * @returns {rect}
 */

function set$2(a, b) {
  a[0][0] = b[0][0];
  a[0][1] = b[0][1];
  a[1][0] = b[1][0];
  a[1][1] = b[1][1];
  return a;
}
/**
 * Checks if a rectangle is empty.
 * @param {rect} a
 * @returns {boolean}
 */

function isEmpty$1(a) {
  return a[0][0] > a[1][0] || a[0][1] > a[1][1];
}
/**
 * Updates a rectangle from a list of points.
 * @param {rect} a
 * @param {import("pex-math").vec2[]} points
 * @returns {rect}
 */

function fromPoints$1(a, points) {
  for (let i = 0; i < points.length; i++) {
    includePoint$1(a, points[i]);
  }

  return a;
}
/**
 * Returns a list of 4 points from a rectangle.
 * @param {rect} a
 * @param {import("pex-math").vec2[]} points
 * @returns {import("pex-math").vec2[]}
 */

function getPoints$1(a, points = []) {
  points[0] = a[0].slice();
  points[1] = [a[0][1], a[1][0]];
  points[2] = a[1].slice();
  points[3] = [a[1][0], a[0][1]];
  return points;
}
/**
 * Scales a rectangle.
 * @param {rect} a
 * @param {number} n
 * @returns {rect}
 */

function scale$1(a, n) {
  a[0][0] *= n;
  a[0][1] *= n;
  a[1][0] *= n;
  a[1][1] *= n;
  return a;
}
/**
 * Sets the size of a rectangle using width and height.
 * @param {rect} a
 * @param {import("pex-math").vec2} size
 * @returns {rect}
 */

function setSize(a, size) {
  a[1][0] = a[0][0] + size[0];
  a[1][1] = a[0][1] + size[1];
  return a;
}
/**
 * Returns the size of a rectangle.
 * @param {rect} a
 * @param {import("pex-math").vec2} out
 * @returns {import("pex-math").vec2}
 */

function size$1(a, out = []) {
  out[0] = width(a);
  out[1] = height(a);
  return out;
}
/**
 * Returns the width of a rectangle.
 * @param {rect} a
 * @returns {number}
 */

function width(a) {
  return a[1][0] - a[0][0];
}
/**
 * Returns the height of a rectangle.
 * @param {rect} a
 * @returns {number}
 */

function height(a) {
  return a[1][1] - a[0][1];
}
/**
 * Returns the aspect ratio of a rectangle.
 * @param {rect} a
 * @returns {number}
 */

function aspectRatio(a) {
  return width(a) / height(a);
}
/**
 * Sets the position of a rectangle.
 * @param {rect} a
 * @param {import("pex-math").vec2} p
 * @returns {rect}
 */

function setPosition(a, [x, y]) {
  const w = width(a);
  const h = height(a);
  a[0][0] = x;
  a[0][1] = y;
  a[1][0] = x + w;
  a[1][1] = y + h;
  return a;
}
/**
 * Returns the center of a rectangle.
 * @param {rect} a
 * @param {import("pex-math").vec2} out
 * @returns {rect}
 */

function center$1(a, out = []) {
  out[0] = a[0][0] + width(a) * 0.5;
  out[1] = a[0][1] + height(a) * 0.5;
  return out;
}
/**
 * Checks if a point is inside a rectangle.
 * @param {rect} a
 * @param {import("pex-math").vec2} p
 * @returns {boolean}
 */

function containsPoint$1(a, [x, y]) {
  return x >= a[0][0] && x <= a[1][0] && y >= a[0][1] && y <= a[1][1];
}
/**
 * Checks if a rectangle is inside another rectangle.
 * @param {rect} a
 * @param {rect} b
 * @returns {boolean}
 */

function containsRect(a, b) {
  return containsPoint$1(a, b[0]) && containsPoint$1(a, b[1]);
}
/**
 * Includes a point in a rectangle.
 * @param {rect} a
 * @param {import("pex-math").vec2} p
 * @returns {rect}
 */

function includePoint$1(a, [x, y]) {
  const minx = a[0][0];
  const miny = a[0][1];
  const maxx = a[1][0];
  const maxy = a[1][1];
  a[0][0] = minx > x ? x : minx;
  a[0][1] = miny > y ? y : miny;
  a[1][0] = maxx < x ? x : maxx;
  a[1][1] = maxy < y ? y : maxy;
  return a;
}
/**
 * Includes a rectangle in another rectangle.
 * @param {rect} a
 * @param {rect} b
 * @returns {rect}
 */

function includeRect(a, b) {
  includePoint$1(a, b[0]);
  includePoint$1(a, b[1]);
  return a;
}
/**
 * Maps a point into the dimensions of a rectangle.
 * @param {rect} a
 * @param {import("pex-math").vec2} p
 * @returns {import("pex-math").vec2}
 */

function mapPoint(a, p) {
  const minx = a[0][0];
  const miny = a[0][1];
  const maxx = a[1][0];
  const maxy = a[1][1];
  p[0] = Math.max(minx, Math.min(p[0], maxx)) - minx;
  p[1] = Math.max(miny, Math.min(p[1], maxy)) - miny;
  return p;
}
/**
 * Clamps a point into the dimensions of a rectangle.
 * @param {rect} a
 * @param {import("pex-math").vec2} p
 * @returns {import("pex-math").vec2}
 */

function clampPoint(a, p) {
  const minx = a[0][0];
  const miny = a[0][1];
  const maxx = a[1][0];
  const maxy = a[1][1];
  p[0] = Math.max(minx, Math.min(p[0], maxx));
  p[1] = Math.max(miny, Math.min(p[1], maxy));
  return p;
}

var rect = /*#__PURE__*/Object.freeze({
  __proto__: null,
  create: create$4,
  empty: empty$1,
  copy: copy$1,
  set: set$2,
  isEmpty: isEmpty$1,
  fromPoints: fromPoints$1,
  getPoints: getPoints$1,
  scale: scale$1,
  setSize: setSize,
  size: size$1,
  width: width,
  height: height,
  aspectRatio: aspectRatio,
  setPosition: setPosition,
  center: center$1,
  containsPoint: containsPoint$1,
  containsRect: containsRect,
  includePoint: includePoint$1,
  includeRect: includeRect,
  mapPoint: mapPoint,
  clampPoint: clampPoint
});

export { aabb, plane, ray, rect };
