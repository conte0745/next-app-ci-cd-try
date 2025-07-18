// @vitest-environment jsdom
import '@testing-library/jest-dom';

// window.matchMedia モック
if (!window.matchMedia) {
  window.matchMedia = function () {
    return {
      matches: false,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      onchange: null,
      dispatchEvent: () => false,
      media: '',
    };
  };
}

// structuredClone polyfill（node18+なら不要だが念のため）
if (!globalThis.structuredClone) {
  globalThis.structuredClone = (obj: any) => JSON.parse(JSON.stringify(obj));
}
