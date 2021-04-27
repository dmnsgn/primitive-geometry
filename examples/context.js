import createRegl from "regl";

const regl = createRegl({
  container: document.querySelector("main"),
  extensions: ["OES_element_index_uint", "OES_standard_derivatives"],
});

export default regl;
