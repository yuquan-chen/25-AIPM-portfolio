/* Self-contained, bevelled monogram. No remote assets or runtime dependencies. */
(() => {
  'use strict';
  const canvas=document.getElementById('monogram');
  const gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:false});
  if(!gl){document.body.classList.add('no-webgl');return;}
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const vs=`attribute vec3 position;attribute vec3 normal;attribute vec3 tint;uniform mat4 projection;uniform mat4 model;varying vec3 n;varying vec3 p;varying vec3 color;void main(){vec4 world=model*vec4(position,1.0);p=world.xyz;n=mat3(model)*normal;color=tint;gl_Position=projection*world;}`;
  const fs=`precision mediump float;uniform vec3 lightPosition;uniform vec3 lightColor;uniform vec3 lightLevels;varying vec3 n;varying vec3 p;varying vec3 color;void main(){vec3 N=normalize(n);vec3 L=normalize(lightPosition-p);vec3 V=normalize(-p);vec3 H=normalize(L+V);float diffuse=max(dot(N,L),0.0);float fill=max(dot(N,normalize(vec3(4.0,1.0,2.0)-p)),0.0);float spec=pow(max(dot(N,H),0.0),46.0);float rim=pow(1.0-max(dot(N,V),0.0),3.0);vec3 c=color*(lightLevels.x+lightLevels.y*diffuse*lightColor+.10*fill)+lightColor*spec*.40*lightLevels.y+vec3(.28,.40,.32)*rim*lightLevels.z;gl_FragColor=vec4(c,1.0);}`;
  function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error('Shader compilation failed');return s;}
  let program;
  try{program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vs));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fs));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('Shader link failed');}
  catch(error){document.body.classList.add('no-webgl');return;}
  gl.useProgram(program);
  const positions=[],normals=[],colors=[];
  function triangle(a,b,c,color){const u=b.map((v,i)=>v-a[i]),v=c.map((w,i)=>w-a[i]);let n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];const length=Math.hypot(...n)||1;n=n.map(w=>-w/length);[a,b,c].forEach(p=>{positions.push(...p);normals.push(...n);colors.push(...color);});}
  function letter(cx,cy,cz,color){
    const outer=1.03,inner=.63,depth=.30,bevel=.075;
    const profile=[[outer-bevel,depth],[outer,depth-bevel],[outer,-depth+bevel],[outer-bevel,-depth],[inner+bevel,-depth],[inner,-depth+bevel],[inner,depth-bevel],[inner+bevel,depth]];
    const steps=100,start=Math.PI*.235,end=Math.PI*1.765;
    const vertex=(angle,r,z)=>[Math.cos(angle)*r+cx,Math.sin(angle)*r+cy,z+cz];
    for(let i=0;i<steps;i++){const a=start+(end-start)*i/steps,b=start+(end-start)*(i+1)/steps;for(let j=0;j<profile.length;j++){const k=(j+1)%profile.length,A=vertex(a,...profile[j]),B=vertex(b,...profile[j]),C=vertex(b,...profile[k]),D=vertex(a,...profile[k]);triangle(A,B,C,color);triangle(A,C,D,color);}}
    for(const [angle,reverse] of [[start,false],[end,true]]){const center=vertex(angle,(outer+inner)/2,0);for(let j=0;j<profile.length;j++){const a=vertex(angle,...profile[j]),b=vertex(angle,...profile[(j+1)%profile.length]);if(reverse)triangle(center,b,a,color);else triangle(center,a,b,color);}}
  }
  letter(-.63,.26,-.18,[.12,.29,.23]);letter(.67,-.26,.26,[.16,.34,.27]);
  function buffer(name,data){const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);const loc=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,3,gl.FLOAT,false,0,0);}
  buffer('position',positions);buffer('normal',normals);buffer('tint',colors);
  const projLoc=gl.getUniformLocation(program,'projection'),modelLoc=gl.getUniformLocation(program,'model');
  const lightPositionLoc=gl.getUniformLocation(program,'lightPosition'),lightColorLoc=gl.getUniformLocation(program,'lightColor'),lightLevelsLoc=gl.getUniformLocation(program,'lightLevels');
  let targetLight=window.coverLighting||{position:[-3.5,5,6],color:[1,.95,.84],power:.9,ambient:.45,dark:false};
  const currentLight={position:[...targetLight.position],color:[...targetLight.color],levels:[targetLight.ambient,targetLight.power,targetLight.dark?.5:.25]};

  window.addEventListener('coverlightchange',()=>{targetLight=window.coverLighting;requestFrame();});
  function applyLight(dt){const blend=reduce.matches?1:1-Math.exp(-3*dt);const levels=[targetLight.ambient,targetLight.power,targetLight.dark?.5:.25];for(let i=0;i<3;i++){currentLight.position[i]+=(targetLight.position[i]-currentLight.position[i])*blend;currentLight.color[i]+=(targetLight.color[i]-currentLight.color[i])*blend;currentLight.levels[i]+=(levels[i]-currentLight.levels[i])*blend;}gl.uniform3fv(lightPositionLoc,currentLight.position);gl.uniform3fv(lightColorLoc,currentLight.color);gl.uniform3fv(lightLevelsLoc,currentLight.levels);}
  gl.enable(gl.DEPTH_TEST);gl.clearColor(0,0,0,0);
  function multiply(a,b){const c=new Float32Array(16);for(let col=0;col<4;col++)for(let row=0;row<4;row++)for(let k=0;k<4;k++)c[col*4+row]+=a[k*4+row]*b[col*4+k];return c;}
  function model(x,y,z){const cx=Math.cos(x),sx=Math.sin(x),cy=Math.cos(y),sy=Math.sin(y),cz=Math.cos(z),sz=Math.sin(z);const X=[1,0,0,0,0,cx,sx,0,0,-sx,cx,0,0,0,0,1],Y=[cy,0,-sy,0,0,1,0,0,sy,0,cy,0,0,0,0,1],Z=[cz,sz,0,0,-sz,cz,0,0,0,0,1,0,0,0,0,1];const m=multiply(multiply(Z,Y),X);m[14]=-6.6;return m;}
  let width=0,height=0,targetX=0,targetY=0,mouseX=0,mouseY=0,active=true,raf=0,last=0;
  const cover=document.querySelector('.cover'),sculpture=document.querySelector('.sculpture'),signature=document.querySelector('.cover-signature');
  function resize(){const rect=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);width=Math.round(rect.width*dpr);height=Math.round(rect.height*dpr);if(!width||!height)return;canvas.width=width;canvas.height=height;gl.viewport(0,0,width,height);const aspect=width/height,f=1/Math.tan(Math.PI/10),near=.1,far=40;gl.uniformMatrix4fv(projLoc,false,new Float32Array([f/aspect,0,0,0,0,f,0,0,0,0,(far+near)/(near-far),-1,0,0,2*far*near/(near-far),0]));requestFrame();}
  cover.addEventListener('pointermove',event=>{if(event.pointerType==='touch'||reduce.matches)return;const r=cover.getBoundingClientRect();targetX=(event.clientX-r.left)/r.width-.5;targetY=(event.clientY-r.top)/r.height-.5;});
  cover.addEventListener('pointerleave',()=>{targetX=0;targetY=0;});
  function requestFrame(){if(!raf&&!document.hidden&&active)raf=requestAnimationFrame(draw);}
  function draw(time){raf=0;if(!active||document.hidden)return;const dt=Math.min((time-last)/1000,.05);last=time;const ease=1-Math.exp(-5*dt);mouseX+=(targetX-mouseX)*ease;mouseY+=(targetY-mouseY)*ease;const t=time*.001;const idle=reduce.matches?0:Math.sin(t*.43)*.17;const x=reduce.matches?-.13:-.13+mouseY*.30;const y=reduce.matches?-.43:-.43+mouseX*.8+idle;const z=reduce.matches?-.10:-.10+Math.sin(t*.32)*.025;applyLight(dt);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.uniformMatrix4fv(modelLoc,false,model(x,y,z));gl.drawArrays(gl.TRIANGLES,0,positions.length/3);if(!reduce.matches)requestFrame();}
  function scroll(){const progress=Math.min(1,Math.max(0,scrollY/cover.offsetHeight));active=progress<1;const motion=reduce.matches?0:progress;sculpture.style.transform=`translateX(-50%) translateY(${motion*55}px) scale(${1-motion*.065},${1+motion*.045})`;signature.style.opacity=String(1-progress*.75);signature.style.transform=`translateY(${motion*25}px)`;requestFrame();}
  new ResizeObserver(resize).observe(canvas);window.addEventListener('scroll',scroll,{passive:true});document.addEventListener('visibilitychange',requestFrame);reduce.addEventListener('change',requestFrame);scroll();
})();



