<template>
<span>
    <i class="el-icon-video-play" 
    v-if="status == 0 || status  == 2 || status == 3"
    @click="do_speak()"
    ></i>
    <i class="el-icon-video-pause" v-else @click="pause()"></i>
</span>
</template>
<script>
import { setTimeout } from 'timers';
const speech_instance = new window.SpeechSynthesisUtterance()
export default {
   data() {
       return{
        status: 0,  // 0 未开始 1开始 2暂停 3停止 
       }
   },
   props: ["text"],
   watch:{
       text:function(v, old_v){
           if(v != old_v){
               this.stop()
           }
       }
   },
   methods:{
       do_speak(){
           this.speak(this.text.replace(/<\/br>|&emsp;|，|？|。|！|、/g, "，，，，"))
       },
       speak(text){
           speech_instance.text = text
           speech_instance.lang = "zh-cn"
           speech_instance.rate = 0.75
           speech_instance.pitch = 0.75
           if(this.status == 0 || this.status == 3){
                window.speechSynthesis.speak(speech_instance)
           }else if(this.status == 2){
               window.speechSynthesis.resume()
           }
       },
       stop(){
           window.speechSynthesis.cancel()
           this.status = 3
       },
       pause(){
           window.speechSynthesis.pause()
           this.status = 2
       }
   },
   created(){
       speech_instance.onstart = ()=>{
           this.status = 1
       }
       speech_instance.onpause = ()=>{
           this.status = 2
       }
       speech_instance.onresume = ()=>{
           this.status = 1
       }

       speech_instance.onend = ()=>{
           if(this.status != 3){
                this.status = 3
                this.do_speak()
           }
           this.status = 3
       }
   }
}
</script>