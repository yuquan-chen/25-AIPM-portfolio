/* One shared street plan drives roads, lots, crossings and vehicle movement. */
window.createUrbanCity = function createUrbanCity(ctx) {
  'use strict';
  const W=2400, H=224, SPEED=26;
  const main=[[0,184],[100,184],[170,167],[245,167],[280,188],[335,195],[395,187],[455,171],[520,171],[565,185],[650,192],[715,176],[780,151],[818,153],[860,185],[938,190],[1040,178],[1340,178],[1400,162],[1460,165],[1520,194],[1605,198],[1690,184],[1735,177],[1820,181],[1900,200],[1970,193],[2020,169],[2090,167],[2150,185],[2220,191],[2310,178],[W,184]];
  const west=[[280,188],[268,154],[285,112],[332,83],[386,83]];
  const east=[[1735,177],[1705,144],[1715,112],[1780,84]];
  // Connected streets, with narrow lanes and a planted roundabout in between.
  const north=[[0,97],[65,91],[113,110],[170,99],[224,75],[283,78],[320,111],[398,113],[436,98],[462,105],[538,76],[590,82],[628,117],[696,128],[755,91],[817,91],[867,65],[938,74],[989,106],[1063,98],[1125,110],[1255,110],[1295,89],[1339,84],[1385,99],[1468,105],[1520,84],[1580,71],[1660,83],[1710,112],[1800,104],[1844,77],[1900,79],[1970,108],[2010,122],[2080,98],[2140,94],[2260,108],[2340,87],[W,97]];
  const circle=Array.from({length:33},(_,i)=>[2190+34*Math.cos(i*Math.PI/16),148+22*Math.sin(i*Math.PI/16)]);
  const roads=[
    {pts:main,width:14,edge:20}, {pts:west,width:6,edge:10}, {pts:east,width:6,edge:10},
    {pts:[[905,188],[923,151],[970,101],[1063,98],[1125,110],[1255,110],[1295,89],[1339,84],[1385,99],[1430,102],[1460,165]],width:7,edge:11},
    {pts:circle,width:6,edge:10},
    {pts:[[2190,170],[2208,181],[2220,191]],width:6,edge:10}
  ];
  const walkways=[
    [[190,162],[187,143],[177,121],[190,99],[236,91]],
    [[609,181],[615,157],[606,130],[617,107],[655,92]],
    [[1084,104],[1087,120],[1106,136],[1134,140]],
    [[1250,139],[1277,127],[1283,108],[1295,89]],
    [[1578,193],[1571,168],[1574,135],[1559,110],[1516,96]],
    [[1951,192],[1952,168],[1935,145],[1944,121],[1984,105]],
    [[2260,181],[2273,157],[2265,128],[2279,109],[2315,100]]
  ].map(pts=>({pts,width:5,edge:8}));
  const itinerary=main;
  const lengths=itinerary.slice(1).map((p,i)=>Math.hypot(p[0]-itinerary[i][0],p[1]-itinerary[i][1]));
  const total=lengths.reduce((a,b)=>a+b,0);
  const signals=[{x:60,y:184,offset:0},{x:218,y:167,offset:5},{x:495,y:171,offset:9},{x:1298,y:178,offset:2},{x:2070,y:167,offset:7}];
  const mod=(n,d)=>((n%d)+d)%d;
  const hash=n=>{const v=Math.sin(n*12.9898+78.233)*43758.5453;return v-Math.floor(v);};
  const rect=(g,x,y,w,h,color)=>{g.fillStyle=color;g.fillRect(Math.round(x),Math.round(y),w,h);};
  function poly(g,pts,color){g.fillStyle=color;g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();}
  let travel=atX(480),time=0,emitted=0,notes=[],waiting=false,active=false,cache=null,cacheMode='';
  const stateEl=document.getElementById('traffic-state');
  function sample(t){let lap=Math.floor(t/total),remaining=mod(t,total);for(let i=0;i<lengths.length;i++){if(remaining<=lengths[i]){const u=remaining/lengths[i],a=itinerary[i],b=itinerary[i+1];return{x:a[0]+(b[0]-a[0])*u+lap*W,y:a[1]+(b[1]-a[1])*u,dx:b[0]-a[0],dy:b[1]-a[1]};}remaining-=lengths[i];}return{x:lap*W,y:190,dx:1,dy:0};}
  function atX(x){let sum=0;for(let i=0;i<lengths.length;i++){const a=itinerary[i],b=itinerary[i+1];if(x>=a[0]&&x<=b[0])return sum+(x-a[0])/(b[0]-a[0])*lengths[i];sum+=lengths[i];}return total;}
  signals.forEach(s=>s.stop=atX(s.x-28));
  function phase(s){const t=mod(time+s.offset,18);return{t,cycle:Math.floor((time+s.offset)/18),color:t<6?'red':t<16?'green':'amber'};}
  const camera=()=>sample(travel).x-208;
  const screenX=x=>mod(x-camera()+30,W)-30;

  const soundtrack=window.createTownSound();
  function muteTail(){soundtrack.clearNotes();}
  function soundNote(index,kind,x){if(index%2)return;const beat=Math.floor(index/2);soundtrack.note(beat,['quarter','eighth','eighth','quarter'][beat%4],x);}
  function setActive(value){active=value;soundtrack.setActive(value);}
  function update(dt){time+=dt;let advance=SPEED*dt;const lap=Math.floor(travel/total);waiting=false;
    for(const s of signals){const stop=s.stop+lap*total,gap=stop-travel;if(phase(s).color!=='green'&&gap>=-.001&&gap<26){advance=Math.min(advance,Math.max(0,gap),Math.sqrt(70*Math.max(0,gap))*dt);if(gap<.06){advance=Math.max(0,gap);waiting=true;}else if(gap<1)waiting=true;}}
    travel+=advance;emitted+=advance;soundtrack.position(sample(travel).x);
    while(emitted>=14){emitted-=14;const at=sample(travel-emitted),index=Math.floor((travel-emitted)/14),kind=['eighth','sixteenth','pair','quarter'][index%4];notes.push({x:at.x,y:at.y,born:time,kind,color:['#ffe099','#b9e4be','#b3e5eb','#f4b3cc','#d3c2fb','#ffb09a','#dcea9c','#a6d8f2'][index%8]});soundNote(index,kind,mod(at.x,W));}
    notes=notes.filter(n=>time-n.born<3.6);
  }
  function jump(x){travel=atX(x);emitted=0;notes=[];waiting=false;muteTail();soundtrack.position(x);document.querySelectorAll('[data-stop]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.stop)===x)));}
  function path(g,pts,width,color,dash=false){let d=0;for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],steps=Math.ceil(Math.max(Math.abs(b[0]-a[0]),Math.abs(b[1]-a[1])));for(let j=0;j<=steps;j++)if(!dash||Math.floor((j+d)/9)%2===0)rect(g,a[0]+(b[0]-a[0])*j/steps-width/2,a[1]+(b[1]-a[1])*j/steps-width/2,width,width,color);d+=steps;}}
  function onPath(pts,fraction){const sizes=pts.slice(1).map((p,i)=>Math.hypot(p[0]-pts[i][0],p[1]-pts[i][1]));let distance=sizes.reduce((a,b)=>a+b,0)*fraction;for(let i=0;i<sizes.length;i++){if(distance<=sizes[i]){const u=distance/sizes[i];return{x:pts[i][0]+(pts[i+1][0]-pts[i][0])*u,y:pts[i][1]+(pts[i+1][1]-pts[i][1])*u};}distance-=sizes[i];}return{x:pts.at(-1)[0],y:pts.at(-1)[1]};}
  function stonePath(g,pts){path(g,pts,8,'#7a8b60');path(g,pts,6,'#bdac85');let count=0;for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],length=Math.hypot(b[0]-a[0],b[1]-a[1]);for(let d=2;d<length;d+=5){const x=a[0]+(b[0]-a[0])*d/length,y=a[1]+(b[1]-a[1])*d/length;rect(g,x-2+(count%2),y-1,3,2,count%3?'#d8c7a5':'#e5d5b3');rect(g,x-2+(count%2),y+1,3,1,'#9b927b');count++;}}}
  // Reserve the full visual silhouette (roof, sign and shadow), not just the
  // building's ground point, so artwork cannot cover a road or pavement.
  function lineHits(a,b,r){let low=0,high=1;for(let k=0;k<2;k++){const lo=k?r.y:r.x,hi=k?r.y+r.h:r.x+r.w,d=b[k]-a[k];if(Math.abs(d)<.0001){if(a[k]<lo||a[k]>hi)return false;}else{let t1=(lo-a[k])/d,t2=(hi-a[k])/d;if(t1>t2)[t1,t2]=[t2,t1];low=Math.max(low,t1);high=Math.min(high,t2);if(low>high)return false;}}return true;}
  function clearOfRoad(r){return ![...roads,...walkways].some(route=>{const margin=route.edge/2+1;const expanded={x:r.x-margin,y:r.y-margin,w:r.w+margin*2,h:r.h+margin*2};return route.pts.slice(1).some((p,i)=>lineHits(route.pts[i],p,expanded));});}
  function tree(g,x,y,p,size=1){rect(g,x+6*size,y+13*size,2*size,14*size,p.shadow);[[0,6,15,11],[3,0,9,21],[-2,10,19,7]].forEach(([a,b,w,h])=>rect(g,x+a*size,y+b*size,w*size,h*size,p.tree));rect(g,x+3*size,y+3*size,7*size,5*size,p.treeLight);rect(g,x+size,y+10*size,5*size,4*size,p.treeLight);}
  function block(g,b,p){const {x,y,w,h,type}=b;const side=type===5?'#486374':p.side;poly(g,[[x,y],[x+w+10,y-4],[x+w+19,y+6],[x+7,y+6]],'#52664d');rect(g,x,y-h,w,h,type===1?'#d7d2b1':type===5?'#8caba8':p.wall[type%5]);poly(g,[[x+w,y-h],[x+w+8,y-h-6],[x+w+8,y-6],[x+w,y]],side);poly(g,[[x,y-h],[x+8,y-h-6],[x+w+8,y-h-6],[x+w,y-h]],p.roof);rect(g,x,y-h,w,2,p.horizon);
    for(let yy=y-h+7;yy<y-8;yy+=11)for(let xx=x+5;xx<x+w-3;xx+=10){rect(g,xx,yy,5,6,p.darkWindow);rect(g,xx+1,yy+1,3,4,p.window);}rect(g,x+w/2-3,y-9,6,9,p.shadow);
    if(type===0||type===3){rect(g,x-2,y-11,w+4,3,p.roof);for(let xx=0;xx<w+4;xx+=6)rect(g,x-2+xx,y-11,3,5,p.accent);}
    if(type===1){rect(g,x+6,y-h-11,12,10,'#f0e4c1');rect(g,x+11,y-h-10,2,8,'#b65455');rect(g,x+8,y-h-7,8,2,'#b65455');rect(g,x-1,y-h+3,39,8,'#ece0bc');g.font='5px monospace';g.fillStyle='#844d49';g.fillText('HOSPITAL',x+2,y-h+9);}
    if(type===2){poly(g,[[x-3,y-h],[x+w/2,y-h-12],[x+w+3,y-h]],'#a76754');rect(g,x+9,y-h-21,1,8,p.shadow);rect(g,x+10,y-h-21,7,4,p.accent);rect(g,x+w/2-3,y-h-7,6,6,'#eee0b4');rect(g,x+w/2,y-h-6,1,3,p.shadow);rect(g,x+w/2,y-h-4,2,1,p.shadow);rect(g,x-1,y-h+3,w+2,8,'#eee0b4');g.font='5px monospace';g.fillStyle='#52644f';g.fillText('SCHOOL',x+5,y-h+9);}
    if(type===5){rect(g,x-1,y-h+3,w+2,9,'#334d68');g.font='5px monospace';g.fillStyle='#f0dfac';g.fillText('POLICE',x+5,y-h+9);poly(g,[[x+12,y-h-10],[x+20,y-h-10],[x+20,y-h-5],[x+16,y-h-2],[x+12,y-h-5]],'#e6c987');rect(g,x+14,y-h-8,4,3,'#526b7a');}
  }
  function riverX(y){return 1180+Math.round(Math.sin((y-85)/44)*10);}
  function streetHeight(pts,x){for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i];if(x>=a[0]&&x<=b[0])return a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0]);}return 97;}
  function cottage(g,x,y,w,h,index,p){
    rect(g,x-2,y-3,w+10,7,index%2?'#8d9b69':'#738958');
    rect(g,x+3,y,w+4,3,'#637352');rect(g,x,y-h,w,h,p.wall[index%5]);rect(g,x+w-4,y-h,4,h,p.side);
    if(index%3){poly(g,[[x-2,y-h],[x+5,y-h-7],[x+w-3,y-h-7],[x+w+2,y-h]],index%2?'#86504b':p.roof);rect(g,x+4,y-h-6,w-8,1,p.accent);rect(g,x+w-8,y-h-10,3,5,p.side);}
    else{rect(g,x-1,y-h-3,w+2,3,p.roof);rect(g,x+4,y-h-7,7,4,'#b4b399');rect(g,x+5,y-h-6,5,1,p.side);}
    for(let yy=y-h+5;yy<y-7;yy+=9)for(let xx=x+4;xx<x+w-4;xx+=8){rect(g,xx,yy,4,5,p.darkWindow);rect(g,xx+1,yy+1,2,3,p.window);}
    rect(g,x+w-10,y-8,5,8,p.shadow);rect(g,x+3,y-7,5,4,p.window);
    if(index%3===0){rect(g,x-1,y-10,w-2,3,p.roof);for(let xx=x;xx<x+w-2;xx+=5)rect(g,xx,y-10,2,4,p.accent);rect(g,x+3,y-18,w-10,6,p.roof);g.font='4px monospace';g.fillStyle='#efdfb8';g.fillText(['CAFE','BOOK','BAKE'][Math.floor(index/3)%3],x+4,y-13);}
    rect(g,x+w+1,y-4,3,4,'#b8755f');rect(g,x+w,y-7,5,3,p.tree);
  }
  function makeCity(p,mode){const tile=document.createElement('canvas');tile.width=W;tile.height=H;const g=tile.getContext('2d');
    g.imageSmoothingEnabled=false;
    rect(g,0,68,W,H-68,mode==='dusk'?'#82936a':'#a4b67e');
    for(let x=0;x<W;x+=4){if(x>1114&&x<1256)continue;const y=Math.min(68,Math.round(streetHeight(north,x)-30));rect(g,x,y,4,69-y,mode==='dusk'?'#82936a':'#a4b67e');}
    for(let i=0;i<3300;i++){const x=Math.floor(hash(i+41)*W),y=69+Math.floor(hash(i+141)*155);rect(g,x,y,2,1,i%3?'#a9b97e':'#678453');if(i%5===0)rect(g,x+1,y-2,1,2,'#779b61');}
    // The river corridor is reserved before laying roads and bridge deck.
    for(let y=68;y<H;y++){const x=riverX(y);rect(g,x-48,y,96,1,'#c0b590');rect(g,x-41,y,82,1,'#60897c');rect(g,x-34,y,68,1,mode==='dusk'?'#648e99':'#78a9af');rect(g,x-22,y,44,1,mode==='dusk'?'#719fa5':'#8bbac0');}
    // Promenades join both bridges; their stone color distinguishes walking paths.
    [-55,55].forEach(side=>{const pts=Array.from({length:16},(_,i)=>[riverX(70+i*10)+side,70+i*10]);path(g,pts,7,'#637e65');path(g,pts,4,'#d1bd94');});
    walkways.forEach(route=>stonePath(g,route.pts));
    roads.forEach(r=>path(g,r.pts,r.edge,mode==='dusk'?'#c8ba97':'#dfd1ad'));
    roads.forEach(r=>path(g,r.pts,r.width,mode==='dusk'?'#646373':'#71837d'));
    roads.filter(r=>r.width>=10).forEach(r=>path(g,r.pts,1,'#e0c99a',true));
    signals.forEach(s=>{rect(g,s.x-8,s.y-7,16,14,mode==='dusk'?'#646373':'#71837d');for(let xx=s.x-7;xx<s.x+8;xx+=4)rect(g,xx,s.y-6,2,12,'#efe4c3');rect(g,s.x-17,s.y-7,2,14,'#eee2c4');});
    // Bridge masonry is visibly above the river; the road stays on its deck.
    rect(g,1119,191,135,19,'#899383');rect(g,1121,194,131,2,'#b5b69c');rect(g,1121,204,131,2,'#6c7f78');
    poly(g,[[1154,212],[1154,205],[1159,205],[1159,199],[1165,199],[1165,196],[1207,196],[1207,199],[1213,199],[1213,205],[1218,205],[1218,212]],'#476b73');rect(g,1166,201,41,14,mode==='dusk'?'#719fa5':'#8bbac0');
    [163,191].forEach(y=>{rect(g,1115,y,143,3,'#c5c7a6');rect(g,1115,y+3,143,2,'#617b74');for(let x=1117;x<1258;x+=12)rect(g,x,y-5,2,8,'#e0d8b8');});
    // A smaller timber bridge carries the northern street over the same river.
    rect(g,1127,117,124,6,'#826d5a');
    [101,117].forEach(y=>{rect(g,1127,y,124,2,'#d6bb8c');for(let x=1129;x<1250;x+=15){rect(g,x,y-7,2,9,'#746a54');path(g,[[x+2,y-6],[x+14,y]],1,'#d3b58b');}});
    rect(g,1139,124,3,13,'#655e51');rect(g,1238,124,3,13,'#655e51');
    // Reeds, a wooden landing and a moored boat enliven the space between bridges.
    rect(g,1230,146,23,8,'#a18461');for(let x=1230;x<1253;x+=4)rect(g,x,146,1,8,'#cfad7b');
    poly(g,[[1199,140],[1215,140],[1212,147],[1203,147]],'#e5d4a6');rect(g,1203,140,10,3,'#9e6256');rect(g,1206,137,2,7,'#efe0b3');
    for(let y=73;y<221;y+=15){if(y>93&&y<125||y>154&&y<214)continue;[-37,37].forEach(side=>{const x=riverX(y)+side;rect(g,x,y,1,7,'#456f53');rect(g,x-3,y+2,1,5,'#647c4f');rect(g,x+2,y-1,1,8,'#94aa64');});}
    const occupied=[{x:2166,y:133,w:48,h:25}];
    const overlaps=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
    function reserve(bounds){if(!clearOfRoad(bounds)||bounds.x<1256&&bounds.x+bounds.w>1114||occupied.some(b=>overlaps(bounds,b)))return false;occupied.push(bounds);return true;}
    // Plazas are lots too, so later buildings and trees cannot cover them.
    [[400,137,30,25],[1548,132,30,25],[1000,66,28,20]].forEach(([x,y,w,h])=>{
      if(!reserve({x:x-2,y:y-2,w:w+4,h:h+4}))return;
      rect(g,x,y,w,h,'#bd8f72');rect(g,x+3,y+3,w-6,h-6,'#7e9b7a');
      g.strokeStyle='#e8dbb3';g.lineWidth=1;g.strokeRect(x+4.5,y+4.5,w-9,h-9);rect(g,x+w/2,y+4,1,h-8,'#e8dbb3');
      rect(g,x+3,y+h/2-3,5,6,'#b39a76');rect(g,x+w-8,y+h/2-3,5,6,'#b39a76');
      rect(g,x+2,y-3,1,11,p.shadow);rect(g,x,y-4,5,3,'#e3d8af');rect(g,x+w-3,y+h-9,1,11,p.shadow);rect(g,x+w-5,y+h-10,5,3,'#e3d8af');
    });
    const planned=[
      [25,165,27,31,3],[83,164,36,29,1],[232,146,27,27,0],
      [377,165,34,27,2],[561,164,34,33,5],[635,165,28,32,3],
      [709,68,34,23,5],[970,160,36,27,1],
      [1043,70,39,26,2],[1266,156,28,22,3],[1322,163,34,26,5],
      [1583,165,35,27,2],[1790,164,35,29,1],[1853,164,24,26,0],
      [2098,163,25,28,0],[2267,78,35,26,2],[2350,164,27,28,3]
    ];
    for(const [x,y,w,h,type] of planned){const bounds={x:x-4,y:y-h-(type===2?23:13),w:w+26,h:h+(type===2?23:13)+7};if(reserve(bounds))block(g,{x,y,w,h,type},p);}
    // Front doors follow the main street; each parcel uses its local road height.
    // This keeps the town continuous even where the carriageway bends.
    for(let x=8,index=0;x<W-40;index++){
      const w=23+Math.floor(hash(index+42)*9),height=25+Math.floor(hash(index+23)*17);
      const curb=Math.min(...[x-3,x+w/2,x+w+10].map(px=>streetHeight(main,px)));
      const y=Math.floor(curb-18);
      for(const h of [height,Math.max(21,height-8),19]){
        const bounds={x:x-3,y:y-h-12,w:w+12,h:h+17};
        if(!reserve(bounds))continue;
        const door=x+w-7,roadY=streetHeight(main,door);
        // A short stone doorstep connects each frontage to the pavement.
        for(let yy=y+4;yy<roadY-10;yy+=3){rect(g,door-2,yy,5,2,'#c9b99a');rect(g,door-1,yy,2,1,'#ead5ac');}
        cottage(g,x,y,w,h,index,p);
        break;
      }
      x+=w+15;
    }
    // Reserve generous tree groups behind the frontages before filling rear lots.
    for(let x=18;x<W-35;x+=113){for(let j=0;j<2;j++){
      const tx=x+j*20,ty=63+Math.floor(hash(x+j)*17),size=j?.85:1;
      const bounds={x:tx-3,y:ty-2,w:24,h:31};
      if(reserve(bounds))tree(g,tx,ty,p,size);
    }}
    for(let x=15,index=0;x<W-35;x+=40,index++){
      const w=21+Math.floor(hash(index+214)*8),h=22+Math.floor(hash(index+311)*16);
      const y=88+Math.floor(hash(index+8)*14),bounds={x:x-3,y:y-h-12,w:w+12,h:h+17};
      if(reserve(bounds))cottage(g,x,y,w,h,index+73,p);
    }
    // Neighborhood corners: little market stalls, umbrellas and public gardens.
    for(let x=35;x<W-35;x+=61){const y=132+Math.floor(hash(x+14)*18),bounds={x:x-3,y:y-12,w:23,h:24};if(!reserve(bounds))continue;
      if(Math.floor(x/61)%3===0){rect(g,x,y,17,9,'#ad805d');rect(g,x-2,y-7,21,4,p.roof);for(let j=0;j<4;j++)rect(g,x-2+j*5,y-7,3,5,j%2?'#e5cf9f':'#ba7464');rect(g,x+3,y-3,1,5,p.shadow);rect(g,x+13,y-3,1,5,p.shadow);for(let j=0;j<4;j++)rect(g,x+2+j*3,y,2,2,j%2?'#b5c978':'#e7ad78');}
      else if(Math.floor(x/61)%3===1){rect(g,x+8,y-5,1,15,p.shadow);poly(g,[[x-1,y-3],[x+2,y-9],[x+13,y-9],[x+17,y-3]],'#e3b193');rect(g,x+7,y-9,3,6,'#b46e63');rect(g,x+4,y+4,10,2,'#c2a67c');rect(g,x,y+7,3,3,p.roof);rect(g,x+16,y+7,3,3,p.roof);}
      else{rect(g,x,y-3,16,14,'#698956');for(let j=0;j<5;j++){rect(g,x+j*3,y-2,2,10,'#8da45f');rect(g,x+j*3,y-1+j%3,2,2,j%2?'#e6c184':'#d7a09b');}}
    }
    // The roundabout contains a low fountain, surrounded by flowers.
    rect(g,2173,138,34,20,'#648459');rect(g,2167,143,46,10,'#648459');
    rect(g,2181,140,19,14,'#c2ba9a');rect(g,2178,143,25,8,'#c2ba9a');rect(g,2182,144,17,6,'#7eabb0');rect(g,2189,135,3,13,'#b0c9bc');rect(g,2186,135,9,2,'#e0debc');
    [2174,2206].forEach(x=>{rect(g,x,145,3,6,'#82964d');rect(g,x-1,143,5,3,'#e4b58e');});
    // The park strip is south of the carriageway; nothing can hide the car.
    for(let x=24;x<W;x+=88){if(x>1090&&x<1290)continue;rect(g,x,210,31,14,'#74945d');rect(g,x+8,213,15,2,'#ad805d');rect(g,x+8,217,15,2,'#c39b75');rect(g,x+9,219,1,3,'#466145');rect(g,x+21,219,1,3,'#466145');for(let j=0;j<4;j++){rect(g,x+j*6,214,1,4,'#48774d');rect(g,x-1+j*6,213,3,1,j%2?'#e7c785':'#e5ae9f');}}
    for(let row=0;row<4;row++)for(let x=15+row*17;x<W;x+=23){const y=[48,91,120,153][row],bounds={x:x-3,y:y-2,w:20,h:28};if(reserve(bounds))tree(g,x,y,p,.85);}
    // Low planting and rock clusters keep the small leftover lawns inhabited.
    for(let i=0;i<480;i++){const x=8+Math.floor(hash(i+812)*2380),y=76+Math.floor(hash(i+328)*135),bounds={x:x-2,y:y-4,w:11,h:10};if(!reserve(bounds))continue;
      if(i%4===0){rect(g,x,y,6,3,'#a9ad98');rect(g,x+1,y-2,4,3,'#c6c7ae');rect(g,x+8,y+3,3,2,'#a7ac92');}
      else if(i%4===1){for(let j=0;j<3;j++){rect(g,x+j*3,y,1,5,'#57794f');rect(g,x-1+j*3,y-1+j%2,3,2,j%2?'#e3b4a9':'#e6ca8c');}}
      else{rect(g,x-1,y,10,4,'#5f7d50');rect(g,x+1,y-3,6,5,'#73925b');rect(g,x+2,y-2,3,2,'#9eaf72');}
    }
    // Lamps and bicycle racks sit below the pavement without covering the road.
    for(let x=53;x<W;x+=163){if(x>930&&x<1450)continue;rect(g,x,207,1,11,p.shadow);rect(g,x-3,207,7,2,p.roof);rect(g,x-2,208,5,2,mode==='dusk'?'#f4d394':'#cfd1ab');if(x%3===0){rect(g,x+12,212,15,1,'#65766b');for(let j=0;j<4;j++)rect(g,x+12+j*4,212,1,5,'#65766b');}}
    return tile;
  }
  function person(x,y,coat,index){const g=ctx,step=Math.floor(time*5+index)%2;rect(g,x-2,y+1,5,1,'#52674e');rect(g,x-1,y-10,3,3,'#ddb994');rect(g,x-1,y-11,3,1,'#493f3c');rect(g,x-2,y-7,5,5,coat);rect(g,x-3,y-6,1,3,'#c69b7b');rect(g,x+3,y-6,1,3,'#c69b7b');rect(g,x-1-step,y-2,1,3,'#3d4545');rect(g,x+1+step,y-2,1,3,'#3d4545');}
  function people(){const coats=['#dba07d','#b4d2ad','#88c4d0','#d2b26b','#d0a9b1'];
    walkways.forEach((route,i)=>{for(let j=0;j<2;j++){const cycle=mod(time*.025+i*.23+j*.57,2),fraction=.14+.7*(cycle<=1?cycle:2-cycle);const point=onPath(route.pts,fraction),x=screenX(point.x);if(x>-12&&x<540)person(x,point.y,coats[(i+j)%5],i+j);}});
    signals.forEach((s,i)=>{const x=screenX(s.x),ph=phase(s);if(x<0||x>528)return;const cross=ph.t>=.6&&ph.t<=4.7;for(let j=0;j<2;j++){let progress=cross?Math.min(1,Math.max(0,(ph.t-.6-j*.28)/3.5)):ph.t<.6?0:1;if(ph.cycle%2)progress=1-progress;person(x-3+j*5,s.y-16+progress*33,coats[(i+j)%5],i+j);}});
  }
  function lights(){signals.forEach(s=>{const x=screenX(s.x+11);if(x<-20||x>548)return;const ph=phase(s),y=s.y-17;rect(ctx,x,y-17,2,27,'#3b5149');rect(ctx,x-3,y-24,8,18,'#2a3e38');['red','amber','green'].forEach((color,i)=>rect(ctx,x-1,y-22+i*5,4,3,ph.color===color?{red:'#f38d80',amber:'#f4d18b',green:'#a3dba6'}[color]:'#526054'));rect(ctx,x-4,y+7,10,2,'#7c8c68');});}
  function glyph(x,y,color,kind){rect(ctx,x-1,y+1,7,5,'#433846');rect(ctx,x,y,5,4,color);rect(ctx,x+4,y-13,2,15,color);if(kind==='quarter')return;rect(ctx,x+6,y-13,5,2,color);if(kind==='pair'){rect(ctx,x+10,y-11,2,13,color);rect(ctx,x+6,y-1,5,4,color);}else{rect(ctx,x+9,y-11,2,4,color);if(kind==='sixteenth'){rect(ctx,x+6,y-7,5,2,color);rect(ctx,x+9,y-5,2,3,color);}}}
  function drawNotes(){notes.forEach(n=>{const age=time-n.born,x=n.x-camera();if(x<-20||x>548)return;ctx.globalAlpha=Math.min(1,age*6)*Math.min(1,(3.6-age)/1.2);rect(ctx,x-2,n.y,5,2,n.color);glyph(x,Math.round(n.y-9-age*9-Math.sin(age*4)*2),n.color,n.kind);});ctx.globalAlpha=1;}
  function car(){const at=sample(travel),x=208,y=Math.round(at.y),vertical=Math.abs(at.dy)>Math.abs(at.dx)*.85;rect(ctx,x-9,y+3,20,3,'#3c4444');if(vertical){rect(ctx,x-5,y-11,11,18,'#c79353');rect(ctx,x-6,y-8,2,4,'#333d42');rect(ctx,x+6,y-8,2,4,'#333d42');rect(ctx,x-6,y+2,2,4,'#333d42');rect(ctx,x+6,y+2,2,4,'#333d42');rect(ctx,x-4,y-10,9,16,'#f1d18b');rect(ctx,x-3,y-6,7,7,'#52878a');rect(ctx,x-3,y-3,7,2,'#e9c985');rect(ctx,x-3,y+(at.dy>0?5:-10),2,1,'#fff0bd');rect(ctx,x+2,y+(at.dy>0?5:-10),2,1,'#fff0bd');}else{rect(ctx,x-10,y-2,21,7,'#c6935b');rect(ctx,x-9,y-3,19,6,'#f2ce87');rect(ctx,x-5,y-8,11,6,'#f2ce87');rect(ctx,x-4,y-7,4,4,'#567f83');rect(ctx,x+1,y-7,4,4,'#638d91');rect(ctx,x-8,y+3,4,3,'#303e42');rect(ctx,x+5,y+3,4,3,'#303e42');rect(ctx,x-7,y+4,2,1,'#a6b6a5');rect(ctx,x+6,y+4,2,1,'#a6b6a5');rect(ctx,x+9,y-1,2,2,'#fff0be');rect(ctx,x-10,y,2,2,waiting?'#fc9c89':'#c9685c');}}
  function draw(p,mode){if(!cache||cacheMode!==mode){cache=makeCity(p,mode);cacheMode=mode;}const offset=Math.floor(mod(camera(),W));ctx.drawImage(cache,-offset,0);ctx.drawImage(cache,W-offset,0);
    for(let j=0;j<19;j++){const y=71+j*8;if(y>93&&y<150||y>155&&y<216)continue;const wx=riverX(y)-23+mod(time*3+j*11,43),x=screenX(wx);if(x>-20&&x<540)rect(ctx,x,y,6+j%4,1,'#b1c6bd');}
    people();lights();drawNotes();car();
    const x=mod(sample(travel).x,W);const label=waiting?'红灯 · 等行人通过':x>950&&x<1420?'沿河街区 · 两桥相连':x>1460&&x<1960?'校园街区 · 穿过小巷':x>2070&&x<2300?'社区花园 · 环岛与街角':'小城漫游 · 沿路行驶';if(stateEl&&stateEl.textContent!==label)stateEl.textContent=label;
  }
  return{update,draw,setActive,jump};
};
