import * as migration_20260903_162235_init from './20260903_162235_init';
import * as migration_20261008_022109_carpetas_media from './20261008_022109_carpetas_media';

export const migrations = [
  {
    up: migration_20260903_162235_init.up,
    down: migration_20260903_162235_init.down,
    name: '20260903_162235_init',
  },
  {
    up: migration_20261008_022109_carpetas_media.up,
    down: migration_20261008_022109_carpetas_media.down,
    name: '20261008_022109_carpetas_media'
  },
];
