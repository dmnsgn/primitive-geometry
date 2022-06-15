# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
