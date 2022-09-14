import * as Primitives from "../index.js";

import { setGeometries, pane, controls, CONFIG } from "./render.js";

const params = new URLSearchParams(window.location.search);

const update = (mapping) => {
  setGeometries(
    params.has("screenshot")
      ? [Primitives.disc({ segments: 128, innerSegments: 128, mapping })]
      : [
          Primitives.ellipse({ mapping }),
          Primitives.disc({ mapping }),
          Primitives.superellipse({ mapping }),
          null,
          Primitives.squircle({ mapping }),
          Primitives.annulus({ mapping }),
          Primitives.reuleux({ mapping }),
          null,
          Primitives.superellipse({
            m: 4,
            sx: 1,
            sy: 1,
            mapping,
          }), // Lamé special quartic (Squircle)
          Primitives.superellipse({ m: 4, sx: 1, sy: 0.5, mapping }), // Rectellipse
          Primitives.superellipse({ m: 2 / 3, sy: 1, mapping }), // Astroid
          null,
          Primitives.superellipse({ m: 1, sy: 1, mapping }), // Diamond
          Primitives.superellipse({
            m: 5 / 2,
            sx: 6 / 6,
            sy: 5 / 6,
            mapping,
          }), // Piet Hein 6 / 5
          Primitives.superellipse({
            m: 5 / 2,
            sx: 3 / 3,
            sy: 2 / 3,
            mapping,
          }), // Piet Hein 6 / 5
        ]
  );
};

const mappingOptions = Object.keys(Primitives.mappings);
if (params.has("screenshot")) window.screenshotItems = mappingOptions;

CONFIG.mapping = "";
pane.addSeparator();
pane
  .addInput(CONFIG, "mapping", {
    options: [
      { text: "", value: "" },
      ...mappingOptions.map((value) => ({
        text: value,
        value,
      })),
    ],
  })
  .on("change", (event) => {
    update(Primitives.mappings[event.value]);
    if (params.has("screenshot")) {
      window.dispatchEvent(new CustomEvent("screenshot"));
    }
  });

CONFIG.cycleMapping = false;
pane.addInput(CONFIG, "cycleMapping");

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
