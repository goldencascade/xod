import { PIN_TYPE } from 'xod-project';

// TODO: split into multiple files?

export const EDITOR_MODE = {
  SELECTING: 'selecting',
  MOVING_SELECTION: 'moving_selection',
  RESIZING_SELECTION: 'resizing_selection',
  LINKING: 'linking',
  PANNING: 'panning',

  get DEFAULT() {
    return this.SELECTING;
  },
};

export const WIDGET_TYPE = {
  BOOLEAN: PIN_TYPE.BOOLEAN,
  NUMBER: PIN_TYPE.NUMBER,
  STRING: PIN_TYPE.STRING,
  PULSE: PIN_TYPE.PULSE,
  IO_LABEL: 'IOLabel',
  TEXTAREA: 'textarea',
};

export const LAYER = {
  BACKGROUND: 'background',
  LINKS: 'links',
  NODES: 'nodes',
  COMMENTS: 'comments',
  NODE_PINS_OVERLAY: 'node_pins_overlay',
  GHOSTS: 'ghosts',
};

export const SELECTION_ENTITY_TYPE = {
  NODE: 'Node',
  COMMENT: 'Comment',
  LINK: 'Link',
};

export const NODETYPE_ERROR_TYPES = {
  CANT_DELETE_USED_PIN_OF_PATCHNODE: 'CANT_DELETE_USED_PIN_OF_PATCHNODE',
  CANT_DELETE_USED_PATCHNODE: 'CANT_DELETE_USED_PATCHNODE',
};

export const LINK_ERRORS = {
  SAME_DIRECTION: 'SAME_DIRECTION',
  SAME_NODE: 'SAME_NODE',
  ONE_LINK_FOR_INPUT_PIN: 'ONE_LINK_FOR_INPUT_PIN',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  INCOMPATIBLE_TYPES: 'INCOMPATIBLE_TYPES',
};

export const PROPERTY_ERRORS = {
  PIN_HAS_LINK: 'PIN_HAS_LINK',
};
