export const KEY = Symbol();

export const [N, S, W, E] = [1, 2, 4, 8];
export const HANDLERS = [N, S, W, E, N | W, N | E, S | W, S | E];
export const SURFACE = N | S | W | E;

export const enum COLORS {
  STICKER_BACKGROUND = '#ffd670',
  FLIPPED_CARD_FRONT_BACKGROUND = '#70d6ff',
  FLIPPED_CARD_BACK_BACKGROUND = '#ff70a6',
  FONT = '#000',
  SELECTION = '#3a86ff',
  GRID = '#d2d6db',
}
