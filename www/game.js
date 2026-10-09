(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // ad-bridge-build/node_modules/@capacitor/core/dist/index.js
  var ExceptionCode, CapacitorException, getPlatformId, createCapacitor, initCapacitorGlobal, Capacitor, registerPlugin, WebPlugin, encode, decode, CapacitorCookiesPluginWeb, CapacitorCookies, readBlobAsBase64, normalizeHttpHeaders, buildUrlParams, buildRequestInit, CapacitorHttpPluginWeb, CapacitorHttp, SystemBarsStyle, SystemBarType, SystemBarsPluginWeb, SystemBars;
  var init_dist = __esm({
    "ad-bridge-build/node_modules/@capacitor/core/dist/index.js"() {
      (function(ExceptionCode2) {
        ExceptionCode2["Unimplemented"] = "UNIMPLEMENTED";
        ExceptionCode2["Unavailable"] = "UNAVAILABLE";
      })(ExceptionCode || (ExceptionCode = {}));
      CapacitorException = class extends Error {
        constructor(message, code, data) {
          super(message);
          this.message = message;
          this.code = code;
          this.data = data;
        }
      };
      getPlatformId = (win) => {
        var _a, _b;
        if (win === null || win === void 0 ? void 0 : win.androidBridge) {
          return "android";
        } else if ((_b = (_a = win === null || win === void 0 ? void 0 : win.webkit) === null || _a === void 0 ? void 0 : _a.messageHandlers) === null || _b === void 0 ? void 0 : _b.bridge) {
          return "ios";
        } else {
          return "web";
        }
      };
      createCapacitor = (win) => {
        const capCustomPlatform = win.CapacitorCustomPlatform || null;
        const cap = win.Capacitor || {};
        const Plugins = cap.Plugins = cap.Plugins || {};
        const getPlatform = () => {
          return capCustomPlatform !== null ? capCustomPlatform.name : getPlatformId(win);
        };
        const isNativePlatform = () => getPlatform() !== "web";
        const isPluginAvailable = (pluginName) => {
          const plugin = registeredPlugins.get(pluginName);
          if (plugin === null || plugin === void 0 ? void 0 : plugin.platforms.has(getPlatform())) {
            return true;
          }
          if (getPluginHeader(pluginName)) {
            return true;
          }
          return false;
        };
        const getPluginHeader = (pluginName) => {
          var _a;
          return (_a = cap.PluginHeaders) === null || _a === void 0 ? void 0 : _a.find((h) => h.name === pluginName);
        };
        const handleError = (err) => win.console.error(err);
        const registeredPlugins = /* @__PURE__ */ new Map();
        const registerPlugin2 = (pluginName, jsImplementations = {}) => {
          const registeredPlugin = registeredPlugins.get(pluginName);
          if (registeredPlugin) {
            console.warn(`Capacitor plugin "${pluginName}" already registered. Cannot register plugins twice.`);
            return registeredPlugin.proxy;
          }
          const platform = getPlatform();
          const pluginHeader = getPluginHeader(pluginName);
          let jsImplementation;
          const loadPluginImplementation = async () => {
            if (!jsImplementation && platform in jsImplementations) {
              jsImplementation = typeof jsImplementations[platform] === "function" ? jsImplementation = await jsImplementations[platform]() : jsImplementation = jsImplementations[platform];
            } else if (capCustomPlatform !== null && !jsImplementation && "web" in jsImplementations) {
              jsImplementation = typeof jsImplementations["web"] === "function" ? jsImplementation = await jsImplementations["web"]() : jsImplementation = jsImplementations["web"];
            }
            return jsImplementation;
          };
          const createPluginMethod = (impl, prop) => {
            var _a, _b;
            if (pluginHeader) {
              const methodHeader = pluginHeader === null || pluginHeader === void 0 ? void 0 : pluginHeader.methods.find((m) => prop === m.name);
              if (methodHeader) {
                if (methodHeader.rtype === "promise") {
                  return (options) => cap.nativePromise(pluginName, prop.toString(), options);
                } else {
                  return (options, callback) => cap.nativeCallback(pluginName, prop.toString(), options, callback);
                }
              } else if (impl) {
                return (_a = impl[prop]) === null || _a === void 0 ? void 0 : _a.bind(impl);
              }
            } else if (impl) {
              return (_b = impl[prop]) === null || _b === void 0 ? void 0 : _b.bind(impl);
            } else {
              throw new CapacitorException(`"${pluginName}" plugin is not implemented on ${platform}`, ExceptionCode.Unimplemented);
            }
          };
          const createPluginMethodWrapper = (prop) => {
            let remove;
            const wrapper = (...args) => {
              const p = loadPluginImplementation().then((impl) => {
                const fn = createPluginMethod(impl, prop);
                if (fn) {
                  const p2 = fn(...args);
                  remove = p2 === null || p2 === void 0 ? void 0 : p2.remove;
                  return p2;
                } else {
                  throw new CapacitorException(`"${pluginName}.${prop}()" is not implemented on ${platform}`, ExceptionCode.Unimplemented);
                }
              });
              if (prop === "addListener") {
                p.remove = async () => remove();
              }
              return p;
            };
            wrapper.toString = () => `${prop.toString()}() { [capacitor code] }`;
            Object.defineProperty(wrapper, "name", {
              value: prop,
              writable: false,
              configurable: false
            });
            return wrapper;
          };
          const addListener = createPluginMethodWrapper("addListener");
          const removeListener = createPluginMethodWrapper("removeListener");
          const addListenerNative = (eventName, callback) => {
            const call = addListener({ eventName }, callback);
            const remove = async () => {
              const callbackId = await call;
              removeListener({
                eventName,
                callbackId
              }, callback);
            };
            const p = new Promise((resolve) => call.then(() => resolve({ remove })));
            p.remove = async () => {
              console.warn(`Using addListener() without 'await' is deprecated.`);
              await remove();
            };
            return p;
          };
          const proxy = new Proxy({}, {
            get(_, prop) {
              switch (prop) {
                // https://github.com/facebook/react/issues/20030
                case "$$typeof":
                  return void 0;
                case "toJSON":
                  return () => ({});
                case "addListener":
                  return pluginHeader ? addListenerNative : addListener;
                case "removeListener":
                  return removeListener;
                default:
                  return createPluginMethodWrapper(prop);
              }
            }
          });
          Plugins[pluginName] = proxy;
          registeredPlugins.set(pluginName, {
            name: pluginName,
            proxy,
            platforms: /* @__PURE__ */ new Set([...Object.keys(jsImplementations), ...pluginHeader ? [platform] : []])
          });
          return proxy;
        };
        if (!cap.convertFileSrc) {
          cap.convertFileSrc = (filePath) => filePath;
        }
        cap.getPlatform = getPlatform;
        cap.handleError = handleError;
        cap.isNativePlatform = isNativePlatform;
        cap.isPluginAvailable = isPluginAvailable;
        cap.registerPlugin = registerPlugin2;
        cap.Exception = CapacitorException;
        cap.DEBUG = !!cap.DEBUG;
        cap.isLoggingEnabled = !!cap.isLoggingEnabled;
        return cap;
      };
      initCapacitorGlobal = (win) => win.Capacitor = createCapacitor(win);
      Capacitor = /* @__PURE__ */ initCapacitorGlobal(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {});
      registerPlugin = Capacitor.registerPlugin;
      WebPlugin = class {
        constructor() {
          this.listeners = {};
          this.retainedEventArguments = {};
          this.windowListeners = {};
        }
        addListener(eventName, listenerFunc) {
          let firstListener = false;
          const listeners = this.listeners[eventName];
          if (!listeners) {
            this.listeners[eventName] = [];
            firstListener = true;
          }
          this.listeners[eventName].push(listenerFunc);
          const windowListener = this.windowListeners[eventName];
          if (windowListener && !windowListener.registered) {
            this.addWindowListener(windowListener);
          }
          if (firstListener) {
            this.sendRetainedArgumentsForEvent(eventName);
          }
          const remove = async () => this.removeListener(eventName, listenerFunc);
          const p = Promise.resolve({ remove });
          return p;
        }
        async removeAllListeners() {
          this.listeners = {};
          for (const listener in this.windowListeners) {
            this.removeWindowListener(this.windowListeners[listener]);
          }
          this.windowListeners = {};
        }
        notifyListeners(eventName, data, retainUntilConsumed) {
          const listeners = this.listeners[eventName];
          if (!listeners) {
            if (retainUntilConsumed) {
              let args = this.retainedEventArguments[eventName];
              if (!args) {
                args = [];
              }
              args.push(data);
              this.retainedEventArguments[eventName] = args;
            }
            return;
          }
          listeners.forEach((listener) => listener(data));
        }
        hasListeners(eventName) {
          var _a;
          return !!((_a = this.listeners[eventName]) === null || _a === void 0 ? void 0 : _a.length);
        }
        registerWindowListener(windowEventName, pluginEventName) {
          this.windowListeners[pluginEventName] = {
            registered: false,
            windowEventName,
            pluginEventName,
            handler: (event) => {
              this.notifyListeners(pluginEventName, event);
            }
          };
        }
        unimplemented(msg = "not implemented") {
          return new Capacitor.Exception(msg, ExceptionCode.Unimplemented);
        }
        unavailable(msg = "not available") {
          return new Capacitor.Exception(msg, ExceptionCode.Unavailable);
        }
        async removeListener(eventName, listenerFunc) {
          const listeners = this.listeners[eventName];
          if (!listeners) {
            return;
          }
          const index = listeners.indexOf(listenerFunc);
          if (index !== -1) {
            this.listeners[eventName].splice(index, 1);
          }
          if (!this.listeners[eventName].length) {
            this.removeWindowListener(this.windowListeners[eventName]);
          }
        }
        addWindowListener(handle) {
          window.addEventListener(handle.windowEventName, handle.handler);
          handle.registered = true;
        }
        removeWindowListener(handle) {
          if (!handle) {
            return;
          }
          window.removeEventListener(handle.windowEventName, handle.handler);
          handle.registered = false;
        }
        sendRetainedArgumentsForEvent(eventName) {
          const args = this.retainedEventArguments[eventName];
          if (!args) {
            return;
          }
          delete this.retainedEventArguments[eventName];
          args.forEach((arg) => {
            this.notifyListeners(eventName, arg);
          });
        }
      };
      encode = (str) => encodeURIComponent(str).replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent).replace(/[()]/g, escape);
      decode = (str) => str.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent);
      CapacitorCookiesPluginWeb = class extends WebPlugin {
        async getCookies() {
          const cookies = document.cookie;
          const cookieMap = {};
          cookies.split(";").forEach((cookie) => {
            if (cookie.length <= 0)
              return;
            let [key, value] = cookie.replace(/=/, "CAP_COOKIE").split("CAP_COOKIE");
            key = decode(key).trim();
            value = decode(value).trim();
            cookieMap[key] = value;
          });
          return cookieMap;
        }
        async setCookie(options) {
          try {
            const encodedKey = encode(options.key);
            const encodedValue = encode(options.value);
            const expires = options.expires ? `; expires=${options.expires.replace("expires=", "")}` : "";
            const path = (options.path || "/").replace("path=", "");
            const domain = options.url != null && options.url.length > 0 ? `domain=${options.url}` : "";
            document.cookie = `${encodedKey}=${encodedValue || ""}${expires}; path=${path}; ${domain};`;
          } catch (error) {
            return Promise.reject(error);
          }
        }
        async deleteCookie(options) {
          try {
            document.cookie = `${options.key}=; Max-Age=0`;
          } catch (error) {
            return Promise.reject(error);
          }
        }
        async clearCookies() {
          try {
            const cookies = document.cookie.split(";") || [];
            for (const cookie of cookies) {
              document.cookie = cookie.replace(/^ +/, "").replace(/=.*/, `=;expires=${(/* @__PURE__ */ new Date()).toUTCString()};path=/`);
            }
          } catch (error) {
            return Promise.reject(error);
          }
        }
        async clearAllCookies() {
          try {
            await this.clearCookies();
          } catch (error) {
            return Promise.reject(error);
          }
        }
      };
      CapacitorCookies = registerPlugin("CapacitorCookies", {
        web: () => new CapacitorCookiesPluginWeb()
      });
      readBlobAsBase64 = async (blob) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = reader.result;
          resolve(base64String.indexOf(",") >= 0 ? base64String.split(",")[1] : base64String);
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(blob);
      });
      normalizeHttpHeaders = (headers = {}) => {
        const originalKeys = Object.keys(headers);
        const loweredKeys = Object.keys(headers).map((k) => k.toLocaleLowerCase());
        const normalized = loweredKeys.reduce((acc, key, index) => {
          acc[key] = headers[originalKeys[index]];
          return acc;
        }, {});
        return normalized;
      };
      buildUrlParams = (params, shouldEncode = true) => {
        if (!params)
          return null;
        const output = Object.entries(params).reduce((accumulator, entry) => {
          const [key, value] = entry;
          let encodedValue;
          let item;
          if (Array.isArray(value)) {
            item = "";
            value.forEach((str) => {
              encodedValue = shouldEncode ? encodeURIComponent(str) : str;
              item += `${key}=${encodedValue}&`;
            });
            item.slice(0, -1);
          } else {
            encodedValue = shouldEncode ? encodeURIComponent(value) : value;
            item = `${key}=${encodedValue}`;
          }
          return `${accumulator}&${item}`;
        }, "");
        return output.substr(1);
      };
      buildRequestInit = (options, extra = {}) => {
        const output = Object.assign({ method: options.method || "GET", headers: options.headers }, extra);
        const headers = normalizeHttpHeaders(options.headers);
        const type = headers["content-type"] || "";
        if (typeof options.data === "string") {
          output.body = options.data;
        } else if (type.includes("application/x-www-form-urlencoded")) {
          const params = new URLSearchParams();
          for (const [key, value] of Object.entries(options.data || {})) {
            params.set(key, value);
          }
          output.body = params.toString();
        } else if (type.includes("multipart/form-data") || options.data instanceof FormData) {
          const form = new FormData();
          if (options.data instanceof FormData) {
            options.data.forEach((value, key) => {
              form.append(key, value);
            });
          } else {
            for (const key of Object.keys(options.data)) {
              form.append(key, options.data[key]);
            }
          }
          output.body = form;
          const headers2 = new Headers(output.headers);
          headers2.delete("content-type");
          output.headers = headers2;
        } else if (type.includes("application/json") || typeof options.data === "object") {
          output.body = JSON.stringify(options.data);
        }
        return output;
      };
      CapacitorHttpPluginWeb = class extends WebPlugin {
        /**
         * Perform an Http request given a set of options
         * @param options Options to build the HTTP request
         */
        async request(options) {
          const requestInit = buildRequestInit(options, options.webFetchExtra);
          const urlParams = buildUrlParams(options.params, options.shouldEncodeUrlParams);
          const url = urlParams ? `${options.url}?${urlParams}` : options.url;
          const response = await fetch(url, requestInit);
          const contentType = response.headers.get("content-type") || "";
          let { responseType = "text" } = response.ok ? options : {};
          if (contentType.includes("application/json")) {
            responseType = "json";
          }
          let data;
          let blob;
          switch (responseType) {
            case "arraybuffer":
            case "blob":
              blob = await response.blob();
              data = await readBlobAsBase64(blob);
              break;
            case "json":
              data = await response.json();
              break;
            case "document":
            case "text":
            default:
              data = await response.text();
          }
          const headers = {};
          response.headers.forEach((value, key) => {
            headers[key] = value;
          });
          return {
            data,
            headers,
            status: response.status,
            url: response.url
          };
        }
        /**
         * Perform an Http GET request given a set of options
         * @param options Options to build the HTTP request
         */
        async get(options) {
          return this.request(Object.assign(Object.assign({}, options), { method: "GET" }));
        }
        /**
         * Perform an Http POST request given a set of options
         * @param options Options to build the HTTP request
         */
        async post(options) {
          return this.request(Object.assign(Object.assign({}, options), { method: "POST" }));
        }
        /**
         * Perform an Http PUT request given a set of options
         * @param options Options to build the HTTP request
         */
        async put(options) {
          return this.request(Object.assign(Object.assign({}, options), { method: "PUT" }));
        }
        /**
         * Perform an Http PATCH request given a set of options
         * @param options Options to build the HTTP request
         */
        async patch(options) {
          return this.request(Object.assign(Object.assign({}, options), { method: "PATCH" }));
        }
        /**
         * Perform an Http DELETE request given a set of options
         * @param options Options to build the HTTP request
         */
        async delete(options) {
          return this.request(Object.assign(Object.assign({}, options), { method: "DELETE" }));
        }
      };
      CapacitorHttp = registerPlugin("CapacitorHttp", {
        web: () => new CapacitorHttpPluginWeb()
      });
      (function(SystemBarsStyle2) {
        SystemBarsStyle2["Dark"] = "DARK";
        SystemBarsStyle2["Light"] = "LIGHT";
        SystemBarsStyle2["Default"] = "DEFAULT";
      })(SystemBarsStyle || (SystemBarsStyle = {}));
      (function(SystemBarType2) {
        SystemBarType2["StatusBar"] = "StatusBar";
        SystemBarType2["NavigationBar"] = "NavigationBar";
      })(SystemBarType || (SystemBarType = {}));
      SystemBarsPluginWeb = class extends WebPlugin {
        async setStyle() {
          this.unavailable("not available for web");
        }
        async setAnimation() {
          this.unavailable("not available for web");
        }
        async show() {
          this.unavailable("not available for web");
        }
        async hide() {
          this.unavailable("not available for web");
        }
      };
      SystemBars = registerPlugin("SystemBars", {
        web: () => new SystemBarsPluginWeb()
      });
    }
  });

  // ad-bridge-build/node_modules/@capacitor-community/admob/dist/esm/consent/consent-status.enum.js
  var AdmobConsentStatus;
  var init_consent_status_enum = __esm({
    "ad-bridge-build/node_modules/@capacitor-community/admob/dist/esm/consent/consent-status.enum.js"() {
      (function(AdmobConsentStatus2) {
        AdmobConsentStatus2["NOT_REQUIRED"] = "NOT_REQUIRED";
        AdmobConsentStatus2["OBTAINED"] = "OBTAINED";
        AdmobConsentStatus2["REQUIRED"] = "REQUIRED";
        AdmobConsentStatus2["UNKNOWN"] = "UNKNOWN";
      })(AdmobConsentStatus || (AdmobConsentStatus = {}));
    }
  });

  // ad-bridge-build/node_modules/@capacitor-community/admob/dist/esm/consent/privacy-options-requirement-status.enum.js
  var PrivacyOptionsRequirementStatus;
  var init_privacy_options_requirement_status_enum = __esm({
    "ad-bridge-build/node_modules/@capacitor-community/admob/dist/esm/consent/privacy-options-requirement-status.enum.js"() {
      (function(PrivacyOptionsRequirementStatus2) {
        PrivacyOptionsRequirementStatus2["NOT_REQUIRED"] = "NOT_REQUIRED";
        PrivacyOptionsRequirementStatus2["REQUIRED"] = "REQUIRED";
        PrivacyOptionsRequirementStatus2["UNKNOWN"] = "UNKNOWN";
      })(PrivacyOptionsRequirementStatus || (PrivacyOptionsRequirementStatus = {}));
    }
  });

  // ad-bridge-build/node_modules/@capacitor-community/admob/dist/esm/web.js
  var web_exports = {};
  __export(web_exports, {
    AdMobWeb: () => AdMobWeb
  });
  var AdMobWeb;
  var init_web = __esm({
    "ad-bridge-build/node_modules/@capacitor-community/admob/dist/esm/web.js"() {
      init_dist();
      init_consent_status_enum();
      init_privacy_options_requirement_status_enum();
      AdMobWeb = class extends WebPlugin {
        async initialize() {
          console.log("initialize");
        }
        async requestTrackingAuthorization() {
          console.log("requestTrackingAuthorization");
        }
        async trackingAuthorizationStatus() {
          return {
            status: "authorized"
          };
        }
        async requestConsentInfo(options) {
          console.log("requestConsentInfo", options);
          return {
            status: AdmobConsentStatus.REQUIRED,
            isConsentFormAvailable: true,
            canRequestAds: true,
            privacyOptionsRequirementStatus: PrivacyOptionsRequirementStatus.REQUIRED
          };
        }
        async showPrivacyOptionsForm() {
          console.log("showPrivacyOptionsForm");
        }
        async showConsentForm() {
          console.log("showConsentForm");
          return {
            status: AdmobConsentStatus.REQUIRED,
            canRequestAds: true,
            privacyOptionsRequirementStatus: PrivacyOptionsRequirementStatus.REQUIRED
          };
        }
        async resetConsentInfo() {
          console.log("resetConsentInfo");
        }
        async setApplicationMuted(options) {
          console.log("setApplicationMuted", options);
        }
        async setApplicationVolume(options) {
          console.log("setApplicationVolume", options);
        }
        async showBanner(options) {
          console.log("showBanner", options);
        }
        async hideBanner() {
          console.log("hideBanner");
        }
        async resumeBanner() {
          console.log("resumeBanner");
        }
        async removeBanner() {
          console.log("removeBanner");
        }
        async startNativeAdFeed() {
          throw new Error("Native ads are only available on iOS and Android");
        }
        async destroyNativeAdFeed(options) {
          console.log("destroyNativeAdFeed", options);
        }
        async loadNativeAd() {
          throw new Error("Native ads are only available on iOS and Android");
        }
        async updateNativeAdPlacements(options) {
          console.log("updateNativeAdPlacements", options);
        }
        async removeNativeAd(options) {
          console.log("removeNativeAd", options);
        }
        async prepareInterstitial(options) {
          console.log("prepareInterstitial", options);
          return {
            adUnitId: options.adId
          };
        }
        async showInterstitial(options) {
          console.log("showInterstitial", options);
        }
        async prepareRewardVideoAd(options) {
          console.log("prepareRewardVideoAd", options);
          return {
            adUnitId: options.adId
          };
        }
        async showRewardVideoAd(options) {
          console.log("showRewardVideoAd", options);
          return {
            type: "",
            amount: 0
          };
        }
        async prepareRewardInterstitialAd(options) {
          console.log("prepareRewardInterstitialAd", options);
          return {
            adUnitId: options.adId
          };
        }
        async showRewardInterstitialAd(options) {
          console.log("showRewardInterstitialAd", options);
          return {
            type: "",
            amount: 0
          };
        }
        async loadAppOpen(options) {
          console.log("loadAppOpen", options);
          return {
            adUnitId: options.adId
          };
        }
        async showAppOpen(options) {
          console.log("showAppOpen", options);
        }
        async isAppOpenLoaded() {
          return { value: false };
        }
        addListener(eventName, listenerFunc) {
          void listenerFunc;
          console.log("addListener", eventName);
          return Promise.resolve({ remove: () => Promise.resolve() });
        }
      };
    }
  });

  // ad-bridge-build/node_modules/@capacitor-community/admob/dist/esm/index.js
  init_dist();

  // ad-bridge-build/node_modules/@capacitor-community/admob/dist/esm/native-ads/native-ad-feed.js
  init_dist();

  // ad-bridge-build/node_modules/@capacitor-community/admob/dist/esm/native-ads/native-ad-template.enum.js
  var NativeAdTemplate;
  (function(NativeAdTemplate2) {
    NativeAdTemplate2["Small"] = "small";
    NativeAdTemplate2["Medium"] = "medium";
  })(NativeAdTemplate || (NativeAdTemplate = {}));

  // ad-bridge-build/node_modules/@capacitor-community/admob/dist/esm/native-ads/native-ad-feed.js
  var bridge;
  var configureNativeAdBridge = (adMobBridge) => {
    bridge = adMobBridge;
  };

  // ad-bridge-build/node_modules/@capacitor-community/admob/dist/esm/definitions.js
  var MaxAdContentRating;
  (function(MaxAdContentRating2) {
    MaxAdContentRating2["General"] = "General";
    MaxAdContentRating2["ParentalGuidance"] = "ParentalGuidance";
    MaxAdContentRating2["Teen"] = "Teen";
    MaxAdContentRating2["MatureAudience"] = "MatureAudience";
  })(MaxAdContentRating || (MaxAdContentRating = {}));

  // ad-bridge-build/node_modules/@capacitor-community/admob/dist/esm/banner/banner-ad-plugin-events.enum.js
  var BannerAdPluginEvents;
  (function(BannerAdPluginEvents2) {
    BannerAdPluginEvents2["SizeChanged"] = "bannerAdSizeChanged";
    BannerAdPluginEvents2["Loaded"] = "bannerAdLoaded";
    BannerAdPluginEvents2["FailedToLoad"] = "bannerAdFailedToLoad";
    BannerAdPluginEvents2["Opened"] = "bannerAdOpened";
    BannerAdPluginEvents2["Closed"] = "bannerAdClosed";
    BannerAdPluginEvents2["AdImpression"] = "bannerAdImpression";
    BannerAdPluginEvents2["AdPaid"] = "bannerAdPaid";
  })(BannerAdPluginEvents || (BannerAdPluginEvents = {}));

  // ad-bridge-build/node_modules/@capacitor-community/admob/dist/esm/banner/banner-ad-position.enum.js
  var BannerAdPosition;
  (function(BannerAdPosition2) {
    BannerAdPosition2["TOP_CENTER"] = "TOP_CENTER";
    BannerAdPosition2["CENTER"] = "CENTER";
    BannerAdPosition2["BOTTOM_CENTER"] = "BOTTOM_CENTER";
  })(BannerAdPosition || (BannerAdPosition = {}));

  // ad-bridge-build/node_modules/@capacitor-community/admob/dist/esm/banner/banner-ad-size.enum.js
  var BannerAdSize;
  (function(BannerAdSize2) {
    BannerAdSize2["BANNER"] = "BANNER";
    BannerAdSize2["FULL_BANNER"] = "FULL_BANNER";
    BannerAdSize2["LARGE_BANNER"] = "LARGE_BANNER";
    BannerAdSize2["MEDIUM_RECTANGLE"] = "MEDIUM_RECTANGLE";
    BannerAdSize2["LEADERBOARD"] = "LEADERBOARD";
    BannerAdSize2["ADAPTIVE_BANNER"] = "ADAPTIVE_BANNER";
    BannerAdSize2["SMART_BANNER"] = "SMART_BANNER";
  })(BannerAdSize || (BannerAdSize = {}));

  // ad-bridge-build/node_modules/@capacitor-community/admob/dist/esm/interstitial/interstitial-ad-plugin-events.enum.js
  var InterstitialAdPluginEvents;
  (function(InterstitialAdPluginEvents2) {
    InterstitialAdPluginEvents2["Loaded"] = "interstitialAdLoaded";
    InterstitialAdPluginEvents2["FailedToLoad"] = "interstitialAdFailedToLoad";
    InterstitialAdPluginEvents2["Showed"] = "interstitialAdShowed";
    InterstitialAdPluginEvents2["FailedToShow"] = "interstitialAdFailedToShow";
    InterstitialAdPluginEvents2["Dismissed"] = "interstitialAdDismissed";
    InterstitialAdPluginEvents2["AdImpression"] = "interstitialAdImpression";
  })(InterstitialAdPluginEvents || (InterstitialAdPluginEvents = {}));

  // ad-bridge-build/node_modules/@capacitor-community/admob/dist/esm/reward-interstitial/reward-interstitial-ad-plugin-events.enum.js
  var RewardInterstitialAdPluginEvents;
  (function(RewardInterstitialAdPluginEvents2) {
    RewardInterstitialAdPluginEvents2["Loaded"] = "onRewardedInterstitialAdLoaded";
    RewardInterstitialAdPluginEvents2["FailedToLoad"] = "onRewardedInterstitialAdFailedToLoad";
    RewardInterstitialAdPluginEvents2["Showed"] = "onRewardedInterstitialAdShowed";
    RewardInterstitialAdPluginEvents2["FailedToShow"] = "onRewardedInterstitialAdFailedToShow";
    RewardInterstitialAdPluginEvents2["Dismissed"] = "onRewardedInterstitialAdDismissed";
    RewardInterstitialAdPluginEvents2["Rewarded"] = "onRewardedInterstitialAdReward";
    RewardInterstitialAdPluginEvents2["AdImpression"] = "onRewardedInterstitialAdImpression";
  })(RewardInterstitialAdPluginEvents || (RewardInterstitialAdPluginEvents = {}));

  // ad-bridge-build/node_modules/@capacitor-community/admob/dist/esm/reward/reward-ad-plugin-events.enum.js
  var RewardAdPluginEvents;
  (function(RewardAdPluginEvents2) {
    RewardAdPluginEvents2["adClicked"] = "onRewardedVideoAdClicked";
    RewardAdPluginEvents2["Loaded"] = "onRewardedVideoAdLoaded";
    RewardAdPluginEvents2["FailedToLoad"] = "onRewardedVideoAdFailedToLoad";
    RewardAdPluginEvents2["Showed"] = "onRewardedVideoAdShowed";
    RewardAdPluginEvents2["FailedToShow"] = "onRewardedVideoAdFailedToShow";
    RewardAdPluginEvents2["Dismissed"] = "onRewardedVideoAdDismissed";
    RewardAdPluginEvents2["Rewarded"] = "onRewardedVideoAdReward";
    RewardAdPluginEvents2["AdImpression"] = "onRewardedVideoAdImpression";
  })(RewardAdPluginEvents || (RewardAdPluginEvents = {}));

  // ad-bridge-build/node_modules/@capacitor-community/admob/dist/esm/consent/index.js
  init_consent_status_enum();

  // ad-bridge-build/node_modules/@capacitor-community/admob/dist/esm/consent/consent-debug-geography.enum.js
  var AdmobConsentDebugGeography;
  (function(AdmobConsentDebugGeography2) {
    AdmobConsentDebugGeography2[AdmobConsentDebugGeography2["DISABLED"] = 0] = "DISABLED";
    AdmobConsentDebugGeography2[AdmobConsentDebugGeography2["EEA"] = 1] = "EEA";
    AdmobConsentDebugGeography2[AdmobConsentDebugGeography2["NOT_EEA"] = 2] = "NOT_EEA";
    AdmobConsentDebugGeography2[AdmobConsentDebugGeography2["US"] = 3] = "US";
    AdmobConsentDebugGeography2[AdmobConsentDebugGeography2["OTHER"] = 4] = "OTHER";
  })(AdmobConsentDebugGeography || (AdmobConsentDebugGeography = {}));

  // ad-bridge-build/node_modules/@capacitor-community/admob/dist/esm/shared/ad-mob-revenue-data.interface.js
  var AdValuePrecision;
  (function(AdValuePrecision2) {
    AdValuePrecision2[AdValuePrecision2["Unknown"] = 0] = "Unknown";
    AdValuePrecision2[AdValuePrecision2["Estimated"] = 1] = "Estimated";
    AdValuePrecision2[AdValuePrecision2["PublisherProvided"] = 2] = "PublisherProvided";
    AdValuePrecision2[AdValuePrecision2["Precise"] = 3] = "Precise";
  })(AdValuePrecision || (AdValuePrecision = {}));

  // ad-bridge-build/node_modules/@capacitor-community/admob/dist/esm/app-open/app-open-ad-plugin-events.enum.js
  var AppOpenAdPluginEvents;
  (function(AppOpenAdPluginEvents2) {
    AppOpenAdPluginEvents2["Loaded"] = "appOpenAdLoaded";
    AppOpenAdPluginEvents2["FailedToLoad"] = "appOpenAdFailedToLoad";
    AppOpenAdPluginEvents2["Opened"] = "appOpenAdOpened";
    AppOpenAdPluginEvents2["Closed"] = "appOpenAdClosed";
    AppOpenAdPluginEvents2["FailedToShow"] = "appOpenAdFailedToShow";
    AppOpenAdPluginEvents2["AdImpression"] = "appOpenAdImpression";
  })(AppOpenAdPluginEvents || (AppOpenAdPluginEvents = {}));

  // ad-bridge-build/node_modules/@capacitor-community/admob/dist/esm/native-ads/native-ad-plugin-events.enum.js
  var NativeAdPluginEvents;
  (function(NativeAdPluginEvents2) {
    NativeAdPluginEvents2["Loaded"] = "nativeAdLoaded";
    NativeAdPluginEvents2["FailedToLoad"] = "nativeAdFailedToLoad";
    NativeAdPluginEvents2["Clicked"] = "nativeAdClicked";
    NativeAdPluginEvents2["AdImpression"] = "nativeAdImpression";
    NativeAdPluginEvents2["Opened"] = "nativeAdOpened";
    NativeAdPluginEvents2["Closed"] = "nativeAdClosed";
    NativeAdPluginEvents2["AdPaid"] = "nativeAdPaid";
  })(NativeAdPluginEvents || (NativeAdPluginEvents = {}));

  // ad-bridge-build/node_modules/@capacitor-community/admob/dist/esm/index.js
  var nativeAdBridge = registerPlugin("AdMob", {
    web: () => Promise.resolve().then(() => (init_web(), web_exports)).then((m) => new m.AdMobWeb())
  });
  var AdMob = nativeAdBridge;
  configureNativeAdBridge(nativeAdBridge);

  // ad-bridge-build/bridge.js
  window.CPRAdMob = AdMob;
})();
/*! Bundled license information:

@capacitor/core/dist/index.js:
  (*! Capacitor: https://capacitorjs.com/ - MIT License *)
*/

'use strict';
const $=s=>document.querySelector(s),KEY='colorPopRush.v1',today=()=>new Date().toLocaleDateString('en-CA'),base=()=>({v:1,coins:0,best:0,themes:['neon'],theme:'neon',hammers:2,stats:{games:0,blocks:0,lines:0,combos:0,score:0},achieved:[],rewardDate:'',streak:0,dailyWins:[],missions:{},settings:{music:true,sound:true,haptics:true},run:null});
let data=base(),storageOK=true;try{const x=JSON.parse(localStorage.getItem(KEY));if(x?.v===1)data={...base(),...x,stats:{...base().stats,...x.stats},settings:{...base().settings,...x.settings}}}catch{};
const palettes={neon:['#ff6888','#44d9f1','#ffe34c','#a7ef43','#b46aff'],candy:['#ff98cb','#a9eafa','#ffe0a1','#dd9afa','#ffa486'],ocean:['#00b5dc','#50e3cb','#768eff','#b2f2ed','#268ad2'],sunset:['#ff784e','#ffc247','#ff5b99','#b36aee','#f0a873']};
const shapes=[[[0,0]],[[0,0],[1,0]],[[0,0],[1,0],[2,0]],[[0,0],[0,1],[0,2]],[[0,0],[1,0],[0,1],[1,1]],[[0,0],[0,1],[1,1]],[[0,0],[0,1],[0,2],[1,2]],[[0,0],[1,0],[2,0],[1,1]],[[0,0],[1,0],[1,1],[2,1]]];
let screen='home',run=data.run,selected=null,hammer=false,audio=null,musicTimer=null,drag=null;
function save(){data.run=run;try{localStorage.setItem(KEY,JSON.stringify(data))}catch{storageOK=false;toast('Storage is full or unavailable. Export a backup in Settings.')}}
function toast(t){$('#toast').textContent=t;$('#toast').hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').hidden=true,2600)}
// Resume audio on actual taps and retry if Android keeps it suspended.
let audioResumePending=null,musicStep=0,audioGeneration=0;
function tone(freq,d=.12,type='sine',volume=.12,delay=0){
 if(!audio||audio.state!=='running'||document.hidden||window.CPRAds?.busy)return;
 const ctx=audio,o=ctx.createOscillator(),g=ctx.createGain(),at=ctx.currentTime+delay;
 o.type=type;o.frequency.value=freq;
 g.gain.setValueAtTime(.001,at);g.gain.linearRampToValueAtTime(volume,at+.008);
 g.gain.exponentialRampToValueAtTime(.001,at+d);
 o.connect(g);g.connect(ctx.destination);o.onended=()=>{o.disconnect();g.disconnect()};
 o.start(at);o.stop(at+d+.015);
}
function audioStatus(){const el=document.querySelector('#audioStatus');if(el)el.textContent=!audio?'Tap Test audio to start sound.':audio.state==='running'?'Audio engine running.':'Audio paused — tap Test audio to retry.'}
function unlockAudio(){
 if(document.hidden||window.CPRAds?.busy)return Promise.resolve(false);
 try{
  const AudioClass=window.AudioContext||window.webkitAudioContext;
  if(!AudioClass){audioStatus();return Promise.resolve(false)}
  if(!audio||audio.state==='closed'){
   audio=new AudioClass();
   audio.onstatechange=()=>{audioStatus();if(audio.state==='running'&&!document.hidden)music();else{clearInterval(musicTimer);musicTimer=null}};
  }
  if(audio.state==='running'){music();audioStatus();return Promise.resolve(true)}
  if(audioResumePending)return audioResumePending;
  // Call resume synchronously inside the user gesture, then wait for readiness.
  audioResumePending=Promise.resolve(audio.resume()).then(()=>{
   if(document.hidden||audio.state!=='running')return false;
   music();audioStatus();return true;
  }).catch(()=>{audioStatus();return false}).finally(()=>{audioResumePending=null});
  return audioResumePending;
 }catch{audioStatus();return Promise.resolve(false)}
}
function music(){
 if(!data.settings.music||document.hidden||window.CPRAds?.busy||!audio||audio.state!=='running'){
  clearInterval(musicTimer);musicTimer=null;return;
 }
 if(musicTimer!==null)return;
 const notes=[261.63,329.63,392,523.25,392,329.63,293.66,392,440,523.25,440,392,329.63,392,293.66,246.94];
 const beat=()=>{if(!data.settings.music||document.hidden)return;const f=notes[musicStep%notes.length];tone(f,.25,'triangle',.09);if(musicStep%4===0)tone(f/2,.4,'sine',.07);musicStep++};
 beat();musicTimer=setInterval(beat,280);
}
function sfx(kind){
 if(data.settings.sound){const generation=audioGeneration;unlockAudio().then(ready=>{
  if(!ready||!data.settings.sound||document.hidden||generation!==audioGeneration)return;
  const f=kind==='clear'?[523,659,784,1046]:kind==='bad'?[180,120]:[440,660];
  f.forEach((v,i)=>tone(v,.16,'triangle',.18,i*.065));
 })}
 if(data.settings.haptics&&navigator.vibrate)navigator.vibrate(kind==='clear'?35:12);
}
function testAudio(){
 unlockAudio().then(ready=>{
  if(!ready){toast('Audio is still blocked. Tap Test audio again.');audioStatus();return}
  // Explicit diagnostic works even when the automatic sound-effects toggle is off.
  [523,659,784].forEach((f,i)=>tone(f,.25,'triangle',.22,i*.18));
  toast('Playing test chime. Check your phone media volume.');audioStatus();
 });
}
for(const event of ['pointerdown','pointerup','click','touchend','keydown'])document.addEventListener(event,()=>{unlockAudio()}, {capture:true,passive:true});
document.addEventListener('visibilitychange',()=>{
 if(document.hidden){audioGeneration++;clearInterval(musicTimer);musicTimer=null;if(audio&&audio.state!=='closed')audio.suspend().catch(()=>{});save()}
 else if(audio)unlockAudio();
});
// Native AdMob integration. Google demo units are mandatory for this test build.
const CPR_AD_CONFIG=Object.freeze({
 testMode:true,
 appId:'ca-app-pub-6051569226872743~2746233124',
 rewarded:'ca-app-pub-6051569226872743/9722615725',
 interstitial:'ca-app-pub-6051569226872743/6110763061',
 testRewarded:'ca-app-pub-3940256099942544/5224354917',
 testInterstitial:'ca-app-pub-3940256099942544/1033173712'
});
window.CPRAds=(()=>{
 let sdk=null,initializing=null,ready=false,consent=null,listeners=[],session=null;
 let interstitialReady=false,interstitialLoading=false,rounds=0,lastAdAt=0;
 let status='Ads available in the Android app only.';
 const native=()=>Boolean(window.Capacitor?.isNativePlatform?.()&&window.Capacitor?.getPlatform?.()==='android');
 const unit=type=>CPR_AD_CONFIG.testMode?CPR_AD_CONFIG[type==='rewarded'?'testRewarded':'testInterstitial']:CPR_AD_CONFIG[type];
 const update=message=>{status=message;const el=document.querySelector('#adStatus');if(el)el.textContent=message};
 const timeout=(promise,ms=15000)=>new Promise((resolve,reject)=>{const t=setTimeout(()=>reject(new Error('Ad service timed out')),ms);Promise.resolve(promise).then(v=>{clearTimeout(t);resolve(v)},e=>{clearTimeout(t);reject(e)})});
 function pauseAudio(){audioGeneration++;clearInterval(musicTimer);musicTimer=null;if(audio?.state==='running')audio.suspend().catch(()=>{})}
 function endSession(current){if(session!==current)return;const next=current.next;session=null;update(ready?(CPR_AD_CONFIG.testMode?'Test ads enabled.':'Ads ready.'):'Ads unavailable.');if(!document.hidden)unlockAudio();next?.()}
 function grantReward(){const current=session;if(current?.type!=='rewarded'||!current.showing||current.granted)return;current.granted=true;data.hammers+=1;save();render();toast('Reward earned: +1 hammer')}
 async function init(){
  if(!native())return false;if(ready)return true;if(initializing)return initializing;
  initializing=(async()=>{try{
   update('Connecting ad service…');sdk=window.CPRAdMob;if(!sdk)throw new Error('AdMob bridge is missing');
   consent=await timeout(sdk.requestConsentInfo());
   if(consent.isConsentFormAvailable&&consent.status==='REQUIRED'){
    if(session)return false;const current={type:'privacy',showing:true};session=current;pauseAudio();
    try{consent=await sdk.showConsentForm()}finally{endSession(current)}
   }
   if(!consent.canRequestAds){update('Ads unavailable until privacy choices are ready.');return false}
   await timeout(sdk.initialize({initializeForTesting:CPR_AD_CONFIG.testMode}));
   const bindings=[
    ['onRewardedVideoAdReward',grantReward],
    ['onRewardedVideoAdDismissed',()=>{if(session?.type==='rewarded')endSession(session)}],
    ['onRewardedVideoAdFailedToShow',()=>{if(session?.type==='rewarded'){toast('Ad could not open. No reward was added.');endSession(session)}}],
    ['interstitialAdDismissed',()=>{if(session?.type==='interstitial'){endSession(session);preloadInterstitial()}}],
    ['interstitialAdFailedToShow',()=>{if(session?.type==='interstitial'){endSession(session);preloadInterstitial()}}]
   ];
   for(const [event,fn]of bindings)listeners.push(await sdk.addListener(event,fn));
   ready=true;update(CPR_AD_CONFIG.testMode?'Test ads enabled.':'Ads ready.');preloadInterstitial();return true;
  }catch(error){for(const listener of listeners)await listener.remove().catch(()=>{});listeners=[];update('Ad setup error: ' + (error?.message || String(error)));console.warn('Ad service:',error?.message);return false}
  finally{initializing=null}})();return initializing;
 }
 async function preloadInterstitial(){
  if(!ready||interstitialReady||interstitialLoading)return;interstitialLoading=true;
  try{await timeout(sdk.prepareInterstitial({adId:unit('interstitial'),isTesting:CPR_AD_CONFIG.testMode,npa:true}));interstitialReady=true}catch{interstitialReady=false}finally{interstitialLoading=false}
 }
 async function watchReward(){
  if(session)return;if(!native())return toast('Rewarded ads are available in the Android app.');
  if(!await init())return toast(status);if(session)return;
  const current={type:'rewarded',granted:false,showing:false};session=current;pauseAudio();update('Loading rewarded ad…');
  try{await timeout(sdk.prepareRewardVideoAd({adId:unit('rewarded'),isTesting:CPR_AD_CONFIG.testMode,npa:true}));
   if(session!==current||document.hidden){endSession(current);return}
   current.showing=true;update('Watch the ad to earn 1 hammer.');
   // Earned-reward listener is the sole grant path; ignore the show result.
   Promise.resolve(sdk.showRewardVideoAd()).catch(()=>{if(session===current){toast('Ad unavailable. No reward was added.');endSession(current)}});
  }catch{if(session===current){toast('No ad available right now. Please try later.');endSession(current)}}
 }
 function completedRound(){rounds++}
 function betweenRounds(next){
  if(session)return;
  if(!ready||!interstitialReady||rounds<3||Date.now()-lastAdAt<120000){next();if(ready)preloadInterstitial();return}
  rounds=0;lastAdAt=Date.now();interstitialReady=false;
  const current={type:'interstitial',showing:true,next};session=current;pauseAudio();
  Promise.resolve(sdk.showInterstitial()).catch(()=>{if(session===current){endSession(current);preloadInterstitial()}});
 }
 async function privacy(){
  if(session)return;if(!native())return toast('Ad privacy choices are available in the Android app.');
  if(!await init())return toast(status);
  if(consent?.privacyOptionsRequirementStatus!=='REQUIRED')return toast('No additional ad privacy form is required right now.');
  const current={type:'privacy',showing:true};session=current;pauseAudio();
  try{await sdk.showPrivacyOptionsForm();consent=await timeout(sdk.requestConsentInfo());if(!consent.canRequestAds){ready=false;interstitialReady=false}}
  catch{toast('Privacy options could not open. Try again later.')}
  finally{endSession(current)}
 }
 return {init,watchReward,completedRound,betweenRounds,privacy,get busy(){return session!==null},get status(){return status}};
})();
// Initialize after the first deliberate interaction, without blocking gameplay.
document.addEventListener('click',()=>window.CPRAds.init(),{once:true});

function rnd(){if(run?.mode==='daily'){run.seed=(Math.imul(run.seed,1664525)+1013904223)>>>0;return run.seed/4294967296}return Math.random()}
function piece(){return {cells:shapes[Math.floor(rnd()*shapes.length)],color:1+Math.floor(rnd()*5)}}
function start(mode){if(run&&!run.over){dialog('Start a new round?','Your current round will end.',[['Keep playing',()=>go('game')],['New round',()=>{finish(false);newRun(mode)}]]);return}newRun(mode)}
function newRun(mode){let seed=2166136261;for(const c of today())seed=Math.imul(seed^c.charCodeAt(0),16777619)>>>0;run={board:Array(64).fill(0),pieces:[],score:0,charge:0,combo:0,mode,date:today(),seed,over:false};run.pieces=[piece(),piece(),piece()];data.stats.games++;selected=null;hammer=false;save();go('game')}
function fits(p,x,y){return p.cells.every(([dx,dy])=>x+dx>=0&&x+dx<8&&y+dy>=0&&y+dy<8&&!run.board[(y+dy)*8+x+dx])}
function canMove(){return run.pieces.some(p=>p&&Array.from({length:64},(_,i)=>i).some(i=>fits(p,i%8,Math.floor(i/8))))}
function place(index,pos){if(window.CPRAds.busy)return;const p=run?.pieces[index];if(!p||run.over||!fits(p,pos%8,Math.floor(pos/8))){sfx('bad');return}const x=pos%8,y=Math.floor(pos/8);p.cells.forEach(([dx,dy])=>run.board[(y+dy)*8+x+dx]=p.color);data.stats.blocks+=p.cells.length;let clear=new Set(),lines=0;for(let i=0;i<8;i++){const row=Array.from({length:8},(_,j)=>i*8+j),col=Array.from({length:8},(_,j)=>j*8+i);for(const arr of [row,col])if(arr.every(j=>run.board[j])){lines++;arr.forEach(j=>clear.add(j))}}clear.forEach(j=>run.board[j]=0);run.combo=lines?run.combo+1:0;const gain=p.cells.length*10+lines*100*Math.max(1,run.combo);run.score+=gain;data.stats.score+=gain;data.stats.lines+=lines;if(lines>1)data.stats.combos++;run.charge=Math.min(100,run.charge+lines*25);data.coins+=lines*5;run.pieces[index]=null;if(run.pieces.every(p=>!p))run.pieces=[piece(),piece(),piece()];selected=null;data.best=Math.max(data.best,run.score);sfx(lines?'clear':'place');achievements();save();render();if(lines){$('.board')?.classList.add('flash');toast(`+${gain} · ${lines} line${lines>1?'s':''} · Combo ${run.combo}`)}if(run.mode==='daily'&&run.score>=1000){finish(true)}else if(!canMove())finish(false)}
function achievements(){const rules=[['first','First Pop',data.stats.lines>=1],['lines25','Line Artist',data.stats.lines>=25],['blocks100','Block Builder',data.stats.blocks>=100],['score1000','Rising Star',data.best>=1000],['score5000','Pop Master',data.best>=5000],['games10','One More Round',data.stats.games>=10],['daily','Daily Hero',data.dailyWins.length>=1]];for(const [id,name,ok]of rules)if(ok&&!data.achieved.includes(id)){data.achieved.push(id);data.coins+=30;toast(`Achievement: ${name} · +30 coins`)}return rules}
function finish(won){if(!run||run.over)return;run.over=true;window.CPRAds.completedRound();const score=run.score;if(won&&!data.dailyWins.includes(run.date)){data.dailyWins.push(run.date);data.coins+=100}achievements();save();if(screen==='game')dialog(won?'Challenge complete!':'Round complete',`Score: ${score}. ${won?'Daily reward: '+(run.date===today()?'100 coins on first completion.':'completed.'): 'Try another round and beat your best!'}`,[['Play again',()=>window.CPRAds.betweenRounds(()=>{run=null;newRun('classic')})],['Menu',()=>window.CPRAds.betweenRounds(()=>go('home'))]])}
function dialog(title,body,buttons){const m=$('#modal');m.replaceChildren();const h=document.createElement('h2');h.textContent=title;const p=document.createElement('p');p.textContent=body;m.append(h,p);for(const [label,fn]of buttons){const b=document.createElement('button');b.textContent=label;b.onclick=()=>{m.close();fn()};m.append(b)}if(!m.open)m.showModal()}
function go(s){screen=s;selected=null;hammer=false;render()}
function button(label,action,cls=''){return `<button class="${cls}" data-action="${action}">${label}</button>`}
function render(){document.body.className=data.theme;const app=$('#app');const head=screen==='home'?`<h1><span>COLOR</span> <em>POP</em><br>RUSH</h1><p class="sub">Little blocks. Big happy moments.</p>`:`<div class="top">${button('‹ Menu','home')}<b>${screen==='game'?'COLOR POP RUSH':screen.replace(/^./,s=>s.toUpperCase())}</b><span>🪙 ${data.coins}</span></div>`;let body='';if(screen==='home'){body=`<div class="card row"><span>🏆 BEST <b>${data.best}</b></span><span>🪙 ${data.coins}</span></div><div class="menu">${run&&!run.over ? button('▶ Continue playing','continue','primary') : ''}${button('✨ New Game','classic',run&&!run.over?'':'primary')}${button('📅 Daily Challenge','daily')}${button('🎁 Daily Rewards','rewards')}${button('🛍 Store','store')}${button('🎨 Themes','themes')}${button('🏅 Achievements','achievements')}${button('🎯 Missions','missions')}${button('📊 Statistics','statistics')}${button('⚙ Settings','settings')}</div><p class="sub small">Drag a shape onto the board, or tap a shape then a cell. Fill rows and columns to clear them!</p>`}
if(screen==='game'&&run){body=`<div class="card top"><div class="hud"><span class="small">SCORE</span><br>${run.score}</div><div>${run.mode==='daily'?'📅 Target 1,000':'🏆 Best '+data.best}</div>${button('Ⅱ','pause')}</div><div class="board">${run.board.map((c,i)=>`<div class="cell ${c?'filled':''}" style="--tile:${palettes[data.theme][c-1]}" data-cell="${i}"></div>`).join('')}</div><div class="tray">${run.pieces.map((p,i)=>p?pieceHTML(p,i):'<div style="width:85px"></div>').join('')}</div><p class="sub small">${hammer?'Tap an occupied square to remove it.':selected!==null?'Tap a cell to place your selected shape.':'Drag a block or tap it, then tap a board cell.'}</p><div class="bar"><i style="width:${run.charge}%"></i></div><div class="row">${button('🌈 Rainbow Pop','rainbow')}${button('🔨 '+data.hammers,'hammer')}</div><p class="sub small">Rainbow: ${run.charge}/100 · clears one color. Hammer: removes one square.</p>`}
if(screen==='store')body=`<div class="card"><h2>Coin Store</h2><p>Earn coins by clearing lines, completing missions, and claiming rewards.</p><div class="row"><span>🔨 3 Hammers<br><small>Remove tricky squares</small></span>${button('Buy · 60 🪙','buyHammer')}</div></div><div class="card"><h3>Bonus Hammer</h3><p>Choose to watch a rewarded ad and earn <b>1 hammer</b> after completing it.</p>${button("Watch ad · +1 hammer","rewardAd")}<p class="small">${CPR_AD_CONFIG.testMode?"Test ads · no revenue in this build.":"Optional rewarded ad."}</p></div><div class="card"><h3>Coin packs and remove ads</h3><p class="small">Paid upgrades are not available yet. The coin store uses earned coins.</p></div>`;
if(screen==='themes')body=Object.entries(palettes).map(([id,colors])=>`<div class="card row"><div><b>${id.toUpperCase()}</b><br>${colors.map(c=>`<i class="theme-dot" style="background:${c}"></i>`).join('')}</div>${button(data.theme===id?'Selected':data.themes.includes(id)?'Use':'Unlock · 100 🪙','theme:'+id)}</div>`).join('');
if(screen==='achievements')body=achievements().map(([id,name])=>`<div class="card row"><span>${data.achieved.includes(id)?'🏅':'🔒'} ${name}</span><small>${data.achieved.includes(id)?'Unlocked':'30 coin reward'}</small></div>`).join('');
if(screen==='rewards')body=`<div class="card"><h2>🎁 Daily gift</h2><p>Return each day! Streak: ${data.streak} day${data.streak===1?'':'s'}.</p><p>Reward: 25 coins + 5 per streak day, up to 60.</p>${button(data.rewardDate===today()?'Already claimed today':'Claim daily reward','claimReward','primary')}</div><p class="small">Uses this device’s local date. Missing a day resets the streak.</p>`;
if(screen==='daily')body=`<div class="card"><h2>📅 ${today()}</h2><p>Reach 1,000 points on today's seeded block sequence. Rainbow and hammers are disabled for a fair challenge.</p><p>Reward: 100 coins once per day.</p>${button(data.dailyWins.includes(today())?'Replay challenge':'Start challenge','startDaily','primary')}</div>`;
if(screen==='missions')body=missionList().map(([id,label,target,current])=>`<div class="card"><div class="row"><b>${label}</b><span>${Math.min(target,current)}/${target}</span></div><div class="bar"><i style="width:${Math.min(100,current/target*100)}%"></i></div>${button(data.missions[id]?'Claimed':'Claim · 50 🪙','mission:'+id)}</div>`).join('');
if(screen==='statistics')body=Object.entries({ 'Best score':data.best,'Rounds started':data.stats.games,'Blocks placed':data.stats.blocks,'Lines cleared':data.stats.lines,'Multiple-line clears':data.stats.combos,'Lifetime points':data.stats.score,'Daily challenges won':data.dailyWins.length}).map(([k,v])=>`<div class="card row"><span>${k}</span><b>${v}</b></div>`).join('');
if(screen==='settings')body=`<div class="card"><h3>Audio check</h3>${button('Test audio','testAudio')}<p id="audioStatus" class="small">Tap Test audio to start sound.</p></div><div class="card">${['music','sound','haptics'].map(k=>`<label class="row" style="padding:12px 0">${k==='music'?'🎵 Music':k==='sound'?'🔊 Sound effects':'📳 Vibration'}<input class="switch" type="checkbox" data-setting="${k}" ${data.settings[k]?'checked':''}></label>`).join('')}</div><div class="card"><h3>Keep your progress safe</h3><p class="small">Progress saves on this device. Export a backup before changing devices or reinstalling.</p>${button('Export backup','export')}${button('Restore backup','import')}<input id="file" type="file" accept="application/json" hidden></div><div class="card"><h3>Ad privacy</h3>${button("Ad privacy choices","adPrivacy")}<p id="adStatus" class="small">${window.CPRAds.status}</p></div><div class="card"><h3>About</h3><p>Color Pop Rush v1.0 · Original synthesized soundtrack and effects. Offline game. Progress is saved on this device. Native Android ads use Google AdMob and its privacy choices. No real-money purchases are active.</p></div>`;
app.innerHTML=head+body+`<div class="foot">COLOR POP RUSH · Made for a little joy</div>`;app.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>action(b.dataset.action));app.querySelectorAll('[data-setting]').forEach(el=>el.onchange=()=>{data.settings[el.dataset.setting]=el.checked;save();unlockAudio();music()});if(screen==='game')bindBoard();if(screen==='settings')$('#file').onchange=restore;
}
function pieceHTML(p,i){let w=Math.max(...p.cells.map(c=>c[0]))+1,h=Math.max(...p.cells.map(c=>c[1]))+1;return `<button aria-label="Select block shape ${i+1}" class="piece ${selected===i?'selected':''}" data-piece="${i}" style="grid-template-columns:repeat(${w},23px)">${Array.from({length:w*h},(_,n)=>`<i class="block ${p.cells.some(([x,y])=>x===n%w&&y===Math.floor(n/w))?'filled':'empty'}" style="--tile:${palettes[data.theme][p.color-1]}"></i>`).join('')}</button>`}
function bindBoard(){document.querySelectorAll('[data-piece]').forEach(b=>{b.onpointerdown=e=>{if(run.over)return;e.preventDefault();selected=+b.dataset.piece;hammer=false;drag={id:e.pointerId,startX:e.clientX,startY:e.clientY,moved:false};b.setPointerCapture(e.pointerId);document.querySelectorAll('.piece').forEach(x=>x.classList.toggle('selected',x===b))};b.onpointermove=e=>{if(!drag)return;drag.moved ||=Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)>8;clearPreview();const target=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-cell]');if(target&&run.pieces[selected]){const n=+target.dataset.cell,p=run.pieces[selected],ok=fits(p,n%8,Math.floor(n/8));p.cells.forEach(([x,y])=>{const xx=n%8+x,yy=Math.floor(n/8)+y;if(xx<8&&yy<8)document.querySelector(`[data-cell="${yy*8+xx}"]`)?.classList.add(ok?'preview':'invalid')})}};b.onpointerup=e=>{const target=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-cell]');clearPreview();if(drag?.moved&&target)place(selected,+target.dataset.cell);drag=null};b.onpointercancel=()=>{drag=null;clearPreview()}});document.querySelectorAll('[data-cell]').forEach(el=>el.onclick=()=>{const n=+el.dataset.cell;if(run.over)return;if(hammer){if(run.board[n]&&data.hammers){data.hammers--;run.board[n]=0;hammer=false;save();sfx('clear');render()}}else if(selected!==null)place(selected,n)})}
function clearPreview(){document.querySelectorAll('.preview,.invalid').forEach(e=>e.classList.remove('preview','invalid'))}
function missionList(){return [['lines10','Clear 10 lines',10,data.stats.lines],['blocks150','Place 150 blocks',150,data.stats.blocks],['rounds5','Start 5 rounds',5,data.stats.games],['best2000','Reach 2,000 points',2000,data.best]]}
function action(a){if(window.CPRAds.busy)return;if(a==='rewardAd')return window.CPRAds.watchReward();if(a==='adPrivacy')return window.CPRAds.privacy();if(a==='testAudio')return testAudio();if(a==='home')return go('home');if(a==='classic')return start('classic');if(a==='continue')return go('game');if(a==='startDaily')return start('daily');if(a==='pause')return dialog('Paused','Take a breath. Your round is saved.',[['Resume',()=>{}],['Menu',()=>go('home')]]);if(a==='claimReward'){if(data.rewardDate===today())return;const yesterday=new Date();yesterday.setDate(yesterday.getDate()-1);data.streak=data.rewardDate===yesterday.toLocaleDateString('en-CA')?data.streak+1:1;data.rewardDate=today();const amount=Math.min(60,25+5*(data.streak-1));data.coins+=amount;save();sfx('clear');toast(`+${amount} coins`);return render()}
if(a==='buyHammer'){if(data.coins<60)return toast('You need 60 coins.');data.coins-=60;data.hammers+=3;save();toast('3 hammers added');return render()}
if(a.startsWith('theme:')){const id=a.split(':')[1];if(!data.themes.includes(id)){if(data.coins<100)return toast('You need 100 coins.');data.coins-=100;data.themes.push(id)}data.theme=id;save();return render()}
if(a.startsWith('mission:')){const id=a.split(':')[1],m=missionList().find(x=>x[0]===id);if(data.missions[id])return;if(m[3]<m[2])return toast('Keep playing to complete this mission.');data.missions[id]=true;data.coins+=50;save();sfx('clear');return render()}
if(a==='rainbow'){if(run.mode==='daily')return toast('Power-ups are disabled in Daily Challenge.');if(run.over||run.charge<100)return toast('Clear lines to charge Rainbow Pop.');const counts=[0,0,0,0,0,0];run.board.forEach(c=>counts[c]++);const color=counts.slice(1).indexOf(Math.max(...counts.slice(1)))+1;run.board=run.board.map(c=>c===color?0:c);run.charge=0;save();sfx('clear');return render()}
if(a==='hammer'){if(run.mode==='daily')return toast('Power-ups are disabled in Daily Challenge.');if(run.over)return;if(!data.hammers)return toast('Buy hammers in the coin store.');hammer=!hammer;selected=null;toast('Tap an occupied square to remove it.');return}
if(a==='export'){const blob=new Blob([JSON.stringify({...data,run},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='ColorPopRush-backup.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);return}if(a==='import')return $('#file').click();go(a)}
async function restore(e){const f=e.target.files[0];if(!f)return;try{if(f.size>1000000)throw Error();const x=JSON.parse(await f.text());if(x.v!==1||!Number.isSafeInteger(x.coins)||x.coins<0||!palettes[x.theme]||!Array.isArray(x.themes)||x.themes.some(t=>!palettes[t])||!Array.isArray(x.achieved)||!Array.isArray(x.dailyWins)||typeof x.settings!=='object'||typeof x.stats!=='object'||!Number.isSafeInteger(x.best)||!Number.isSafeInteger(x.hammers)||x.hammers<0)throw Error();if(x.run&&(!Number.isSafeInteger(x.run.score)||x.run.score<0||!Number.isFinite(x.run.charge)||typeof x.run.over!=='boolean'||!['classic','daily'].includes(x.run.mode)||!Array.isArray(x.run.board)||x.run.board.length!==64||x.run.board.some(c=>!Number.isInteger(c)||c<0||c>5)||!Array.isArray(x.run.pieces)||x.run.pieces.length!==3||x.run.pieces.some(p=>p&&(!Number.isInteger(p.color)||p.color<1||p.color>5||!Array.isArray(p.cells)||p.cells.length>9||!p.cells.length||p.cells.some(c=>!Array.isArray(c)||c.length!==2||c.some(n=>!Number.isInteger(n)||n<0||n>7))))))throw Error();dialog('Restore backup?','This replaces progress on this device. Export your current progress first if you want to keep it.',[['Cancel',()=>{}],['Restore',()=>{data={...base(),...x};run=data.run;save();music();render();toast('Backup restored')}]]);}catch{toast('This is not a valid Color Pop Rush backup.')}}
render();if('serviceWorker'in navigator&&location.protocol==='https:'&&!window.Capacitor)navigator.serviceWorker.register('sw.js').catch(()=>{});