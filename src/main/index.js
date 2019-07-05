'use strict'

import {
  app,
  BrowserWindow,
  systemPreferences,
  Tray,
  Menu,
  dialog,
  nativeImage,
  ipcMain,
} from 'electron'

if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

import {
  writeFile
} from "../renderer/util"
const log = require('electron-log')
const path = require("path")
const fs = require("fs")
const xfs = require("fs-extra")
const userDataPath = app.getPath("userData")
if (!fs.existsSync(path.join(userDataPath, "./USERCONFIG"))) {
  try {
    xfs.ensureDirSync(path.join(userDataPath, "./USERCONFIG"))
  } catch (e) {
    log.err(e)
  }
}

let config_url = path.join(userDataPath, './USERCONFIG/config.json')
const image = nativeImage.createFromPath(path.join(__static, './icon@3x.png'))

let clear_auto_search = false
let offline_search = true
let font_family = "songkai"
let dark_mode = "light"
let chinese = 'cn'
let tray = null
let detailWindow = null
let position = {}
let one_click_mode = "random"
let current_gsc_id = 0
let interval_id = 0
let auto_play_lyric = true
let got_gsc = null

let mainWindow
const winURL = process.env.NODE_ENV === 'development' ?
  `http://localhost:9080` :
  `file://${__dirname}/index.html`

const detailURL = process.env.NODE_ENV === 'development' ?
  `http://localhost:9090/detail.html` :
  `file://${__dirname}/detail.html`

function createWindow() {
  mainWindow = new BrowserWindow({
    height: 668,
    width: 1100,
    maximizable: false,
    resizable: false,
    show: false,
    center: true,
    titleBarStyle: 'hidden'
  })
  mainWindow.loadURL(winURL)
  // mainWindow.once('ready-to-show', () => {})
  // web内容加载完之后进行
  mainWindow.webContents.on('did-finish-load', () => {
    // 显示主界面
    mainWindow.show()
    let userSetDarkMode = false
    try {
      if (fs.existsSync(config_url)) {
        let result = fs.readFileSync(config_url)
        result = JSON.parse(result)
        // 加载清除后是否自动搜索
        clear_auto_search = result.__clear_auto_search__ !== undefined ? result.__clear_auto_search__ : clear_auto_search
        // 加载是否离线搜索
        offline_search = result.__offline_search__ !== undefined ? result.__offline_search__ : offline_search
        // 加载字体
        font_family = result.__font__ !== undefined ? result.__font__ : font_family
        // 加载显示模式
        dark_mode = result.__dark_mode__ !== undefined ? result.__dark_mode__ : dark_mode
        // 加载简体
        chinese = result.__chinese__ !== undefined ? result.__chinese__ : chinese
        // 加载单机切换模式
        one_click_mode = result.__one_click_mode__ !== undefined ? result.__one_click_mode__ : one_click_mode
        // 通知栏自动播放内容
        auto_play_lyric = result.__auto_play_lyric__ !== undefined ? result.__auto_play_lyric__ : auto_play_lyric
        if (result.__dark_mode__ !== undefined) {
          userSetDarkMode = true
        }
      }
    } catch (e) {
      log.error(e)
    }
    if (process.platform === "darwin" && !userSetDarkMode) {
      if (systemPreferences.isDarkMode()) {
        dark_mode = "dark"
      } else {
        dark_mode = "light"
      }
    }
    // 发送显示模式
    mainWindow.webContents.send('change-style', dark_mode, true);
    // 发送字体显示
    mainWindow.webContents.send('change-font', font_family);
    // 发送是否清除后自动搜索
    mainWindow.webContents.send('clear_auto_search', clear_auto_search);
    // 发送是否使用离线搜索
    mainWindow.webContents.send('offline_search', offline_search);
    // 发送简繁体
    if (chinese == 'tw') {
      mainWindow.webContents.send('change-fanti', true);
    }
    // 发送自动播放内容
    mainWindow.webContents.send("auto_play_lyric", auto_play_lyric)
    // 设置菜单
    set_menu()
  })
  // 托盘
  try {
    tray = new Tray(path.join(__static, './icon.png'))
    tray.setToolTip('i古诗词')
    mainWindow.on('closed', () => {
      mainWindow = null
      clear_interval(interval_id)
      tray.destroy()
      if (detailWindow) {
        detailWindow.destroy()
      }
    })
    tray.on("right-click", () => {
      if (mainWindow != null) {
        // 根据模式切换诗词
        if (one_click_mode == "like") {
          mainWindow.webContents.send('query_like_gsc');
        } else {
          mainWindow.webContents.send('query_random_gsc');
        }
      } else {
        tray.destroy()
        tray = null
      }
    })

    // 屏蔽双击事件
    tray.on("double-click", () => false)

    tray.on("click", () => {
      if (current_gsc_id != 0) {
        // mainWindow.send("go_detail", current_gsc_id)
        if (detailWindow && detailWindow.isVisible()) {
          detailWindow.hide()
        } else {
          send_show_gsc(current_gsc_id, 0, null)
        }
      }
    })
    tray.on("drop", () => {
      if (mainWindow != null) {
        mainWindow.show()
      } else {
        tray.destroy()
      }
    });
  } catch (e) {
    log.error(e)
  }

  tray.on("mouse-enter", () => {
    if (current_gsc_id != 0 && auto_play_lyric) {
      if (detailWindow && !detailWindow.isVisible()) {
        send_show_gsc(current_gsc_id, 0, null)
      }
    }
  })
  tray.on("mouse-leave", () => {
    if (current_gsc_id != 0 && auto_play_lyric)
      if (detailWindow && detailWindow.isVisible()) {
        detailWindow.hide()
      }
  })
  // 设置数据库
  createDB()
  // 创建小窗口
  createDetail()
}

// 右键按钮
ipcMain.on("copy_and_search", (event, arg, arg1) => {
  mainWindow.webContents.send('copy_and_search', arg, arg1);
})

// 截图
ipcMain.on("capture_content", (event, arg) => {
  mainWindow.webContents.send('capture_content', arg);
})

// 托盘当前古诗词
ipcMain.on("currentht_gsc_a", (event, gsc) => {
  if (tray) {
    current_gsc_id = gsc.id
    got_gsc = gsc
    play_gsc(gsc)
  }
})

// 获取到古诗词
ipcMain.on("received_gsc", (event, gsc_id, len, gsc) => {
  if (gsc_id == 0 && mainWindow != null) {
    mainWindow.show()
  } else if (detailWindow) {
    send_show_gsc(gsc_id, len, gsc)
    got_gsc = gsc
  }
})

// 发送显示主界面详情消息
ipcMain.on("go_detail", (event, gsc_id) => {
  mainWindow.send("go_detail", gsc_id)
})

// 打开主界面
ipcMain.on("open_main_window", (e, arg) => {
  if (mainWindow) {
    mainWindow.show()
  }
})

// 关闭小窗口
ipcMain.on("close_detail_window", (e, arg) => {
  if (detailWindow) {
    detailWindow.hide()
  }
})

// 监听菜单自动播放内容
ipcMain.on("auto_play_lyric", (e, arg) => {
  if (arg && interval_id == 0) {
    play_gsc(got_gsc)
  }
  if (!arg) {
    clear_interval(interval_id)
  }
})

const clear_interval = (id) => {
  if (id != 0) {
    clearInterval(id)
  }
  interval_id = 0
  if (tray) {
    tray.setTitle("")
  }
}

const getDetailPosition = () => {
  const trayBounds = tray.getBounds()
  const x = Math.round(trayBounds.x + (trayBounds.width / 2) - 150)
  const y = Math.round(trayBounds.y + trayBounds.height + 4)
  return {
    x: x,
    y: y
  }
}

const createDetail = () => {
  detailWindow = new BrowserWindow({
    width: 320,
    height: 420,
    show: false,
    frame: false,
    fullscreenable: false,
    resizable: false,
    webPreferences: {
      backgroundThrottling: false,
      scrollBounce: true,
    }
  })
  detailWindow.loadURL(detailURL)
}

const play_gsc = (gsc) => {
  if (!auto_play_lyric) {
    if (interval_id != 0) {
      clear_interval(interval_id)
    }
    return false
  }
  try {
    if (tray && gsc) {
      tray.setToolTip(gsc.work_title + "·" + gsc.work_author)
      let title_author = gsc.work_title + "　" + '【{0}】'.format(gsc.work_dynasty) + "　" + gsc.work_author
      let contents = gsc.content.replace(/<\/br>|&emsp;/g, "")
      let start = 0
      let end = contents.length
      if (interval_id != 0) {
        try {
          clear_interval(interval_id)
        } catch (e) {
          log.error(e)
        }
      }
      // 循环展示, 每次移动2个字，展示20个字
      let play_width = 20
      let content = ""
      let from_head = true
      let gap = play_width - title_author.length
      if (gap > 1)
        title_author = "　".repeat(parseInt(gap / 2)) + title_author + "　".repeat(parseInt(gap / 2))
      interval_id = setInterval(()=> {
        if (start + play_width > end + 1 && contents.length >= play_width) {
          start = 0
          from_head = true
        }
        if (from_head) {
          tray.setTitle('\u001b[34m ' + title_author + "\u001b[0m")
          from_head = false
        } else {
          content = contents.substr(start, play_width)
          if (content.length < play_width) {
            content += "　".repeat(play_width - content.length)
            start = 0
            from_head = true
          } else {
            from_head = false
            start +=2
          }
          //tray.setTitle(c.bgWhite.blue(content))
          tray.setTitle('\u001b[30;1m ' + content + '\u001b[0m')
        }
      }, 1000)
    }
  } catch (e) {
    log.error(e)
  }
}

// 显示小窗
const send_show_gsc = (gsc_id, len, gsc) => {
  detailWindow.webContents.send('to_get_gsc_detail', gsc_id, font_family, gsc)
  position = getDetailPosition()
  detailWindow.setPosition(position.x, position.y, true)
  if (len > 0) {
    let calc_height = (len / 160) * 420 + 80
    detailWindow.setSize(320, Math.min(parseInt(calc_height), 420), true)
  }
  detailWindow.show()
  detailWindow.focus()
  current_gsc_id = gsc_id
  if (tray) {
    play_gsc(gsc)
  }
}

app.on('ready', createWindow)

app.on("quit", () => {
  if (interval_id != 0) {
    log.error("clear interval", interval_id)
    clear_interval(interval_id)
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
  if (interval_id != 0) {
    log.error("clear interval", interval_id)
    clear_interval(interval_id)
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
          accelerator: 'ctrl+g',
          click: function () {
            let win = new BrowserWindow({
              width: 380,
              height: 300,
              titleBarStyle: 'hidden'
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
            label: "祥云",
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
                font_family = "songti"
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
                font_family = "kaiti"
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
                font_family = "songkai"
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
                font_family = "heiti"
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
                font_family = "NotoSansCJK"
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
                font_family = "huajieti"
              }
            },
            {
              label: '游园体',
              type: 'radio',
              checked: font_family == "youyuanti",
              accelerator: 'ctrl+shift+m',
              click: function () {
                const content = {
                  "__font__": "youyuanti"
                }
                writeFile(config_url, content);
                show_dialog("youyuanti")
                font_family = "youyuanti"
              }
            }
          ]
        },
        {
          label: '右键切换模式',
          submenu: [{
              label: "喜欢",
              type: 'radio',
              checked: one_click_mode == "like",
              click: () => {
                const content = {
                  "__one_click_mode__": "like"
                }
                one_click_mode = "like"
                writeFile(config_url, content);
              }
            },
            {
              label: "随机",
              type: 'radio',
              checked: one_click_mode == "random",
              click: () => {
                const content = {
                  "__one_click_mode__": "random"
                }
                one_click_mode = "random"
                writeFile(config_url, content);
              }
            },
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
          label: '通知栏播放',
          type: "checkbox",
          checked: auto_play_lyric,
          click: (menu_item) => {
            const content = {
              "__auto_play_lyric__": menu_item.checked
            }
            writeFile(config_url, content);
            auto_play_lyric = menu_item.checked
            if (!auto_play_lyric && interval_id != 0) {
              clear_interval(interval_id)
            }
            mainWindow.webContents.send('auto_play_lyric', menu_item.checked);
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
            clear_auto_search = menu_item.checked
          }
        },
      ]
    }
  ]
  let m = Menu.buildFromTemplate(menus)
  Menu.setApplicationMenu(m)
}

const createDB = () => {
  let sqlite3 = require("sqlite3").verbose();
  let dbFilePath = path.join(app.getAppPath(), '../gsc.db');
  if (process.env.NODE_ENV !== "production") {
    log.error(__dirname, __static)
    dbFilePath = path.join(__static, "../gsc.db")
  }
  global.__db__ = new sqlite3.Database(dbFilePath, (e) => {
    if (e) {
      log.error(e)
    }
  })
}