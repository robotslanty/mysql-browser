const { app, BrowserWindow, ipcMain } = require('electron');
const db = require('mariadb');

let win;

function createWindow() {
    win = new BrowserWindow({
        width: 800, height: 600,
    });
    win.loadFile('ui/index.html');
    // win.webContents.openDevTools();

    win.on('closed', () => {
        win = null;
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (win === null) {
        createWindow();
    }
});

db.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'test'
}).then(connection => {
    ipcMain.on('sendSql', (event, arg) => {
        console.log(arg);

        connection.query(arg).then(results => {
            return win.webContents.send('sqlResult', {
                'fields': Object.keys(results[0]),
                'rows': results,
            });
        }).catch(err => {
            return win.webContents.send('sqlError', error)
        });
    });
}).catch(err => {
    console.log(err);
});