const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

const isDev = !app.isPackaged; // Or verify via env vars

function createWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            nodeIntegration: false, // Security best practice
            contextIsolation: true, // Security best practice
            preload: path.join(__dirname, 'preload.js')
        }
    });

    if (isDev) {
        win.loadURL('http://localhost:5173');
        win.webContents.openDevTools(); // Open DevTools in dev mode
    } else {
        // In production, load the built index.html
        // Assuming dist is at ../dist relative to electron/main.js
        win.loadFile(path.join(__dirname, '../dist/index.html'));
    }
}

app.whenReady().then(() => {
    ipcMain.handle('select-dir', async () => {
        const { dialog } = require('electron');
        const result = await dialog.showOpenDialog({
            properties: ['openDirectory']
        });
        return result.filePaths[0];
    });

    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
