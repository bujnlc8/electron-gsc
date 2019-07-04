<template>
  <div :style="myfont">
      <div style="font-size:16px;text-align: center;">
        <label @dblclick="go_detail(gsc_id)">{{gsc.work_title}}</label>
        <span style="padding-left:1em;">
          <img
            v-if="is_liked == 0"
            @click="operate_like_gsc(gsc_id, 1)"
            style="height:1em;width:1em;"
            src="../../static/like.png"
          />
          <img
            v-else-if="is_liked == 1"
            @click="operate_like_gsc(gsc_id, 0)"
            style="height:1em;width:1em;"
            src="../../static/liked.png"
          />
        </span>
      </div>
      <div v-if="gsc.work_dynasty" style="font-size:13px;text-align: center;">{{gsc.work_dynasty}}·{{gsc.work_author}}</div>
      <div
        v-if="gsc.forword !==''"
        style="font-size:0.8em;font-style:italic;text-indent: 2em;"
      >{{gsc.forward}}</div>
      <div v-html="gsc.content" :class="gsc.layout" @dblclick="close_window()"></div>
  </div>
</template>
<script>
import { ipcRenderer, remote } from "electron";
import { beautifyGsc } from "./util";
const db = remote.getGlobal("__db__");
const log = require("electron-log");
export default {
  name: "DetailApp",
  data() {
    return {
      gsc_id: 1,
      myfont: { "font-family": "songkai" },
      gsc: {},
      is_liked: 0
    };
  },
  watch: {
    gsc: function(v, old_v) {
      this.is_liked = v.like;
    }
  },
  methods: {
    operate_like_gsc(gsc_id, op) {
      db.run("UPDATE gsc set like = ? WHERE id = ?", op, gsc_id, e => {
        if (!e) {
          //this.gsc.like = op
          this.is_liked = op;
        } else {
          log.error(e);
        }
      });
    },
    go_detail(gsc_id) {
      ipcRenderer.send("go_detail", gsc_id);
    },
    close_window(){
      ipcRenderer.send("close_detail_window", null)
    }
  },
  created() {
    ipcRenderer.on("to_get_gsc_detail", (event, gsc_id, font, gsc) => {
      if (font) {
        this.myfont = { "font-family": font };
      }
      this.gsc_id = gsc_id;
      if (!gsc) {
        db.get("SELECT * from gsc where id = ?", this.gsc_id, (e, row) => {
          if (!e) {
            this.gsc = beautifyGsc(row);
          }
        });
      } else {
        this.gsc = beautifyGsc(gsc);
      }
    });
  }
};
</script>
<style>
body {
  padding: 0;
  margin: 0;
  opacity: 0.9;
  font-size: 16px;
  line-height: 1.75em;
  border-radius: 6px;
  padding: 1em 0.5em 0.5em 1em;
  background-color: #e4ebf2;
  color: #23345c;
}

::-webkit-scrollbar {
  width: 0px;
  height: 0px;
}
.indent {
  text-align: left;
  text-indent: 2em;
}
.center {
  text-align: center;
}
@font-face {
  font-family: "kaiti";
  src: url("assets/kaiti.ttf");
}

@font-face {
  font-family: "songkai";
  src: url("assets/songkai.ttf");
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
</style>