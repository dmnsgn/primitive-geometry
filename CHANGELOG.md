# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

# [2.11.0](https://github.com/dmnsgn/primitive-geometry/compare/v2.10.1...v2.11.0) (2025-05-24)


### Features

* add mergeCentroid option for ellipse, disc, reuleux, squircle and superellipse ([e590786](https://github.com/dmnsgn/primitive-geometry/commit/e5907861c48aa6aa39d53b792b468bda8fb297ac))
* add polar uv mapping + add safer division ([fa8e850](https://github.com/dmnsgn/primitive-geometry/commit/fa8e850633e42351ede778f34fd28c81a9fb42a7))
* use ellipse for annulus + add support for elliptical annulus ([e8b2640](https://github.com/dmnsgn/primitive-geometry/commit/e8b2640d53025abb1c95a1ca1d32b90ea1dab5b6))



## [2.10.1](https://github.com/dmnsgn/primitive-geometry/compare/v2.10.0...v2.10.1) (2024-06-20)


### Bug Fixes

* Update types export in package.json ([4c18ff1](https://github.com/dmnsgn/primitive-geometry/commit/4c18ff141e398ea276919408b9f5d94d73780d41)), closes [#18](https://github.com/dmnsgn/primitive-geometry/issues/18)



# [2.10.0](https://github.com/dmnsgn/primitive-geometry/compare/v2.9.1...v2.10.0) (2024-02-04)


### Features

* use 3D positions for circle ([5bb9e3b](https://github.com/dmnsgn/primitive-geometry/commit/5bb9e3b68b4de45ceec0864465a0edf4fffe1d7e)), closes [#15](https://github.com/dmnsgn/primitive-geometry/issues/15)



## [2.9.1](https://github.com/dmnsgn/primitive-geometry/compare/v2.9.0...v2.9.1) (2022-10-26)


### Bug Fixes

* ccw triangle order for rounded rectangle edges ([c04dc96](https://github.com/dmnsgn/primitive-geometry/commit/c04dc9698eba752b10d73c438a1daeadb474228d))



# [2.9.0](https://github.com/dmnsgn/primitive-geometry/compare/v2.8.0...v2.9.0) (2022-09-22)


### Features

* add phi/thetaOffset ([1ea22da](https://github.com/dmnsgn/primitive-geometry/commit/1ea22da7b69384c0d5fc32d9613d68d8a1a4c2ec))
* add rounded rectangle and stadium ([0dd9d9e](https://github.com/dmnsgn/primitive-geometry/commit/0dd9d9ed70194d1e78f85df6db8096589fd626df))



# [2.8.0](https://github.com/dmnsgn/primitive-geometry/compare/v2.7.0...v2.8.0) (2022-09-14)


### Features

* add elliptical geometries (ellipse, superellipse, squircle, reuleux) ([ba5b72f](https://github.com/dmnsgn/primitive-geometry/commit/ba5b72f6fed5748cde1dc62b8b9580f33f481cc1))



# [2.7.0](https://github.com/dmnsgn/primitive-geometry/compare/v2.6.0...v2.7.0) (2022-06-15)


### Features

* **plane:** add quads option ([3b9cb02](https://github.com/dmnsgn/primitive-geometry/commit/3b9cb02db95882faceb20049a3edbd9ceeec776a)), closes [#11](https://github.com/dmnsgn/primitive-geometry/issues/11)



# [2.6.0](https://github.com/dmnsgn/primitive-geometry/compare/v2.5.0...v2.6.0) (2022-04-15)


### Features

* **capsule:** add roundSegments ([4a0ca75](https://github.com/dmnsgn/primitive-geometry/commit/4a0ca7586c1426169d63bec62f466647df424e9c))
* **rounded-cube:** add roundSegments and edgeSegments ([98741b9](https://github.com/dmnsgn/primitive-geometry/commit/98741b90e5660e1555e7c998265f5b88badda19f))



# [2.5.0](https://github.com/dmnsgn/primitive-geometry/compare/v2.4.0...v2.5.0) (2022-04-11)


### Bug Fixes

* **plane:** hardcode normals from direction ([18e2423](https://github.com/dmnsgn/primitive-geometry/commit/18e2423beb133c84ab35372dfc50388477bb5d49))
* **torus:** default radius and minorSegments ([14c5256](https://github.com/dmnsgn/primitive-geometry/commit/14c5256d36b125bc116b2f8e7c91de93723e3d23))


### Features

* add disc and annulus ([6328e9f](https://github.com/dmnsgn/primitive-geometry/commit/6328e9ffbe82955f8302e49b7d1ba67769f21f08))
* **quad:** make normal face z ([246f7de](https://github.com/dmnsgn/primitive-geometry/commit/246f7de131db1463c829c4bbbcb901b2ea892c82))


### Performance Improvements

* move iterator in increment expression + remove assignment to 0 (default with TypedArrays) ([d0dbfbc](https://github.com/dmnsgn/primitive-geometry/commit/d0dbfbc7c8acd19b1c1b032e7f7dfa3412ea78fd))
* **circle:** extract t value for cos/sin ([5d1c7dd](https://github.com/dmnsgn/primitive-geometry/commit/5d1c7dd8f6e55ec76b7c5b02ec6f938924120045))



# [2.4.0](https://github.com/dmnsgn/primitive-geometry/compare/v2.3.0...v2.4.0) (2022-04-06)


### Bug Fixes

* **capsule:** wrong cell order ([0aa7efb](https://github.com/dmnsgn/primitive-geometry/commit/0aa7efb8c5e1f6e00c9a7c21d465c4048e8d983d))


### Features

* add phi/theta for all geometries ([b3afdf8](https://github.com/dmnsgn/primitive-geometry/commit/b3afdf8e320b0056f7f1274e908cac97d78df632))



# [2.3.0](https://github.com/dmnsgn/primitive-geometry/compare/v2.2.0...v2.3.0) (2022-04-06)


### Features

* add tetrahedron + add icosahedron ([cd341d2](https://github.com/dmnsgn/primitive-geometry/commit/cd341d203274cec347242f58d373f69501caee13))
* **cylinder:** add capBaseSegments option ([92dc090](https://github.com/dmnsgn/primitive-geometry/commit/92dc090880ab1de82f0d68c5becddb10b90ab22e))
* add plane direction + refactor computePlane for use in both plane and cube ([a5392c3](https://github.com/dmnsgn/primitive-geometry/commit/a5392c30de99db8e2190d041451c9c963d1bd549))
* **circle:** add theta and closed options ([cf34b04](https://github.com/dmnsgn/primitive-geometry/commit/cf34b047c837efb6514b74da9848dab7d97c8eca))



# [2.2.0](https://github.com/dmnsgn/primitive-geometry/compare/v2.1.0...v2.2.0) (2021-10-02)


### Features

* add exports field to package.json ([09700e2](https://github.com/dmnsgn/primitive-geometry/commit/09700e218efe30b29e5d8b3bf71a44864adf2f32))



# [2.1.0](https://github.com/dmnsgn/primitive-geometry/compare/v2.0.1...v2.1.0) (2021-08-16)


### Features

* add arguments check ([797003b](https://github.com/dmnsgn/primitive-geometry/commit/797003bee9de62b8f7a03ccec5d34a0730605f1b)), closes [#10](https://github.com/dmnsgn/primitive-geometry/issues/10)



## [2.0.1](https://github.com/dmnsgn/primitive-geometry/compare/v2.0.0...v2.0.1) (2021-06-15)



# [2.0.0](https://github.com/dmnsgn/primitive-geometry/compare/v1.2.1...v2.0.0) (2021-04-27)


### Code Refactoring

* use ES modules and move to typed arrays ([d6f2aed](https://github.com/dmnsgn/primitive-geometry/commit/d6f2aedf1805b8506e2baf1ffc4190e6952158c5))


### BREAKING CHANGES

* switch to type module and move to typed arrays
