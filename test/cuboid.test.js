import { describe, it } from "node:test";
import assert from "node:assert/strict";

import * as Primitives from "../index.js";

describe("cuboid", () => {
  it("cubeFaces pins the shared face order, winding and diagonal direction every cuboid (cube/box/roundedCube/hollowCube) and hexahedron rely on", () => {
    const { positions, cells } = Primitives.cubeFaces({ sx: 1, sy: 1, sz: 1 });

    assert.deepEqual(
      Array.from(positions),
      [
        -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5,

        0.5, 0.5, -0.5, 0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5,
      ],
    );

    assert.deepEqual(cells, [
      [3, 2, 5, 4], // +x
      [7, 6, 1, 0], // -x
      [7, 0, 3, 4], // +y
      [1, 6, 5, 2], // -y
      [0, 1, 2, 3], // +z
      [4, 5, 6, 7], // -z
    ]);
  });
});
