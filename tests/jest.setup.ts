import "@testing-library/jest-dom";

// Polyfill ResizeObserver for @headlessui/react in jsdom
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Suppress headlessui TransitionChild act() warnings
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === "string" && args[0].includes("not wrapped in act"))
      return;
    originalError(...args);
  };
});
afterAll(() => {
  console.error = originalError;
});
