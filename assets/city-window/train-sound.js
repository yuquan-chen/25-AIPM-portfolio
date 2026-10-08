/* Original, local synthesis: no downloads, samples or autoplay. */
window.createTownSound = function createTownSound() {
  'use strict';

  const slider=document.getElementById('volume'),output=document.getElementById('volume-value'),status=document.getElementById('audio-status');
  let context=null,master=null,music=null,river=null,riverPan=null;
  let enabled=false,active=false,environment=true,volume=Number(slider.value)/100,x=480;
  let suspendTimer=null,lastMix=-1,lastInstrument='拨弦 / 木琴',unavailable=false;
  const voices=new Set();
  const mod=(n,d)=>((n%d)+d)%d;
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  function smooth(param,value,seconds=.15){const now=context.currentTime;param.cancelScheduledValues(now);param.setTargetAtTime(value,now,seconds);}
  function riverStrength(){const distance=Math.abs(x-1180);const u=clamp(1-(distance-42)/215,0,1);return u*u*(3-2*u);}
  function updateLabel(){
    const value=slider.value+'%',description=unavailable?'声音暂不可用，请再次调节音量':volume===0?'静音':value;
    if(output.textContent!==value)output.textContent=value;
    if(slider.getAttribute('aria-valuetext')!==description)slider.setAttribute('aria-valuetext',description);
  }
  function noiseBuffer(seconds,water=false){
    const length=Math.floor(context.sampleRate*seconds),buffer=context.createBuffer(2,length,context.sampleRate);
    for(let channel=0;channel<2;channel++){
      const data=buffer.getChannelData(channel);let state=9187+channel*3719,low=0;
      const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
      for(let i=0;i<length;i++){
        const white=random()*2-1;low=.975*low+.025*white;
        const t=i/context.sampleRate;
        data[i]=water?(white*.045+low*.34)*(.78+.07*Math.sin(t*1.73+channel)+.04*Math.sin(t*.61)):
          white*Math.pow(1-i/length,3)*.42;
      }
      if(water){
        // Irregular, falling-pitch bubbles keep the stream from sounding like static.
        for(let t=.04;t<seconds;t+=.14+random()*.24){
          const start=Math.floor(t*context.sampleRate),duration=.06+random()*.08;
          const frequency=320+random()*520,amplitude=.012+random()*.018;let phase=0;
          for(let j=0;j<duration*context.sampleRate;j++){
            const age=j/context.sampleRate,u=age/duration;
            phase+=2*Math.PI*frequency*(1-.5*u)/context.sampleRate;
            data[(start+j)%length]+=Math.sin(phase)*Math.sin(Math.PI*u)*Math.exp(-u*4)*amplitude;
          }
        }
        // Join the loop with a brief crossfade rather than an abrupt noise edge.
        const blend=Math.floor(context.sampleRate*.08);
        for(let i=0;i<blend;i++){const u=i/blend;data[length-blend+i]=data[length-blend+i]*(1-u)+data[i]*u;}
      }
    }
    return buffer;
  }
  function buildAudio(){
    const AudioCtor=window.AudioContext||window.webkitAudioContext;
    if(!AudioCtor)throw Error('Web Audio unavailable');
    context=new AudioCtor();master=context.createGain();master.gain.value=0;
    const compressor=context.createDynamicsCompressor();compressor.threshold.value=-20;compressor.knee.value=18;compressor.ratio.value=2.5;compressor.attack.value=.025;compressor.release.value=.32;
    master.connect(compressor);compressor.connect(context.destination);
    music=context.createGain();music.gain.value=.72;music.connect(master);
    const reverb=context.createConvolver(),wet=context.createGain();reverb.buffer=noiseBuffer(.8);wet.gain.value=.08;music.connect(reverb);reverb.connect(wet);wet.connect(master);
    const stream=context.createBufferSource();stream.buffer=noiseBuffer(9,true);stream.loop=true;stream.loopStart=.08;stream.loopEnd=9;
    const high=context.createBiquadFilter(),low=context.createBiquadFilter();high.type='highpass';high.frequency.value=150;low.type='lowpass';low.frequency.value=1500;low.Q.value=.35;
    river=context.createGain();river.gain.value=0;riverPan=context.createStereoPanner();riverPan.pan.value=0;
    stream.connect(high);high.connect(low);low.connect(river);river.connect(riverPan);riverPan.connect(master);stream.start(0,.08);
  }
  function clearNotes(){
    if(!context)return;
    for(const voice of voices){smooth(voice.envelope.gain,0,.018);voice.sources.forEach(source=>{try{source.stop(context.currentTime+.09);}catch{}});}
  }
  function mix(force=false){
    if(!context)return;
    const now=context.currentTime;
    if(!force&&now-lastMix<.08)return;
    lastMix=now;
    const near=environment?riverStrength():0;
    smooth(river.gain,near*.25,.8);
    smooth(riverPan.pan,clamp((1180-x)/220,-.65,.65),.45);
    smooth(music.gain,.72-near*.08,.6);
  }
  function level(){
    if(!context)return;
    clearTimeout(suspendTimer);suspendTimer=null;
    if(enabled&&active){
      context.resume().then(()=>{unavailable=false;updateLabel();}).catch(()=>{unavailable=true;updateLabel();});
      smooth(master.gain,volume*.45,.12);mix(true);
    }else{
      smooth(master.gain,0,.025);clearNotes();
      suspendTimer=setTimeout(()=>{if(!(enabled&&active)&&context.state==='running')context.suspend().catch(()=>{});},180);
    }
  }
  const instruments={
    pluck:{name:'温暖拨弦',attack:.035,decay:.9,partials:[[1,.75,1],[2,.08,.55],[3,.02,.3]]},
    wood:{name:'轻木琴',attack:.02,decay:.72,partials:[[1,.75,1],[2,.06,.35],[4,.012,.18]]},
    bell:{name:'柔和钟琴',attack:.025,decay:1.1,partials:[[1,.72,1],[2.7,.06,.5],[5.4,.012,.2]]},
    flute:{name:'笛音',attack:.12,decay:.95,partials:[[1,.58,1],[2,.025,.75],[3,.008,.5]]}
  };
  function play(frequency,instrument,delay,velocity,length=1,pan=0){
    if(!enabled||!active||!context||context.state!=='running'||voices.size>=18)return;
    const spec=instruments[instrument],now=context.currentTime+delay,duration=spec.decay*length;
    const envelope=context.createGain(),panner=context.createStereoPanner();envelope.gain.value=.18*velocity;panner.pan.value=pan;
    envelope.connect(panner);panner.connect(music);
    const voice={envelope,sources:[],remaining:spec.partials.length};voices.add(voice);
    function ended(){if(--voice.remaining===0){voice.sources.forEach(s=>s.disconnect());envelope.disconnect();panner.disconnect();voices.delete(voice);}}
    for(const [ratio,amplitude,decay] of spec.partials){
      const osc=context.createOscillator(),gain=context.createGain();osc.type='sine';
      osc.frequency.setValueAtTime(frequency*ratio,now);
      const end=now+Math.max(spec.attack+.08,duration*decay);
      gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(amplitude,now+spec.attack);
      gain.gain.exponentialRampToValueAtTime(.0001,end);
      osc.connect(gain);gain.connect(envelope);voice.sources.push(osc);
      osc.onended=()=>{gain.disconnect();ended();};osc.start(now);osc.stop(end+.035);
    }
  }
  function note(index,kind,worldX){
    x=mod(worldX,2400);
    const near=riverStrength(),campus=x>1460&&x<1960,garden=x>2100&&x<2290;
    const instrument=near>.3?'flute':garden?'bell':campus?'wood':Math.floor(index/8)%2?'pluck':'wood';
    lastInstrument=instruments[instrument].name;updateLabel();
    const scale=[293.66,329.63,369.99,440,493.88];
    const phrases=[[0,1,2,4,2,1,0,1,2,3,4,3,2,1,2,0],[2,3,4,3,2,1,2,4,3,2,1,0,1,2,1,0]];
    const phrase=phrases[Math.floor(index/16)%2],degree=phrase[index%16];
    const velocity=.48+.16*Math.sin((index%16)/15*Math.PI),pan=Math.sin(index*.38)*.12;
    play(scale[degree],instrument,0,velocity,kind==='quarter'?1.35:1.05,pan);
    // A very quiet octave gives the phrase a soft floor without adding a new chord.
    if(index%8===0)play(scale[degree]/2,'pluck',.025,.11,1.55,0);
  }
  let volumeRevision=0;
  slider.addEventListener('input',async()=>{
    const revision=++volumeRevision;
    volume=Number(slider.value)/100;enabled=volume>0;updateLabel();
    if(!enabled){unavailable=false;level();updateLabel();return;}
    try{
      // Audio is unlocked directly by the slider's pointer/keyboard gesture.
      if(!context)buildAudio();
      await context.resume();
      if(revision!==volumeRevision)return;
      unavailable=false;level();updateLabel();
    }catch{
      if(revision!==volumeRevision)return;
      enabled=false;unavailable=true;
      if(context&&master){smooth(master.gain,0,.025);context.suspend().catch(()=>{});}
      updateLabel();
    }
  });
  updateLabel();
  return{
    note,clearNotes,
    setActive(value){if(active===value)return;active=value;level();updateLabel();},
    position(value){x=mod(value,2400);mix();updateLabel();}
  };
};
