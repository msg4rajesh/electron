'use strict';

const path = require('path');
const Module = require('module');

// We modified the original process.argv to let node.js load the
// init.js, we need to restore it here.
process.argv.splice(1, 1);

// Clear search paths.
require('../common/reset-search-paths');

// Import common settings.
require('@electron/internal/common/init');

// Export node bindings to global.
const { makeRequireFunction } = __non_webpack_require__('internal/modules/cjs/helpers') // eslint-disable-line
global.module = new Module('electron/js2c/worker_init');
global.require = makeRequireFunction(global.module);

// Set the __filename to the path of html file if it is file: protocol.
if (self.location.protocol === 'file:') {
  const pathname = process.platform === 'win32' && self.location.pathname[0] === '/' ? self.location.pathname.substr(1) : self.location.pathname;
  global.__filename = path.normalize(decodeURIComponent(pathname));
  global.__dirname = path.dirname(global.__filename);

  // Set module's filename so relative require can work as expected.
  global.module.filename = global.__filename;

  // Also search for module under the html file.
  global.module.paths = Module._nodeModulePaths(global.__dirname);
} else {
  // For backwards compatibility we fake these two paths here
  global.__filename = path.join(process.resourcesPath, 'electron.asar', 'worker', 'init.js');
  global.__dirname = path.join(process.resourcesPath, 'electron.asar', 'worker');
}