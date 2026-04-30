const { app, BrowserWindow, Notification, ipcMain } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;
let awayTimer;
let AWAY_DURATION = 10 * 1000; // Default 10 seconds in milliseconds

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../build/index.html'));
  }

  mainWindow.on('blur', () => {
    // Start timer when window loses focus
    awayTimer = setTimeout(() => {
      const notification = new Notification({
        title: 'Reminder',
        body: 'Your time is over now lets get back to work',
        icon: path.join(__dirname, '../public/favicon.ico'), // Optional icon
      });
      notification.show();
    }, AWAY_DURATION);
  });

  mainWindow.on('focus', () => {
    // Clear timer when window gains focus
    if (awayTimer) {
      clearTimeout(awayTimer);
      awayTimer = null;
    }
  });
}

app.whenReady().then(createWindow);

ipcMain.handle('set-duration', (event, seconds) => {
  AWAY_DURATION = seconds * 1000;
  return AWAY_DURATION;
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});