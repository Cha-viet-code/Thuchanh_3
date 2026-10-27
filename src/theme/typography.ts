import type { TextStyle } from 'react-native';

type Variant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'body'
  | 'bodyBold'
  | 'caption'
  | 'button'
  | 'tabLabel'
  | 'icon'
  | 'iconLarge';

const typography: Record<Variant, TextStyle> = {
  h1: { fontSize: 24, fontWeight: '700', lineHeight: 32 },
  h2: { fontSize: 20, fontWeight: '700', lineHeight: 28 },
  h3: { fontSize: 17, fontWeight: '600', lineHeight: 24 },
  body: { fontSize: 15, fontWeight: '400', lineHeight: 22 },
  bodyBold: { fontSize: 15, fontWeight: '600', lineHeight: 22 },
  caption: { fontSize: 13, fontWeight: '400', lineHeight: 18 },
  button: { fontSize: 15, fontWeight: '600', lineHeight: 20 },
  tabLabel: { fontSize: 11, fontWeight: '500' },
  icon: { fontSize: 22, lineHeight: 28 },
  iconLarge: { fontSize: 40, lineHeight: 48 },
};

export default typography;
