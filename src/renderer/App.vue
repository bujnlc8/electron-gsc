<template>
  <div id="app" :style="myfont">
    <div class="titlebar" v-if="platform =='darwin'"></div>
    <div v-loading="body_loading" 
  element-loading-fullscreen="true" element-loading-background="rgba(0, 0, 0, 0.9)"
  element-loading-text="全力加载中..." style="height:592px;" 
  v-if="body_loading"></div>
    <router-view></router-view>
  </div>
</template>
<script>
import { setTimeout } from "timers";
const fs = require("fs");
const path = require("path");
const { ipcRenderer, remote } = require("electron");
const {app} = remote
const userDataPath = app.getPath("userData")
let config_url = path.join(userDataPath, "./USERCONFIG/config.json");
import Gsc from "./components/Gsc";
export default {
  name: "igsc",
  components: {Gsc},
  data() {
    return {
      myfont: { "font-family": "songkai" },
      dark_mode: 'light',
      platform: process.platform,
      body_loading: true,
    };
  },
  created() {
    let that = this;
    ipcRenderer.on("change-font", function(event, message) {
      that.myfont = { "font-family": message };
    });
  },
  mounted() {
    let that = this;
    ipcRenderer.on("change-style", (event, dark_mode, is_user) => {
      if (!fs.existsSync(config_url) || is_user){
          this.change_mode(dark_mode);
      }
    });
    window.onload = () => {
      if (fs.existsSync(config_url)) {
        try {
          let result = fs.readFileSync(config_url);
          result = JSON.parse(result);
          if(result.__dark_mode__){
              that.change_mode(result.__dark_mode__ );
          }
          if(result.__font__){
              that.myfont = { "font-family": result.__font__ };
          }
        } catch (error) {}
      }
      if (this.body_loading) {
        setTimeout(()=>{
            this.body_loading = false
        }, 2000)
      }
    };
  },
  methods: {
    change_mode(dark_mode){
      this.dark_mode = dark_mode
      document.body.className = dark_mode;
    }
  }
};
</script>

<style>
@font-face {
  font-family: "songkai";
  src: url("assets/songkai.ttf");
}

@font-face {
  font-family: "kaiti";
  src: url("assets/kaiti.ttf");
}

@font-face {
  font-family: "NotoSansCJK";
  src: url("assets/NotoSansCJK.ttf");
}
@font-face {
  font-family: "songti";
  src: url("assets/songti.otf");
}

@font-face {
  font-family: "heiti";
  src: url("assets/heiti.otf");
}
@font-face {
  font-family: "huajieti";
  src: url("assets/huajieti.otf");
}
@font-face {
  font-family: "youyuanti";
  src: url("assets/youyuanti.otf");
}

.el-button--primary,
.el-input__inner {
  font-family: "songti";
}

.aplayer-info{
  font-family: "songti";
  background-color:rgba(250, 250, 250, 0.1); 
  color: #93816d
}

.aplayer-info:hover{
  background-color:rgba(250, 250, 250, 0.8); 
}

.el-input__inner {
  border-radius: 20px !important;
  border: none !important;
}
.el-input__inner:focus {
  border: 1px solid #93816d !important;
}
.el-loading-mask {
  border-radius: 20px !important;
  background-color:rgba(255,255,255,0) !important;
}

.el-tabs__item.is-active {
  color: #93816d !important;
  font-weight: 700;
  font-size: 1.1em;
  opacity: 0.8;
}
.el-tabs__item:hover {
  color: #93816d !important;
}
/*tab激活样式*/
.el-tabs__active-bar {
  background-color: #93816d !important;
  height: 2.5px !important;
}
.el-input__prefix {
  color: #93816d !important;
}

.el-button--primary{
background-color: #93816d !important;
border-color: #93816d !important;
opacity: 0.7;
}
.el-loading-spinner .path{
 stroke: #93816d !important;
}

/*美化滚动条*/
::-webkit-scrollbar {
  width: 0px;
  height: 0px;
}
/*定义滚动条轨道 内阴影+圆角*/
::-webkit-scrollbar-track {
  -webkit-box-shadow: inset 0 0 2px rgba(0, 0, 0, 0.3);
  background: #f5fffa;
}
/*定义滑块 内阴影+圆角*/
::-webkit-scrollbar-thumb {
  border-radius: 3px;
  -webkit-box-shadow: inset 0 0 1.5px rgba(0, 0, 0, 0.3);
  background-color: rgba(158, 158, 158, 0.7);
}
::-webkit-scrollbar-thumb:hover {
  border-radius: 3px;
  -webkit-box-shadow: inset 0 0 1.5px rgba(0, 0, 0, 0.3);
  background-color: rgba(158, 158, 158, 1);
}

body {
  -webkit-app-region: no-drag;
}

.titlebar {
  z-index: 999;
  height: 40px;
  margin-top: -20px;
  -webkit-app-region: drag;
  -webkit-user-select: none;
}

.light-yellow {
  color: #625b57;
  padding: 0px 12px 20px 12px;
  background-repeat: repeat;
  background-size: cover;
  background-image: url("assets/light.jpeg");
}

.light {
  padding: 0px 12px 20px 12px;
  background-repeat: repeat;
  background-size: cover;
  background-image: url("assets/dark.png");
}

.dark {
  color:#b8d3ca;
  padding: 0px 12px 20px 12px;
  background-repeat: repeat;
  background-size: cover;
  background-image: url("assets/dark.png");
  background-color:#0047ab;
}
.el-tabs__nav-wrap::after{
  height: 1px !important;
  opacity: 0.8;
}
</style>