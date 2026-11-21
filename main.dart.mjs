// Compiles a dart2wasm-generated main module from `source` which can then
// be instantiated via the `instantiate` method.
//
// `source` needs to be a `Response` object (or promise thereof) e.g. created
// via the `fetch()` JS API.
export async function compileStreaming(source) {
  const builtins = {builtins: ['js-string'], importedStringConstants: ''};
  return new CompiledApp(
      await _compileStreaming(source, builtins), builtins);
}

// Compiles a dart2wasm-generated wasm module from `bytes` which is then
// instantiable via the `instantiate` method.
export async function compile(bytes) {
  const builtins = {builtins: ['js-string'], importedStringConstants: ''};
  return new CompiledApp(await WebAssembly.compile(bytes, builtins), builtins);
}

let _isCompileStreamingSupported;
async function _compileStreaming(source, builtins) {
  _isCompileStreamingSupported ??= WebAssembly.compileStreaming(
    new Response(
      new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,2,23,1,14,119,97,115,109,58,106,115,45,115,116,114,105,110,103,4,99,97,115,116,0,0]),
      {headers: {'Content-Type': 'application/wasm'}},
    ),
    builtins,
  ).then(() => false, (e) => e instanceof WebAssembly.CompileError);
  if (await _isCompileStreamingSupported) {
    return WebAssembly.compileStreaming(source, builtins);
  }
  return WebAssembly.compile(await (await source).arrayBuffer(), builtins);
}

class CompiledApp {
  constructor(module, builtins) {
    this.module = module;
    this.builtins = builtins;
  }

  // The second argument is an options object containing:
  // `loadDeferredModules` is a JS function that takes an array of module names
  //   matching wasm files produced by the dart2wasm compiler. It also takes a
  //   callback that should be invoked for each loaded module with 2 arguments:
  //   (1) the module name, (2) the loaded module in a format supported by
  //   `WebAssembly.compile` or `WebAssembly.compileStreaming`. The callback
  //   returns a Promise that resolves when the module is instantiated.
  //   loadDeferredModules should return a Promise that resolves when all the
  //   modules have been loaded and the callback promises have resolved.
  // `loadDeferredId` is a JS function that takes load ID produced by the
  //   compiler when the `use-load-ids` option is passed. Each load ID maps to
  //   one or more wasm files as specified in the emitted JSON file. It also
  //   takes a callback that should be invoked for each loaded module with 2
  //   arguments: (1) the module name, (2) the loaded module in a format
  //   supported by `WebAssembly.compile` or `WebAssembly.compileStreaming`.
  //   The callback returns a Promise that resolves when the module is
  //   instantiated.
  //   loadDeferredId should return a Promise that resolves when all the
  //   modules have been loaded and the callback promises have resolved.
  async instantiate(additionalImports, {loadDeferredModules, loadDeferredId} = {}) {
    let dartInstance;

    // Prints to the console
    function printToConsole(value) {
      if (typeof dartPrint == "function") {
        dartPrint(value);
        return;
      }
      if (typeof console == "object" && typeof console.log != "undefined") {
        console.log(value);
        return;
      }
      if (typeof print == "function") {
        print(value);
        return;
      }

      throw "Unable to print message: " + value;
    }

    // A special symbol attached to functions that wrap Dart functions.
    const jsWrappedDartFunctionSymbol = Symbol("JSWrappedDartFunction");

    function finalizeWrapper(dartFunction, wrapped) {
      wrapped.dartFunction = dartFunction;
      wrapped[jsWrappedDartFunctionSymbol] = true;
      return wrapped;
    }

    // Imports
    const dart2wasm = {
            AB: x0 => new Int16Array(x0),
      AC: (o, start, length) => new Uint8ClampedArray(o.buffer, o.byteOffset + start, length),
      AD: x0 => x0.clientX,
      AE: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      AF: s => s.toUpperCase(),
      AG: (x0,x1) => x0.go(x1),
      AH: x0 => x0.clipboard,
      AI: x0 => new WeakRef(x0),
      AJ: x0 => x0.ready,
      AK: x0 => x0.body,
      B: s => printToConsole(s),
      BB: x0 => new Uint16Array(x0),
      BC: (o, start, length) => new Uint8Array(o.buffer, o.byteOffset + start, length),
      BD: (x0,x1,x2) => x0.addEventListener(x1,x2),
      BE: (p, s, f) => p.then(s, (e) => f(e, e === undefined)),
      BF: (x0,x1) => x0[x1],
      BG: (x0,x1) => x0.querySelectorAll(x1),
      BH: (x0,x1) => x0.writeText(x1),
      BI: x0 => x0.deref(),
      BJ: x0 => x0.tracks,
      BK: (x0,x1) => new OffscreenCanvas(x0,x1),
      C: Function.prototype.call.bind(Number.prototype.toString),
      CB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI16ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      CC: (o, start, length) => new Int8Array(o.buffer, o.byteOffset + start, length),
      CD: (x0,x1,x2) => x0.setAttribute(x1,x2),
      CE: (o, i) => o[i],
      CF: x0 => x0.length,
      CG: (x0,x1) => x0.requestAnimationFrame(x1),
      CH: x0 => x0.unlock(),
      CI: () => globalThis.WeakRef,
      CJ: () => globalThis.window.ImageDecoder,
      CK: x0 => x0.assetBase,
      D: Function.prototype.call.bind(BigInt.prototype.toString),
      DB: x0 => new Int32Array(x0),
      DC: (x0,x1) => x0.querySelector(x1),
      DD: (x0,x1) => x0.closest(x1),
      DE: o => o.length,
      DF: (x0,x1) => x0.exec(x1),
      DG: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      DH: (x0,x1) => x0.lock(x1),
      DI: (o, offsetInBytes, lengthInBytes) => {
        var dst = new ArrayBuffer(lengthInBytes);
        new Uint8Array(dst).set(new Uint8Array(o, offsetInBytes, lengthInBytes));
        return new DataView(dst);
      },
      DJ: (x0,x1,x2) => x0.insertBefore(x1,x2),
      DK: x0 => x0.loader,
      E: (exn) => {
        let stackString = exn.toString();
        let frames = stackString.split('\n');
        let drop = 4;
        if (frames[0].startsWith('Error')) {
            drop += 1;
        }
        return frames.slice(drop).join('\n');
      },
      EB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI32ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      EC: (x0,x1) => x0.item(x1),
      ED: (ms, c) =>
      setTimeout(() => dartInstance.exports.$invokeCallback(c),ms),
      EE: o => {
        if (o === undefined) return 1;
        var type = typeof o;
        if (type === 'boolean') return 2;
        if (type === 'number') return 3;
        if (type === 'string') return 4;
        if (o instanceof Array) return 5;
        if (ArrayBuffer.isView(o)) {
          if (o instanceof Int8Array) return 6;
          if (o instanceof Uint8Array) return 7;
          if (o instanceof Uint8ClampedArray) return 8;
          if (o instanceof Int16Array) return 9;
          if (o instanceof Uint16Array) return 10;
          if (o instanceof Int32Array) return 11;
          if (o instanceof Uint32Array) return 12;
          if (o instanceof Float32Array) return 13;
          if (o instanceof Float64Array) return 14;
          if (o instanceof DataView) return 15;
        }
        if (o instanceof ArrayBuffer) return 16;
        // Feature check for `SharedArrayBuffer` before doing a type-check.
        if (globalThis.SharedArrayBuffer !== undefined &&
            o instanceof SharedArrayBuffer) {
            return 17;
        }
        if (o instanceof Promise) return 18;
        return 19;
      },
      EF: x0 => x0.unicode,
      EG: x0 => x0.now(),
      EH: x0 => x0.orientation,
      EI: (a, s, e) => a.slice(s, e),
      EJ: x0 => x0.id,
      EK: () => globalThis._flutter,
      F: () => new Error().stack,
      FB: x0 => new Uint32Array(x0),
      FC: x0 => x0.length,
      FD: (handle) => clearTimeout(handle),
      FE: x0 => x0.language,
      FF: x0 => x0.index,
      FG: x0 => x0.performance,
      FH: (x0,x1) => x0.querySelector(x1),
      FI: () => {
        return typeof process != "undefined" &&
               Object.prototype.toString.call(process) == "[object process]" &&
               process.platform == "win32"
      },
      FJ: x0 => x0.offsetHeight,
      G: s => JSON.stringify(s),
      GB: x0 => new Float32Array(x0),
      GC: (x0,x1) => x0.querySelectorAll(x1),
      GD: x0 => x0.maxTouchPoints,
      GE: (x0,x1,x2,x3) => x0.register(x1,x2,x3),
      GF: (x0,x1) => { x0.lastIndex = x1 },
      GG: (d, digits) => d.toFixed(digits),
      GH: (x0,x1) => { x0.title = x1 },
      GI: () => {
        // On browsers return `globalThis.location.href`
        if (globalThis.location != null) {
          return globalThis.location.href;
        }
        return null;
      },
      GJ: x0 => x0.offsetWidth,
      H: Function.prototype.call.bind(Number.prototype.toString),
      HB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmF32ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      HC: (x0,x1) => x0.getAttribute(x1),
      HD: x0 => x0.platform,
      HE: () => globalThis.window.FinalizationRegistry,
      HF: x0 => x0.dotAll,
      HG: x0 => x0.maxHeight,
      HH: (x0,x1) => x0.vibrate(x1),
      HI: () => new XMLHttpRequest(),
      HJ: x0 => x0.stopPropagation(),
      I: Function.prototype.call.bind(String.prototype.indexOf),
      IB: x0 => new Float64Array(x0),
      IC: x0 => x0.remove(),
      ID: s => new Date(s * 1000).getTimezoneOffset() * 60,
      IE: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      IF: x0 => x0.ignoreCase,
      IG: x0 => x0.maxWidth,
      IH: x0 => x0.arrayBuffer(),
      II: (x0,x1,x2) => x0.open(x1,x2),
      IJ: x0 => x0.disabled,
      J: (s, p, i) => s.lastIndexOf(p, i),
      JB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmF64ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      JC: (x0,x1) => x0.appendChild(x1),
      JD: Date.now,
      JE: x0 => new window.FinalizationRegistry(x0),
      JF: x0 => x0.multiline,
      JG: x0 => x0.minHeight,
      JH: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof ArrayBuffer) return 1;
        if (globalThis.SharedArrayBuffer !== undefined &&
            o instanceof SharedArrayBuffer) {
          return 2;
        }
        return 3;
      },
      JI: (x0,x1) => x0.send(x1),
      JJ: (x0,x1) => { x0.min = x1 },
      K: (exn) => {
        if (exn instanceof Error) {
          return exn.stack;
        } else {
          return null;
        }
      },
      KB: x0 => new ArrayBuffer(x0),
      KC: (x0,x1) => x0.append(x1),
      KD: (x0,x1) => x0.contains(x1),
      KE: (x0,x1) => x0.unregister(x1),
      KF: x0 => x0.pop(),
      KG: x0 => x0.minWidth,
      KH: x0 => x0.status,
      KI: x0 => x0.send(),
      KJ: (x0,x1) => { x0.max = x1 },
      L: o => o === undefined,
      LB: (x0,x1,x2) => new Uint8Array(x0,x1,x2),
      LC: (x0,x1,x2,x3) => x0.setProperty(x1,x2,x3),
      LD: (decoder, codeUnits) => decoder.decode(codeUnits),
      LE: x0 => x0.preventDefault(),
      LF: x0 => x0.flags,
      LG: (x0,x1) => x0.removeProperty(x1),
      LH: (x0,x1) => x0.fetch(x1),
      LI: x0 => x0.abort(),
      LJ: (x0,x1) => { x0.disabled = x1 },
      M: o => String(o),
      MB: (x0,x1,x2) => new DataView(x0,x1,x2),
      MC: x0 => x0.style,
      MD: () => new TextDecoder("utf-8", {fatal: true}),
      ME: x0 => x0.parent,
      MF: (s, m) => {
        try {
          return new RegExp(s, m);
        } catch (e) {
          return String(e);
        }
      },
      MG: (x0,x1) => x0.add(x1),
      MH: x0 => x0.content,
      MI: x0 => x0.upload,
      MJ: (x0,x1) => { x0.scrollLeft = x1 },
      N: (c) =>
      queueMicrotask(() => dartInstance.exports.$invokeCallback(c)),
      NB: (o, p) => o[p],
      NC: x0 => x0.debugShowSemanticsNodes,
      ND: () => new TextDecoder("utf-8", {fatal: false}),
      NE: x0 => x0.timeStamp,
      NF: o => o instanceof RegExp,
      NG: x0 => x0.data,
      NH: x0 => x0.document,
      NI: x0 => x0.readyState,
      NJ: (x0,x1) => { x0.spellcheck = x1 },
      O: (x0,x1) => x0.didCreateEngineInitializer(x1),
      OB: (o) => new DataView(o.buffer, o.byteOffset, o.byteLength),
      OC: o => o,
      OD: (a, i, v) => a[i] = v,
      OE: (x0,x1) => x0.hasAttribute(x1),
      OF: (a, s) => a.join(s),
      OG: (x0,x1) => x0.removeAttribute(x1),
      OH: () => typeof dartUseDateNowForTicks !== "undefined",
      OI: x0 => x0.responseURL,
      OJ: (x0,x1) => { x0.disabled = x1 },
      P: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      PB: Function.prototype.call.bind(Object.getOwnPropertyDescriptor(DataView.prototype, 'byteLength').get),
      PC: o => {
        if (o === undefined || o === null) return 0;
        if (typeof o === 'boolean') return 1;
        return 2;
      },
      PD: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI8ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      PE: x0 => x0.type,
      PF: (x0,x1) => x0.error(x1),
      PG: (x0,x1) => { x0.value = x1 },
      PH: () => Date.now(),
      PI: x0 => x0.statusText,
      PJ: (x0,x1,x2,x3,x4,x5,x6,x7,x8,x9) => x0.drawImage(x1,x2,x3,x4,x5,x6,x7,x8,x9),
      Q: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      QB: o => o.byteOffset,
      QC: (x0,x1) => x0.warn(x1),
      QD: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI16ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      QE: (x0,x1) => x0.getModifierState(x1),
      QF: () => globalThis.console,
      QG: (x0,x1) => { x0.value = x1 },
      QH: () => 1000 * performance.now(),
      QI: x0 => x0.getAllResponseHeaders(),
      QJ: (x0,x1) => x0.getContext(x1),
      R: (x0,x1) => ({initializeEngine: x0,autoStart: x1}),
      RB: o => o.buffer,
      RC: x0 => x0.console,
      RD: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI32ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      RE: x0 => x0.buttons,
      RF: s => s.trimRight(),
      RG: x0 => x0.value,
      RH: x0 => new Uint8Array(x0),
      RI: x0 => x0.status,
      RJ: (x0,x1) => { x0.height = x1 },
      S: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      SB: Function.prototype.call.bind(DataView.prototype.getUint8),
      SC: () => globalThis.window,
      SD: (s) => +s,
      SE: x0 => x0.ctrlKey,
      SF: x0 => x0.blur(),
      SG: x0 => x0.selectionDirection,
      SH: (x0,x1,x2) => x0.slice(x1,x2),
      SI: x0 => x0.response,
      SJ: (x0,x1) => { x0.width = x1 },
      T: x0 => new Promise(x0),
      TB: (b, o) => new DataView(b, o),
      TC: (o, c) => o instanceof c,
      TD: s => {
        if (!/^\s*[+-]?(?:Infinity|NaN|(?:\.\d+|\d+(?:\.\d*)?)(?:[eE][+-]?\d+)?)\s*$/.test(s)) {
          return NaN;
        }
        return parseFloat(s);
      },
      TE: x0 => x0.getBoundingClientRect(),
      TF: x0 => x0.button,
      TG: x0 => x0.selectionStart,
      TH: (x0,x1) => x0.decode(x1),
      TI: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      TJ: (x0,x1) => x0.transferFromImageBitmap(x1),
      U: (x0,x1,x2) => x0.call(x1,x2),
      UB: (b, o, l) => new DataView(b, o, l),
      UC: (string, token) => string.split(token),
      UD: s => s.trim(),
      UE: x0 => x0.y,
      UF: (x0,x1) => x0.prepend(x1),
      UG: x0 => x0.selectionEnd,
      UH: (x0,x1) => x0.adoptText(x1),
      UI: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
      UJ: x0 => x0.rasterEndMilliseconds,
      V: (constructor, args) => {
        const factoryFunction = constructor.bind.apply(
            constructor, [null, ...args]);
        return new factoryFunction();
      },
      VB: Function.prototype.call.bind(DataView.prototype.getFloat64),
      VC: o => o instanceof Array,
      VD: x0 => x0.classList,
      VE: x0 => x0.x,
      VF: x0 => x0.parentElement,
      VG: x0 => x0.value,
      VH: x0 => x0.first(),
      VI: (x0,x1,x2,x3) => x0.removeEventListener(x1,x2,x3),
      VJ: x0 => x0.rasterStartMilliseconds,
      W: x0 => new Array(x0),
      WB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Float64Array) return 1;
        return 2;
      },
      WC: (a, i) => a[i],
      WD: x0 => x0.relatedTarget,
      WE: x0 => x0.top,
      WF: x0 => x0.innerHeight,
      WG: x0 => x0.selectionDirection,
      WH: x0 => x0.next(),
      WI: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      WJ: x0 => x0.imageBitmaps,
      X: o => [o],
      XB: Function.prototype.call.bind(DataView.prototype.setFloat64),
      XC: a => a.length,
      XD: x0 => x0.hasFocus(),
      XE: x0 => x0.left,
      XF: x0 => x0.innerWidth,
      XG: x0 => x0.selectionStart,
      XH: x0 => x0.current(),
      XI: x0 => x0.withCredentials,
      XJ: x0 => x0.canvasKitMaximumSurfaces,
      Y: (o0, o1) => [o0, o1],
      YB: (t, s) => t.set(s),
      YC: (x0,x1) => x0.test(x1),
      YD: x0 => x0.shiftKey,
      YE: x0 => x0.scrollTop,
      YF: x0 => x0.height,
      YG: x0 => x0.selectionEnd,
      YH: (x0,x1) => new Intl.v8BreakIterator(x0,x1),
      YI: (x0,x1) => { x0.timeout = x1 },
      YJ: x0 => x0.hostElement,
      Z: (o0, o1, o2) => [o0, o1, o2],
      ZB: Function.prototype.call.bind(DataView.prototype.setFloat32),
      ZC: x0 => x0.userAgent,
      ZD: x0 => x0.body,
      ZE: x0 => x0.offsetTop,
      ZF: x0 => x0.width,
      ZG: (x0,x1) => { x0.name = x1 },
      ZH: x0 => x0.v8BreakIterator,
      ZI: (x0,x1,x2) => x0.setRequestHeader(x1,x2),
      ZJ: x0 => x0.location,
      a: (o0, o1, o2, o3) => [o0, o1, o2, o3],
      aB: Function.prototype.call.bind(DataView.prototype.getFloat32),
      aC: x0 => x0.navigator,
      aD: x0 => x0.visibilityState,
      aE: x0 => x0.scrollLeft,
      aF: x0 => x0.clientHeight,
      aG: (x0,x1) => { x0.placeholder = x1 },
      aH: () => globalThis.Intl,
      aI: (x0,x1) => { x0.withCredentials = x1 },
      aJ: (x0,x1) => x0.getModifierState(x1),
      b: (x0,x1,x2) => { x0[x1] = x2 },
      bB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Float32Array) return 1;
        return 2;
      },
      bC: Function.prototype.call.bind(String.prototype.toLowerCase),
      bD: (x0,x1,x2) => x0.removeEventListener(x1,x2),
      bE: x0 => x0.offsetLeft,
      bF: x0 => x0.clientWidth,
      bG: (x0,x1) => { x0.autocomplete = x1 },
      bH: (x0,x1) => x0.segment(x1),
      bI: (x0,x1) => { x0.responseType = x1 },
      bJ: x0 => x0.metaKey,
      c: o => o,
      cB: Function.prototype.call.bind(DataView.prototype.getUint32),
      cC: Object.is,
      cD: x0 => x0.disconnect(),
      cE: x0 => x0.offsetParent,
      cF: x0 => x0.isConnected,
      cG: (x0,x1) => { x0.type = x1 },
      cH: x0 => x0.index,
      cI: x0 => x0.close(),
      cJ: x0 => x0.altKey,
      d: (o, p) => o[p],
      dB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Uint32Array) return 1;
        return 2;
      },
      dC: x0 => x0.vendor,
      dD: x0 => new Intl.Locale(x0),
      dE: x0 => x0.offsetY,
      dF: x0 => x0.head,
      dG: (x0,x1) => { x0.name = x1 },
      dH: x0 => x0.next(),
      dI: x0 => x0.height,
      dJ: x0 => x0.ctrlKey,
      e: () => globalThis,
      eB: Function.prototype.call.bind(DataView.prototype.getInt32),
      eC: (x0,x1) => x0.createTextNode(x1),
      eD: x0 => x0.region,
      eE: x0 => x0.offsetX,
      eF: (x0,x1) => { x0.content = x1 },
      eG: (x0,x1) => { x0.placeholder = x1 },
      eH: x0 => x0.value,
      eI: x0 => x0.width,
      eJ: x0 => x0.isComposing,
      f: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      fB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Int32Array) return 1;
        return 2;
      },
      fC: (x0,x1) => { x0.id = x1 },
      fD: x0 => x0.script,
      fE: (o, p, r) => o.replaceAll(p, () => r),
      fF: (x0,x1) => { x0.name = x1 },
      fG: (x0,x1) => { x0.scrollTop = x1 },
      fH: x0 => x0.done,
      fI: (x0,x1,x2,x3,x4,x5) => x0.createImageBitmap(x1,x2,x3,x4,x5),
      fJ: x0 => x0.code,
      g: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      gB: o => o instanceof Uint16Array,
      gC: (x0,x1) => { x0.nonce = x1 },
      gD: x0 => x0.language,
      gE: x0 => x0.deltaMode,
      gF: (x0,x1) => x0.removeChild(x1),
      gG: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
      gH: (o, m, a) => o[m].apply(o, a),
      gI: (x0,x1) => x0.createImageBitmap(x1),
      gJ: x0 => x0.repeat,
      h: (x0,x1) => ({addView: x0,removeView: x1}),
      hB: Function.prototype.call.bind(DataView.prototype.getUint16),
      hC: x0 => x0.nonce,
      hD: x0 => x0.languages,
      hE: x0 => x0.deltaY,
      hF: x0 => x0.firstChild,
      hG: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
      hH: x0 => x0.iterator,
      hI: x0 => new Blob(x0),
      hJ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      i: (l, r) => l === r,
      iB: o => o instanceof Int16Array,
      iC: () => globalThis.window.flutterConfiguration,
      iD: (x0,x1) => x0.observe(x1),
      iE: x0 => x0.deltaX,
      iF: x0 => x0.viewConstraints,
      iG: s => {
        if (/[[\]{}()*+?.\\^$|]/.test(s)) {
            s = s.replace(/[[\]{}()*+?.\\^$|]/g, '\\$&');
        }
        return s;
      },
      iH: () => globalThis.Symbol,
      iI: x0 => x0.close(),
      iJ: x0 => x0.userAgent,
      j: x0 => x0.random(),
      jB: Function.prototype.call.bind(DataView.prototype.getInt16),
      jC: (x0,x1) => x0.attachShadow(x1),
      jD: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      jE: x0 => x0.wheelDeltaY,
      jF: x0 => x0.hostElement,
      jG: x0 => x0.keyCode,
      jH: (x0,x1) => new Intl.Segmenter(x0,x1),
      jI: x0 => x0.naturalHeight,
      jJ: x0 => x0.navigator,
      k: o => o,
      kB: o => o instanceof Uint8ClampedArray,
      kC: (x0,x1) => x0.createElement(x1),
      kD: x0 => new ResizeObserver(x0),
      kE: x0 => x0.wheelDeltaX,
      kF: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      kG: (x0,x1) => x0.scrollIntoView(x1),
      kH: x0 => x0.Segmenter,
      kI: x0 => x0.naturalWidth,
      kJ: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      l: o => {
        if (o === undefined || o === null) return 0;
        if (typeof o === 'number') return 1;
        return 2;
      },
      lB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Uint8Array) return 1;
        return 2;
      },
      lC: x0 => x0.scale,
      lD: (x0,x1) => x0.getPropertyValue(x1),
      lE: x0 => x0.bottom,
      lF: x0 => ({runApp: x0}),
      lG: x0 => x0.multiViewEnabled,
      lH: x0 => x0.buffer,
      lI: (x0,x1) => { x0.src = x1 },
      lJ: () => globalThis.window,
      m: () => globalThis.Math,
      mB: Function.prototype.call.bind(DataView.prototype.setInt32),
      mC: x0 => x0.visualViewport,
      mD: x0 => globalThis.parseFloat(x0),
      mE: x0 => x0.right,
      mF: Function.prototype.call.bind(DataView.prototype.getBigInt64),
      mG: (x0,x1) => x0.replaceWith(x1),
      mH: x0 => x0.wasmMemory,
      mI: x0 => x0.displayHeight,
      mJ: (x0,x1) => x0.getItem(x1),
      n: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
      nB: Function.prototype.call.bind(DataView.prototype.setUint32),
      nC: x0 => x0.devicePixelRatio,
      nD: (x0,x1) => x0.getComputedStyle(x1),
      nE: x0 => x0.clientY,
      nF: Function.prototype.call.bind(DataView.prototype.setBigInt64),
      nG: (x0,x1) => { x0.className = x1 },
      nH: () => globalThis.window._flutter_skwasmInstance,
      nI: x0 => x0.displayWidth,
      nJ: x0 => x0.localStorage,
      o: b => !!b,
      oB: Function.prototype.call.bind(DataView.prototype.setInt16),
      oC: x0 => x0.height,
      oD: x0 => x0.documentElement,
      oE: x0 => x0.clientX,
      oF: (o, start, length) => new BigInt64Array(o.buffer, o.byteOffset + start, length),
      oG: (x0,x1) => { x0.tabIndex = x1 },
      oH: () => new TextDecoder(),
      oI: x0 => x0.duration,
      oJ: (x0,x1) => x0.key(x1),
      p: () => globalThis.document,
      pB: Function.prototype.call.bind(DataView.prototype.setUint16),
      pC: x0 => x0.width,
      pD: x0 => x0.computedStyleMap(),
      pE: x0 => x0.changedTouches,
      pF: (x0,x1,x2,x3) => x0.pushState(x1,x2,x3),
      pG: (x0,x1) => { x0.action = x1 },
      pH: (map, o, v) => map.set(o, v),
      pI: (x0,x1) => ({frameIndex: x0,completeFramesOnly: x1}),
      pJ: x0 => x0.length,
      q: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      qB: Function.prototype.call.bind(DataView.prototype.setUint8),
      qC: x0 => x0.screen,
      qD: (x0,x1) => x0.get(x1),
      qE: x0 => x0.key,
      qF: x0 => x0.history,
      qG: (x0,x1) => { x0.method = x1 },
      qH: (map, o) => map.get(o),
      qI: (x0,x1) => x0.decode(x1),
      qJ: (x0,x1,x2) => x0.setItem(x1,x2),
      r: (x0,x1) => x0.focus(x1),
      rB: Function.prototype.call.bind(DataView.prototype.setInt8),
      rC: (string, times) => string.repeat(times),
      rD: (o, p) => p in o,
      rE: x0 => x0.identifier,
      rF: x0 => x0.search,
      rG: (x0,x1) => { x0.noValidate = x1 },
      rH: () => new WeakMap(),
      rI: x0 => x0.image,
      rJ: x0 => x0.extraAssets,
      s: () => ({}),
      sB: Function.prototype.call.bind(DataView.prototype.getInt8),
      sC: o => {
        if (o === null || o === undefined) return 0;
        if (typeof(o) === 'string') return 1;
        return 2;
      },
      sD: (x0,x1) => { x0.textContent = x1 },
      sE: x0 => x0.touches,
      sF: x0 => x0.location,
      sG: x0 => x0.click(),
      sH: x0 => x0.debugSkipFontRetryDelay,
      sI: x0 => x0.close(),
      sJ: x0 => x0.fontManifest,
      t: (o, p, v) => o[p] = v,
      tB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Int8Array) return 1;
        return 2;
      },
      tC: x0 => x0.tabIndex,
      tD: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      tE: x0 => x0.pressure,
      tF: x0 => x0.pathname,
      tG: (x0,x1) => x0.getElementsByClassName(x1),
      tH: (x0,x1,x2) => x0.set(x1,x2),
      tI: (x0,x1,x2,x3,x4) => ({type: x0,data: x1,premultiplyAlpha: x2,colorSpaceConversion: x3,preferAnimation: x4}),
      tJ: x0 => x0.assetManifest,
      u: () => [],
      uB: (o, start, length) => new Float64Array(o.buffer, o.byteOffset + start, length),
      uC: (x0,x1) => x0.contains(x1),
      uD: x0 => x0.matches,
      uE: x0 => x0.tiltY,
      uF: (x0,x1,x2,x3) => x0.replaceState(x1,x2,x3),
      uG: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF32ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      uH: x0 => x0.fontFallbackBaseUrl,
      uI: x0 => new window.ImageDecoder(x0),
      uJ: x0 => x0.buildConfig,
      v: (a, i) => a.push(i),
      vB: (o, start, length) => new Float32Array(o.buffer, o.byteOffset + start, length),
      vC: x0 => x0.activeElement,
      vD: (x0,x1) => x0.matchMedia(x1),
      vE: x0 => x0.tiltX,
      vF: o => {
        const proto = Object.getPrototypeOf(o);
        return proto === Object.prototype || proto === null;
      },
      vG: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF64ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      vH: (handle) => clearInterval(handle),
      vI: x0 => x0.name,
      vJ: x0 => x0.length,
      w: x0 => new Int8Array(x0),
      wB: (o, start, length) => new Uint32Array(o.buffer, o.byteOffset + start, length),
      wC: x0 => x0.parentNode,
      wD: x0 => x0.matches,
      wE: x0 => x0.pointerType,
      wF: o => Object.keys(o),
      wG: (x0,x1) => x0.dispatchEvent(x1),
      wH: (ms, c) =>
      setInterval(() => dartInstance.exports.$invokeCallback(c), ms),
      wI: x0 => x0.repetitionCount,
      wJ: x0 => x0.getReader(),
      x: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI8ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      xB: (o, start, length) => new Int32Array(o.buffer, o.byteOffset + start, length),
      xC: x0 => x0.tagName,
      xD: o => typeof o === 'function' && o[jsWrappedDartFunctionSymbol] === true,
      xE: x0 => x0.pointerId,
      xF: x0 => x0.state,
      xG: (x0,x1) => x0.createEvent(x1),
      xH: () => Date.now(),
      xI: x0 => x0.frameCount,
      xJ: x0 => x0.value,
      y: x0 => new Uint8Array(x0),
      yB: (o, start, length) => new Uint16Array(o.buffer, o.byteOffset + start, length),
      yC: x0 => x0.target,
      yD: f => f.dartFunction,
      yE: x0 => x0.getCoalescedEvents(),
      yF: x0 => x0.hash,
      yG: (x0,x1,x2,x3) => x0.initEvent(x1,x2,x3),
      yH: (a, i) => a.splice(i, 1),
      yI: x0 => x0.selectedTrack,
      yJ: x0 => x0.done,
      z: x0 => new Uint8ClampedArray(x0),
      zB: (o, start, length) => new Int16Array(o.buffer, o.byteOffset + start, length),
      zC: x0 => x0.clientY,
      zD: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      zE: s => s.trimLeft(),
      zF: x0 => x0.state,
      zG: x0 => x0.readText(),
      zH: a => a.pop(),
      zI: x0 => x0.completed,
      zJ: x0 => x0.read(),

    };

    const baseImports = {
      _: dart2wasm,
      Math: Math,
      Date: Date,
      Object: Object,
      Array: Array,
      Reflect: Reflect,
      WebAssembly: {
        JSTag: WebAssembly.JSTag,
      },
      "": new Proxy({}, { get(_, prop) { return prop; } }),

    };

    

    dartInstance = await WebAssembly.instantiate(this.module, {
      ...baseImports,
      ...additionalImports,
      
    });

    return new InstantiatedApp(this, dartInstance);
  }
}

class InstantiatedApp {
  constructor(compiledApp, instantiatedModule) {
    this.compiledApp = compiledApp;
    this.instantiatedModule = instantiatedModule;
  }

  // Call the main function with the given arguments.
  invokeMain(...args) {
    this.instantiatedModule.exports.$invokeMain(args);
  }
}
