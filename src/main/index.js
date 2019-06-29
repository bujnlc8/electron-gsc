'use strict'

import { app, BrowserWindow, systemPreferences, Tray, Menu, dialog, nativeImage } from 'electron'
const path = require("path")
const fs = require("fs")
let config_url = path.join(__static, './localConfig.json')
const image = nativeImage.createFromPath(path.join(__static, './icon@3x.png'))

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow() {
  /**
   * Initial window options
   */
  const appIcon = new Tray(path.join(__static, './icon@3x.png'))
  mainWindow = new BrowserWindow({
    height: 660,
    useContentSize: true,
    width: 1100,
    maximizable: false,
    resizable: false,
    icon: appIcon
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
  // 菜单
  // require('../renderer/menu.js')
  set_menu()
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  // if (process.platform !== 'darwin') {
  //   app.quit()
  // }
  app.quit()
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

systemPreferences.subscribeNotification(
  'AppleInterfaceThemeChangedNotification',
  function theThemeHasChanged() {
    updateMyAppTheme(systemPreferences.isDarkMode())
  }
)

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */

const show_dialog = (font_name) => {
  dialog.showMessageBox({
    type: "info",
    message: "字体更换完可能需要重启应用才能生效哦～",
    icon: image,
  });
  // 发送更换字体给渲染进程
  mainWindow.webContents.send('change-font', font_name);
}

const set_menu = () => {
  let menus = [{
    label: '关于',
    submenu: [{
      label: 'i古诗词',
      accelerator: 'ctrl+j',
      click: function () {
        let win = new BrowserWindow({
          width: 300,
          height: 200
        })
        win.loadURL(`file://${__static}/about.html`)
      }
    },
    {
      label: '更改字体',
      accelerator: 'ctrl+f',
      submenu: [
        {
          label: '宋体',
          accelerator: 'ctrl+shift+s',
          click: function () {
            const content = JSON.stringify({ "__font__": "songti" });
            fs.writeFileSync(config_url, content);
            show_dialog("songti")
          }
        },
        {
          label: '楷体',
          accelerator: 'ctrl+shift+k',
          click: function () {
            const content = JSON.stringify({ "__font__": "kaiti" });
            fs.writeFileSync(config_url, content);
            show_dialog("kaiti")
          }
        },
        {
          label: '宋楷',
          accelerator: 'ctrl+shift+g',
          click: function () {
            const content = JSON.stringify({ "__font__": "songkai" });
            fs.writeFileSync(config_url, content);
            show_dialog("songkai")
          }
        },
        {
          label: '黑体',
          accelerator: 'ctrl+shift+h',
          click: function () {
            const content = JSON.stringify({ "__font__": "heiti" });
            fs.writeFileSync(config_url, content);
            show_dialog("heiti")
          }
        },
        {
          label: 'クレPro',
          accelerator: 'ctrl+shift+p',
          click: function () {
            const content = JSON.stringify({ "__font__": "NotoSansCJK" });
            fs.writeFileSync(config_url, content);
            show_dialog("NotoSansCJK")
          }
        }]
    },
    ]
  }
  ]

  let m = Menu.buildFromTemplate(menus)
  Menu.setApplicationMenu(m)
}