'use strict';

import { app, BrowserWindow, protocol } from 'electron';
import { createServer } from 'net';
import { Server } from 'procbridge';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';

// import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer';
const isDevelopment = !app.isPackaged;

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } },
]);

async function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 1300,
    height: 800,
    frame: false,
    maximizable: false,
    fullscreenable: false,
    resizable: isDevelopment,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      // This is a way to bypass CORS but this is not secure at all
      webSecurity: false,
    },
  });

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    // if (isDevelopment) win.webContents.openDevTools();
  } else {
    createProtocol('app');
    // Load the index.html when not in development
    win.loadURL('app://./index.html');
  }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
  else BrowserWindow.getAllWindows().forEach((win) => win.show());
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment) {
    // Install Vue Devtools
    // try {
    // await installExtension(VUEJS3_DEVTOOLS);
    // } catch (e) {
    //   console.error('Vue Devtools failed to install:', e.toString());
    // }
  }
  createWindow();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit();
      }
    });
  } else {
    process.on('SIGTERM', () => {
      app.quit();
    });
  }
}

const IPCServer = new Server('127.0.0.1', 28189, async (method, data) => {
  switch (method) {
    case 'open-window':
      console.log('Opening Login Window');
      return new Promise(async (res) => {
        const window = new BrowserWindow({
          width: data.width,
          height: data.height,
          autoHideMenuBar: true,
          show: false,
          resizable: false,
          title: 'Loading...',
          fullscreenable: false,
        });
        let finalURL = null;
        window.webContents.addListener('will-redirect', (event, url) => {
          if (url.startsWith(data.targetUrlPrefix)) {
            finalURL = url;
            window.close();
          }
        });
        window.on('close', () => {
          window.removeAllListeners();
          res(
            finalURL === null
              ? { status: 'CLOSED_WITH_NO_URL' }
              : { status: 'MATCHED_TARGET_URL', url: finalURL }
          );
        });
        window.webContents.session.clearCache();
        window.webContents.session.clearStorageData();
        window.loadURL(data.url);
        window.on('show', () => {
          window.setAlwaysOnTop(true);
          window.setAlwaysOnTop(false);
        });
        window.once('ready-to-show', () => {
          console.log('Showing Login Window');
          window.show();
        });
      });
    default:
      console.error('Unknown IPC Method:', method);
      break;
  }
});

function isPortAvailable(port) {
  return new Promise((res) => {
    const server = createServer()
      .addListener('error', () => res(false))
      .addListener('listening', () => {
        server.addListener('close', () => res(true));
        server.close();
      })
      .listen(port, '127.0.0.1');
  });
}
async function startIPCServer() {
  const available = await isPortAvailable(28189);
  if (available) {
    console.log('Starting IPC Server');
    IPCServer.start();
    console.log('Started IPC Server');
  } else {
    console.warn(
      'Failed to start IPC Server: Port not avilable. Will try again in 30 seconds.'
    );
    setTimeout(() => startIPCServer(), 3e4);
  }
}

startIPCServer();
