module.exports = {
  roots: [
    "test"
  ],
  testMatch: [
    "**/?(*.)+(spec|test).+(js|jsx)"
  ],
  snapshotSerializers: [
    "<rootDir>/node_modules/enzyme-to-json/serializer"
  ],
  setupFilesAfterEnv: [
    "<rootDir>/test/setupEnzyme.js"
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: -10
    }
  }
}
