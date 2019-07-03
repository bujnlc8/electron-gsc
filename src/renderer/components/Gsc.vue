<template>
  <div v-if="!$parent.body_loading">
    <el-container :style="container_style">
      <el-aside width="480px">
        <el-row style="position:fixed;z-index:999;width:460px;">
          <el-col :span="18">
            <el-input
              v-loading="loading"
              element-loading-text="用力搜索中..."
              v-model="input"
              prefix-icon="el-icon-search"
              @keyup.enter.native="search"
              clearable
              placeholder="请输入内容"
              @clear="clear_search()"
            ></el-input>
          </el-col>
          <el-col :span="4">
            <el-button
              type="primary"
              round
              icon="el-icon-right"
              @click="search"
              v-bind:disabled="loading"
            >搜索</el-button>
          </el-col>
        </el-row>
        <el-row style="position:fixed;z-index:999; margin-top:3rem;font-family:songti;">
          <el-col>
            <el-switch 
            :disabled="!offline_search"
            @change="search()"
            v-model="filter_like"
            active-color="#13ce66"
            inactive-color="#93816d"
            active-text="只是喜欢"
            inactive-text="全部包含">
          </el-switch>
          </el-col>
        </el-row>
        <el-row style="margin-top:5rem;" v-if="gsc_length > 0">
          <el-col :span="23">
            <div class="grid-content">
              <label>搜索結果({{ gsc_length }})</label>
            </div>
          </el-col>
        </el-row>
        <el-row style="margin-top:5rem;" v-if="gsc_length == 0">
          <el-col :span="23" v-if="chinese=='cn'">暂无搜索结果，请尝试其他输入吧~</el-col>
          <el-col :span="23" v-if="chinese=='tw'">暫無搜索結果，請嘗試其他輸入吧~</el-col>
        </el-row>
        <div v-for="gsc in gscs" v-bind:key="gsc.id" class="gsc-div" @click="open_gsc(gsc.id)">
          <el-row>
            <el-col :span="20">
              <div class="grid-content">{{gsc.work_title}} <i class="el-icon-link" 
              v-if="current_gsc.baidu_wiki" @click="showBaidu(current_gsc.baidu_wiki)" style="margin-left:1em;"></i></div>
            </el-col>
            <el-col :span="3">
              <div class="grid-content content-right">
                <i
                  class="el-icon-view"
                  v-if="current_gsc && current_gsc.id == gsc.id"
                  style="margin-right:1em;"
                ></i>
                <i class="el-icon-service" v-else-if="gsc.audio_id > 0" style="margin-right:1em;"></i>
              </div>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="16">
              <div class="grid-content">{{gsc.short_content}}</div>
            </el-col>
            <el-col :span="7">
              <div class="grid-content content-right">【{{gsc.work_dynasty}}】 {{gsc.work_author}}</div>
            </el-col>
          </el-row>
          <div class="seperate-div"></div>
        </div>
      </el-aside>
      <el-container>
        <!---右半部分开始-->
        <el-main v-if="current_gsc" style="margin-top:-10px;">
          <div id="mycapture" style="padding:1.2em 2em;">
            <el-row class="content">
              <el-col :span="24">
                <div style="text-align:center;font-size:1.3em;">
                  <label @click="search_word(current_gsc.work_title)">{{current_gsc.work_title}}</label>
                  <span slot="label" v-if="activeName.length == 0" id="like-icon">
                <img  v-if="is_liked == 0" @click="operate_like_gsc(current_gsc.id, 1)" style="height:16px;width:16px;" src="../../../static/like.png"/>
                <img  v-else-if="is_liked == 1" @click="operate_like_gsc(current_gsc.id, 0)"  style="height:16px;width:16px;" src="../../../static/liked.png"/>
                </span>
                </div>
              </el-col>
            </el-row>
            <el-row class="content">
              <el-col :span="24">
                <div style="text-align:center;font-size:1.2em;">
                  【{{current_gsc.work_dynasty}}】
                  <label
                    @click="search_word(current_gsc.work_author)"
                  >{{current_gsc.work_author}}</label>
                </div>
              </el-col>
            </el-row>
            <el-row class="content" v-if="current_gsc.foreword != ''">
              <el-col :span="24">
                <div
                  v-html="current_gsc.foreword"
                  style="font-size:0.8em;font-style:italic;text-indent: 2em;"
                ></div>
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
              <aplayer preload="none" theme="#93816d" :music="musicList" listMaxHeight="1"></aplayer>
            </el-col>
          </el-row>
          <el-tabs v-model="activeName" v-if="chinese == 'cn'">
            <el-tab-pane label="评析" name="intro" v-if="current_gsc.intro !=''">
              <div v-html="current_gsc.intro" class="indent"></div>
            </el-tab-pane>
            <el-tab-pane label="注释" name="annotation" v-if="current_gsc.annotation!=''">
              <div v-html="current_gsc.annotation" class="indent"></div>
            </el-tab-pane>
            <el-tab-pane label="译文" name="translation" v-if="current_gsc.translation!=''">
              <div v-html="current_gsc.translation" class="indent"></div>
            </el-tab-pane>
            <el-tab-pane label="赏析" name="appreciation" v-if="current_gsc.appreciation!=''">
              <div v-html="current_gsc.appreciation" class="indent"></div>
            </el-tab-pane>
            <el-tab-pane label="辑评" name="master_comment" v-if="current_gsc.master_comment!=''">
              <div v-html="current_gsc.master_comment" class="indent"></div>
            </el-tab-pane>
            <el-tab-pane disabled v-if="activeName.length > 0">
              <span slot="label">
                <img  v-if="is_liked == 0" @click="operate_like_gsc(current_gsc.id, 1)" style="height:16px;width:16px;" src="../../../static/like.png"/>
                <img  v-else-if="is_liked == 1" @click="operate_like_gsc(current_gsc.id, 0)"  style="height:16px;width:16px;" src="../../../static/liked.png"/>
                </span>
            </el-tab-pane>
          </el-tabs>
          <el-tabs v-model="activeName" v-if="chinese == 'tw'">
            <el-tab-pane label="評析" name="intro" v-if="current_gsc.intro !=''">
              <div v-html="current_gsc.intro" class="indent"></div>
            </el-tab-pane>
            <el-tab-pane label="註釋" name="annotation" v-if="current_gsc.annotation!=''">
              <div v-html="current_gsc.annotation" class="indent"></div>
            </el-tab-pane>
            <el-tab-pane label="譯文" name="translation" v-if="current_gsc.translation!=''">
              <div v-html="current_gsc.translation" class="indent"></div>
            </el-tab-pane>
            <el-tab-pane label="賞析" name="appreciation" v-if="current_gsc.appreciation!=''">
              <div v-html="current_gsc.appreciation" class="indent"></div>
            </el-tab-pane>
            <el-tab-pane label="輯評" name="master_comment" v-if="current_gsc.master_comment!=''">
              <div v-html="current_gsc.master_comment" class="indent"></div>
            </el-tab-pane>
            <el-tab-pane disabled v-if="activeName.length > 0">
              <span slot="label">
                <img  v-if="is_liked == 0" @click="operate_like_gsc(current_gsc.id, 1)" style="height:16px;width:16px;" src="../../../static/like.png"/>
                <img  v-else-if="is_liked == 1" @click="operate_like_gsc(current_gsc.id, 0)"  style="height:16px;width:16px;" src="../../../static/liked.png"/>
                </span>
            </el-tab-pane>
          </el-tabs>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>
<script>
import { ApiUrl } from "../api.js";
import {beautifyGsc} from "../util"
import Aplayer from "vue-aplayer";
import { throws } from "assert";
import html2canvas from "html2canvas";
const jf_convert = require("chinese_convert");
const fs = require("fs");
const path = require("path");
const { remote, ipcRenderer } = require("electron");
const { Menu, MenuItem, clipboard, BrowserWindow, nativeImage } = remote;
const db = remote.getGlobal("__db__")
const menu = new Menu();
menu.append(
  new MenuItem({
    label: "复制",
    click: function() {
      let selectionObj = window.getSelection();
      let selectedText = selectionObj.toString();
      if (selectedText.length > 0) {
        clipboard.writeText(selectedText);
        ipcRenderer.send("copy_and_search", selectedText, 0);
      }
    }
  })
);
menu.append(new MenuItem({ type: "separator" }));
menu.append(
  new MenuItem({
    label: "搜索",
    click: function() {
      let selectionObj = window.getSelection();
      let selectedText = selectionObj.toString();
      if (selectedText.length > 0) {
        ipcRenderer.send("copy_and_search", selectedText, 1);
      }
    }
  })
);
menu.append(new MenuItem({ type: "separator" }));
menu.append(
  new MenuItem({
    label: "复制搜索",
    click: function() {
      let selectionObj = window.getSelection();
      let selectedText = selectionObj.toString();
      if (selectedText.length > 0) {
        clipboard.writeText(selectedText);
        ipcRenderer.send("copy_and_search", selectedText, 2);
      }
    }
  })
);
menu.append(new MenuItem({ type: "separator" }));
menu.append(
  new MenuItem({
    label: "谷歌搜索",
    click: function() {
      let selectionObj = window.getSelection();
      let selectedText = selectionObj.toString();
      if (selectedText.length <= 0) {
        return;
      }
      let win = new BrowserWindow({
        width: 1200,
        height: 800
      });
      win.loadURL("https://www.google.com/search?q={0}".format(selectedText));
    }
  })
);
menu.append(new MenuItem({ type: "separator" }));
menu.append(
  new MenuItem({
    label: "维基百科",
    click: function() {
      let selectionObj = window.getSelection();
      let selectedText = selectionObj.toString();
      if (selectedText.length <= 0) {
        return;
      }
      let win = new BrowserWindow({
        width: 1200,
        height: 800
      });
      win.loadURL(
        "https://zh.wikipedia.org/w/index.php?search={0}".format(selectedText)
      );
    }
  })
);
menu.append(new MenuItem({ type: "separator" }));
menu.append(
  new MenuItem({
    label: "百度搜索",
    click: function() {
      let selectionObj = window.getSelection();
      let selectedText = selectionObj.toString();
      if (selectedText.length <= 0) {
        return;
      }
      let win = new BrowserWindow({
        width: 1200,
        height: 800
      });
      win.loadURL(
        "https://www.baidu.com/s?wd={0}&ie=utf-8".format(selectedText)
      );
    }
  })
);
menu.append(new MenuItem({ type: "separator" }));
menu.append(
  new MenuItem({
    label: "截图保存",
    click: function() {
      ipcRenderer.send("capture_content", 0);
    }
  })
);
window.addEventListener(
  "contextmenu",
  e => {
    e.preventDefault();
    menu.popup({ window: remote.getCurrentWindow() });
  },
  false
);

export default {
  name: "Gsc",
  components: { Aplayer },
  data() {
    return {
      input: "",
      gscs: [],
      gsc_length: 0,
      loading: false,
      current_gsc: null,
      musicList: [],
      activeName: "",
      imgsrc: "",
      container_style: { height: "612px" },
      chinese: "cn",
      clear_auto_search: false,
      offline_search: true,
      is_liked: 0,
      filter_like: false,
    };
  },
  watch:{
    current_gsc: function(v, old_v){
      this.is_liked = v.like
    }
  },
  mounted() {
    this.search();
  },
  methods: {
    operate_like_gsc(gsc_id, op){
      db.run("UPDATE gsc set like = ? WHERE id = ?", op, gsc_id, (e)=>{
        if(e){
          this.show_notify(message="操作失败")
        }else{
          this.show_notify("success", "提醒", (op==1 ? '喜欢' : '取消') + '成功')
          this.current_gsc.like = op
          this.is_liked  = op
        }
      })
    },
    showBaidu(baidu_wiki){
      let win = new BrowserWindow({
        width: 1200,
        height: 800
      });
      win.loadURL(baidu_wiki);
    },
    clear_search() {
      if (this.clear_auto_search) {
        this.search();
      }
      return true;
    },
    cn2twgsc(gsc_obj) {
      gsc_obj.work_title = jf_convert.cn2tw(gsc_obj.work_title);
      gsc_obj.work_author = jf_convert.cn2tw(gsc_obj.work_author);
      gsc_obj.work_dynasty = jf_convert.cn2tw(gsc_obj.work_dynasty);
      gsc_obj.content = jf_convert.cn2tw(gsc_obj.content);
      gsc_obj.short_content = jf_convert.cn2tw(gsc_obj.short_content);
      gsc_obj.intro = jf_convert.cn2tw(gsc_obj.intro);
      gsc_obj.master_comment = jf_convert.cn2tw(gsc_obj.master_comment);
      gsc_obj.appreciation = jf_convert.cn2tw(gsc_obj.appreciation);
      gsc_obj.annotation = jf_convert.cn2tw(gsc_obj.annotation);
      gsc_obj.translation = jf_convert.cn2tw(gsc_obj.translation);
      gsc_obj.foreword = jf_convert.cn2tw(gsc_obj.foreword);
    },
    tw2cngsc(gsc_obj) {
      gsc_obj.work_title = jf_convert.tw2cn(gsc_obj.work_title);
      gsc_obj.work_author = jf_convert.tw2cn(gsc_obj.work_author);
      gsc_obj.work_dynasty = jf_convert.tw2cn(gsc_obj.work_dynasty);
      gsc_obj.content = jf_convert.tw2cn(gsc_obj.content);
      gsc_obj.short_content = jf_convert.tw2cn(gsc_obj.short_content);
      gsc_obj.intro = jf_convert.tw2cn(gsc_obj.intro);
      gsc_obj.master_comment = jf_convert.tw2cn(gsc_obj.master_comment);
      gsc_obj.appreciation = jf_convert.tw2cn(gsc_obj.appreciation);
      gsc_obj.annotation = jf_convert.tw2cn(gsc_obj.annotation);
      gsc_obj.translation = jf_convert.tw2cn(gsc_obj.translation);
      gsc_obj.foreword = jf_convert.tw2cn(gsc_obj.foreword);
    },
    search_word(word) {
      this.input = jf_convert.tw2cn(word);
      this.search();
    },
    do_content(gsc_obj) {
      beautifyGsc(gsc_obj)
      // 简繁转换
      if (this.chinese === "tw") {
        this.cn2twgsc(gsc_obj);
      }
      return gsc_obj;
    },
    show_notify(t = "error", title = "Oops", message = "服务器开小差啦~") {
      if (t == "error") {
        this.$notify.error({
          title: title,
          duration: 1500,
          message: message
        });
      } else if (t == "info") {
        this.$notify.info({
          title: title,
          duration: 1500,
          message: message
        });
      } else if (t == "success") {
        this.$notify({
          title: title,
          duration: 1500,
          message: message,
          type: "success"
        });
      } else if (t == "warning") {
        this.$notify({
          title: title,
          duration: 1500,
          message: message,
          type: "warning"
        });
      }
    },
    do_gscs(gscs) {
      for (let i = 0; i < gscs.length; i++) {
        let gsc_obj = gscs[i];
        this.do_content(gsc_obj);
      }
      this.gscs = gscs;
      if (this.gscs.length > 0 && !this.current_gsc) {
        this.open_gsc(this.gscs[0].id);
      }
      this.gsc_length = this.gscs.length;
    },
    search() {
      // 离线搜索
      this.loading = true;
      let that = this
      if (this.offline_search) {
        let sql = "select * from gsc where audio_id > 0 order by random() limit 30"
        if(this.filter_like){
            sql = "select * from gsc where `like` = 1 order by audio_id desc"
        }
        if(this.input){
          sql = ("select * from gsc where (work_title like '%{0}%' or " + 
          " work_author like '%{1}%' or content like '%{2}%' or " +
          " foreword like '%{3}%' ) ").format(this.input, this.input, this.input, this.input)
          if(this.filter_like){
            sql += " and `like` = 1 "
          }
        }
        db.parallelize(function(){
            db.all(sql, [], function(e,row) {
              if (e) {
                that.show_notify();
                that.loading = false;
              } else {
                that.do_gscs(row);
                that.loading = false;
              }
            });
        });
      } else {
        let url = ApiUrl.home;
        if (this.input) {
          url = ApiUrl.search.format(this.input);
        }
        this.$http
          .get(url)
          .then(response => {
            let d = response.data;
            if (d.code != 0) {
              this.show_notify();
              this.loading = false;
            } else {
              this.do_gscs(d.data.data);
              this.loading = false;
            }
          })
          .catch(e => {
            this.show_notify();
            this.loading = false;
          });
      }
    },
    do_open_gsc(gsc){
        this.current_gsc = this.do_content(gsc);
        this.musicList = {
          title: this.current_gsc.work_title,
          artist: this.current_gsc.work_author,
          src: "https://songci.nos-eastchina1.126.net/audio/{0}.m4a".format(
            this.current_gsc.audio_id
          ),
          pic:
            "https://qcloudtest-1256650966.cos.ap-guangzhou.myqcloud.com/avatar.jpeg"
        };
        if (this.current_gsc.intro) {
          this.activeName = "intro";
        } else if (this.current_gsc.annotation) {
          this.activeName = "annotation";
        } else if (this.current_gsc.translation) {
          this.activeName = "translation";
        } else if (this.current_gsc.appreciation) {
          this.activeName = "appreciation";
        } else if (this.current_gsc.master_comment) {
          this.activeName = "master_comment";
        } else {
          this.activeName = "";
      }
    },
    open_gsc(id_) {
      if(!this.offline_search){
      let url = ApiUrl.detail.format(id_);
      this.$http
        .get(url)
        .then(response => {
          let d = response.data;
          if (d.code != 0) {
            this.show_notify();
          } else {
            this.do_open_gsc(d.data.data)
          }
        })
        .catch(e => {
          this.show_notify();
        });
      }else{
        let sql = "select * from gsc where id={0}".format(id_)
        db.get(sql, (e, row)=>{
          if(e){
            this.show_notify();
          }else{
            this.do_open_gsc(row)
          }
        })
      }
    }
  },
  created() {
    let that = this;
    if (process.platform == "win32") {
      this.container_style = { height: "592px" };
    }
    ipcRenderer.on("query_current_gsc", (event, arg)=>{
      db.get(
      "SELECT * from gsc where `like` = 1 order by random() limit 1", (e, row)=>{
        if(!e && row){
          ipcRenderer.send("received_current_gsc", row.id, this.$parent.myfont["font-family"], 
          row.content.length, this.do_content(row))
        }else{
          ipcRenderer.send("received_current_gsc", parseInt(Math.random() * 8000), this.$parent.myfont["font-family"], 0, null)
        }
      })
    })
    ipcRenderer.on("query_like_gsc", (event, arg)=>{
      db.get(
      "SELECT * from gsc order by random() limit 1", (e, row)=>{
        if(!e && row){
          ipcRenderer.send("received_like_gsc", row.id, this.$parent.myfont["font-family"], 
          row.content.length, this.do_content(row))
        }else{
          ipcRenderer.send("received_like_gsc", parseInt(Math.random() * 8000), this.$parent.myfont["font-family"], 0, null)
        }
      })
    })
    ipcRenderer.on("copy_and_search", (evnet, message, arg1) => {
      if (arg1 == 0 || arg1 == 2) {
        this.show_notify("success", "提醒", "已经复制到剪贴板");
      }
      if (arg1 == 1 || arg1 == 2) {
        this.search_word(message);
      }
    });
    ipcRenderer.on("capture_content", (event, message) => {
      let color = "#FFFCEC";
      if (this.$parent.dark_mode == "light-yellow") {
        color = "whitesmoke";
      } else if (this.$parent.dark_mode == "dark") {
        color = "#93816d";
      }
      html2canvas(document.getElementById("mycapture"), {
        backgroundColor: color,
        ignoreElements: (item)=>{
          if(item.id ==="like-icon"){
            return true
          }
          return false
        }
      }).then(canvas => {
        //this.imgsrc = canvas.toDataURL('image/png')
        let data_url = canvas.toDataURL("image/png");
        let native_img = nativeImage.createFromDataURL(data_url);
        clipboard.writeImage(native_img);
        this.show_notify("success", "提醒", "图片已经复制到剪贴板");
      });
    });
    // 切换简体
    ipcRenderer.on("change-jianti", (event, arg) => {
      this.chinese = "cn";
      let divs = document.getElementsByClassName("grid-content");
      for (let i = 0; i < divs.length; i++) {
        divs[i].innerText = jf_convert.tw2cn(divs[i].innerText);
      }
      let tabs = document.getElementsByClassName("el-tabs__item");
      for (let i = 0; i < tabs.length; i++) {
        tabs[i].innerText = jf_convert.tw2cn(tabs[i].innerText);
      }
      let tabs2 = document.getElementsByClassName("el-tab-pane");
      for (let i = 0; i < tabs2.length; i++) {
        tabs2[i].innerHTML = jf_convert.tw2cn(tabs2[i].innerHTML);
      }
      if (this.current_gsc) {
        this.tw2cngsc(this.current_gsc);
      }
    });
    // 切换繁体
    ipcRenderer.on("change-fanti", (event, arg) => {
      this.chinese = "tw";
      // 左边
      let divs = document.getElementsByClassName("grid-content");
      for (let i = 0; i < divs.length; i++) {
        divs[i].innerText = jf_convert.cn2tw(divs[i].innerText);
      }
      // tabs
      let tabs = document.getElementsByClassName("el-tabs__item");
      for (let i = 0; i < tabs.length; i++) {
        tabs[i].innerText = jf_convert.cn2tw(tabs[i].innerText);
      }
      let tabs2 = document.getElementsByClassName("el-tab-pane");
      for (let i = 0; i < tabs.length; i++) {
        tabs2[i].innerHTML = jf_convert.cn2tw(tabs2[i].innerHTML);
      }
      if (this.current_gsc) {
        this.cn2twgsc(this.current_gsc);
      }
    });
    ipcRenderer.on("clear_auto_search", (event, clear_auto_search) => {
      this.clear_auto_search = clear_auto_search;
    });
    ipcRenderer.on("offline_search", (event, offline_search) => {
      this.offline_search = offline_search;
    });
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
  border: 0.5px dashed #93816d;
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