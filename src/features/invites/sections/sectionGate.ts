export type Sections = Record<string, boolean> | null | undefined

/** For sections that older invites always showed: only an explicit false hides them. */
export const isOn = (sections: Sections, key: string) => sections?.[key] !== false