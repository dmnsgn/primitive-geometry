/**
 * Prints a vector to a string.
 * @param {import("./types.js").vec2} a
 * @param {number} [precision=4]
 * @returns {string}
 */ function toString$5(a, precision) {
    if (precision === void 0) precision = 4;
    const scale = 10 ** precision;
    // prettier-ignore
    return `[${Math.floor(a[0] * scale) / scale}, ${Math.floor(a[1] * scale) / scale}]`;
}

/** @module vec3 */ /**
 * Returns a new vec3 at 0, 0, 0.
 * @returns {import("./types.js").vec3}
 */ function create$4() {
    return [
        0,
        0,
        0
    ];
}
/**
 * Sets a vector to another vector.
 * @param {import("./types.js").vec3} a
 * @param {import("./types.js").vec3} b
 * @returns {import("./types.js").vec3}
 */ function set$2(a, b) {
    a[0] = b[0];
    a[1] = b[1];
    a[2] = b[2];
    return a;
}
/**
 * Adds a vector to another.
 * @param {import("./types.js").vec3} a
 * @param {import("./types.js").vec3} b
 * @returns {import("./types.js").vec3}
 */ function add(a, b) {
    a[0] += b[0];
    a[1] += b[1];
    a[2] += b[2];
    return a;
}
/**
 * Subtracts a vector from another.
 * @param {import("./types.js").vec3} a
 * @param {import("./types.js").vec3} b
 * @returns {import("./types.js").vec3}
 */ function sub(a, b) {
    a[0] -= b[0];
    a[1] -= b[1];
    a[2] -= b[2];
    return a;
}
/**
 * Scales a vector by a number.
 * @param {import("./types.js").vec3} a
 * @param {number} s
 * @returns {import("./types.js").vec3}
 */ function scale$1(a, s) {
    a[0] *= s;
    a[1] *= s;
    a[2] *= s;
    return a;
}
/**
 * Calculates the dot product of two vectors.
 * @param {import("./types.js").vec3} a
 * @param {import("./types.js").vec3} b
 * @returns {number}
 */ function dot(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
/**
 * Calculates the cross product of two vectors.
 * @param {import("./types.js").vec3} a
 * @param {import("./types.js").vec3} b
 * @returns {import("./types.js").vec3}
 */ function cross(a, b) {
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
 * @param {import("./types.js").vec3} a
 * @returns {number}
 */ function length(a) {
    const x = a[0];
    const y = a[1];
    const z = a[2];
    return Math.sqrt(x * x + y * y + z * z);
}
/**
 * Normalises a vector.
 * @param {import("./types.js").vec3} a
 * @returns {import("./types.js").vec3}
 */ function normalize(a) {
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
 * Prints a vector to a string.
 * @param {import("./types.js").vec3} a
 * @param {number} [precision=4]
 * @returns {string}
 */ function toString$4(a, precision) {
    if (precision === void 0) precision = 4;
    const scale = 10 ** precision;
    // prettier-ignore
    return `[${Math.floor(a[0] * scale) / scale}, ${Math.floor(a[1] * scale) / scale}, ${Math.floor(a[2] * scale) / scale}]`;
}

/**
 * Sets a vector components.
 * @param {import("./types.js").avec3} a
 * @param {number} i
 * @param {number} x
 * @param {number} y
 * @param {number} z
 */ function set3(a, i, x, y, z) {
    a[i * 3] = x;
    a[i * 3 + 1] = y;
    a[i * 3 + 2] = z;
}

/**
 * Creates a new bounding box.
 * @returns {import("./types.js").aabb}
 */ function create$3() {
    // [min, max]
    return [
        [
            Infinity,
            Infinity,
            Infinity
        ],
        [
            -Infinity,
            -Infinity,
            -Infinity
        ]
    ];
}
/**
 * Reset a bounding box.
 * @param {import("./types.js").aabb} a
 * @returns {import("./types.js").rect}
 */ function empty$1(a) {
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
 * @param {import("./types.js").aabb} a
 * @returns {import("./types.js").aabb}
 */ function copy$1(a) {
    return [
        a[0].slice(),
        a[1].slice()
    ];
}
/**
 * Sets a bounding box to another.
 * @param {import("./types.js").aabb} a
 * @param {import("./types.js").aabb} b
 * @returns {import("./types.js").aabb}
 */ function set$1(a, b) {
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
 * @param {import("./types.js").aabb} a
 * @returns {boolean}
 */ function isEmpty$1(a) {
    return a[0][0] > a[1][0] || a[0][1] > a[1][1] || a[0][2] > a[1][2];
}
/**
 * Updates a bounding box from a list of points.
 * @param {import("./types.js").aabb} a
 * @param {import("./types.js").vec3[] | import("./types.js").TypedArray} points
 * @returns {import("./types.js").aabb}
 */ function fromPoints$1(a, points) {
    const isFlatArray = !points[0]?.length;
    const l = points.length / (isFlatArray ? 3 : 1);
    for(let i = 0; i < l; i++){
        if (isFlatArray) {
            includePoint$1(a, points, i * 3);
        } else {
            includePoint$1(a, points[i]);
        }
    }
    return a;
}
/**
 * Returns a list of 8 points from a bounding box.
 * @param {import("./types.js").aabb} a
 * @param {import("./types.js").vec3[]} [points]
 * @returns {import("./types.js").vec3[]}
 */ function getCorners$1(a, points) {
    if (points === void 0) points = Array.from({
        length: 8
    }, ()=>[]);
    set3(points[0], 0, a[0][0], a[0][1], a[0][2]);
    set3(points[1], 0, a[1][0], a[0][1], a[0][2]);
    set3(points[2], 0, a[1][0], a[0][1], a[1][2]);
    set3(points[3], 0, a[0][0], a[0][1], a[1][2]);
    set3(points[4], 0, a[0][0], a[1][1], a[0][2]);
    set3(points[5], 0, a[1][0], a[1][1], a[0][2]);
    set3(points[6], 0, a[1][0], a[1][1], a[1][2]);
    set3(points[7], 0, a[0][0], a[1][1], a[1][2]);
    return points;
}
/**
 * Returns the center of a bounding box.
 * @param {import("./types.js").aabb} a
 * @param {import("./types.js").vec3} out
 * @returns {import("./types.js").vec3}
 */ function center$1(a, out) {
    if (out === void 0) out = [
        0,
        0,
        0
    ];
    out[0] = (a[0][0] + a[1][0]) / 2;
    out[1] = (a[0][1] + a[1][1]) / 2;
    out[2] = (a[0][2] + a[1][2]) / 2;
    return out;
}
/**
 * Returns the size of a bounding box.
 * @param {import("./types.js").aabb} a
 * @param {import("./types.js").vec3} out
 * @returns {import("./types.js").vec3}
 */ function size$1(a, out) {
    if (out === void 0) out = [
        0,
        0,
        0
    ];
    out[0] = Math.abs(a[1][0] - a[0][0]);
    out[1] = Math.abs(a[1][1] - a[0][1]);
    out[2] = Math.abs(a[1][2] - a[0][2]);
    return out;
}
/**
 * Checks if a point is inside a bounding box.
 * @param {import("./types.js").aabb} a
 * @param {import("./types.js").vec3} p
 * @returns {boolean}
 */ function containsPoint$1(a, param) {
    let [x, y, z] = param;
    return x >= a[0][0] && x <= a[1][0] && y >= a[0][1] && y <= a[1][1] && z >= a[0][2] && z <= a[1][2];
}
/**
 * Includes a bounding box in another.
 * @param {import("./types.js").aabb} a
 * @param {import("./types.js").aabb} b
 * @returns {import("./types.js").aabb}
 */ function includeAABB(a, b) {
    if (isEmpty$1(a)) {
        set$1(a, b);
    } else if (isEmpty$1(b)) ; else {
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
 * @param {import("./types.js").aabb} a
 * @param {import("./types.js").vec3} p
 * @param {number} [i=0] offset in the point array
 * @returns {import("./types.js").vec3}
 */ function includePoint$1(a, p, i) {
    if (i === void 0) i = 0;
    a[0][0] = Math.min(a[0][0], p[i + 0]);
    a[0][1] = Math.min(a[0][1], p[i + 1]);
    a[0][2] = Math.min(a[0][2], p[i + 2]);
    a[1][0] = Math.max(a[1][0], p[i + 0]);
    a[1][1] = Math.max(a[1][1], p[i + 1]);
    a[1][2] = Math.max(a[1][2], p[i + 2]);
    return a;
}
/**
 * Prints a bounding box to a string.
 * @param {import("./types.js").aabb} a
 * @param {number} [precision=4]
 * @returns {string}
 */ function toString$3(a, precision) {
    if (precision === void 0) precision = 4;
    // prettier-ignore
    return `[${toString$4(a[0], precision)}, ${toString$4(a[1], precision)}]`;
}

var aabb = /*#__PURE__*/Object.freeze({
  __proto__: null,
  center: center$1,
  containsPoint: containsPoint$1,
  copy: copy$1,
  create: create$3,
  empty: empty$1,
  fromPoints: fromPoints$1,
  getCorners: getCorners$1,
  includeAABB: includeAABB,
  includePoint: includePoint$1,
  isEmpty: isEmpty$1,
  set: set$1,
  size: size$1,
  toString: toString$3
});

/**
 * Enum for different side values
 * @readonly
 * @enum {number}
 */ const Side = Object.freeze({
    OnPlane: 0,
    Same: -1,
    Opposite: 1
});
const TEMP_0$1 = create$4();
/**
 * Creates a new plane
 * @returns {import("./types.js").plane}
 */ function create$2() {
    return [
        [
            0,
            0,
            0
        ],
        [
            0,
            1,
            0
        ]
    ];
}
/**
 * Returns on which side a point is.
 * @param {import("./types.js").plane} plane
 * @param {import("./types.js").vec3} point
 * @returns {number}
 */ function side(param, point) {
    let [planePoint, planeNormal] = param;
    set$2(TEMP_0$1, planePoint);
    sub(TEMP_0$1, point);
    normalize(TEMP_0$1);
    const dot$1 = dot(TEMP_0$1, planeNormal);
    if (dot$1 > 0) return Side.Opposite;
    if (dot$1 < 0) return Side.Same;
    return Side.OnPlane;
}
/**
 * Prints a plane to a string.
 * @param {import("./types.js").plane} a
 * @param {number} [precision=4]
 * @returns {string}
 */ function toString$2(a, precision) {
    if (precision === void 0) precision = 4;
    // prettier-ignore
    return `[${toString$4(a[0], precision)}, ${toString$4(a[1], precision)}]`;
}

var plane = /*#__PURE__*/Object.freeze({
  __proto__: null,
  Side: Side,
  create: create$2,
  side: side,
  toString: toString$2
});

/**
 * Enum for different intersections values
 * @readonly
 * @enum {number}
 */ const Intersections = Object.freeze({
    Intersect: 1,
    NoIntersect: 0,
    SamePlane: -1,
    Parallel: -2,
    TriangleDegenerate: -2
});
const TEMP_0 = create$4();
const TEMP_1 = create$4();
const TEMP_2 = create$4();
const TEMP_3 = create$4();
const TEMP_4 = create$4();
const TEMP_5 = create$4();
const TEMP_6 = create$4();
const TEMP_7 = create$4();
const EPSILON = 1e-6;
/**
 * Creates a new ray
 * @returns {import("./types.js").ray}
 */ function create$1() {
    return [
        [
            0,
            0,
            0
        ],
        [
            0,
            0,
            1
        ]
    ];
}
/**
 * Determines if a ray intersect a plane and set intersection point
 * @see {@link https://www.cs.princeton.edu/courses/archive/fall00/cs426/lectures/raycast/sld017.htm}
 * @param {import("./types.js").ray} ray
 * @param {import("./types.js").plane} plane
 * @param {import("./types.js").vec3} out
 * @returns {number}
 */ function hitTestPlane(param, param1, out) {
    let [origin, direction] = param;
    let [point, normal] = param1;
    if (out === void 0) out = create$4();
    set$2(TEMP_0, origin);
    set$2(TEMP_1, direction);
    const dotDirectionNormal = dot(TEMP_1, normal);
    if (dotDirectionNormal === 0) return Intersections.SamePlane;
    set$2(TEMP_2, point);
    const t = dot(sub(TEMP_2, TEMP_0), normal) / dotDirectionNormal;
    if (t < 0) return Intersections.Parallel;
    set$2(out, add(TEMP_0, scale$1(TEMP_1, t)));
    return Intersections.Intersect;
}
/**
 * Determines if a ray intersect a triangle and set intersection point
 * @see {@link http://geomalgorithms.com/a06-_intersect-2.html#intersect3D_RayTriangle()}
 * @param {import("./types.js").ray} ray
 * @param {import("./types.js").triangle} triangle
 * @param {import("./types.js").vec3} out
 * @returns {number}
 */ function hitTestTriangle(param, param1, out) {
    let [origin, direction] = param;
    let [p0, p1, p2] = param1;
    if (out === void 0) out = create$4();
    // get triangle edge vectors and plane normal
    const u = sub(set$2(TEMP_0, p1), p0);
    const v = sub(set$2(TEMP_1, p2), p0);
    const n = cross(set$2(TEMP_2, u), v);
    if (length(n) < EPSILON) return Intersections.TriangleDegenerate;
    // ray vectors
    const w0 = sub(set$2(TEMP_3, origin), p0);
    // params to calc ray-plane intersect
    const a = -dot(n, w0);
    const b = dot(n, direction);
    if (Math.abs(b) < EPSILON) {
        if (a === 0) return Intersections.SamePlane;
        return Intersections.NoIntersect;
    }
    // get intersect point of ray with triangle plane
    const r = a / b;
    // ray goes away from triangle
    if (r < -1e-6) return Intersections.NoIntersect;
    // for a segment, also test if (r > 1.0) => no intersect
    // intersect point of ray and plane
    const I = add(set$2(TEMP_4, origin), scale$1(set$2(TEMP_5, direction), r));
    const uu = dot(u, u);
    const uv = dot(u, v);
    const vv = dot(v, v);
    const w = sub(set$2(TEMP_6, I), p0);
    const wu = dot(w, u);
    const wv = dot(w, v);
    const D = uv * uv - uu * vv;
    // get and test parametric coords
    const s = (uv * wv - vv * wu) / D;
    if (s < -1e-6 || s > 1.0 + EPSILON) return Intersections.NoIntersect;
    const t = (uv * wu - uu * wv) / D;
    if (t < -1e-6 || s + t > 1.0 + EPSILON) return Intersections.NoIntersect;
    set$2(out, u);
    scale$1(out, s);
    add(out, scale$1(set$2(TEMP_7, v), t));
    add(out, p0);
    return Intersections.Intersect;
}
/**
 * Determines if a ray intersect an AABB bounding box
 * @see {@link http://gamedev.stackexchange.com/questions/18436/most-efficient-aabb-vs-ray-collision-algorithms}
 * @param {import("./types.js").ray} ray
 * @param {import("./types.js").aabb} aabb
 * @returns {boolean}
 */ function hitTestAABB(param, aabb) {
    let [origin, direction] = param;
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
 */ const intersectsAABB = hitTestAABB;
/**
 * Prints a plane to a string.
 * @param {import("./types.js").ray} a
 * @param {number} [precision=4]
 * @returns {string}
 */ function toString$1(a, precision) {
    if (precision === void 0) precision = 4;
    // prettier-ignore
    return `[${toString$4(a[0], precision)}, ${toString$4(a[1], precision)}]`;
}

var ray = /*#__PURE__*/Object.freeze({
  __proto__: null,
  Intersections: Intersections,
  create: create$1,
  hitTestAABB: hitTestAABB,
  hitTestPlane: hitTestPlane,
  hitTestTriangle: hitTestTriangle,
  intersectsAABB: intersectsAABB,
  toString: toString$1
});

/**
 * Creates a new rectangle.
 * @returns {import("./types.js").rect}
 */ function create() {
    return [
        [
            Infinity,
            Infinity
        ],
        [
            -Infinity,
            -Infinity
        ]
    ];
}
/**
 * Reset a rectangle.
 * @param {import("./types.js").rect} a
 * @returns {import("./types.js").rect}
 */ function empty(a) {
    a[0][0] = a[0][1] = Infinity;
    a[1][0] = a[1][1] = -Infinity;
    return a;
}
/**
 * Copies a rectangle.
 * @param {import("./types.js").rect} a
 * @returns {import("./types.js").rect}
 */ function copy(a) {
    return [
        a[0].slice(),
        a[1].slice()
    ];
}
/**
 * Sets a rectangle to another.
 * @param {import("./types.js").rect} a
 * @param {import("./types.js").rect} b
 * @returns {import("./types.js").rect}
 */ function set(a, b) {
    a[0][0] = b[0][0];
    a[0][1] = b[0][1];
    a[1][0] = b[1][0];
    a[1][1] = b[1][1];
    return a;
}
/**
 * Checks if a rectangle is empty.
 * @param {import("./types.js").rect} a
 * @returns {boolean}
 */ function isEmpty(a) {
    return a[0][0] > a[1][0] || a[0][1] > a[1][1];
}
/**
 * Updates a rectangle from a list of points.
 * @param {import("./types.js").rect} a
 * @param {import("./types.js").vec2[] | import("./types.js").TypedArray} points
 * @returns {import("./types.js").rect}
 */ function fromPoints(a, points) {
    const isTypedArray = !Array.isArray(points);
    for(let i = 0; i < points.length / (isTypedArray ? 2 : 1); i++){
        includePoint(a, isTypedArray ? points.slice(i * 2) : points[i]);
    }
    return a;
}
/**
 * Returns a list of 4 points from a rectangle.
 * @param {import("./types.js").rect} a
 * @param {import("./types.js").vec2[]} points
 * @returns {import("./types.js").vec2[]}
 */ function getCorners(a, points) {
    if (points === void 0) points = [];
    points[0] = a[0].slice();
    points[1] = [
        a[0][1],
        a[1][0]
    ];
    points[2] = a[1].slice();
    points[3] = [
        a[1][0],
        a[0][1]
    ];
    return points;
}
/**
 * Scales a rectangle.
 * @param {import("./types.js").rect} a
 * @param {number} n
 * @returns {import("./types.js").rect}
 */ function scale(a, n) {
    a[0][0] *= n;
    a[0][1] *= n;
    a[1][0] *= n;
    a[1][1] *= n;
    return a;
}
/**
 * Sets the size of a rectangle using width and height.
 * @param {import("./types.js").rect} a
 * @param {import("./types.js").vec2} size
 * @returns {import("./types.js").rect}
 */ function setSize(a, size) {
    a[1][0] = a[0][0] + size[0];
    a[1][1] = a[0][1] + size[1];
    return a;
}
/**
 * Returns the size of a rectangle.
 * @param {import("./types.js").rect} a
 * @param {import("./types.js").vec2} out
 * @returns {import("./types.js").vec2}
 */ function size(a, out) {
    if (out === void 0) out = [];
    out[0] = width(a);
    out[1] = height(a);
    return out;
}
/**
 * Returns the width of a rectangle.
 * @param {import("./types.js").rect} a
 * @returns {number}
 */ function width(a) {
    return a[1][0] - a[0][0];
}
/**
 * Returns the height of a rectangle.
 * @param {import("./types.js").rect} a
 * @returns {number}
 */ function height(a) {
    return a[1][1] - a[0][1];
}
/**
 * Returns the aspect ratio of a rectangle.
 * @param {import("./types.js").rect} a
 * @returns {number}
 */ function aspectRatio(a) {
    return width(a) / height(a);
}
/**
 * Sets the position of a rectangle.
 * @param {import("./types.js").rect} a
 * @param {import("./types.js").vec2} p
 * @returns {import("./types.js").rect}
 */ function setPosition(a, param) {
    let [x, y] = param;
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
 * @param {import("./types.js").rect} a
 * @param {import("./types.js").vec2} out
 * @returns {import("./types.js").rect}
 */ function center(a, out) {
    if (out === void 0) out = [];
    out[0] = a[0][0] + width(a) * 0.5;
    out[1] = a[0][1] + height(a) * 0.5;
    return out;
}
/**
 * Checks if a point is inside a rectangle.
 * @param {import("./types.js").rect} a
 * @param {import("./types.js").vec2} p
 * @returns {boolean}
 */ function containsPoint(a, param) {
    let [x, y] = param;
    return x >= a[0][0] && x <= a[1][0] && y >= a[0][1] && y <= a[1][1];
}
/**
 * Checks if a rectangle is inside another rectangle.
 * @param {import("./types.js").rect} a
 * @param {import("./types.js").rect} b
 * @returns {boolean}
 */ function containsRect(a, b) {
    return containsPoint(a, b[0]) && containsPoint(a, b[1]);
}
/**
 * Includes a point in a rectangle.
 * @param {import("./types.js").rect} a
 * @param {import("./types.js").vec2} p
 * @returns {import("./types.js").rect}
 */ function includePoint(a, param) {
    let [x, y] = param;
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
 * @param {import("./types.js").rect} a
 * @param {import("./types.js").rect} b
 * @returns {import("./types.js").rect}
 */ function includeRect(a, b) {
    includePoint(a, b[0]);
    includePoint(a, b[1]);
    return a;
}
/**
 * Maps a point into the dimensions of a rectangle.
 * @param {import("./types.js").rect} a
 * @param {import("./types.js").vec2} p
 * @returns {import("./types.js").vec2}
 */ function mapPoint(a, p) {
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
 * @param {import("./types.js").rect} a
 * @param {import("./types.js").vec2} p
 * @returns {import("./types.js").vec2}
 */ function clampPoint(a, p) {
    const minx = a[0][0];
    const miny = a[0][1];
    const maxx = a[1][0];
    const maxy = a[1][1];
    p[0] = Math.max(minx, Math.min(p[0], maxx));
    p[1] = Math.max(miny, Math.min(p[1], maxy));
    return p;
}
/**
 * Prints a rect to a string.
 * @param {import("./types.js").rect} a
 * @param {number} [precision=4]
 * @returns {string}
 */ function toString(a, precision) {
    if (precision === void 0) precision = 4;
    // prettier-ignore
    return `[${toString$5(a[0], precision)}, ${toString$5(a[1], precision)}]`;
}

var rect = /*#__PURE__*/Object.freeze({
  __proto__: null,
  aspectRatio: aspectRatio,
  center: center,
  clampPoint: clampPoint,
  containsPoint: containsPoint,
  containsRect: containsRect,
  copy: copy,
  create: create,
  empty: empty,
  fromPoints: fromPoints,
  getCorners: getCorners,
  height: height,
  includePoint: includePoint,
  includeRect: includeRect,
  isEmpty: isEmpty,
  mapPoint: mapPoint,
  scale: scale,
  set: set,
  setPosition: setPosition,
  setSize: setSize,
  size: size,
  toString: toString,
  width: width
});

export { aabb, plane, ray, rect };
