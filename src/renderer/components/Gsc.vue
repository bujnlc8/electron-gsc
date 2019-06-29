<template>
  <div>
    <el-container style="height: 600px;">
      <el-aside width="480px">
        <el-row>
          <el-col :span="19">
            <el-input v-model="input" prefix-icon="el-icon-search" @keyup.enter.native="search" clearable placeholder="请输入内容"></el-input>
          </el-col>
          <el-col :span="4" v-loading="loading" element-loading-spinner="el-icon-loading">
            <el-button type="primary" round icon="el-icon-right" @click="search">搜索</el-button>
          </el-col>
        </el-row>
        <el-row style="margin-top:1rem;" v-if="gscs.length > 0">
          <el-col :span="23">
            <div class="grid-content bg-purple-dark">搜索结果({{gscs.length}})</div>
          </el-col>
        </el-row>
        <el-row style="margin-top:1rem;" v-if="gscs.length == 0">
          <el-col :span="23">暂无搜索结果，请尝试其他输入吧~</el-col>
        </el-row>
        <div v-for="gsc in gscs" v-bind:key="gsc.id" class="gsc-div" @click="open_gsc(gsc.id)">
          <el-row>
            <el-col :span="20">
              <div class="grid-content">{{gsc.work_title}}</div>
            </el-col>
            <el-col :span="3">
              <div class="grid-content content-right">
                <img
                  src="../assets/sound.png"
                  v-if="gsc.audio_id > 0"
                  style="width:2em;height:2em;">
              </div>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="16">
              <div class="grid-content">{{gsc.short_content}}</div>
            </el-col>
            <el-col :span="7">
              <div class="grid-content content-right">[{{gsc.work_dynasty}}] {{gsc.work_author}}</div>
            </el-col>
          </el-row>
          <div class="seperate-div"></div>
        </div>
      </el-aside>
      <el-container>
        <!---右半部分开始-->
        <el-main v-if="current_gsc" style="margin-top:-10px;">
          <div id="mycapture" style="padding:1.5em 2em;">
          <el-row class="content">
            <el-col :span="24">
              <div style="text-align:center;font-size:1.3em;"><label @click="search_word(current_gsc.work_title)">{{current_gsc.work_title}}</label></div>
            </el-col>
          </el-row>
          <el-row class="content">
            <el-col :span="24">
              <div
                style="text-align:center;font-size:1.2em;"
              >[{{current_gsc.work_dynasty}}] <label @click="search_word(current_gsc.work_author)">{{current_gsc.work_author}}</label></div>
            </el-col>
          </el-row>
          <el-row class="content" v-if="current_gsc.foreword != ''">
            <el-col :span="24">
              <div v-html="current_gsc.foreword"
                style="font-size:0.8em;font-style:italic;text-indent: 2.5em;"></div>
            </el-col>
          </el-row>
          <el-row class="content">
            <el-col :span="24">
              <div
                :class="current_gsc.layout"
                v-html="current_gsc.content"
                style="font-size:1.1em;"
              ></div>
            </el-col>
          </el-row>
          </div>
          <el-row v-if="current_gsc.audio_id > 0">
             <el-col :span="24">
                  <aplayer preload="none" theme="#b7daff" :music="musicList" listmaxheight="1">
                </aplayer>
            </el-col>
          </el-row>
          <el-tabs v-model="activeName">
            <el-tab-pane label="评析" name="intro" v-if="current_gsc.intro !=''"><div v-html="current_gsc.intro" class="indent"></div></el-tab-pane>
            <el-tab-pane label="注释" name="annotation" v-if="current_gsc.annotation!=''"><div v-html="current_gsc.annotation" class="indent"></div></el-tab-pane>
            <el-tab-pane label="译文" name="translation" v-if="current_gsc.translation!=''"><div v-html="current_gsc.translation" class="indent"></div></el-tab-pane>
            <el-tab-pane label="赏析" name="appreciation" v-if="current_gsc.appreciation!=''"><div v-html="current_gsc.appreciation" class="indent"></div></el-tab-pane>
            <el-tab-pane label="辑评" name="master_comment" v-if="current_gsc.master_comment!=''"><div v-html="current_gsc.master_comment" class="indent"></div></el-tab-pane>
         </el-tabs>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>
<script>
import { ApiUrl } from "../api.js";
import Aplayer from 'vue-aplayer'
import { throws } from 'assert';
import html2canvas from 'html2canvas'
const {remote, ipcRenderer} = require('electron')
const {Menu, MenuItem, clipboard, BrowserWindow, nativeImage} = remote;
const menu = new Menu()
menu.append(
  new MenuItem({
    label: "复制",
    click: function(){
      let selectionObj = window.getSelection();
      let selectedText = selectionObj.toString();
      if(selectedText.length > 0){
         clipboard.writeText(selectedText)
         ipcRenderer.send("copy_and_search", selectedText, 0)
      }
    }
  }));
  menu.append(new MenuItem({type: 'separator'}))
  menu.append(
  new MenuItem({
    label: "搜索",
    click: function(){
      let selectionObj = window.getSelection();
      let selectedText = selectionObj.toString();
      if(selectedText.length >0){
        ipcRenderer.send("copy_and_search", selectedText, 1)
      }
    }
  }));
  menu.append(new MenuItem({type: 'separator'}))
  menu.append(
  new MenuItem({
    label: "复制搜索",
    click: function(){
      let selectionObj = window.getSelection();
      let selectedText = selectionObj.toString();
      if(selectedText.length > 0){
      clipboard.writeText(selectedText)
      ipcRenderer.send("copy_and_search", selectedText, 2)
      }
    }
  }));
  menu.append(new MenuItem({type: 'separator'}))
  menu.append(
  new MenuItem({
    label: "谷歌搜索",
    click: function(){
      let selectionObj = window.getSelection();
      let selectedText = selectionObj.toString();
      if(selectedText.length<=0){
        return
      }
      let win = new BrowserWindow({
        width: 1000,
        height: 800,
      })
      win.loadURL('https://www.google.com/search?q={0}'.format(selectedText))
    }
  }));
  menu.append(new MenuItem({type: 'separator'}))
  menu.append(
  new MenuItem({
    label: "维基百科",
    click: function(){
      let selectionObj = window.getSelection();
      let selectedText = selectionObj.toString();
      if(selectedText.length<=0){
        return
      }
      let win = new BrowserWindow({
        width: 1000,
        height: 800,
      })
      win.loadURL('https://zh.wikipedia.org/w/index.php?search={0}'.format(selectedText))
    }
  }));
  menu.append(new MenuItem({type: 'separator'}))
  menu.append(
  new MenuItem({
    label: "百度搜索",
    click: function(){
      let selectionObj = window.getSelection();
      let selectedText = selectionObj.toString();
      if(selectedText.length<=0){
        return
      }
      let win = new BrowserWindow({
        width: 1000,
        height: 800,
      })
      win.loadURL('https://www.baidu.com/s?wd={0}'.format(selectedText))
    }
  }));
  menu.append(new MenuItem({type: 'separator'}))
  menu.append(
  new MenuItem({
    label: "截图保存",
    click: function(){
      ipcRenderer.send("capture_content", 0)
    }
  }));
  window.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        menu.popup({window: remote.getCurrentWindow()})
  }, false)

export default {
  components: {Aplayer},
  data() {
    return {
      input: "",
      gscs: [],
      loading: false,
      current_gsc: null,
      musicList: null,
      activeName: '',
      imgsrc: ''
    };
  },
  mounted(){
    ipcRenderer.on("capture_content",(event, message)=>{
    html2canvas(document.getElementById('mycapture'), {backgroundColor: "#FFFCEC"}).then(canvas=>{
      //this.imgsrc = canvas.toDataURL('image/png')
      let data_url = canvas.toDataURL('image/png')
      let native_img = nativeImage.createFromDataURL(data_url)
      clipboard.writeImage(native_img)
      this.show_notify("success", "提醒", "图片已经复制到剪贴板")
    });
  })
  },
  methods: {
    search_word(word){
        this.input = word
        this.search()
    },
    do_content(gsc_obj) {
      // 句号
      let period_index = gsc_obj.content.indexOf("。");
      if (period_index == -1) {
        // 感叹号
        let exclamatory_mark_index = gsc_obj.content.indexOf("！");
        if (exclamatory_mark_index == -1) {
          // 问号
          let question_mark_index = gsc_obj.content.indexOf("？");
          gsc_obj.short_content = gsc_obj.content.slice(
            0,
            question_mark_index + 1
          );
        } else
          [
            (gsc_obj.short_content = gsc_obj.content.slice(
              0,
              exclamatory_mark_index + 1
            ))
          ];
      } else {
        gsc_obj.short_content = gsc_obj.content.slice(0, period_index + 1);
      }
      if (gsc_obj.layout == "indent") {
        gsc_obj.content = gsc_obj.content.replace(/\n/g, "</br>&emsp;&emsp;");
        gsc_obj.content = gsc_obj.content.replace(/\t/g, "</br>&emsp;&emsp;");
        } else {
        gsc_obj.content = gsc_obj.content.replace(/\n/g, "</br>");
        gsc_obj.content = gsc_obj.content.replace(/\t/g, "</br>");
      }
        gsc_obj.translation = gsc_obj.translation.replace(/\n/g, "</br>&emsp;&emsp;");
        gsc_obj.translation = gsc_obj.translation.replace(/\t/g, "</br>&emsp;&emsp;");
        gsc_obj.annotation = gsc_obj.annotation.replace(/\n/g, "</br>&emsp;&emsp;");
        gsc_obj.annotation = gsc_obj.annotation.replace(/\t/g, "</br>&emsp;&emsp;");
        gsc_obj.appreciation = gsc_obj.appreciation.replace(/\n/g, "</br>&emsp;&emsp;");
        gsc_obj.appreciation = gsc_obj.appreciation.replace(/\t/g, "</br>&emsp;&emsp;");
        gsc_obj.master_comment = gsc_obj.master_comment.replace(/\n/g, "</br>&emsp;&emsp;");
        gsc_obj.master_comment = gsc_obj.master_comment.replace(/\t/g, "</br>&emsp;&emsp;");
        gsc_obj.intro = gsc_obj.intro.replace(/\n/g, "</br>&emsp;&emsp;");
        gsc_obj.intro = gsc_obj.intro.replace(/\t/g, "</br>&emsp;&emsp;");
      return gsc_obj;
    },
    show_notify(t = "error", title = "Oops", message = "服务器开小差啦~") {
      if(t == "error"){
      this.$notify.error({
        title: title,
        duration: 1500,
        message: message
      });
      }else if(t=="info"){
        this.$notify.info({
        title: title,
        duration: 1500,
        message: message
      });
      }else if(t=="success"){
        this.$notify({
        title: title,
        duration: 1500,
        message: message,
        type: "success"
      });
      }else if(t=="warning"){
        this.$notify({
        title: title,
        duration: 1500,
        message: message,
        type: "warning"
      });
      }
    },
    search() {
      let url = ApiUrl.home;
      if (this.input) {
        url = ApiUrl.search.format(this.input);
      }
      this.loading = true;
      this.$http
        .get(url)
        .then(response => {
          let d = response.data;
          if (d.code != 0) {
            this.show_notify();
          } else {
            for (let i = 0; i < d.data.data.length; i++) {
              let gsc_obj = d.data.data[i];
              this.do_content(gsc_obj);
            }
            this.loading = false;
            this.gscs = d.data.data;
            if (this.gscs.length > 0 && !this.current_gsc) {
              this.open_gsc(this.gscs[0].id);
            }
          }
        })
        .catch(e => {
          this.show_notify();
        });
    },
    open_gsc(id_) {
      let url = ApiUrl.detail.format(id_);
      this.$http
        .get(url)
        .then(response => {
          let d = response.data;
          if (d.code != 0) {
            this.show_notify();
          } else {
            this.current_gsc = this.do_content(d.data.data);
            this.musicList = {
                title: this.current_gsc.work_title,
                artist: this.current_gsc.work_author,
                src: 'https://songci.nos-eastchina1.126.net/audio/{0}.m4a'.format(this.current_gsc.audio_id),
                pic: 'https://qcloudtest-1256650966.cos.ap-guangzhou.myqcloud.com/avatar.jpeg'
            }
            if(this.current_gsc.intro){
                this.activeName = "intro"
            }else if(this.current_gsc.annotation){
                this.activeName = "annotation"
            }else if(this.current_gsc.translation){
                this.activeName = "translation"
            }else if(this.current_gsc.appreciation){
                this.activeName = "appreciation"
            }else if(this.current_gsc.master_comment){
                this.activeName = "master_comment"
            }else{
               this.activeName = '' 
            }
          }
        })
        .catch(e => {
          this.show_notify();
        });
    }
  },
  created() {
    this.search();
    ipcRenderer.on("copy_and_search", (evnet, message, arg1)=>{
      if(arg1 == 0 || arg1 == 2){
          this.show_notify("success", "提醒", "已经复制到剪贴板")
      }
      if(arg1 == 1 || arg1 == 2){
          this.search_word(message)
      }
    })
  }
};
</script>
<style>
.content-right {
  text-align: right;
}
.gsc-div {
  margin-top: 20px;
}
.grid-content {
  margin-top: 6px;
}
.seperate-div {
  height: 0;
  border: 0.5px dashed #bb7e7e;
  margin-top: 0.5rem;
  opacity: 0.5;
  margin-right: 1em;
}
.indent {
  text-align: left;
  text-indent: 2em;
}
.center {
  text-align: center;
}
.content {
  margin-top: 0.5em;
  line-height: 1.6em;
}
</style>