import { homedir } from 'os';
import { join } from 'path';

export default {
  links: {
    GH_DISCUSSIONS: 'https://github.com/orgs/Solar-Tweaks/discussions',
    GITHUB: 'https://github.com/Solar-Tweaks/',
    YOUTUBE: 'https://www.youtube.com/channel/UCXRhlF3x02Sc8hgWnCMXnTQ',
    LUNARCLIENT: 'https://lunarclient.com/',
    SERVER_STATUS_ENDPOINT: 'https://mcapi.us/server/status',
    LC_METADATA_ENDPOINT: 'https://api.lunarclientprod.com/launcher/launch',
    WEBSITE: 'https://solartweaks.com',
  },
  API_URL: 'https://server.solartweaks.com/api',
  ENGINE: {
    ENGINE: 'solar-engine.jar',
    CONFIG: 'config.json',
    CONFIG_EXAMPLE: 'config.example.json',
    METADATA: 'metadata.json',
    // EDIT (repo name & branch)
    CONFIG_EXAMPLE_URL:
      'https://raw.githubusercontent.com/Solar-Tweaks/Solar-Engine/main/config.example.json',
    // EDIT (repo name & branch)
    METADATA_URL:
      'https://raw.githubusercontent.com/Solar-Tweaks/Solar-Engine/main/metadata.json',
  },
  UPDATERS: {
    INDEX: '/updater/index',
    LAUNCHER: '/updater/?item=launcher&version={version}',
    // EDIT (item name)
    ENGINE: '/updater/?item=engine&version={version}',
  },
  ENDPOINTS: {
    LAUNCH: '/launch',
  },
  DOTLUNARCLIENT: join(homedir(), '.lunarclient'),
  SOLARTWEAKS_DIR: join(homedir(), '.lunarclient', 'solartweaks'),
  SENTRY:
    'https://33bba07610344830abca3221280a1499@o4504068582866944.ingest.sentry.io/4504068606328832',
};
