export const KEY = Symbol();

export const [N, S, W, E] = [1, 2, 4, 8];
export const HANDLERS = [N, S, W, E, N | W, N | E, S | W, S | E];
export const SURFACE = N | S | W | E;
