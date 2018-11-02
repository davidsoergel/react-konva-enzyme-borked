module.exports = function (config) {
  config.set({
    frameworks: ['jasmine', 'karma-typescript'],
    files: [
      { pattern: 'src/**/*.ts' },
      { pattern: 'src/**/*.tsx' },
    ],
    preprocessors: {
      '**/*.ts': ['karma-typescript'],
      '**/*.tsx': ['karma-typescript'],
    },
    karmaTypescriptConfig: {
      tsconfig: 'tsconfig.json',
      bundlerOptions: {
        entrypoints: /_test\.(ts|tsx)$/,
      },
    },
    reporters: ['progress', 'karma-typescript'],
    browsers: ['Chrome'],
    client: {
      jasmine: {
        random: false
      },
      args: ['--grep', config.grep || '']
    }
  });
};
