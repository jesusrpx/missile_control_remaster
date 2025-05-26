// const { app, BrowserWindow } = require('electron')
import { app, BrowserWindow } from 'electron'

// Creacion de la ventana principal
function createWindow() {
    const win = new BrowserWindow({
        width: 440,
        height: 440,
        backgroundColor: '#38491e',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
        title: "Missile Control",
        frame: true,
        titleBarStyle: 'default',
    })

    // Carga el contenido de la pagina
    win.loadFile('public/app.html')
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})