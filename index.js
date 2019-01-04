const {
  app,
  BrowserWindow,
  globalShortcut,
  Tray,
  clipboard,
  ipcMain
} = require('electron')

const Store = require('electron-store');
const store = new Store();
// store.clear();

const INTERVAL = 1000;

String.prototype.hashCode = function () {
  var hash = 0,
    i, chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr = this.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

let lastSize = store.size;

function createWindow() {


  win = new BrowserWindow({
    width: 800,
    height: 600,
    transparent: true,
    frame: false,
    show: false
  })
  win.loadFile('index.html')

  ipcMain.on('message', (event, arg) => {
    clipboard.writeText(arg);
    win.hide();
  })

  tray = new Tray('./content-cut.png')
  tray.setToolTip('Multi Clipboard.')
  setInterval(() => {
    const text = clipboard.readText();
    const hash = text.hashCode();
    const hashString = hash.toString();
    if (!store.has(hashString)) {

      const data = {
        time: Date.now(),
        snippet: text
      }

      store.set(hashString, data);
      win.webContents.send('store-data', store.store);
    }
    if (store.size !== lastSize) {
      lastSize = store.size;
    }

  }, INTERVAL);


  globalShortcut.register('CommandOrControl+Shift+V', () => {
    win.show()
    win.webContents.send('store-data', store.store);
  })

  globalShortcut.register('Escape', () => {
    win.hide()
  })

}

app.on('ready', createWindow)