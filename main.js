const { app, BrowserWindow } = require('electron');
const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

let mainWindow;
let serverProcess;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    // Wait for server to start
    waitForServer(() => {
        mainWindow.loadURL('http://localhost:3000');
        mainWindow.webContents.openDevTools(); // For debugging
    });
}

function startServer() {
    serverProcess = spawn('npm', ['start'], {
        shell: true,
        stdio: 'inherit'
    });

    serverProcess.on('error', (error) => {
        console.error('Failed to start server:', error);
    });
}

function waitForServer(callback) {
    const checkServer = () => {
        http.get('http://localhost:3000', (res) => {
            if (res.statusCode === 200) {
                callback();
            }
        }).on('error', () => {
            setTimeout(checkServer, 1000);
        });
    };
    checkServer();
}

app.whenReady().then(() => {
    startServer();
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        if (serverProcess) {
            serverProcess.kill();
        }
        app.quit();
    }
});