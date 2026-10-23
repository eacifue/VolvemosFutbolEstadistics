export const cx = (...a: Array<string | false | null | undefined>): string => a.filter(Boolean).join(' ');

export const TEAM_LABEL = { white: 'Blanco', black: 'Negro' } as const;
export const TEAM_SHORT = { white: 'B', black: 'N' } as const;
