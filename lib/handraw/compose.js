/**
 * 提示词拼装器：把「画风 + 主题色 + 影调 + 排版图型 + 比例 + 模式」按 handraw-style 的
 * Skill 规则拼成一段可直接出图的提示词。
 *
 * 两条硬规则（照抄上游 AGENTS.md，任何改写都会让风格漂移）：
 *   1. 素材正文原样拼接，不缩写、不润色、不换序；
 *   2. 示例图的画面内容绝不写进提示词——画风只描述媒介、光影、色彩这类纯视觉语言，
 *      画面主题永远由用户那一句话决定。
 */
import { getItem } from './catalog.js'

const THEME_PLACEHOLDER = '【请在此输入画面主题，或在生图模型中垫入你的照片】'

const GRAPHIC_SUFFIX =
  '【如果主题直白包含画面元素那就按主题出图，文案由你来升华，但是不要直接描述画面。 如果主题比较概念化，那么文案和主题尽量保持一致，如果文案较长由你提炼，由你先设计画面隐喻（人类和非人类都行）再出图   。    文字参与构图，图文一体】'

const REDRAW_ZH = '【请只提取人物的五官特征和姿态，场景轮廓，在画风上严格按 选择的风格重新画，不要在原照片上加质感。】'

const WHITESPACE = {
  moderate: '【大量留白】',
  high: '【大量留白，场景只显示必要部分，不要显示全】',
}

const PHOTO_TYPES = ['跨界续绘', '撕纸第二世界', '越界破框', '微缩浮岛', '记忆图谱', '悬浮落地', '正负形咬合']

export const MODES = ['graphic-text', 'pure-image']

function text(value, max) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

/**
 * SC-021 是「自适应双拼照片转译社媒卡」，原文里列了 7 种冲突的拼接类型。
 * 出图时只能给模型一种：挑出指定类型、把 7 条全部剔除，再补一句方向说明。
 */
function photoLayout(prompt, variant, ratio) {
  const lines = prompt.split(/\r?\n/)
  const selected = lines.find(line => new RegExp(`^\\s*[-–]\\s*【类型\\s*0?${variant}\\b`).test(line))
  const withoutOptions = lines.filter(line => !/^\s*[-–]\s*【类型\s*0?[1-7]\b/.test(line))
  const parts = /^(\d+(?:\.\d+)?)[：:](\d+(?:\.\d+)?)$/.exec(ratio)
  const horizontal = parts ? Number(parts[1]) > Number(parts[2]) : false
  let out = withoutOptions.join('\n').trim()
  out += `\n本张只采用【类型 0${variant} · ${PHOTO_TYPES[variant - 1]}】；${
    horizontal ? '左右等分，左侧摄影、右侧手绘。' : '上下等分，上方摄影、下方手绘。'
  }`
  if (selected) out += '\n' + selected.replace(/^\s*[-–]\s*/, '')
  return out
}

function pick(kind, id, label) {
  if (!id) return null
  const item = getItem(id)
  if (!item || item.kind !== kind) {
    const err = new Error(`所选${label}不存在：${id}`)
    err.statusCode = 400
    err.code = 'bad-template'
    throw err
  }
  return item
}

/**
 * @param {object} design {layout?,style?,color?,tone?,ratio?,mode?,theme,brief?,whitespace?,variant?,referenceUpload?}
 * @returns {{prompt:string, mode:string, refs:object, chars:number}}
 */
export function composePrompt(design) {
  if (!design || typeof design !== 'object') {
    const err = new Error('创作参数无效。')
    err.statusCode = 400
    throw err
  }

  const theme = text(design.theme, 800) || THEME_PLACEHOLDER
  const style = pick('style', text(design.style, 16), '画风')
  const layout = pick('layout', text(design.layout, 16), '图型')
  const color = pick('color', text(design.color, 16), '配色')
  const tone = pick('tone', text(design.tone, 16), '影调')
  const ratio = text(design.ratio, 40)
  const fusion = design.fusion && typeof design.fusion === 'object' ? design.fusion : {}
  const character = pick('style', text(fusion.character, 16), '角色画风')
  const scene = pick('style', text(fusion.scene, 16), '场景画风')
  const fused = Boolean((character || scene) && style)

  const ecommerce = Boolean(layout && layout.id.startsWith('EC-'))
  const mode = ecommerce ? 'ecommerce' : layout ? 'graphic-text' : MODES.includes(design.mode) ? design.mode : 'pure-image'
  const variant = Number(design.variant) >= 1 && Number(design.variant) <= 7 ? Math.trunc(Number(design.variant)) : 1

  const lines = []
  if (style) {
    lines.push(`画风：${style.title}（${style.id}）`)
    if (style.credit) lines.push(`参考风格名称：${style.credit}`)
    if (style.body && style.body.zh) lines.push(`纯视觉画风特征（禁止照抄示例主体）：${style.body.zh}`)
  }
  if (fused) {
    const scope = character && scene ? '角色/主体与场景/环境' : character ? '角色/主体' : '场景/环境'
    lines.push(
      `融合原则：以「${style.title}（${style.id}）」作为整幅画面的主画风（媒介、笔触、色彩体系照它）；${scope}另按下面的参考画风处理，只借用其形体语言与氛围，不改变主画风的材质与配色。`,
    )
    if (character) {
      lines.push(`角色/主体画风：${character.title}（${character.id}）`)
      if (character.body && character.body.zh) lines.push(`角色/主体视觉特征：${character.body.zh}`)
    }
    if (scene) {
      lines.push(`场景/环境画风：${scene.title}（${scene.id}）`)
      if (scene.body && scene.body.zh) lines.push(`场景/环境视觉特征：${scene.body.zh}`)
    }
  }
  if (color) lines.push(color.body.zh || color.body.en || color.title)
  lines.push(`主题：${theme}`)
  if (ratio) lines.push(`画幅比例：${ratio}`)
  if (tone) lines.push(`影调：${tone.title}。${tone.body.zh || ''}`)
  if (WHITESPACE[design.whitespace]) lines.push(WHITESPACE[design.whitespace])
  const brief = text(design.brief, 1200)
  if (brief) lines.push(`画面要求：${brief}`)
  if (layout) {
    const body = layout.body.zh || layout.body.en || ''
    lines.push(`排版图型（${layout.id}）：${layout.id === 'SC-021' ? photoLayout(body, variant, ratio) : body}`)
  }
  if (design.referenceUpload) lines.push(REDRAW_ZH)
  if (mode === 'graphic-text' && !ecommerce) lines.push(GRAPHIC_SUFFIX)
  if (mode === 'pure-image') lines.push('纯图模式：画面内不生成额外标题、标识或可读文字。')

  const prompt = lines.filter(Boolean).join('\n\n')
  return {
    prompt,
    mode,
    chars: prompt.length,
    refs: {
      layout: layout ? layout.id : null,
      style: style ? style.id : null,
      color: color ? color.id : null,
      tone: tone ? tone.id : null,
      ratio: ratio || null,
      mode,
      character: character ? character.id : null,
      scene: scene ? scene.id : null,
    },
  }
}
