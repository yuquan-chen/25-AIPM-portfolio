/* A room, directional window light, and a shadow map for the moving CC. */
(() => {
  'use strict';
  const canvas=document.getElementById('monogram'),gl=canvas.getContext('webgl',{alpha:true,antialias:true});
  if(!gl){document.body.classList.add('no-webgl');return;}
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),SHADOW=1024,FOV=2.8;
  const identity=new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
  const multiply=(a,b)=>{const out=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++)for(let k=0;k<4;k++)out[c*4+r]+=a[k*4+r]*b[c*4+k];return out;};
  const unit=v=>{const d=Math.hypot(...v)||1;return v.map(x=>x/d);};
  const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const dot=(a,b)=>a.reduce((sum,v,i)=>sum+v*b[i],0);
  function lookAt(eye,at){const z=unit(eye.map((v,i)=>v-at[i])),x=unit(cross([0,1,0],z)),y=cross(z,x);return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1]);}
  function ortho(size,near,far){return new Float32Array([1/size,0,0,0,0,1/size,0,0,0,0,-2/(far-near),0,0,0,-(far+near)/(far-near),1]);}
  const eye=[2.4,.4,0],cameraTarget=[0,.3,-8.4];
  const cameraForward=unit(cameraTarget.map((v,i)=>v-eye[i]));
  const cameraRight=unit(cross(cameraForward,[0,1,0]));
  const cameraUp=cross(cameraRight,cameraForward),view=lookAt(eye,cameraTarget);
  function program(vertex,fragment){
    const p=gl.createProgram();
    for(const [type,source] of [[gl.VERTEX_SHADER,vertex],[gl.FRAGMENT_SHADER,fragment]]){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));gl.attachShader(p,s);}
    gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p));return p;
  }
  const shadowCode=`
    uniform sampler2D shadowMap;uniform mat4 lightMatrix;
    float unpackDepth(vec4 c){return dot(c,vec4(1.0,1.0/255.0,1.0/65025.0,1.0/16581375.0));}
    float shadowAt(vec3 point){vec4 q=lightMatrix*vec4(point,1.0);vec3 s=q.xyz/q.w*.5+.5;if(s.x<0.0||s.x>1.0||s.y<0.0||s.y>1.0||s.z>1.0)return 0.0;float shade=0.0;for(int x=-1;x<=1;x++){for(int y=-1;y<=1;y++){float depth=unpackDepth(texture2D(shadowMap,s.xy+vec2(float(x),float(y))*1.35/1024.0));shade+=s.z-.0015>depth?1.0:0.0;}}return shade/9.0;}
  `;
  // Shared by every receiving surface, including the sculpture itself.
  const windowCode=`
    float aperture(vec2 point){
      vec2 edge=abs(point)-vec2(2.75,1.8);
      float opening=1.0-smoothstep(-.035,.035,max(edge.x,edge.y));
      float vertical=1.0-smoothstep(.045,.080,abs(point.x));
      float horizontal=1.0-smoothstep(.045,.080,abs(point.y));
      return opening*(1.0-max(vertical,horizontal));
    }
    float windowVisibility(vec3 point){
      vec3 direction=normalize(lightDirection);
      if(direction.x>=-.01)return 0.0;
      float innerT=(-3.6-point.x)/direction.x;
      float outerT=(-3.88-point.x)/direction.x;
      if(innerT<0.0||outerT<0.0)return 0.0;
      vec3 innerHit=point+direction*innerT,outerHit=point+direction*outerT;
      vec2 inner=innerHit.zy-vec2(-7.4,.65),outer=outerHit.zy-vec2(-7.4,.65);
      vec2 rim=abs(inner)-vec2(2.75,1.8);
      float reveal=1.0-smoothstep(-.035,.035,max(rim.x,rim.y));
      return aperture(outer)*reveal;
    }
  `;
  let meshProgram,roomProgram,depthProgram;
  try{
    depthProgram=program(`attribute vec3 position;uniform mat4 model;uniform mat4 lightMatrix;void main(){gl_Position=lightMatrix*model*vec4(position,1.0);}`,`precision highp float;void main(){vec4 c=fract(gl_FragCoord.z*vec4(1.0,255.0,65025.0,16581375.0));c-=c.yzww*vec4(1.0/255.0,1.0/255.0,1.0/255.0,0.0);gl_FragColor=c;}`);
    meshProgram=program(`attribute vec3 position;attribute vec3 normal;attribute vec3 tint;uniform mat4 model;uniform mat4 projection;uniform mat4 view;varying vec3 p;varying vec3 n;varying vec3 color;void main(){vec4 w=model*vec4(position,1.0);p=w.xyz;n=mat3(model)*normal;color=tint;gl_Position=projection*view*w;}`,`precision highp float;varying vec3 p;varying vec3 n;varying vec3 color;uniform vec3 eye;uniform vec3 lightDirection;uniform vec3 lightColor;uniform vec3 lampPosition;uniform vec3 levels;uniform float night;uniform float emission;uniform float furniture;uniform float wood;${shadowCode}${windowCode}
      void main(){
        vec3 N=normalize(n),L=normalize(mix(normalize(lightDirection),normalize(lampPosition-p),night)),V=normalize(eye-p),H=normalize(L+V);
        float incidence=max(dot(N,L),0.0);
        float visibility=mix(windowVisibility(p),1.0,night)*(1.0-shadowAt(p+N*.035));
        float spec=pow(max(dot(N,H),0.0),55.0);
        float skyFill=.10+.09*max(N.y,0.0)+night*.18;
        float furnitureFill=mix(.80+.10*max(N.y,0.0)+.04*max(N.z,0.0),.28+.10*max(N.y,0.0),night);
        float grain=(sin(p.x*185.0+sin(p.z*16.0)*3.0)*.012+sin(p.x*71.0+p.z*4.0)*.008)*wood;
        vec3 surface=color*(1.0+grain);
        vec3 ambient=surface*mix(levels.x+skyFill,furnitureFill,furniture);
        float falloff=mix(1.0,2.4/(1.0+dot(lampPosition-p,lampPosition-p)*.38),night);
        vec3 direct=(surface*levels.y*incidence+vec3(spec*mix(.22,.055,wood)))*mix(lightColor,vec3(1.0,.74,.43),night)*visibility*falloff;
        // The translucent shade glows; its own bulb must not overexpose its exterior.
        direct*=(1.0-step(.01,emission))*mix(1.0,mix(.75,.28,night),furniture);
        float shadeShape=.72+.28*max(dot(N,normalize(vec3(-.4,.8,.6))),0.0);
        gl_FragColor=vec4(ambient+direct+color*emission*vec3(1.0,.91,.72)*shadeShape,1.0);
      }`);
    roomProgram=program(`attribute vec2 position;varying vec2 screen;void main(){screen=position;gl_Position=vec4(position,.999,1.0);}`,`precision highp float;varying vec2 screen;uniform float aspect;uniform float fieldOfView;uniform vec3 eye;uniform vec3 cameraForward;uniform vec3 cameraRight;uniform vec3 cameraUp;uniform vec3 paper;uniform vec3 lightDirection;uniform vec3 lightColor;uniform vec3 lampPosition;uniform float night;${shadowCode}${windowCode}
      void main(){
        vec3 ray=cameraForward+cameraRight*(screen.x*aspect/fieldOfView)+cameraUp*(screen.y/fieldOfView);
        float wallT=(-14.0-eye.z)/ray.z;
        float floorT=ray.y<-.0001?(-1.58-eye.y)/ray.y:10000.0;
        float sideT=ray.x<-.0001?(-3.6-eye.x)/ray.x:10000.0;
        float hitT=min(wallT,min(floorT,sideT));
        bool floorSurface=floorT==hitT,sideSurface=sideT==hitT;
        vec3 p=eye+ray*hitT;
        vec3 base=paper*(floorSurface?.86:sideSurface?.92:1.0);
        vec3 N=floorSurface?vec3(0.0,1.0,0.0):sideSurface?vec3(1.0,0.0,0.0):vec3(0.0,0.0,1.0);
        if(sideSurface){
          vec2 uv=p.zy-vec2(-7.4,.65);
          vec2 outerBounds=abs(uv)-vec2(2.88,1.93);
          vec2 innerBounds=abs(uv)-vec2(2.75,1.8);
          if(max(outerBounds.x,outerBounds.y)<0.0){
            // The surrounding trim, reveal and glazing occupy distinct depth planes.
            vec3 trim=mix(vec3(.43,.48,.41),vec3(.16,.22,.19),night);
            if(max(innerBounds.x,innerBounds.y)>=0.0){gl_FragColor=vec4(trim,1.0);return;}
            float glassT=(-3.88-eye.x)/ray.x;vec3 glassP=eye+ray*glassT;
            vec2 glassUV=glassP.zy-vec2(-7.4,.65);
            if(abs(glassUV.x)>2.75||abs(glassUV.y)>1.8){
              float sill=glassUV.y< -1.8?1.06:.76;
              gl_FragColor=vec4(paper*sill,1.0);return;
            }
            if(abs(glassUV.x)<.065||abs(glassUV.y)<.065){gl_FragColor=vec4(trim*.92,1.0);return;}
            float skyHeight=clamp((glassUV.y+1.8)/3.6,0.0,1.0);
            vec3 sky=mix(vec3(.95,.96,.88),vec3(.72,.83,.84),skyHeight);
            sky=mix(sky,vec3(.035,.07,.095)+vec3(.015,.02,.025)*skyHeight,night);
            // A distant moon is round in the sky, then occluded by the actual window frame.
            vec3 moonDirection=normalize(vec3(-.60,.11,-.80));
            vec3 moonRight=normalize(cross(moonDirection,vec3(0.0,1.0,0.0)));
            vec3 moonUp=cross(moonRight,moonDirection);
            vec2 moonUV=vec2(dot(normalize(ray),moonRight),dot(normalize(ray),moonUp))/.021;
            float moonRadius=length(moonUV);
            float disc=1.0-smoothstep(.94,1.02,moonRadius);
            float craters=exp(-length(moonUV-vec2(-.27,.24))*9.0)*.075+exp(-length(moonUV-vec2(.35,-.18))*12.0)*.06;
            sky+=vec3(.11,.14,.17)*exp(-moonRadius*moonRadius*.25)*night;
            sky=mix(sky,vec3(.88,.89,.76)-craters,disc*night);
            float reflection=(1.0-smoothstep(.05,.25,abs(glassUV.y-glassUV.x*.32-.3)))*.045;
            gl_FragColor=vec4(sky+reflection*(1.0-night),1.0);return;
          }
        }
        float incidence=max(dot(N,normalize(lightDirection)),0.0);
        float lightMask=windowVisibility(p);
        if(floorSurface){
          float seam=exp(-abs(p.z+14.0)*4.0);base*=1.0-seam*.045;
          float joint=(1.0-smoothstep(.003,.009,abs(fract((p.x+.75)/3.6)-.5)))*.014;
          base-=joint;
        }else{
          base*=.96+.04*smoothstep(-1.58,1.8,p.y);
        }
        float visibility=1.0-shadowAt(p+N*.012);
        float texture=(fract(sin(dot(p.xz+p.xy,vec2(127.1,311.7)))*43758.5453)-.5)*.004;
        vec3 sun=vec3(1.0,.985,.92)*lightColor;
        // Occlusion removes direct light only; it must not darken ambient-lit areas twice.
        vec3 daylight=sun*lightMask*incidence*.24*visibility*(1.0-night);
        vec3 lampDelta=lampPosition-p;
        float lampIncidence=max(dot(N,normalize(lampDelta)),0.0);
        float lampDistance=dot(lampDelta,lampDelta);
        float shadeCut=mix(.12,1.0,smoothstep(-.18,.5,lampDelta.y));
        vec3 lamplight=vec3(1.0,.67,.34)*.50*lampIncidence*visibility*shadeCut/(1.0+lampDistance*.85)*night;
        vec3 result=base+daylight+lamplight;
        gl_FragColor=vec4(result+texture,1.0);
      }`);
  }catch(error){document.body.classList.add('no-webgl');return;}
  const positions=[],normals=[],colors=[];
  function tri(a,b,c,color){const n=unit(cross(c.map((v,i)=>v-a[i]),b.map((v,i)=>v-a[i])));for(const p of [a,b,c]){positions.push(...p);normals.push(...n);colors.push(...color);}}
  function letter(cx,cy,cz,color){const outer=1.03,inner=.63,depth=.30,bevel=.075;const profile=[[outer-bevel,depth],[outer,depth-bevel],[outer,-depth+bevel],[outer-bevel,-depth],[inner+bevel,-depth],[inner,-depth+bevel],[inner,depth-bevel],[inner+bevel,depth]];const start=Math.PI*.235,end=Math.PI*1.765,steps=110;const v=(a,r,z)=>[Math.cos(a)*r+cx,Math.sin(a)*r+cy,z+cz];for(let i=0;i<steps;i++){const a=start+(end-start)*i/steps,b=start+(end-start)*(i+1)/steps;for(let j=0;j<8;j++){const k=(j+1)%8,A=v(a,...profile[j]),B=v(b,...profile[j]),C=v(b,...profile[k]),D=v(a,...profile[k]);tri(A,B,C,color);tri(A,C,D,color);}}for(const [a,reverse]of[[start,false],[end,true]])for(let j=0;j<8;j++){const center=v(a,(outer+inner)/2,0),A=v(a,...profile[j]),B=v(a,...profile[(j+1)%8]);reverse?tri(center,B,A,color):tri(center,A,B,color);}}
  // Two warm clay tones keep the overlapping initials distinct from the green room.
  letter(-.63,.26,-.18,[.57,.27,.22]);letter(.67,-.26,.26,[.76,.40,.31]);
  const sculptureCount=positions.length/3,lampParts=[];
  function lathe(profile,cx,cz,color,smooth=false){
    const steps=64;
    for(let i=0;i<steps;i++){
      const a=i/steps*Math.PI*2,b=(i+1)/steps*Math.PI*2;
      const v=(r,y,t)=>[cx+Math.cos(t)*r,y,cz+Math.sin(t)*r];
      for(let j=0;j<profile.length-1;j++){
        const [r,y]=profile[j],[s,z]=profile[j+1];
        const A=v(r,y,a),B=v(r,y,b),C=v(s,z,b),D=v(s,z,a);
        if(smooth){
          const normalAt=(index,t)=>{const before=profile[Math.max(0,index-1)],after=profile[Math.min(profile.length-1,index+1)],radial=after[1]-before[1];return unit([Math.cos(t)*radial,before[0]-after[0],Math.sin(t)*radial]);};
          for(const [point,index,t]of[[A,j,a],[B,j,b],[C,j+1,b],[A,j,a],[C,j+1,b],[D,j+1,a]]){positions.push(...point);normals.push(...normalAt(index,t));colors.push(...color);}
        }else{tri(A,B,C,color);tri(A,C,D,color);}
      }
    }
  }
  function lampPart(emission,wood,build){const start=positions.length/3;build();lampParts.push({start,count:positions.length/3-start,emission,wood});}
  // Pale oak and off-white porcelain, with a restrained champagne metal stem.
  lampPart(0,1,()=>{
    for(const [x,z]of[[-.43,-.28],[.43,-.28],[-.43,.28],[.43,.28]])lathe([[0,-1.58],[.035,-1.58],[.047,-.77],[0,-.77]],x,z,[.82,.69,.53]);
    lathe([[0,-.80],[.65,-.80],[.70,-.775],[.70,-.72],[.66,-.70],[0,-.70]],0,0,[.90,.77,.60]);
  });
  lampPart(0,0,()=>{
    lathe([[0,-.70],[.24,-.70],[.25,-.67],[.22,-.62],[0,-.62]],0,0,[.94,.91,.84]);
    lathe([[0,-.62],[.027,-.62],[.027,.42],[0,.42]],0,0,[.76,.70,.58]);
  });
  lampPart(.55,0,()=>lathe([[0,.77],[.16,.755],[.31,.68],[.43,.56],[.51,.41],[.54,.28],[.52,.245]].reverse(),0,0,[.97,.95,.89],true));
  lampPart(.72,0,()=>lathe([[.52,.245],[.45,.255],[.25,.36],[.06,.46],[0,.46]].reverse(),0,0,[.99,.96,.89]));
  function buffer(data){const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);return b;}
  const geometry={position:buffer(positions),normal:buffer(normals),tint:buffer(colors)},quad=buffer([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]);
  function attribute(p,name,b,size=3){const loc=gl.getAttribLocation(p,name);if(loc<0)return;gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,size,gl.FLOAT,false,0,0);}
  const locations=new Map();function uniform(p,name){let map=locations.get(p);if(!map){map={};locations.set(p,map);}if(!(name in map))map[name]=gl.getUniformLocation(p,name);return map[name];}
  const matrix=(p,name,value)=>gl.uniformMatrix4fv(uniform(p,name),false,value);
  const vec=(p,name,value)=>gl.uniform3fv(uniform(p,name),value);
  const num=(p,name,value)=>gl.uniform1f(uniform(p,name),value);
  const depthTexture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,depthTexture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,SHADOW,SHADOW,0,gl.RGBA,gl.UNSIGNED_BYTE,null);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  const depthBuffer=gl.createRenderbuffer();gl.bindRenderbuffer(gl.RENDERBUFFER,depthBuffer);gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT16,SHADOW,SHADOW);
  const fb=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,fb);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,depthTexture,0);gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,depthBuffer);if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE){document.body.classList.add('no-webgl');return;}gl.bindFramebuffer(gl.FRAMEBUFFER,null);
  let width=1,height=1,fieldOfView=FOV,projection=identity,raf=0,last=0,active=true,targetX=0,targetY=0,mouseX=0,mouseY=0;
  let target=window.coverLighting;
  const current={direction:[...target.direction],color:[...target.color],paper:target.paper.map(v=>v/255),ambient:target.ambient,power:target.power,night:target.dark?1:0};
  const cover=document.querySelector('.cover');
  function requestFrame(){if(!raf&&active&&!document.hidden)raf=requestAnimationFrame(draw);}
  function resize(){const rect=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,1.75);width=Math.max(1,Math.round(rect.width*dpr));height=Math.max(1,Math.round(rect.height*dpr));canvas.width=width;canvas.height=height;const near=.1,far=40;fieldOfView=FOV*Math.min(1,(width/height)/1.25);projection=new Float32Array([fieldOfView/(width/height),0,0,0,0,fieldOfView,0,0,0,0,(far+near)/(near-far),-1,0,0,2*far*near/(near-far),0]);requestFrame();}
  function model(x,y,z){const cx=Math.cos(x),sx=Math.sin(x),cy=Math.cos(y),sy=Math.sin(y),cz=Math.cos(z),sz=Math.sin(z);const X=[1,0,0,0,0,cx,sx,0,0,-sx,cx,0,0,0,0,1],Y=[cy,0,-sy,0,0,1,0,0,sy,0,cy,0,0,0,0,1],Z=[cz,sz,0,0,-sz,cz,0,0,0,0,1,0,0,0,0,1];const m=multiply(multiply(Z,Y),X);for(let i=0;i<12;i++)m[i]*=.86;m[13]=.55;m[14]=-8.4;return m;}
  let lampPosition=[2.5,.29,-10.2];
  function lightUniforms(p,lightMatrix){matrix(p,'lightMatrix',lightMatrix);vec(p,'lightDirection',current.direction);vec(p,'lightColor',current.color);vec(p,'lampPosition',lampPosition);gl.uniform1i(uniform(p,'shadowMap'),0);}
  function draw(time){
    raf=0;if(!active||document.hidden)return;
    const dt=Math.min((time-last)/1000,.05);last=time;const blend=reduced.matches?1:1-Math.exp(-4*dt);
    for(let i=0;i<3;i++){current.direction[i]+=(target.direction[i]-current.direction[i])*blend;current.color[i]+=(target.color[i]-current.color[i])*blend;current.paper[i]+=(target.paper[i]/255-current.paper[i])*blend;}
    for(const [key,value]of[['ambient',target.ambient],['power',target.power],['night',target.dark?1:0]])current[key]+=(value-current[key])*blend;
    mouseX+=(targetX-mouseX)*blend;mouseY+=(targetY-mouseY)*blend;
    const t=time*.001,m=model(-.11+(reduced.matches?0:mouseY*.22),-.38+(reduced.matches?0:mouseX*.70+Math.sin(t*.40)*.13),-.08);
    const lampScale=.85,lampX=2.15;
    const lampModel=new Float32Array(identity);lampModel[0]=lampModel[5]=lampModel[10]=lampScale;lampModel[12]=lampX;lampModel[13]=-1.58+1.58*lampScale;lampModel[14]=-8.3;
    lampPosition=[lampX,.29*lampScale+lampModel[13],-8.3];
    const focus=[0,-.3,-8.4],sunDirection=unit(current.direction);const sunEye=focus.map((v,i)=>v+sunDirection[i]*22);
    // The night shadow camera sits at the bulb, so the CC shadow falls away from the lamp.
    const lampProjection=new Float32Array([.78,0,0,0,0,.78,0,0,0,0,-30.08/29.92,-1,0,0,-4.8/29.92,0]);
    const lm=current.night>.5?multiply(lampProjection,lookAt(lampPosition,[0,-1.1,-8.4])):multiply(ortho(8,.1,50),lookAt(sunEye,focus));
    gl.bindFramebuffer(gl.FRAMEBUFFER,fb);gl.viewport(0,0,SHADOW,SHADOW);gl.enable(gl.DEPTH_TEST);gl.clearColor(1,1,1,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(depthProgram);attribute(depthProgram,'position',geometry.position);matrix(depthProgram,'model',m);matrix(depthProgram,'lightMatrix',lm);gl.drawArrays(gl.TRIANGLES,0,sculptureCount);
    if(current.night<.5){matrix(depthProgram,'model',lampModel);gl.drawArrays(gl.TRIANGLES,sculptureCount,positions.length/3-sculptureCount);}
    gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,width,height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,depthTexture);
    gl.disable(gl.DEPTH_TEST);gl.useProgram(roomProgram);attribute(roomProgram,'position',quad,2);num(roomProgram,'aspect',width/height);num(roomProgram,'fieldOfView',fieldOfView);num(roomProgram,'night',current.night);vec(roomProgram,'paper',current.paper);vec(roomProgram,'eye',eye);vec(roomProgram,'cameraForward',cameraForward);vec(roomProgram,'cameraRight',cameraRight);vec(roomProgram,'cameraUp',cameraUp);lightUniforms(roomProgram,lm);gl.drawArrays(gl.TRIANGLES,0,6);
    gl.enable(gl.DEPTH_TEST);gl.useProgram(meshProgram);for(const name of ['position','normal','tint'])attribute(meshProgram,name,geometry[name]);matrix(meshProgram,'model',m);matrix(meshProgram,'projection',projection);matrix(meshProgram,'view',view);vec(meshProgram,'eye',eye);num(meshProgram,'night',current.night);num(meshProgram,'emission',0);num(meshProgram,'furniture',0);num(meshProgram,'wood',0);vec(meshProgram,'levels',[current.ambient,current.power,0]);lightUniforms(meshProgram,lm);gl.drawArrays(gl.TRIANGLES,0,sculptureCount);
    matrix(meshProgram,'model',lampModel);num(meshProgram,'furniture',1);for(const part of lampParts){num(meshProgram,'wood',part.wood);num(meshProgram,'emission',part.emission*current.night);gl.drawArrays(gl.TRIANGLES,part.start,part.count);}
    if(!reduced.matches)requestFrame();
  }
  cover.addEventListener('pointermove',event=>{if(event.pointerType==='touch'||reduced.matches)return;const r=cover.getBoundingClientRect();targetX=(event.clientX-r.left)/r.width-.5;targetY=(event.clientY-r.top)/r.height-.5;});cover.addEventListener('pointerleave',()=>{targetX=0;targetY=0;});
  function scroll(){const p=Math.max(0,Math.min(1,scrollY/cover.offsetHeight));active=p<1;requestFrame();}
  window.addEventListener('coverlightchange',()=>{target=window.coverLighting;requestFrame();});window.addEventListener('scroll',scroll,{passive:true});document.addEventListener('visibilitychange',requestFrame);reduced.addEventListener('change',requestFrame);new ResizeObserver(resize).observe(canvas);scroll();
})();





