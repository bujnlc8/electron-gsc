<template>
  <div :style="__font__">
    <div class="header-arrow"></div>
    <div class="content">
      <div style="font-size:16px;">
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
      <div v-if="gsc.work_dynasty" style="font-size:13px;">{{gsc.work_dynasty}}·{{gsc.work_author}}</div>
      <div
        v-if="gsc.forword !==''"
        style="font-size:0.8em;font-style:italic;text-indent: 2em;"
      >{{gsc.forward}}</div>
      <div v-html="gsc.content" :class="gsc.layout"></div>
    </div>
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
      __font__: { "font-family": "songkai" },
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
    }
  },
  created() {
    ipcRenderer.on("togetgscdetail", (event, gsc_id, font, gsc) => {
      if (font) {
        this.__font__ = { "font-family": font };
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
}
.content {
  height: 360px;
  margin-top: 5px;
  font-size: 16px;
  text-align: center;
  background-color: #e4ebf2;
  line-height: 1.75em;
  color: #23345c;
  padding: 1em 0.5em 0.5em 1em;
  border-radius: 6px;
  overflow: scroll;
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
.header-arrow {
  z-index: -1;
  position: fixed;
  top: 2px;
  left: 50%;
  margin-left: -6px;
  height: 10px;
  width: 10px;
  transform: rotate(45deg);
  background-color: #e4ebf2;
}
</style>