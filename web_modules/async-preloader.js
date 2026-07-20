import { r as __toESM, t as __commonJSMin } from "./_chunks/rolldown-runtime-DUFJ1jAm.js";

var require_fontfaceobserver_umd = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	(function(e, t) {
		"object" == typeof exports && "undefined" != typeof module ? module.exports = t() : "function" == typeof define && define.amd ? define(t) : (e = e || self).FontFaceObserver = t();
	})(exports, function() {
		"use strict";
		function n(e, t) {
			if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
		}
		function i(e, t) {
			for (var n = 0; n < t.length; n++) {
				var i = t[n];
				i.enumerable = i.enumerable || !1, i.configurable = !0, "value" in i && (i.writable = !0), Object.defineProperty(e, i.key, i);
			}
		}
		function e(e, t, n) {
			return t && i(e.prototype, t), n && i(e, n), e;
		}
		function o(e, t, n) {
			return t in e ? Object.defineProperty(e, t, {
				value: n,
				enumerable: !0,
				configurable: !0,
				writable: !0
			}) : e[t] = n, e;
		}
		var l = {
			maxWidth: "none",
			display: "inline-block",
			position: "absolute",
			height: "100%",
			width: "100%",
			overflow: "scroll",
			fontSize: "16px"
		}, a = {
			display: "inline-block",
			height: "200%",
			width: "200%",
			fontSize: "16px",
			maxWidth: "none"
		}, s = {
			maxWidth: "none",
			minWidth: "20px",
			minHeight: "20px",
			display: "inline-block",
			overflow: "hidden",
			position: "absolute",
			width: "auto",
			margin: "0",
			padding: "0",
			top: "-999px",
			whiteSpace: "nowrap",
			fontSynthesis: "none"
		}, S = function() {
			function t(e) {
				n(this, t), this.element = document.createElement("div"), this.element.setAttribute("aria-hidden", "true"), this.element.appendChild(document.createTextNode(e)), this.collapsible = document.createElement("span"), this.expandable = document.createElement("span"), this.collapsibleInner = document.createElement("span"), this.expandableInner = document.createElement("span"), this.lastOffsetWidth = -1, Object.assign(this.collapsible.style, l), Object.assign(this.expandable.style, l), Object.assign(this.expandableInner.style, l), Object.assign(this.collapsibleInner.style, a), this.collapsible.appendChild(this.collapsibleInner), this.expandable.appendChild(this.expandableInner), this.element.appendChild(this.collapsible), this.element.appendChild(this.expandable);
			}
			return e(t, [
				{
					key: "getElement",
					value: function() {
						return this.element;
					}
				},
				{
					key: "setFont",
					value: function(e) {
						Object.assign(this.element.style, function(t) {
							for (var e = 1; e < arguments.length; e++) {
								var n = null != arguments[e] ? arguments[e] : {}, i = Object.keys(n);
								"function" == typeof Object.getOwnPropertySymbols && (i = i.concat(Object.getOwnPropertySymbols(n).filter(function(e) {
									return Object.getOwnPropertyDescriptor(n, e).enumerable;
								}))), i.forEach(function(e) {
									o(t, e, n[e]);
								});
							}
							return t;
						}({}, s, { font: e }));
					}
				},
				{
					key: "getWidth",
					value: function() {
						return this.element.offsetWidth;
					}
				},
				{
					key: "setWidth",
					value: function(e) {
						this.element.style.width = e + "px";
					}
				},
				{
					key: "reset",
					value: function() {
						var e = this.getWidth(), t = e + 100;
						return this.expandableInner.style.width = t + "px", this.expandable.scrollLeft = t, this.collapsible.scrollLeft = this.collapsible.scrollWidth + 100, this.lastOffsetWidth !== e && (this.lastOffsetWidth = e, !0);
					}
				},
				{
					key: "onScroll",
					value: function(e) {
						this.reset() && null !== this.element.parentNode && e(this.lastOffsetWidth);
					}
				},
				{
					key: "onResize",
					value: function(e) {
						var t = this;
						function n() {
							t.onScroll(e);
						}
						this.collapsible.addEventListener("scroll", n), this.expandable.addEventListener("scroll", n), this.reset();
					}
				}
			]), t;
		}();
		var t = function() {
			function b(e) {
				var t = 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : {};
				return n(this, b), this.family = e, this.style = t.style || "normal", this.weight = t.weight || "normal", this.stretch = t.stretch || "normal", this;
			}
			return e(b, null, [
				{
					key: "getUserAgent",
					value: function() {
						return window.navigator.userAgent;
					}
				},
				{
					key: "getNavigatorVendor",
					value: function() {
						return window.navigator.vendor;
					}
				},
				{
					key: "hasWebKitFallbackBug",
					value: function() {
						if (null === b.HAS_WEBKIT_FALLBACK_BUG) {
							var e = /AppleWebKit\/([0-9]+)(?:\.([0-9]+))/.exec(b.getUserAgent());
							b.HAS_WEBKIT_FALLBACK_BUG = !!e && (parseInt(e[1], 10) < 536 || 536 === parseInt(e[1], 10) && parseInt(e[2], 10) <= 11);
						}
						return b.HAS_WEBKIT_FALLBACK_BUG;
					}
				},
				{
					key: "hasSafari10Bug",
					value: function() {
						if (null === b.HAS_SAFARI_10_BUG) if (b.supportsNativeFontLoading() && /Apple/.test(b.getNavigatorVendor())) {
							var e = /AppleWebKit\/([0-9]+)(?:\.([0-9]+))(?:\.([0-9]+))/.exec(b.getUserAgent());
							b.HAS_SAFARI_10_BUG = !!e && parseInt(e[1], 10) < 603;
						} else b.HAS_SAFARI_10_BUG = !1;
						return b.HAS_SAFARI_10_BUG;
					}
				},
				{
					key: "supportsNativeFontLoading",
					value: function() {
						return null === b.SUPPORTS_NATIVE_FONT_LOADING && (b.SUPPORTS_NATIVE_FONT_LOADING = !!document.fonts), b.SUPPORTS_NATIVE_FONT_LOADING;
					}
				},
				{
					key: "supportStretch",
					value: function() {
						if (null === b.SUPPORTS_STRETCH) {
							var e = document.createElement("div");
							try {
								e.style.font = "condensed 100px sans-serif";
							} catch (e) {}
							b.SUPPORTS_STRETCH = "" !== e.style.font;
						}
						return b.SUPPORTS_STRETCH;
					}
				}
			]), e(b, [
				{
					key: "load",
					value: function(e, t) {
						var p = this, m = e || "BESbswy", g = 0, y = t || b.DEFAULT_TIMEOUT, v = p.getTime();
						return new Promise(function(h, f) {
							if (b.supportsNativeFontLoading() && !b.hasSafari10Bug()) {
								var e = new Promise(function(n, i) {
									(function t() {
										y <= p.getTime() - v ? i(/* @__PURE__ */ new Error(y + "ms timeout exceeded")) : document.fonts.load(p.getStyle("\"" + p.family + "\""), m).then(function(e) {
											1 <= e.length ? n() : setTimeout(t, 25);
										}, i);
									})();
								}), t = new Promise(function(e, t) {
									g = setTimeout(function() {
										t(/* @__PURE__ */ new Error(y + "ms timeout exceeded"));
									}, y);
								});
								Promise.race([t, e]).then(function() {
									clearTimeout(g), h(p);
								}, f);
							} else n = function() {
								var i = new S(m), o = new S(m), l = new S(m), a = -1, s = -1, r = -1, e = -1, t = -1, n = -1, u = document.createElement("div");
								function c() {
									null !== u.parentNode && u.parentNode.removeChild(u);
								}
								function d() {
									if ((-1 != a && -1 != s || -1 != a && -1 != r || -1 != s && -1 != r) && (a == s || a == r || s == r)) {
										if (b.hasWebKitFallbackBug() && (a == e && s == e && r == e || a == t && s == t && r == t || a == n && s == n && r == n)) return;
										c(), clearTimeout(g), h(p);
									}
								}
								u.dir = "ltr", i.setFont(p.getStyle("sans-serif")), o.setFont(p.getStyle("serif")), l.setFont(p.getStyle("monospace")), u.appendChild(i.getElement()), u.appendChild(o.getElement()), u.appendChild(l.getElement()), document.body.appendChild(u), e = i.getWidth(), t = o.getWidth(), n = l.getWidth(), function e() {
									if (y <= p.getTime() - v) c(), f(/* @__PURE__ */ new Error(y + "ms timeout exceeded"));
									else {
										var n = document.hidden;
										!0 !== n && void 0 !== n || (a = i.getWidth(), s = o.getWidth(), r = l.getWidth(), d()), g = setTimeout(e, 50);
									}
								}(), i.onResize(function(e) {
									a = e, d();
								}), i.setFont(p.getStyle("\"" + p.family + "\",sans-serif")), o.onResize(function(e) {
									s = e, d();
								}), o.setFont(p.getStyle("\"" + p.family + "\",serif")), l.onResize(function(e) {
									r = e, d();
								}), l.setFont(p.getStyle("\"" + p.family + "\",monospace"));
							}, document.body ? n() : document.addEventListener ? document.addEventListener("DOMContentLoaded", function e() {
								document.removeEventListener("DOMContentLoaded", e), n();
							}) : document.attachEvent("onreadystatechange", function e() {
								"interactive" != document.readyState && "complete" != document.readyState || (document.detachEvent("onreadystatechange", e), n());
							});
							var n;
						});
					}
				},
				{
					key: "getStyle",
					value: function(e) {
						return [
							this.style,
							this.weight,
							b.supportStretch() ? this.stretch : "",
							"100px",
							e
						].join(" ");
					}
				},
				{
					key: "getTime",
					value: function() {
						return (/* @__PURE__ */ new Date()).getTime();
					}
				}
			]), b;
		}();
		return o(t, "Ruler", S), o(t, "HAS_WEBKIT_FALLBACK_BUG", null), o(t, "HAS_SAFARI_10_BUG", null), o(t, "SUPPORTS_STRETCH", null), o(t, "SUPPORTS_NATIVE_FONT_LOADING", null), o(t, "DEFAULT_TIMEOUT", 3e3), t;
	});
}));

var import_fontfaceobserver_umd = /* @__PURE__ */ __toESM(require_fontfaceobserver_umd(), 1);
/**
* Keys used for the {@link AsyncPreloader.loaders}
*/
var LoaderKey;
(function(LoaderKey) {
	LoaderKey["Json"] = "Json";
	LoaderKey["ArrayBuffer"] = "ArrayBuffer";
	LoaderKey["Bytes"] = "Bytes";
	LoaderKey["Blob"] = "Blob";
	LoaderKey["FormData"] = "FormData";
	LoaderKey["Text"] = "Text";
	LoaderKey["Image"] = "Image";
	LoaderKey["Video"] = "Video";
	LoaderKey["Audio"] = "Audio";
	LoaderKey["Xml"] = "Xml";
	LoaderKey["Font"] = "Font";
})(LoaderKey || (LoaderKey = {}));

const isSafari = /^((?!chrome|android).)*safari/i.test(globalThis.navigator?.userAgent) === true;
/**
* AsyncPreloader: assets preloader using ES2017 async/await and fetch.
*
* It exports an instance of itself as default so you can:
*
* ```js
* import Preloader from "async-preloader";
*
* await Preloader.loadItems([]);
* ```
*
* to use directly as a singleton or
*
* ```js
* import { AsyncPreloader as Preloader } from "async-preloader";
*
* const preloader = new Preloader();
* await preloader.loadItems([]);
* ```
* if you need more than one instance.
*/
var AsyncPreloader = class AsyncPreloader {
	/**
	* Object that contains the loaded items
	*/
	items = /* @__PURE__ */ new Map();
	/**
	* Default body method to be called on the Response from fetch if no body option is specified on the LoadItem
	*/
	defaultBodyMethod = "blob";
	/**
	* Default loader to use if no loader key is specified in the {@link LoadItem} or if the extension doesn't match any of the {@link AsyncPreloader.loaders} extensions
	*/
	defaultLoader = LoaderKey.Text;
	/**
	* Loader types and the extensions they handle
	*
	* Allows the omission of the loader key in a {@link LoadItem.loader} for some generic extensions
	*/
	static loaders = (/* @__PURE__ */ new Map()).set(LoaderKey.Text, { extensions: ["txt"] }).set(LoaderKey.Json, { extensions: ["json"] }).set(LoaderKey.Image, { extensions: [
		"jpeg",
		"jpg",
		"gif",
		"png",
		"webp"
	] }).set(LoaderKey.Video, { extensions: [
		"webm",
		"ogg",
		"mp4"
	] }).set(LoaderKey.Audio, { extensions: [
		"webm",
		"ogg",
		"mp3",
		"wav",
		"flac"
	] }).set(LoaderKey.Xml, {
		extensions: [
			"xml",
			"svg",
			"html"
		],
		mimeType: {
			xml: "text/xml",
			svg: "image/svg+xml",
			html: "text/html"
		},
		defaultMimeType: "text/xml"
	}).set(LoaderKey.Font, { extensions: [
		"woff2",
		"woff",
		"ttf",
		"otf",
		"eot"
	] });
	/**
	* DOMParser instance for the XML loader
	*/
	static domParser = typeof DOMParser !== "undefined" && new DOMParser();
	/**
	* Load the specified manifest (array of items)
	*
	* @param items Items to load
	* @returns Resolve when all items are loaded, reject for any error
	*/
	loadItems = async (items) => {
		return await Promise.all(items.map(this.loadItem));
	};
	/**
	* Load a single item
	*
	* @param item Item to load
	* @returns Resolve when item is loaded, reject for any error
	*/
	loadItem = async (item) => {
		if (typeof item === "string") item = { src: item };
		const loaderKey = item.loader || AsyncPreloader.getLoaderKey(AsyncPreloader.getFileExtension(item.src || ""));
		const loaderMethod = this[`load${loaderKey}`];
		const loadedItem = await loaderMethod(item);
		this.items.set(item.id || item.src, loadedItem);
		return loadedItem;
	};
	/**
	* Load a manifest of items
	*
	* @param src Manifest src url
	* @param key Manifest key in the JSON object containing the array of LoadItem.
	* @returns
	*/
	loadManifest = async (src, key = "items") => {
		const loadedManifest = await this.loadJson({ src });
		const items = AsyncPreloader.getProp(loadedManifest, key);
		return await this.loadItems(items);
	};
	/**
	* Load an item and parse the Response as text
	*
	* @param item Item to load
	* @returns Fulfilled value of parsed Response
	*/
	loadText = async (item) => {
		return await (await AsyncPreloader.fetchItem(item)).text();
	};
	/**
	* Load an item and parse the Response as json
	*
	* @param item Item to load
	* @returns Fulfilled value of parsed Response
	*/
	loadJson = async (item) => {
		return await (await AsyncPreloader.fetchItem(item)).json();
	};
	/**
	* Load an item and parse the Response as arrayBuffer
	*
	* @param item Item to load
	* @returns Fulfilled value of parsed Response
	*/
	loadArrayBuffer = async (item) => {
		return await (await AsyncPreloader.fetchItem(item)).arrayBuffer();
	};
	/**
	* Load an item and parse the Response as bytes
	*
	* @param item Item to load
	* @returns Fulfilled value of parsed Response
	*/
	loadBytes = async (item) => {
		return await (await AsyncPreloader.fetchItem(item)).bytes();
	};
	/**
	* Load an item and parse the Response as blob
	*
	* @param item Item to load
	* @returns Fulfilled value of parsed Response
	*/
	loadBlob = async (item) => {
		return await (await AsyncPreloader.fetchItem(item)).blob();
	};
	/**
	* Load an item and parse the Response as formData
	*
	* @param item Item to load
	* @returns Fulfilled value of parsed Response
	*/
	loadFormData = async (item) => {
		return await (await AsyncPreloader.fetchItem(item)).formData();
	};
	/**
	* Load an item in one of the following cases:
	* - item's "loader" option set as "Image"
	* - item's "src" option extensions matching the loaders Map
	* - direct call of the method
	*
	* @param item Item to load
	* @returns Fulfilled value with a decoded HTMLImageElement instance of or a parsed Response according to the "body" option. Defaults to a decoded HTMLImageElement.
	*/
	loadImage = async (item) => {
		const image = new Image();
		if (item.body) {
			const data = await (await AsyncPreloader.fetchItem(item))[item.body]();
			if (item.body !== "blob") return data;
			return await new Promise((resolve, reject) => {
				image.addEventListener("load", function load() {
					image.removeEventListener("load", load);
					URL.revokeObjectURL(image.src);
					resolve(image);
				});
				image.addEventListener("error", function error(event) {
					image.removeEventListener("error", error);
					URL.revokeObjectURL(image.src);
					reject(event);
				});
				image.src = URL.createObjectURL(data);
			});
		}
		image.src = item.src;
		if (!item.noDecode) await image.decode();
		return image;
	};
	/**
	* Load an item in one of the following cases:
	* - item's "loader" option set as "Video"
	* - item's "src" option extensions matching the loaders Map
	* - direct call of the method
	*
	* @param item Item to load
	* @returns Fulfilled value of parsed Response according to the "body" option. Defaults to an HTMLVideoElement with a blob as srcObject or src.
	*/
	loadVideo = async (item) => {
		const data = await (await AsyncPreloader.fetchItem(item))[item.body || this.defaultBodyMethod]();
		if (item.body) return data;
		const video = document.createElement("video");
		return await new Promise((resolve, reject) => {
			video.addEventListener("canplaythrough", function canplaythrough() {
				video.removeEventListener("canplaythrough", canplaythrough);
				URL.revokeObjectURL(video.src);
				resolve(video);
			});
			video.addEventListener("error", function error(event) {
				video.removeEventListener("error", error);
				URL.revokeObjectURL(video.src);
				reject(event);
			});
			try {
				if (isSafari) throw "";
				video.srcObject = data;
			} catch (error) {
				video.src = URL.createObjectURL(data);
			}
			video.load();
		});
	};
	/**
	* Load an item in one of the following cases:
	* - item's "loader" option set as "Audio"
	* - item's "src" option extensions matching the loaders Map
	* - direct call of the method
	*
	* @param item Item to load
	* @returns Fulfilled value of parsed Response according to the "body" option. Defaults to an HTMLAudioElement with a blob as srcObject or src.
	*/
	loadAudio = async (item) => {
		const data = await (await AsyncPreloader.fetchItem(item))[item.body || this.defaultBodyMethod]();
		if (item.body) return data;
		const audio = document.createElement("audio");
		audio.autoplay = false;
		audio.preload = "auto";
		return await new Promise((resolve, reject) => {
			audio.addEventListener("canplaythrough", function canplaythrough() {
				audio.removeEventListener("canplaythrough", canplaythrough);
				URL.revokeObjectURL(audio.src);
				resolve(audio);
			});
			audio.addEventListener("error", function error(event) {
				audio.removeEventListener("error", error);
				URL.revokeObjectURL(audio.src);
				reject(event);
			});
			try {
				if (isSafari) throw "";
				audio.srcObject = data;
			} catch (error) {
				audio.src = URL.createObjectURL(data);
			}
			audio.load();
		});
	};
	/**
	* Load an item in one of the following cases:
	* - item's "loader" option set as "Xml"
	* - item's "src" option extensions matching the loaders Map
	* - direct call of the method
	*
	* @param item Item to load (need a mimeType specified or default to "application/xml")
	* @returns Result of Response parsed as a document.
	*/
	loadXml = async (item) => {
		if (!item.mimeType) {
			const extension = AsyncPreloader.getFileExtension(item.src);
			item = {
				...item,
				mimeType: AsyncPreloader.getMimeType(LoaderKey.Xml, extension)
			};
		}
		if (!AsyncPreloader.domParser) throw new Error("DomParser is not supported.");
		if (!item.mimeType) throw new Error("AsyncPreloader.loadXml mimeType is unknown.");
		const data = await (await AsyncPreloader.fetchItem(item)).text();
		return AsyncPreloader.domParser.parseFromString(data, item.mimeType);
	};
	/**
	* Load a font via FontFace or check a font is loaded via FontFaceObserver instance
	*
	* @param item Item to load (id correspond to the font family name).
	* @returns Fulfilled value with FontFace instance or initial id if no src provided.
	*/
	loadFont = async (item) => {
		const fontName = item.id || AsyncPreloader.getFileName(item.src);
		const options = item.fontOptions || {};
		if (!item.src) {
			await new import_fontfaceobserver_umd.default(fontName, options.variant || {}).load(options.testString, options.timeout);
			return fontName;
		}
		const source = item.body === "arrayBuffer" ? await this.loadArrayBuffer({ src: item.src }) : `url(${item.src})`;
		return await new FontFace(fontName, source, options.descriptors).load().then((font) => {
			document.fonts.add(font);
			return font;
		});
	};
	/**
	* Fetch wrapper for LoadItem
	*
	* @param item Item to fetch
	* @returns Fetch response
	*/
	static fetchItem(item) {
		return fetch(item.src, item.options || {});
	}
	/**
	* Get an object property by its path in the form 'a[0].b.c' or ['a', '0', 'b', 'c'].
	* Similar to [lodash.get](https://lodash.com/docs/4.17.5#get).
	*
	* @param object Object with nested properties
	* @param path Path to the desired property
	* @returns The returned object property
	*/
	static getProp(object, path) {
		const p = Array.isArray(path) ? path : path.split(".").filter((index) => index.length);
		if (!p.length) return object;
		return AsyncPreloader.getProp(object[p.shift() ?? ""], p);
	}
	/**
	* Get file base
	*
	* @param path
	* @returns
	*/
	static getFileBase(path) {
		return path.split("?")[0].split("#")[0].split("/").pop() || "";
	}
	/**
	* Get file extension
	*
	* @param path
	* @returns
	*/
	static getFileExtension(path) {
		return AsyncPreloader.getFileBase(path).split(".")[1];
	}
	/**
	* Get file name
	*
	* @param path
	* @returns
	*/
	static getFileName(path) {
		return AsyncPreloader.getFileBase(path).split(".")[0] || path;
	}
	/**
	* Retrieve loader key from extension (when the loader option isn't specified in the LoadItem)
	*
	* @param extension
	* @returns
	*/
	static getLoaderKey(extension) {
		const loader = Array.from(AsyncPreloader.loaders).find((loader) => loader[1].extensions.includes(extension));
		return loader ? loader[0] : LoaderKey.Text;
	}
	/**
	* Retrieve mime type from extension
	*
	* @param loaderKey
	* @param extension
	* @returns
	*/
	static getMimeType(loaderKey, extension) {
		const loader = AsyncPreloader.loaders.get(loaderKey);
		return loader?.mimeType?.[extension] || loader?.defaultMimeType;
	}
};
const AsyncPreloaderInstance = new AsyncPreloader();

export { AsyncPreloader, LoaderKey, AsyncPreloaderInstance as default };