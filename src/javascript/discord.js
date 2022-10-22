import { Client } from 'discord-rpc';
import { remote } from 'electron';
import Logger from './logger';
const logger = new Logger('discord');

const clientId = '920998351430901790';

export const client = new Client({ transport: 'ipc' });

client.on('ready', async () => {
  logger.info('Discord RPC ready');
});

client.isConnected = false;

/**
 * Establish connection to Discord RPC
 */
export function login() {
  client
    .login({ clientId })
    .then(async (client) => {
      if (client) {
        logger.info(`Authed for user ${client.user.username}`);
        client.isConnected = true;
        await updateActivity('In the launcher');
      } else logger.error('Failed to login to Discord RPC');
    })
    .catch((error) => {
      logger.error(error);
    });
}

export async function disableRPC() {
  if (!client.isConnected) return;
  return await client.destroy();
}

/**
 * Update the current Discord activity
 * @param {string} details The details of the activity
 * @param {string} [state=undefined] The state of the activity
 * @param {Date|number} [timestamp=null] The start timestamp of the activity
 * @param {'elasped'|'remaining'} [mode=null] Display style for the timestamp
 */
export async function updateActivity(
  details,
  state = undefined,
  timestamp = null,
  mode = null
) {
  if (!client.isConnected) return;
  logger.info('Updating Discord Activity');
  const activity = {
    details,
    state,
    largeImageKey: 'logo',
    largeImageText: `Solar Tweaks ${remote.app.getVersion()}`,
    buttons: [
      {
        label: '⬇️⠀Download Solar Tweaks',
        url: 'https://github.com/Solar-Tweaks/Solar-Tweaks',
      },
    ],
  };

  if (Math.random() > 0.98)
    activity.buttons.push({
      label: '🧐⠀Super secret button',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    });

  if (timestamp && mode) {
    if (mode === 'remaining') {
      activity.startTimestamp = new Date();
      activity.endTimestamp = timestamp;
    } else {
      activity.startTimestamp = timestamp;
    }
  }

  client.setActivity(activity).catch((error) => {
    logger.error(error);
  });
}
