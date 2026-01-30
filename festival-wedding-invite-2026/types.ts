
export enum ThemeOption {
  SOFT_SAGE = 'SOFT_SAGE',
  WARM_SUNSET = 'WARM_SUNSET',
  WILDFLOWER = 'WILDFLOWER'
}

export interface DesignTheme {
  primary: string;
  secondary: string;
  accent: string;
  bgMain: string;
  bgSection: string;
  textMain: string;
  textMuted: string;
}

export interface AppState {
  isSeniorMode: boolean;
  activeTheme: ThemeOption;
}
