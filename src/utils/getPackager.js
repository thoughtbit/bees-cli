import { execSync } from 'child_process'

let packager = null
function getPackager () {
  if (packager !== null) {
    return packager
  }
  try {
    execSync(/^win/.test(process.platform) ? 'yarn --version' : 'yarn --version 2>/dev/null')
    packager = 'yarn'
  } catch (e) {
    packager = 'npm'
  }
  return packager
}

export default getPackager
