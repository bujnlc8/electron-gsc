'use strict'

import {
  app,
  BrowserWindow,
  systemPreferences,
  Tray,
  Menu,
  dialog,
  nativeImage
} from 'electron'

if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

const path = require("path")
const fs = require("fs")
let config_url = path.join(__static, './localConfig.json')
const image = nativeImage.createFromPath(path.join(__static, './icon@3x.png'))

let mainWindow
const winURL = process.env.NODE_ENV === 'development' ?
  `http://localhost:9080` :
  `file://${__dirname}/index.html`


function createWindow() {
  mainWindow = new BrowserWindow({
    height: 660,
    useContentSize: true,
    width: 1100,
    maximizable: false,
    resizable: false,
    show: false,
    center: true,
    vibrancy: 'popover',
  })
  mainWindow.loadURL(winURL)
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })
  // 托盘
  const tray = new Tray(path.join(__static, './icon@3x.png'))
  tray.setToolTip('i古诗词')
  mainWindow.on('closed', () => {
    mainWindow = null
    tray.destroy()
  })
  tray.on("click", ()=>{
    if(mainWindow != null){
      mainWindow.show()
    }else{
      tray.destroy()
    }
  })
  tray.on("drop", ()=>{
    if(mainWindow != null){
      mainWindow.show()
    }else{
      tray.destroy()
    }
  })
  // 设置菜单
  set_menu()
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

// 只有在mac才有效
if (process.platform === 'darwin') {
  systemPreferences.subscribeNotification(
    'AppleInterfaceThemeChangedNotification',
    function theThemeHasChanged() {
      updateMyAppTheme(systemPreferences.isDarkMode())
    }
  )
}

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
    label: app.getName(),
    submenu: [{
      label: '关于',
      accelerator: 'ctrl+j',
      click: function () {
        let win = new BrowserWindow({
          width: 350,
          height: 250
        })
        win.loadURL(`file://${__static}/about.html`)
      }
    }, {
      role: 'hide'
    }, {
      role: 'hideothers'
    }, {
      role: 'unhide'
    }, {
      role: 'quit'
    }]
  },
  {
    label: '设置',
    submenu: [{
      label: '更改字体',
      accelerator: 'ctrl+f',
      submenu: [{
        label: '宋体',
        accelerator: 'ctrl+shift+s',
        click: function () {
          const content = JSON.stringify({
            "__font__": "songti"
          });
          fs.writeFileSync(config_url, content);
          show_dialog("songti")
        }
      },
      {
        label: '楷体',
        accelerator: 'ctrl+shift+k',
        click: function () {
          const content = JSON.stringify({
            "__font__": "kaiti"
          });
          fs.writeFileSync(config_url, content);
          show_dialog("kaiti")
        }
      },
      {
        label: '宋楷',
        accelerator: 'ctrl+shift+g',
        click: function () {
          const content = JSON.stringify({
            "__font__": "songkai"
          });
          fs.writeFileSync(config_url, content);
          show_dialog("songkai")
        }
      },
      {
        label: '黑体',
        accelerator: 'ctrl+shift+h',
        click: function () {
          const content = JSON.stringify({
            "__font__": "heiti"
          });
          fs.writeFileSync(config_url, content);
          show_dialog("heiti")
        }
      },
      {
        label: 'クレPro',
        accelerator: 'ctrl+shift+p',
        click: function () {
          const content = JSON.stringify({
            "__font__": "NotoSansCJK"
          });
          fs.writeFileSync(config_url, content);
          show_dialog("NotoSansCJK")
        }
      }
      ]
    },]
  }
  ]

  let m = Menu.buildFromTemplate(menus)
  Menu.setApplicationMenu(m)
}