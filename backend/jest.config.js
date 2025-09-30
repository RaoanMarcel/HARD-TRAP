const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  globals: {
    "ts-jest": {
      useESM: false,
    },
  },
  moduleNameMapper: {
    "^(\.{1,2}/.*)\\.ts$": "$1",
  },
};