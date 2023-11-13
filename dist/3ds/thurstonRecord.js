import*as e from"three";import*as t from"3ds";var i={d:(e,t)=>{for(var r in t)i.o(t,r)&&!i.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:t[r]})},o:(e,t)=>Object.prototype.hasOwnProperty.call(e,t)},r={};i.d(r,{t:()=>n});const o=(e=>{var t={};return i.d(t,e),t})({Clock:()=>e.Clock,Color:()=>e.Color,Vector2:()=>e.Vector2});const s=(e=>{var t={};return i.d(t,e),t})({BasicRenderer:()=>t.BasicRenderer,ExpFog:()=>t.ExpFog,FlatCamera:()=>t.FlatCamera,FlyControls:()=>t.FlyControls,Scene:()=>t.Scene,bind:()=>t.bind});class n{constructor(e,t={}){this.set=e,this.callback=void 0;const i=new s.ExpFog(new o.Color(0,0,0),.07);this.scene=new s.Scene({fog:i}),this.camera=new s.FlatCamera({set:this.set}),this.renderer=new s.BasicRenderer(this.camera,this.scene,{}),this.setPixelRatio(window.devicePixelRatio),this.setSize(window.innerWidth,window.innerHeight),this.renderer.setClearColor(new o.Color(0,0,.2),1),document.body.appendChild(this.renderer.domElement),this.recordSize=void 0!==t.recordSize?t.recordSize:new o.Vector2(3840,2160);const r=(0,s.bind)(this,this.onWindowResize);window.addEventListener("resize",r,!1),this.flyControls=new s.FlyControls(this.camera),this.isRecordOn=!1,this.autostart=!1,this.capture=void 0;const n=(0,s.bind)(this,this.onKeyDown);window.addEventListener("keydown",n,!1),this.clock=new o.Clock,this.recordClock=new o.Clock}setPixelRatio(e){this.renderer.setPixelRatio(e)}setSize(e,t){this.renderer.setSize(e,t)}add(e){this.scene.add(...arguments)}onWindowResize(e){this.setSize(window.innerWidth,window.innerHeight),this.camera.aspect=window.innerWidth/window.innerHeight,this.camera.updateProjectionMatrix()}recordStart(){console.log("start");const e=(0,s.bind)(this,this.onWindowResize);window.removeEventListener("resize",e),this.setSize(this.recordSize.x,this.recordSize.y),this.capture=new CCapture({framerate:24,format:"jpg"}),this.capture.start(),this.recordClock.start(),this.isRecordOn=!0}recordStop(){console.log("stop"),this.capture.stop(),this.capture.save(),this.isRecordOn=!1,this.setSize(window.innerWidth,window.innerHeight);const e=(0,s.bind)(this,this.onWindowResize);window.addEventListener("resize",e,!1)}onKeyDown(e){"r"===e.key&&(this.isRecordOn?this.recordStop():this.recordStart())}animate(){this.autostart&&void 0===this.capture&&this.recordStart();const e=this.clock.getDelta();this.flyControls.update(e),this.renderer.render(),this.isRecordOn&&this.capture.capture(this.renderer.threeRenderer.domElement),void 0!==this.callback&&this.callback()}run(){this.renderer.build();const e=(0,s.bind)(this,this.animate);this.renderer.threeRenderer.setAnimationLoop(e)}}var d=r.t;export{d as ThurstonRecord};