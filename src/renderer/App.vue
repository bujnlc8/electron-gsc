<template>
  <div id="app" :style="myfont">
    <router-view></router-view>
  </div>
</template>

<script>
import { setTimeout } from 'timers';
const fs = require("fs");
const path = require("path");
const {ipcRenderer} = require("electron")
export default {
  name: "igsc",
  data() {
    return {
      myfont: { "font-family": "NotoSansCJK" },
      dark_actived: false
    };
  },
  created() {
    let that = this
    ipcRenderer.on("change-font", function(event, message) {
        that.myfont = { "font-family": message};
    });
    let config_url = path.join(__static, "./localConfig.json");
    if (fs.existsSync(config_url)) {
      try {
        let result = fs.readFileSync(config_url);
        result = JSON.parse(result);
        this.myfont = { "font-family": result.__font__ };
      } catch (error) {
        this.myfont = { "font-family": "songkai" };
      }
    }
  },
  mounted(){
    let body = document.body
    ipcRenderer.on("change-style", function(event, is_dark) {
        if(is_dark){
          body.className = "dark"
          document.getElementsByClassName("el-input__inner")[0].style.backgroundColor = '#bfbfbf'
          setTimeout(()=>{
              document.getElementsByClassName("aplayer-info")[0].style.backgroundColor = '#bfbfbf'
          },1000)
        }else{
          body.className = "light"
          document.getElementsByClassName("el-input__inner")[0].style.backgroundColor = '#fff'
          setTimeout(()=>{
              document.getElementsByClassName("aplayer-info")[0].style.backgroundColor = '#fff'
          },1000)
        }
    });
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
  src: url("assets/NotoSansSC-Regular.ttf");
}
@font-face {
  font-family: "songti";
  src: url("assets/SourceHanSerifTC-Regular.otf");
}

@font-face {
  font-family: "heiti";
  src: url("assets/SourceHanSansCN-Regular.otf");
}

.el-button--primary, .el-input__inner, .aplayer-info{
  font-family: "songti";
}
.el-input__inner{
  border-radius: 20px !important;
  border: none !important;
}
.el-input__inner:focus{
  border: 1px solid #bb7e7e !important;
}
.el-loading-mask{
  border-radius: 20px !important;
}

.el-tabs__item.is-active{
  color: #bb7e7e !important;
  font-weight: 700;
  font-size: 1.1em;
}
.el-tabs__item:hover{
  color: #bb7e7e !important;
}
/*tab激活样式*/
.el-tabs__active-bar{
  background-color: #bb7e7e !important;
  height: 2.5px !important;
}
.el-input__prefix{
  color: #bb7e7e !important;
}

/*美化滚动条*/
::-webkit-scrollbar {
width: 0px;
height: 0px;
}
/*定义滚动条轨道 内阴影+圆角*/
::-webkit-scrollbar-track {
-webkit-box-shadow: inset 0 0 2px rgba(0,0,0,0.3);
background: #fff ;
}
/*定义滑块 内阴影+圆角*/
::-webkit-scrollbar-thumb {
border-radius: 3px;
-webkit-box-shadow: inset 0 0 1.5px rgba(0,0,0,.3);
background-color:rgba(158, 158, 158, 0.7);
}
::-webkit-scrollbar-thumb:hover {
border-radius: 3px;
-webkit-box-shadow: inset 0 0 1.5px rgba(0,0,0,.3);
background-color:rgba(158, 158, 158, 1);
}

body{
  -webkit-app-region: no-drag;
}

.titlebar {
  height: 40px;
  margin-top: -20px;
  -webkit-app-region: drag;
  -webkit-user-select: none;
  cursor: pointer;
}

.light {  
  padding: 0px 12px 20px 12px;
  background-repeat: repeat;
  background-size: cover;
  background-image: url("assets/light.jpeg")
}

.dark{
  color: #fff;
  padding: 0px 12px 20px 12px;
  background-repeat: repeat;
  background-size: cover;
  background-image: url("assets/dark.png");
  background-color:#625b57;
}
</style>