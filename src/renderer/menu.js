const {
    Menu, BrowserWindow ,dialog, nativeImage, app} = require('electron')

const fs = require("fs")
const path = require("path")
let config_url = path.join(__static, './localConfig.json')
const image = nativeImage.createFromPath(path.join(__static, './icon@3x.png'))

const show_dialog = ()=>{
    dialog.showMessageBox({
        type: "info",
        message: "字体更换完需要重启应用才能生效哦～",
        icon: image,
    });
}

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
                show_dialog()
            }
        },
        {
            label: '楷体',
            accelerator: 'ctrl+shift+k',
            click: function () {
                const content = JSON.stringify({ "__font__": "kaiti" });
                fs.writeFileSync(config_url, content);
                show_dialog()
            }
        },
        {
            label: '宋楷',
            accelerator: 'ctrl+shift+g',
            click: function () {
                const content = JSON.stringify({ "__font__": "songkai" });
                fs.writeFileSync(config_url, content);
                app.relaunch()
                show_dialog()
            }
        },
        {
            label: 'クレPro',
            accelerator: 'ctrl+shift+p',
            click: function () {
                const content = JSON.stringify({ "__font__": "NotoSansCJK" });
                fs.writeFileSync(config_url, content);
                show_dialog()
            }
        }]
     },
    ]
}
]

let m = Menu.buildFromTemplate(menus)
Menu.setApplicationMenu(m)