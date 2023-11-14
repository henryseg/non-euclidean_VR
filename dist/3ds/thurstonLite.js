import*as e from"three";import*as t from"dat.gui";import*as i from"stats";import*as s from"3ds";var r={d:(e,t)=>{for(var i in t)r.o(t,i)&&!r.o(e,i)&&Object.defineProperty(e,i,{enumerable:!0,get:t[i]})},o:(e,t)=>Object.prototype.hasOwnProperty.call(e,t)},n={};r.d(n,{N:()=>c});const a=(e=>{var t={};return r.d(t,e),t})({Clock:()=>e.Clock,Color:()=>e.Color});const o=(e=>{var t={};return r.d(t,e),t})({GUI:()=>t.GUI});const d=(e=>{var t={};return r.d(t,e),t})({default:()=>i.default});const h=(e=>{var t={};return r.d(t,e),t})({BasicRenderer:()=>s.BasicRenderer,ExpFog:()=>s.ExpFog,FlyControls:()=>s.FlyControls,Scene:()=>s.Scene,SphereCamera:()=>s.SphereCamera,bind:()=>s.bind});class c{constructor(e,t={}){this.set=e,this.callback=void 0;const i=new h.ExpFog(new a.Color(0,0,0),.07);this.scene=new h.Scene({fog:i}),this._camera=new h.SphereCamera({set:this.set}),this.renderer=new h.BasicRenderer(this.camera,this.scene,{}),this.setPixelRatio(window.devicePixelRatio),this.setSize(window.innerWidth,window.innerHeight),this.renderer.setClearColor(new a.Color(0,0,.2),1),document.body.appendChild(this.renderer.domElement);const s=(0,h.bind)(this,this.onWindowResize);window.addEventListener("resize",s,!1),this.flyControls=new h.FlyControls(this.camera),this.clock=new a.Clock,this.stats=void 0,this.gui=void 0}get camera(){return this._camera}set camera(e){this._camera=e,this.renderer.camera=e}setPixelRatio(e){this.renderer.setPixelRatio(e)}setSize(e,t){this.renderer.setSize(e,t)}initGUI(){this.gui=new o.GUI,this.gui.close(),this.gui.add({help:function(){window.open("https://3-dimensional.space")}},"help").name("Help/About");const e=this.gui.addFolder("Camera");return e.add(this.camera,"maxDist",0,100,1).name("Max distance"),e.add(this.camera,"maxSteps",20,500,1).name("Max steps"),e.add(this.camera,"threshold").name("Threshold"),this}initStats(){return this.stats=new d.default,this.stats.showPanel(0),document.body.appendChild(this.stats.dom),this}add(e){this.scene.add(...arguments)}onWindowResize(e){this.setSize(window.innerWidth,window.innerHeight),this.camera.aspect=window.innerWidth/window.innerHeight,this.camera.updateProjectionMatrix()}animate(){const e=this.clock.getDelta();this.flyControls.update(e),this.renderer.render(),void 0!==this.callback&&this.callback(),this.stats.update()}run(){this.initStats(),this.initGUI(),this.renderer.build();const e=(0,h.bind)(this,this.animate);this.renderer.threeRenderer.setAnimationLoop(e)}}var l=n.N;export{l as ThurstonLite};