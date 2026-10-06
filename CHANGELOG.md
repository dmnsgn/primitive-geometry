# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

# [3.2.0](https://github.com/dmnsgn/primitive-geometry/compare/v3.1.0...v3.2.0) (2026-10-06)

### Bug Fixes

* center pole vertex u between wedge columns in revolution geometries ([d3955de](https://github.com/dmnsgn/primitive-geometry/commit/d3955deef402e48265a69dcdcfbcea4e4dc89566))
* make v follow distance along the curved profile for capsule hemispheres ([ad27fea](https://github.com/dmnsgn/primitive-geometry/commit/ad27fea4be088e35e2b1dcd161a69aa8da1e2039))
* threeSquircular mapping condition ([4c1006c](https://github.com/dmnsgn/primitive-geometry/commit/4c1006c5303baf6d0db349e86fb268136ba55898))

### Features

* add circumferential mapping for caps ([8ce644a](https://github.com/dmnsgn/primitive-geometry/commit/8ce644a94d6646c26e308e8fc9fdd577a0b5eb6c))
* add mergeSeam option ([d06f57e](https://github.com/dmnsgn/primitive-geometry/commit/d06f57efa93973864a18c4c71110742a536279ce))
* add welded support for revolution geometries ([dc16336](https://github.com/dmnsgn/primitive-geometry/commit/dc16336e32f71fcd39e1744d2a736b7986a5d90a))
* scope vDistribution to non-uniformly swept meridians ([47aa847](https://github.com/dmnsgn/primitive-geometry/commit/47aa8475d95f3c2ad7faa4dcf1078135e05d727a))
* size polyhedra by circumradius ([09637cc](https://github.com/dmnsgn/primitive-geometry/commit/09637ccfabe7e9e621520d15be70a343fbf3a83a))
* split two-ended revolution options into per-end pairs ([7a159f8](https://github.com/dmnsgn/primitive-geometry/commit/7a159f8712a7797aa258e3101dcae8cf99bd1595))

# [3.1.0](https://github.com/dmnsgn/primitive-geometry/compare/v3.0.0...v3.1.0) (2026-09-29)

### Features

* add innerRadius to disc, superellipse, squircle, astroid and reuleaux ([0391cd3](https://github.com/dmnsgn/primitive-geometry/commit/0391cd3957c40ffec2d40a61ad9eb156b46ae307))
* **ellipsoid, superellipsoid, astroidal-ellipsoid, superegg:** rename rx/ry/rz options to sx/sy/sz ([dc15784](https://github.com/dmnsgn/primitive-geometry/commit/dc1578422c4c28c1b2bbff4e2130a01f617cba37))
* **funnel:** rename radiusTop option to radiusApex ([9fd1676](https://github.com/dmnsgn/primitive-geometry/commit/9fd1676afdca425cfbea67be7e89ba3e2057555b))
* **hyperboloid:** rename radiusTop option to endRadius ([7c1a6bd](https://github.com/dmnsgn/primitive-geometry/commit/7c1a6bd721fdd4274890b4c34253e913022fd0a7))
* **quad:** make scale the side length, defaulting to 1 ([391a4c0](https://github.com/dmnsgn/primitive-geometry/commit/391a4c0535f87c99dc832042dbe79d16f2a15733))
* remove redundant edgeSegments from roundedRectangle, stadium and roundedCube ([c46c461](https://github.com/dmnsgn/primitive-geometry/commit/c46c46136389c8072aa221ef4970ea72a9b47b86))
* rename cross segments to edgeSegments + add edgeSegments to star + fix partial theta for polar path ([170e5fd](https://github.com/dmnsgn/primitive-geometry/commit/170e5fd69daf75c84eec78178218afa99815e34c))
* **reuleaux:** rename n option to sides ([dd93f3e](https://github.com/dmnsgn/primitive-geometry/commit/dd93f3ef1086fab8e3866ed80284c662deb90838))

# [3.0.0](https://github.com/dmnsgn/primitive-geometry/compare/v2.11.0...v3.0.0) (2026-09-23)

### Bug Fixes

* clamp ellipsoid theta and thetaOffset + fix bit-identical revolutions at the poles ([ca5e37b](https://github.com/dmnsgn/primitive-geometry/commit/ca5e37ba21384b4cf04dbe54175f408a41114e0d))
* clamp spherical ring inner radius ([6c71282](https://github.com/dmnsgn/primitive-geometry/commit/6c71282eefe92c90581b3fe33bd435d1304e6ff4))
* correct ellipsoid normals ([bd2f04f](https://github.com/dmnsgn/primitive-geometry/commit/bd2f04f2765a6a66402fb076aec288fc9ed7de5b))
* correct prism and antiprism uvs ([86101af](https://github.com/dmnsgn/primitive-geometry/commit/86101af9ce2cd8bee739f37f7e1fe32ca1aab31e))
* correct spherical ring uvs ([da2076b](https://github.com/dmnsgn/primitive-geometry/commit/da2076b3e33648c20bbdd9bbb2687fefe69eec46))
* correct thetaOffset equation for reuleaux ([66d74f3](https://github.com/dmnsgn/primitive-geometry/commit/66d74f3f807e35ee446a8d3b48f71954248a2ea1))
* correct uv direction in computeFaceContext ([95c94da](https://github.com/dmnsgn/primitive-geometry/commit/95c94da5a0bf14ee585054ead8e91b9136f21f3a))
* **cylinder, capsule, ellipsoid, torus:** weld wrap/pole seams and drop degenerate fan triangles ([6cc1c29](https://github.com/dmnsgn/primitive-geometry/commit/6cc1c2988a523276ce179e5e39868a8a4cfd1130))
* default icosahedron subdivision to 0 ([a6837dd](https://github.com/dmnsgn/primitive-geometry/commit/a6837ddfcd1a17fe4b410882be83719b4191d936))
* **ellipse:** weld wrap column for closed shapes ([8fc5349](https://github.com/dmnsgn/primitive-geometry/commit/8fc5349223788134d005c81740b53e5cb498f770)), closes [#16](https://github.com/dmnsgn/primitive-geometry/issues/16)
* formalize triangulate face to match TRIANGLE_STRIP ([91e838a](https://github.com/dmnsgn/primitive-geometry/commit/91e838a28300785ddedf819c47857ce4df2725e7))
* handle innerSegments for triquetra's core ([0ebc276](https://github.com/dmnsgn/primitive-geometry/commit/0ebc276e120217818746bec8d18c585b6bb27ff8))
* make all quad attributes Float32Array ([d26f9eb](https://github.com/dmnsgn/primitive-geometry/commit/d26f9eb3c2c29dd121158f89abef759cd489e89f))
* rename reuleux to reuleaux ([d1f3f03](https://github.com/dmnsgn/primitive-geometry/commit/d1f3f0329e162dd702aa487d50d77593e2b54006))

### Features

* add all path versions of plane geometries ([4bfb459](https://github.com/dmnsgn/primitive-geometry/commit/4bfb4598099908c1a7d14a4d740f9d2786b436de))
* add apple + add lemon ([f3884c4](https://github.com/dmnsgn/primitive-geometry/commit/f3884c40f8981dca0866d57b83a5f88c4eddb88e))
* add arbelos ([7d5893a](https://github.com/dmnsgn/primitive-geometry/commit/7d5893a1be717c3134789e2ce82f92130412b792))
* add arc geometries: lune, lens, salinon, ying-yang ([e5778bb](https://github.com/dmnsgn/primitive-geometry/commit/e5778bb19b64d67fb68077a6feb2cea553bb129e))
* add astroid + add astroidal ellipsoid ([51f3d4e](https://github.com/dmnsgn/primitive-geometry/commit/51f3d4ee0d19efe0587b0964cb95b6443a02f902))
* add barrel ([57c8bcf](https://github.com/dmnsgn/primitive-geometry/commit/57c8bcf282832f693fd6205b1364eff63a0820e9))
* add bicone + add doubleCone ([245277c](https://github.com/dmnsgn/primitive-geometry/commit/245277c6b592f4b08e25aa99473fbcdb1065edbd))
* add computeGridQuad for hollow sphere and torus ([e8227ac](https://github.com/dmnsgn/primitive-geometry/commit/e8227acdb78a27a39140adbd72a33a1e5240b2c6))
* add cross ([64780b5](https://github.com/dmnsgn/primitive-geometry/commit/64780b5e786e45c12522c30b10b09eb393edfd5c))
* add edge subdivision for rectangle/square ([9b34b2b](https://github.com/dmnsgn/primitive-geometry/commit/9b34b2b0ff447dd149f49ad9ad8eeb4ae5dd8e63))
* add elliptical torus with minorSx/minorSy + add elliptical cylinder/cone with sx/sz ([649aa48](https://github.com/dmnsgn/primitive-geometry/commit/649aa4886fbbd8f152d48f7c5395983eaa1f2291))
* add funnel ([4a58788](https://github.com/dmnsgn/primitive-geometry/commit/4a587888eb6dd280fdb98037bb9eefe47427cb17))
* add hollow cube + add hollow sphere + add hollow cylinder ([0c0b9ef](https://github.com/dmnsgn/primitive-geometry/commit/0c0b9ef3b2555c62262e9908f46399559b53591c))
* add hyperboloid + add paraboloid ([7124533](https://github.com/dmnsgn/primitive-geometry/commit/7124533a4e04faa788c000547623de9fd5e5200a))
* add innerRadius to quadrilaterals ([54456c4](https://github.com/dmnsgn/primitive-geometry/commit/54456c44301b143cfdddfffb12d69fd61d72c0b6))
* add Path suffix for path geometries ([4004edd](https://github.com/dmnsgn/primitive-geometry/commit/4004eddb2582264ae7e1c08e9f92693609777e1e))
* add phiOffset to capsule, cone, cylinder ([36e3d23](https://github.com/dmnsgn/primitive-geometry/commit/36e3d2358e7665268b2d3a709f1deba35879190f))
* add polygon, kite, rhombus, lozenge ([b576328](https://github.com/dmnsgn/primitive-geometry/commit/b5763285466a81786cf9b6b8a2930b3cc9dcf2bd))
* add prism + add antiprism ([c67cbfb](https://github.com/dmnsgn/primitive-geometry/commit/c67cbfb83dbae1031d98a83124facfe3658e3410))
* add rectangle ([d73d3e3](https://github.com/dmnsgn/primitive-geometry/commit/d73d3e3a5d691d87cc414079cb19051ecf0f96b1))
* add regular and geodesic-dome polyhedra geometries ([d2c90ba](https://github.com/dmnsgn/primitive-geometry/commit/d2c90babaa23ca15b04c0acbe50f52a7e9fd2984))
* add regular quad/triangular/hexagonal grids + replace plane quads option with grid ([cbf8ed2](https://github.com/dmnsgn/primitive-geometry/commit/cbf8ed230ff63a140d32c03b0f9be5d5e0b48e7e))
* add roundDirection option to roundedCube + add roundedCorners option to roundedRectangle ([4e86817](https://github.com/dmnsgn/primitive-geometry/commit/4e86817ccd637e6b99a77fbc45025bda493053d2))
* add rounded cylinder ([8e41787](https://github.com/dmnsgn/primitive-geometry/commit/8e417872a4620ed5ba5e91d10eb15397d0913988))
* add spherical ring ([916da3b](https://github.com/dmnsgn/primitive-geometry/commit/916da3bb1aed5ab4294d209ef7526c7d1292dbac))
* add sphericon ([8be27c3](https://github.com/dmnsgn/primitive-geometry/commit/8be27c3a6f2edbc6cfdf0ebda8970b52d2a08ff9))
* add square ([7371f75](https://github.com/dmnsgn/primitive-geometry/commit/7371f7565d9fb96d67d94e98a9fa36616dd2cb15))
* add star geometry ([7b3482d](https://github.com/dmnsgn/primitive-geometry/commit/7b3482d61157168f85f263ac6084d7ba31787472))
* add superellipsoid + add superegg ([56a7075](https://github.com/dmnsgn/primitive-geometry/commit/56a70754b56c2ecec3a89248ecf5b792774acaad))
* add tetrahedronFaces center option ([0ea9ae8](https://github.com/dmnsgn/primitive-geometry/commit/0ea9ae84253de81f99701452cf4c62ec486526d8))
* add trapezoid + add parallelogram ([7d786c4](https://github.com/dmnsgn/primitive-geometry/commit/7d786c40c4def919cd13e3f3cbdaddd4d3ab45d2))
* add triangle + add right triangle + add fullscreenTriangle utils ([48689c7](https://github.com/dmnsgn/primitive-geometry/commit/48689c7a2771f0ab7cab0e6b9d2d5cb676083c26))
* add triquetra ([ee1d4c8](https://github.com/dmnsgn/primitive-geometry/commit/ee1d4c8f3f5ff1b727735ced1ef49b8090b056a0))
* add vDistribution for revolution geometries ([977acc6](https://github.com/dmnsgn/primitive-geometry/commit/977acc6401c821038e248d1e77e129d1489fa684))
* consolidate cuboid faces order +x, -x, +y, -y, +z, -z and vertex order ([5a12a72](https://github.com/dmnsgn/primitive-geometry/commit/5a12a72b358c30c0929ba84bda1435a0a16b032a))
* dedupe cap-wiring helper for barrel/funnel/hyperboloid ([c7c5881](https://github.com/dmnsgn/primitive-geometry/commit/c7c5881b1ff97e544d573b41cb6b2c1a8dce0b98))
* dedupe prism/antiprism corner() and buildCap ([b2bb12d](https://github.com/dmnsgn/primitive-geometry/commit/b2bb12d4944494e235b43dc557db420ffe49cc6f))
* dedupe triquetra columnAngle against swept-arc ([a62a959](https://github.com/dmnsgn/primitive-geometry/commit/a62a959526a1d60691ce6a6a840748bdaecf08b5))
* expose and formalize polygon face geometry definitions ([e7cc938](https://github.com/dmnsgn/primitive-geometry/commit/e7cc93877a33bfc815dc5e178c27065adf8928c2))
* extract shared spindle-arc helper for apple/lemon ([1559b10](https://github.com/dmnsgn/primitive-geometry/commit/1559b107f0ca9326c8dde6824262a177f8053bd6))
* extract the shared trapezoid/triangle corner-centering helper ([e0c1645](https://github.com/dmnsgn/primitive-geometry/commit/e0c1645276441dbe5c2ffcb2305545d637f9a361))
* generalise computeCap + add caps to torus ([2cb1ba7](https://github.com/dmnsgn/primitive-geometry/commit/2cb1ba7fd94600a5c8d98a4512e62d309eab019a))
* remove checkArguments ([a95fc77](https://github.com/dmnsgn/primitive-geometry/commit/a95fc776396cca8a3208e616e3583c5b8771e554))
* rename cubesphere to hexasphere and use hexahedronFaces ([6314e1a](https://github.com/dmnsgn/primitive-geometry/commit/6314e1ac8efb436e8d0f843aea7f8fa6774fa80d))
* **rounded-rectangle, rounded-cube:** use single welded grid via computePlane to avoid discontinuities ([51a6bb8](https://github.com/dmnsgn/primitive-geometry/commit/51a6bb8da797ff6d86a204189f36e8faeb45f457)), closes [#13](https://github.com/dmnsgn/primitive-geometry/issues/13) [#20](https://github.com/dmnsgn/primitive-geometry/issues/20)
* use computePlane for roundedRectangle ([ec413aa](https://github.com/dmnsgn/primitive-geometry/commit/ec413aae1767bda5e6dc661540c5082726c4abec))
* use computeRevolutionGeometry in capsule ([1058cd1](https://github.com/dmnsgn/primitive-geometry/commit/1058cd18f2b81f5c770463214e85b38de8383233))
* use cubeFaces in hexahedron ([c235a4b](https://github.com/dmnsgn/primitive-geometry/commit/c235a4bf3038e7f96ffb44e935bfadea6b25d4cb))

### BREAKING CHANGES

* **cylinder, capsule, ellipsoid, torus:** fans create less cells
* fixed reuleaux naming typo
* Float32Array for quad normals/uvs
* new icosphere, tetrahedron and icosahedron implementations
* **rounded-rectangle, rounded-cube:** nx/ny(/nz) options default to edgeSegments; zero-size straight sections now collapse instead of emitting degenerate cells.
* nx+1 columns are generated instead of nx
* quad cells order
* remove plane quad option in favour of quadGrid
* reuleaux thetaOffset behaviour
* update circle cells definition
* use computeCap for cylinder

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
