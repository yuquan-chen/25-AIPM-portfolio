import {spring} from 'remotion';

export const FPS = 60;
export const DURATION = 72;
export const CATEGORIES = [
  {
    key:'llm-training', number:'01', title:'LLM TRAINING',
    files:[
      {key:'data', number:'01', title:'训练数据', date:'2025年4月上旬'},
      {key:'structure', number:'02', title:'张量流', date:'2025年4月中旬'},
      {key:'state', number:'03', title:'Token 生成', date:'2025年4月下旬'},
      {key:'distribution', number:'04', title:'UMAP 分布', date:'2025年5月'},
    ],
  },
];
export const CATEGORY = CATEGORIES[0];
export const FILES = CATEGORY.files;

// The live drawer and Remotion composition use the same frame-based geometry.
export const pullAtFrame = frame => spring({frame, fps:FPS, config:{mass:1.2, damping:24, stiffness:105}, durationInFrames:DURATION, overshootClamping:true});
export const liftAtFrame = frame => spring({frame, fps:FPS, config:{mass:.85, damping:22, stiffness:150}, durationInFrames:42, overshootClamping:true});
const mix = (a,b,t) => a+(b-a)*t;

export function geometry(p, reading=0, selected=-1, mobile=false, readDepth=650) {
  const count = Math.max(FILES.length,1);
  // Keep today's four-file pull compact; each added file earns more travel,
  // while leaving room for the selected-note reader at the end of the motion.
  const spread = Math.min(readDepth-110,(mobile?160:140)+count*(mobile?30:20));
  const frontY = 69 + p*spread + reading*(readDepth-spread);
  const frontX = 84 - p*53;
  const height = frontY+147;
  const fileStep = Math.min(mobile?60:38,(mobile?210:114)/Math.max(count-1,1));
  // Each successive file rises by half a layer, creating a tighter shingled stack.
  const rowOffset = index => index*.5;
  // All extracted notes land at the original first-tab reading slot.
  const readingSlotY = 75+p*30;
  const selectedY = selected>=0 ? readingSlotY : 75;
  const readerTop = selectedY+36;
  const readerRows = Math.max(count-1,0);
  const readerReserve = readerRows*34+24;
  // Keep the remaining file tabs above the drawer's front fascia. The panel
  // grows from the selected tab into the available cavity instead of covering
  // the lower tabs or placing their hit targets behind the drawer face.
  const readerHeight = Math.max(180,Math.min(frontY-readerTop-readerReserve,height-readerTop-readerReserve));
  const folders = FILES.map((file,i) => {
    const depth = (i+.5)/count;
    const x = 98 - depth*34*p;
    const w = 604 + depth*68*p;
    const tabW = mobile ? 220 : 147;
    const tabX = x + (i%2 === 0 ? 20 : w-tabW-20);
    let y = 75 + p*(30+rowOffset(i)*fileStep);
    if (reading) {
      if (i===selected) {
        y = mix(y,selectedY,reading);
      } else {
        const rowAfterReader = i<selected ? i : i-1;
        y = mix(y,readerTop+readerHeight+12+rowAfterReader*32,reading);
      }
    }
    return {...file,x,w,y,tabX,tabW,selected:i===selected};
  });
  const first = folders[0];
  const categoryTab = first ? {x:first.tabX+first.tabW+8,y:first.y,w:240} : null;
  return {p,reading,selected,frontY,frontX,height,readerTop,readerHeight,fileStep,categoryTab,folders};
}

function folderPath(x,y,w,tabX,tabW,bottom) {
  // Folder tabs use stepped corners so the filing cabinet reads as pixel art.
  return `M ${x+8} ${y+32} H ${tabX-8} V ${y+27} H ${tabX-2} L ${tabX+6} ${y+7} H ${tabX+11} V ${y} H ${tabX+tabW-11} V ${y+7} H ${tabX+tabW-6} L ${tabX+tabW+2} ${y+27} H ${tabX+tabW+8} V ${y+32} H ${x+w-8} V ${y+40} H ${x+w} V ${bottom} H ${x} V ${y+40} H ${x+8} Z`;
}

export function sceneMarkup(g, {hover=-1, labels=false, mobile=false}={}) {
  const {p,reading,selected,frontY:y,frontX:x,folders,height} = g;
  const ink='#302f2d', paper='#fbfbf8';
  const folder = (f,i) => {
    const lift = hover===i && !reading ? 9 : 0;
    const fy=f.y-lift;
    return `<g data-folder-art="${f.key}">
      <path d="${folderPath(f.x+1,fy+6,f.w-2,f.tabX,f.tabW,y+10)}" fill="#d8d7d0"/>
      <path d="${folderPath(f.x,fy,f.w,f.tabX,f.tabW,y+8)}" fill="${hover===i?'#f5f2e8':paper}"/>
      <path d="${folderPath(f.x,fy,f.w,f.tabX,f.tabW,y+8)}" fill="#9b907c" filter="url(#paper-grain)" opacity=".04" pointer-events="none"/>
      ${labels?`<text x="${f.tabX+f.tabW/2}" y="${fy+22}" text-anchor="middle" fill="${ink}" stroke="none" font-size="15" font-family="Portfolio Pixel, monospace">${f.number}　${f.title}</text>`:''}
      <path d="M ${f.x+10} ${fy+44} H ${f.x+f.w-10}" opacity=".22" shape-rendering="crispEdges"/>
    </g>`;
  };
  const order = folders.map((f,i)=>[f,i]).filter(([f])=>!reading||!f.selected);
  if(reading && selected>=0) order.unshift([folders[selected],selected]);
  const category = g.categoryTab;
  const categoryY = category ? category.y-(hover===0&&!reading?9:0) : 0;
  const categoryMarkup = category ? `<g opacity="${Math.min(1,p*5)}"><path d="M ${category.x+10} ${categoryY+32} L ${category.x+16} ${categoryY+9} H ${category.x+23} V ${categoryY+1} H ${category.x+category.w-8} V ${categoryY+8} H ${category.x+category.w-2} L ${category.x+category.w+6} ${categoryY+32} Z" fill="#302f2d"/><text x="${category.x+category.w/2}" y="${categoryY+22}" text-anchor="middle" fill="#fffefa" stroke="none" font-size="${mobile?9:10}" font-family="Portfolio Pixel, monospace">${CATEGORY.number} / ${CATEGORY.title}</text></g>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 ${height}" aria-hidden="true" style="width:100%;height:100%;overflow:visible;display:block;shape-rendering:crispEdges">
    <defs><linearGradient id="drawer-face" x2="0" y2="1"><stop stop-color="#fffefa"/><stop offset="1" stop-color="#e7e6df"/></linearGradient><linearGradient id="drawer-floor" x2="0" y2="1"><stop stop-color="#cfcec7"/><stop offset="1" stop-color="#aaa9a2"/></linearGradient><filter id="paper-grain" x="-4%" y="-4%" width="108%" height="108%"><feTurbulence type="fractalNoise" baseFrequency=".45" numOctaves="1" seed="11"/></filter></defs>
    <g stroke="${ink}" stroke-width="1.25" stroke-linejoin="miter">
      <path d="M 81 34 L 94 23 H 706 L 719 34 V 192 H 81 Z" fill="#ecebe5"/>
      <path d="M 81 34 H 719 V 192 H 81 Z" fill="#d9d8d1"/>
      <path d="M 96 55 H 704 V 181 H 96 Z" fill="#b9b8b1"/>
      <path d="M 88 41 H 712 M 90 186 H 710" stroke="#fffefa"/>
      <path d="M 98 67 L ${x+10} ${y+17} L ${800-x-10} ${y+17} L 702 67 Z" fill="url(#drawer-floor)"/>
      <path d="M 98 64 L ${x+9} ${y+9} V ${y+92} L 98 173 Z" fill="#d2d1ca"/>
      <path d="M 702 64 L ${800-x-9} ${y+9} V ${y+92} L 702 173 Z" fill="#c4c3bc"/>
      <path d="M 105 81 L ${x+21} ${y+24} M 695 81 L ${800-x-21} ${y+24}" stroke="#fffefa" opacity="${p}"/>
      <g opacity="${Math.min(1,p*5)}">${order.map(([f,i])=>folder(f,i)).join('')}</g>
      ${categoryMarkup}
      <path d="M ${x} ${y} H ${800-x} L ${800-x+8} ${y+12} H ${x-8} Z" fill="#d2d1ca"/>
      <path d="M ${x-8} ${y+12} H ${800-x+8} L ${800-x-10} ${y+119} H ${x+10} Z" fill="url(#drawer-face)"/>
      <path d="M ${x+10} ${y+119} H ${800-x-10} L ${800-x-14} ${y+125} H ${x+14} Z" fill="#b8b7af"/>
      <path d="M ${x+5} ${y+21} H ${795-x}" stroke="#fffefa"/>
      <path d="M 362 ${y+86} H 438 V ${y+96} H 432 V ${y+101} H 368 V ${y+96} H 362 Z" fill="#4a4945"/>
      <path d="M 367 ${y+89} H 433 V ${y+94} H 367 Z" fill="#fffefa"/>
    </g>
    ${labels&&p<.9?`<g><path d="M 185 ${y+36} H 615 V ${y+68} H 609 V ${y+73} H 191 V ${y+68} H 185 Z" fill="#fffefa" stroke="${ink}"/><text x="400" y="${y+58}" text-anchor="middle" fill="${ink}" font-family="Portfolio Pixel, monospace" font-size="16">还想了解更多，打开抽屉查阅随笔区。</text></g>`:''}
  </svg>`;
}
