'use strict'

import {
  app,
  BrowserWindow,
  systemPreferences,
  Tray,
  Menu,
  dialog,
  nativeImage,
  ipcMain
} from 'electron'

if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

import {writeFile} from "../renderer/util"

const path = require("path")
const fs = require("fs")
const xfs = require("fs-extra")
const userDataPath = app.getPath("userData")
if (!fs.existsSync(path.join(userDataPath, "./USERCONFIG"))) {
  try {
    xfs.ensureDirSync(path.join(userDataPath, "./USERCONFIG"))
  } catch (e) {
    console.log(e)
  }
}

let config_url = path.join(userDataPath, './USERCONFIG/config.json')
const image = nativeImage.createFromPath(path.join(__static, './icon@3x.png'))

let clear_auto_search = false
let offline_search = false
let font_family = "songkai"
let dark_mode = "light"
let chinese = 'cn'

let mainWindow
const winURL = process.env.NODE_ENV === 'development' ?
  `http://localhost:9080` :
  `file://${__dirname}/index.html`


function createWindow() {
  mainWindow = new BrowserWindow({
    height: 668,
    useContentSize: true,
    width: 1100,
    maximizable: false,
    resizable: false,
    show: false,
    center: true,
    titleBarStyle: 'hidden'
  })
  mainWindow.loadURL(winURL)
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })
  // web内容加载完之后进行
  mainWindow.webContents.on('did-finish-load', () => {
    if (process.platform === "darwin") {
      let dark_mode = "light"
      if (systemPreferences.isDarkMode()) {
        dark_mode = "dark"
      }
      mainWindow.webContents.send('change-style', dark_mode, false)
    } else {
      mainWindow.webContents.send('change-style', "light", false)
    }
    // 发送是否清除后自动搜索
    mainWindow.webContents.send('clear_auto_search', clear_auto_search);
    // 发送是否使用离线搜索
    mainWindow.webContents.send('offline_search', offline_search);
  })
  // 托盘
  const tray = new Tray(path.join(__static, './icon.png'))
  tray.setToolTip('i古诗词')
  mainWindow.on('closed', () => {
    mainWindow = null
    tray.destroy()
  })
  tray.on("click", () => {
    if (mainWindow != null) {
      mainWindow.show()
    } else {
      tray.destroy()
    }
  })
  tray.on("drop", () => {
    if (mainWindow != null) {
      mainWindow.show()
    } else {
      tray.destroy()
    }
  });
  try {
    if (fs.existsSync(config_url)) {
      let result = fs.readFileSync(config_url)
      result = JSON.parse(result)
      console.log(result, 'gg')
      // 加载清除后是否自动搜索
      clear_auto_search = result.__clear_auto_search__ ? result.__clear_auto_search__ : clear_auto_search
      // 加载是否离线搜索
      offline_search = result.__offline_search__ ? result.__offline_search__ : offline_search
      // 加载字体
      font_family = result.__font__ ? result.__font__ : font_family
      // 加载显示模式
      dark_mode = result.__dark_mode__ ? result.__dark_mode__ : dark_mode
      // 加载简体
      chinese = result.__chinese__ ? result.__chinese__ : chinese
    }
  } catch (e) {
    console.log(e)
  }
  // 设置菜单
  set_menu()
}

// 右键按钮
ipcMain.on("copy_and_search", (event, arg, arg1) => {
  mainWindow.webContents.send('copy_and_search', arg, arg1);
})

// 截图
ipcMain.on("capture_content", (event, arg) => {
  mainWindow.webContents.send('capture_content', arg);
})

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

// 监听黑暗模式切换
if (process.platform === 'darwin') {
  systemPreferences.subscribeNotification(
    'AppleInterfaceThemeChangedNotification',
    function theThemeHasChanged() {
      let dark_mode = "light"
      if (systemPreferences.isDarkMode()) {
        dark_mode = "dark"
      }
      mainWindow.webContents.send('change-style', dark_mode, true);
    }
  )
}
const show_dialog = (font_name) => {
  // 发送更换字体给渲染进程
  try {
    mainWindow.webContents.send('change-font', font_name);
  } catch (e) {
    dialog.showMessageBox({
      type: "info",
      message: "可能需要重启应用才能生效哦～",
      icon: image
    });
  }
}

const set_menu = () => {
  let menus = [{
      label: "i古诗词",
      submenu: [{
          label: '关于',
          accelerator: 'ctrl+j',
          click: function () {
            let win = new BrowserWindow({
              width: 380,
              height: 300
            })
            win.loadURL(`file://${__static}/about.html`)
          }
        }, {
          role: 'cut'
        }, {
          role: 'copy'
        }, {
          role: 'paste'
        }, {
          role: 'hide'
        }, {
          role: 'hideothers'
        }, {
          role: 'unhide'
        }, {
          role: 'quit'
        }, {
          role: 'minimize'
        },
        {
          role: 'close'
        }
      ]
    },
    {
      label: '设置',
      submenu: [{
          label: '显示切换',
          accelerator: 'ctrl+m',
          submenu: [{
            label: "暗黑",
            type: "radio",
            checked: dark_mode == "dark",
            accelerator: 'ctrl+shift+b',
            click: function () {
              mainWindow.webContents.send('change-style', "dark", true);
              const content = {
                "__dark_mode__": "dark"
              }
              writeFile(config_url, content);
            }
          }, {
            label: "明亮",
            type: "radio",
            checked: dark_mode == "light",
            accelerator: 'ctrl+shift+l',
            click: function () {
              mainWindow.webContents.send('change-style', "light", true);
              const content = {
                "__dark_mode__": "light"
              }
              writeFile(config_url, content);
            }
          }, {
            label: "明黄",
            type: "radio",
            checked: dark_mode == "light-yellow",
            accelerator: 'ctrl+shift+y',
            click: function () {
              mainWindow.webContents.send('change-style', "light-yellow", true);
              const content = {
                "__dark_mode__": "light-yellow"
              }
              writeFile(config_url, content);
            }
          }]
        },
        {
          label: '简繁转换',
          accelerator: 'ctrl+i',
          submenu: [{
            label: "简体",
            type: "radio",
            checked: chinese == "cn",
            accelerator: 'ctrl+shift+c',
            click: function () {
              mainWindow.webContents.send('change-jianti', true);
              const content = {
                "__chinese__": "cn"
              }
              writeFile(config_url, content);
            }
          }, {
            label: "繁体",
            type: "radio",
            checked: chinese == "tw",
            accelerator: 'ctrl+shift+t',
            click: function () {
              mainWindow.webContents.send('change-fanti', false);
              const content = {
                "__chinese__": "tw"
              }
              writeFile(config_url, content);
            }
          }]
        },
        {
          label: '更改字体',
          accelerator: 'ctrl+f',
          submenu: [{
              label: '宋体',
              type: 'radio',
              checked: font_family == "songti",
              accelerator: 'ctrl+shift+s',
              click: function () {
                const content = {
                  "__font__": "songti"
                }
                writeFile(config_url, content);
                show_dialog("songti")
              }
            },
            {
              label: '楷体',
              type: 'radio',
              checked: font_family == "kaiti",
              accelerator: 'ctrl+shift+k',
              click: function () {
                const content = {
                  "__font__": "kaiti"
                }
                writeFile(config_url, content);
                show_dialog("kaiti")
              }
            },
            {
              label: '宋楷',
              type: 'radio',
              checked: font_family == "songkai",
              accelerator: 'ctrl+shift+g',
              click: function () {
                const content = {
                  "__font__": "songkai"
                }
                writeFile(config_url, content);
                show_dialog("songkai")
              }
            },
            {
              label: '黑体',
              type: 'radio',
              checked: font_family == "heiti",
              accelerator: 'ctrl+shift+h',
              click: function () {
                const content = {
                  "__font__": "heiti"
                }
                writeFile(config_url, content);
                show_dialog("heiti")
              }
            },
            {
              label: 'クレPro',
              type: 'radio',
              checked: font_family == "NotoSansCJK",
              accelerator: 'ctrl+shift+p',
              click: function () {
                const content = {
                  "__font__": "NotoSansCJK"
                }
                writeFile(config_url, content);
                show_dialog("NotoSansCJK")
              }
            },
            {
              label: '花节体',
              type: 'radio',
              checked: font_family == "huajieti",
              accelerator: 'ctrl+shift+j',
              click: function () {
                const content = {
                  "__font__": "huajieti"
                }
                writeFile(config_url, content);
                show_dialog("huajieti")
              }
            },
            {
              label: '游园体',
              type: 'radio',
              checked: font_family == "huajieti",
              accelerator: 'ctrl+shift+m',
              click: function () {
                const content = {
                  "__font__": "youyuanti"
                }
                writeFile(config_url, content);
                show_dialog("youyuanti")
              }
            }
          ]
        },
        {
          label: '离线搜索',
          type: "checkbox",
          checked: offline_search,
          click: (menu_item) => {
            const content = {
              "__offline_search__": menu_item.checked
            }
            mainWindow.webContents.send('offline_search', menu_item.checked);
            writeFile(config_url, content);
          }
        },
        {
          label: '清除时自动搜索',
          type: "checkbox",
          checked: clear_auto_search,
          click: (menu_item) => {
            const content = {
              "__clear_auto_search__": menu_item.checked
            };
            mainWindow.webContents.send('clear_auto_search', menu_item.checked);
            writeFile(config_url, content);
          }
        },
      ]
    }
  ]
  let m = Menu.buildFromTemplate(menus)
  Menu.setApplicationMenu(m)
}