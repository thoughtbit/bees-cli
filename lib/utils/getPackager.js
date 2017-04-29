'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _child_process = require('child_process');

var packager = null;
function getPackager() {
  if (packager !== null) {
    return packager;
  }
  try {
    (0, _child_process.execSync)(/^win/.test(process.platform) ? 'yarn --version' : 'yarn --version 2>/dev/null');
    packager = 'yarn';
  } catch (e) {
    packager = 'npm';
  }
  return packager;
}

exports.default = getPackager;