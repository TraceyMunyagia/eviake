export type Content = Record<string, any>

export const getIn = (obj: Content | null | undefined, path: string): any =>
  path.split('.').reduce((o: any, k) => (o == null ? undefined : o[k]), obj)

/** Immutable set on a dotted path of plain objects. */
export function setIn(obj: Content | null | undefined, path: string, value: unknown): Content {
  const keys = path.split('.')
  const root: Content = { ...(obj ?? {}) }
  let cur: Content = root
  keys.forEach((k, i) => {
    if (i === keys.length - 1) cur[k] = value
    else {
      cur[k] = { ...(cur[k] ?? {}) }
      cur = cur[k]
    }
  })
  return root
}
