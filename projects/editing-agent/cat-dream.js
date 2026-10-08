(() => {
  'use strict';
  document.documentElement.classList.add('cat-dream-story');
  const phone=document.getElementById('phone'),screen=document.createElement('canvas');screen.width=128;screen.height=192;screen.className='pixel-preview';screen.setAttribute('role','img');screen.setAttribute('aria-label','像素动画：胖猫上秤、锻炼、瘦身，最后从梦中惊醒');phone.prepend(screen);
  const title=document.createElement('div'),caption=document.createElement('div');title.className='pixel-scene-title';caption.className='pixel-scene-caption';phone.append(title,caption);
  const ink='#343d36',fur='#dfa669',light='#f0c889',clay='#bd745d';
  function rect(c,x,y,w,h,color){c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),w,h);}
  function box(c,x,y,w,h,fill,border=ink){rect(c,x+3,y,w-6,h,border);rect(c,x,y+3,w,h-6,border);rect(c,x+3,y+3,w-6,h-6,fill);}
  function line(c,x,y,w,h,color=ink){rect(c,x,y,w,h,color);}
  function star(c,x,y,col='#f7dfa0'){rect(c,x-1,y-5,2,10,col);rect(c,x-5,y-1,10,2,col);rect(c,x-2,y-2,4,4,col);}
  function room(c,night=false){rect(c,0,0,128,192,night?'#667b7c':'#b9c59b');rect(c,0,130,128,62,night?'#908d78':'#cab08b');rect(c,0,129,128,3,'#748668');for(let y=142;y<192;y+=13){rect(c,0,y,128,1,'#a28d72');for(let x=(y%2)*13;x<128;x+=29)rect(c,x,y,1,13,'#a28d72');}box(c,9,26,31,45,'#e8d8a7','#526d5b');rect(c,12,29,25,39,night?'#506578':'#88a7a1');rect(c,29,34,5,5,'#ead195');rect(c,23,29,2,39,'#526d5b');rect(c,12,47,25,2,'#526d5b');box(c,91,36,22,21,'#e5d4a0','#6f765c');rect(c,99,42,7,7,clay);rect(c,104,106,16,23,'#b27657');rect(c,110,84,3,25,'#52724c');rect(c,99,82,13,7,'#698652');rect(c,112,75,10,9,'#698652');}
  function face(c,x,y,expression='happy'){const r=(a,b,w,h,col)=>rect(c,x+a,y+b,w,h,col);
    r(0,0,8,17,ink);r(34,0,8,17,ink);r(3,3,3,10,clay);r(36,3,3,10,clay);r(5,8,32,30,ink);r(0,16,42,16,ink);r(3,16,36,16,fur);r(8,11,26,24,fur);r(11,12,3,8,'#ae754e');r(20,11,3,7,'#ae754e');r(29,12,3,8,'#ae754e');
    if(expression==='sleep'){r(8,24,9,2,ink);r(26,24,9,2,ink);}else if(expression==='shock'){r(10,20,6,9,ink);r(27,20,6,9,ink);r(12,21,2,3,'#f6e7ba');r(29,21,2,3,'#f6e7ba');}else if(expression==='determined'){r(8,21,8,2,ink);r(14,23,3,4,ink);r(27,23,3,4,ink);r(28,21,8,2,ink);}else{r(10,23,6,2,ink);r(8,25,3,2,ink);r(14,25,3,2,ink);r(27,23,6,2,ink);r(25,25,3,2,ink);r(31,25,3,2,ink);}
    r(19,28,5,3,'#94564a');if(expression==='shock')r(20,32,4,4,ink);else{r(17,33,4,2,ink);r(23,33,4,2,ink);}r(5,29,7,2,'#cb8b72');r(31,29,7,2,'#cb8b72');r(-3,27,9,1,ink);r(37,27,8,1,ink);
  }
  function cat(c,x,y,{fat=true,expression='happy',pose='stand',step=0}={}){
    const resting=pose==='sleep',running=pose==='run',w=fat?52:34,h=resting?30:38;
    const bx=x+(42-w)/2,by=y+32,phase=step%2;
    c.save();c.translate(running?(phase?1:-1):0,running?-phase*2:0);
    // Tail sits behind the body; rounded stepped bands form one continuous torso.
    if(!resting){rect(c,bx+w-4,by+23,12,7,ink);rect(c,bx+w+4,by+14,6,14,ink);rect(c,bx+w-3,by+25,10,3,fur);rect(c,bx+w+6,by+16,2,10,fur);}
    const roundBody=(left,top,width,height,color)=>{const r=Math.min(8,Math.floor(height/3),Math.floor(width/4)),half=Math.ceil(r/2);rect(c,left+r,top,width-2*r,height,color);rect(c,left+half,top+half,width-2*half,height-2*half,color);rect(c,left,top+r,width,height-2*r,color);};
    roundBody(bx,by,w,h,ink);roundBody(bx+2,by+2,w-4,h-4,fur);
    roundBody(bx+8,by+9,w-16,h-13,light);
    const paw=(px,py)=>{rect(c,px+1,py,8,9,ink);rect(c,px,py+2,10,5,ink);rect(c,px+2,py+2,6,5,fur);rect(c,px+4,py+6,1,1,'#ae754e');};
    if(resting){
      // Front paws rest on the duvet; the hind legs and tail stay beneath it.
      rect(c,21,by+26,86,5,'#527a76');rect(c,23,by+31,82,17,'#88a59a');
      paw(bx+9,by+22);paw(bx+w-19,by+22);
    }else{
      paw(bx+8,by+h-4+(running?phase*2:0));paw(bx+w-18,by+h-4+(running?(1-phase)*2:0));
      const ay=by+(pose==='victory'?-5:9),move=running?(phase?4:-4):0;
      rect(c,bx+1,ay-move,7,16,ink);rect(c,bx+3,ay-move+2,4,12,fur);
      rect(c,bx+w-8,ay+move,7,16,ink);rect(c,bx+w-7,ay+move+2,4,12,fur);
    }
    face(c,x,y,expression);if(running){rect(c,x+1,y+16,39,3,clay);rect(c,x+39,y+17,7,3,clay);}c.restore();
  }
  function bed(c){box(c,17,110,92,50,'#668a87');rect(c,15,155,6,13,ink);rect(c,103,155,6,13,ink);box(c,20,106,86,14,'#dccf9f');box(c,24,111,33,15,'#eee0b8');rect(c,62,123,44,29,'#88a59a');rect(c,66,128,36,2,'#a9bca3');rect(c,66,144,36,2,'#a9bca3');}
  function snacks(c){box(c,108,143,16,20,clay);rect(c,111,148,10,7,'#ebc581');rect(c,115,144,4,4,'#ddd1a0');rect(c,4,157,10,4,'#b77b52');rect(c,7,155,4,2,'#e2bb77');}
  function scale(c,weight){box(c,37,143,55,17,'#8da99c');rect(c,41,146,47,11,'#c9d9b6');rect(c,48,147,32,8,'#354f46');c.fillStyle='#e2d895';c.font='7px monospace';c.fillText(weight,50,153);}
  function gym(c,t){rect(c,0,0,128,192,'#96b4aa');rect(c,0,132,128,60,'#b7aa85');rect(c,0,130,128,3,'#536c5f');for(let x=0;x<128;x+=16)rect(c,x,145,12,2,'#7b8b74');box(c,11,33,29,31,'#dac88e');rect(c,17,43,17,3,clay);rect(c,24,37,3,16,clay);box(c,87,35,29,49,'#bbd1be');rect(c,96,44,11,2,'#e4e1bf');rect(c,94,48,2,17,'#e4e1bf');box(c,20,143,87,11,'#40584c');for(let x=23;x<103;x+=10)rect(c,x+(Math.floor(t*12)%10),145,3,3,'#9aa894');rect(c,98,92,4,55,'#3f5548');rect(c,87,91,17,4,'#3f5548');rect(c,88,83,13,8,'#698675');}
  function render(target,index,p){const c=target.getContext('2d');c.imageSmoothingEnabled=false;c.clearRect(0,0,target.width,target.height);c.save();c.scale(target.width/128,target.height/192);
    if(index===0){room(c);bed(c);const sleep=p>.45;cat(c,43,63,{fat:true,pose:'sleep',expression:sleep?'sleep':'happy'});snacks(c);if(sleep){c.fillStyle='#f0e3b6';c.font='12px monospace';c.fillText('z',94,68-Math.floor(p*5));c.font='8px monospace';c.fillText('z',104,52);}}
    else if(index===1){room(c);const hop=Math.round(Math.max(0,1-p*4)*12);scale(c,p>.22?'8.8kg':'--.--');cat(c,43,70-hop,{fat:true,expression:p>.38?'determined':'shock'});if(p>.25){rect(c,95,75,3,11,clay);rect(c,95,89,3,3,clay);rect(c,103,79,3,8,clay);}}
    else if(index===2){gym(c,p*3);cat(c,43,67,{fat:p<.75,expression:'determined',pose:'run',step:Math.floor(p*24)});if(Math.floor(p*20)%2){rect(c,86,83,2,5,'#d9eece');rect(c,90,90,2,4,'#d9eece');}for(let i=0;i<3;i++)rect(c,5+i*7,100+i*10,10,2,'#cfdfb9');}
    else if(index===3){rect(c,0,0,128,192,'#edc789');for(let i=0;i<5;i++)rect(c,i*30-15+Math.floor(p*5),0,12,192,'#e4ba7d');rect(c,0,145,128,47,'#c9aa82');box(c,24,142,80,11,'#dac59b');cat(c,43,69,{fat:false,pose:'victory'});const phase=Math.floor(p*10)%2;[[22,60],[101,82],[19,116],[100,125]].forEach(([x,y],i)=>{if(i%2===phase)star(c,x,y);});if(p>.9){const close=Math.floor((p-.9)*10*64);rect(c,0,0,close,192,ink);rect(c,128-close,0,close,192,ink);}}
    else{room(c,true);bed(c);const surprise=p<.5;const lift=surprise?-Math.round(Math.sin(Math.min(p*3,1)*Math.PI)*7):0;cat(c,43,63+lift,{fat:true,pose:'sleep',expression:surprise?'shock':'sleep'});snacks(c);if(p<.45){rect(c,99,69,3,12,'#eedca6');rect(c,99,84,3,3,'#eedca6');}else{c.fillStyle='#e5d2a0';c.font='10px monospace';c.fillText('zZ',94,64);}}
    c.restore();
  }
  const words=[['胖猫的日常','先睡一会儿…'],['上秤的那一刻','好！今天开始锻炼！'],['说练就练','跑两步，再跑两步！'],['我，真的做到了！','感觉自己轻盈了！'],['等等…是一场梦？！','那就…明天再说。']];
  document.querySelectorAll('.asset').forEach((a,i)=>{const thumb=document.createElement('canvas');thumb.width=128;thumb.height=96;thumb.className='pixel-thumb';thumb.setAttribute('aria-hidden','true');a.prepend(thumb);const frame=document.createElement('canvas');frame.width=128;frame.height=192;render(frame,[1,2,4][i],.6);const c=thumb.getContext('2d');c.imageSmoothingEnabled=false;c.drawImage(frame,0,[68,64,58][i],128,96,0,0,128,96);});
  window.paintEditingPixel=(time,titleText,captionText,fade,shots)=>{const bounds=shots||[{from:0,to:3},{from:3,to:5},{from:5,to:8},{from:8,to:12},{from:12,to:15}];let index=bounds.findIndex(s=>time>=s.from&&time<s.to);if(index<0)index=time>=15?4:0;const p=Math.max(0,Math.min(1,(time-bounds[index].from)/(bounds[index].to-bounds[index].from)));render(screen,index,p);if(fade>0){const c=screen.getContext('2d');c.globalAlpha=fade;c.fillStyle='#eadbb5';c.fillRect(0,0,128,192);c.globalAlpha=1;}title.textContent=titleText||words[index][0];caption.textContent=captionText||words[index][1];};
  window.paintEditingPixel(0,'','',0);
})();
