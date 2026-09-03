import * as migration_20260903_162235_init from './20260903_162235_init';

export const migrations = [
  {
    up: migration_20260903_162235_init.up,
    down: migration_20260903_162235_init.down,
    name: '20260903_162235_init'
  },
];
