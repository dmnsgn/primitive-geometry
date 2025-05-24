import * as Primitives from "../index.js";

import { setGeometries, pane, controls, CONFIG } from "./render.js";

const params = new URLSearchParams(window.location.search);

const update = (options) => {
  setGeometries(
    params.has("screenshot")
      ? [Primitives.disc({ segments: 128, innerSegments: 128, ...options })]
      : [
          Primitives.ellipse(options),
          Primitives.disc(options),
          Primitives.superellipse(options),
          null,
          Primitives.annulus(options),
          // Elliptical annulus
          Primitives.annulus({ sy: 0.5, options }),
          null,
          Primitives.squircle(options),
          Primitives.reuleux(options),
          null,
          Primitives.superellipse({
            m: 4,
            sx: 1,
            sy: 1,
            ...options,
          }), // Lamé special quartic (Squircle)
          Primitives.superellipse({
            m: 4,
            sx: 1,
            sy: 0.5,
            ...options,
          }), // Rectellipse
          Primitives.superellipse({ m: 2 / 3, sy: 1, ...options }), // Astroid
          null,
          Primitives.superellipse({ m: 1, sy: 1, ...options }), // Diamond
          Primitives.superellipse({
            m: 5 / 2,
            sx: 6 / 6,
            sy: 5 / 6,
            ...options,
          }), // Piet Hein 6 / 5
          Primitives.superellipse({
            m: 5 / 2,
            sx: 3 / 3,
            sy: 2 / 3,
            ...options,
          }), // Piet Hein 6 / 5
        ],
  );
};

const mappingOptions = Object.keys(Primitives.mappings);
if (params.has("screenshot")) window.screenshotItems = mappingOptions;

CONFIG.mapping = "";
CONFIG.theta = Primitives.utils.TAU;
CONFIG.thetaOffset = 0;
CONFIG.mergeCentroid = false;

const getGeometryOptions = () => ({
  // segments: 4,
  // innerSegments: 4,
  mapping: Primitives.mappings[CONFIG.mapping],
  theta: CONFIG.theta,
  thetaOffset: CONFIG.thetaOffset,
  mergeCentroid: CONFIG.mergeCentroid,
});

pane.addBlade({ view: "separator" });
pane
  .addBinding(CONFIG, "mapping", {
    options: [
      { text: "", value: "" },
      ...mappingOptions.map((value) => ({
        text: value,
        value,
      })),
    ],
  })
  .on("change", (event) => {
    update(getGeometryOptions());
    if (params.has("screenshot")) {
      window.dispatchEvent(new CustomEvent("screenshot"));
    }
  });
pane
  .addBinding(CONFIG, "theta", {
    min: 0,
    max: Primitives.utils.TAU,
  })
  .on("change", () => {
    update(getGeometryOptions());
  });
pane
  .addBinding(CONFIG, "thetaOffset", {
    min: 0,
    max: Primitives.utils.TAU,
  })
  .on("change", () => {
    update(getGeometryOptions());
  });
pane.addBinding(CONFIG, "mergeCentroid").on("change", () => {
  update(getGeometryOptions());
});

CONFIG.cycleMapping = false;
pane.addBinding(CONFIG, "cycleMapping");

CONFIG.mapping = params.get("mapping");
if (params.has("screenshot")) {
  CONFIG.axes = false;
  document.querySelector("main h1").innerHTML = ``;
  update();
  pane.refresh();
  pane.dispose();

  controls.damping = 0;
  controls.sphericalTarget = [0, Math.PI / 2, 1.5];
  controls.update();
  controls.damping = 0.9;
} else {
  update();
  pane.refresh();
}

setInterval(() => {
  if (CONFIG.cycleMapping) {
    CONFIG.mapping =
      mappingOptions[
        (mappingOptions.findIndex((m) => m === CONFIG.mapping) + 1) %
          mappingOptions.length
      ];

    pane.refresh();
  }
}, 2000);
