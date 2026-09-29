const { app, BrowserWindow, session, dialog } = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const startUrl = pathToFileURL(path.join(__dirname, '../dist/index.html')).href;
const trusted = (url) => url === startUrl || url.startsWith(startUrl + '#');
if (process.env.AURYNOTE_TEST_MODE === '1') app.setPath('userData', path.join(__dirname, '../artifacts/electron-profile'));
function createWindow() {
  const window = new BrowserWindow({ width: 1320, height: 900, minWidth: 880, minHeight: 680, backgroundColor: '#f8f8f5', title: 'aurynote', show: process.env.AURYNOTE_TEST_MODE !== '1', autoHideMenuBar: true, webPreferences: { nodeIntegration: false, contextIsolation: true, sandbox: true } });
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  window.webContents.on('will-navigate', (event, url) => { if (!trusted(url)) event.preventDefault(); });
  window.loadFile(path.join(__dirname, '../dist/index.html'));
}
app.whenReady().then(() => {
  session.defaultSession.setPermissionCheckHandler((contents, permission) => permission === 'media' && !!contents && trusted(contents.getURL()));
  session.defaultSession.setPermissionRequestHandler(async (contents, permission, callback, details) => {
    if (!trusted(contents.getURL()) || permission !== 'media' || details.mediaTypes?.includes('video')) return callback(false);
    const result = await dialog.showMessageBox({ type: 'question', title: 'Use your microphone?', message: 'Let aurynote hear the note you play?', detail: 'Audio stays on this device. Nothing is recorded or uploaded.', buttons: ['Allow microphone', 'Cancel'], cancelId: 1, defaultId: 1 });
    callback(result.response === 0);
  });
  createWindow();
  app.on('activate', () => { if (!BrowserWindow.getAllWindows().length) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
