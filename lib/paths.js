// 路径与目录：插件数据放 $DSH_HOME/image-studio，Codex 凭据来自 $CODEX_HOME（默认 ~/.codex）。
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'

function envDir(name) {
  const raw = process.env[name]
  if (typeof raw === 'string' && raw.trim()) return resolve(raw.trim())
  return null
}

/** DeepSeek Harness 的家目录（$DSH_HOME，否则 ~/.dsh）。 */
export function dshHome() {
  return envDir('DSH_HOME') || join(homedir(), '.dsh')
}

/** 本插件的数据目录。 */
export function dataDir() {
  return join(dshHome(), 'image-studio')
}

export function imagesDir() {
  return join(dataDir(), 'images')
}

export function settingsFile() {
  return join(dataDir(), 'settings.json')
}

export function indexFile() {
  return join(dataDir(), 'index.json')
}

/** Codex 的家目录（$CODEX_HOME，否则 ~/.codex）。 */
export function codexHome() {
  return envDir('CODEX_HOME') || join(homedir(), '.codex')
}

/** Codex 的登录凭据文件。 */
export function codexAuthFile() {
  return join(codexHome(), 'auth.json')
}
