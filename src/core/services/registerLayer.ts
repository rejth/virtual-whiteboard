import { getContext } from 'svelte';

import { type LayerManager } from './LayerManager.svelte';
import type { LayerProps } from './types';

export const REGISTER_LAYER_KEY = Symbol('register');

export const registerLayer = (layer: LayerProps) => {
  const register = getContext<LayerManager['registerLayer']>(REGISTER_LAYER_KEY);
  return register(layer);
};
