import "@testing-library/jest-dom";

// Polyfill ResizeObserver for @headlessui/react in jsdom
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
