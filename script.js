(function(){
  var board=document.getElementById('board'),cv=document.getElementById('draw'),fx=document.getElementById('fx');
  var c=cv.getContext('2d'),f=fx.getContext('2d'),dpr=Math.min(window.devicePixelRatio||1,2),W=0,H=0;
  var cols=['#f4f1e6','#ffd966','#ff9db8','#8bd8ff'],cur=cols[0],erase=false;
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function size(){
    var w=board.clientWidth,h=board.clientHeight;
    if(w===W&&h===H)return;
    W=w;H=h;
    [cv,fx].forEach(function(k){k.width=W*dpr;k.height=H*dpr});
    c.setTransform(dpr,0,0,dpr,0,0);f.setTransform(dpr,0,0,dpr,0,0);
  }
  size();window.addEventListener('resize',size);

  /* chalk drawing */
  function dust(x1,y1,x2,y2){
    var d=Math.hypot(x2-x1,y2-y1),n=Math.max(1,Math.ceil(d/2));
    for(var i=0;i<=n;i++){
      var t=i/n,x=x1+(x2-x1)*t,y=y1+(y2-y1)*t;
      if(erase){c.globalCompositeOperation='destination-out';c.beginPath();c.arc(x,y,16,0,7);c.fill();continue}
      c.globalCompositeOperation='source-over';c.fillStyle=cur;
      for(var k=0;k<5;k++){
        c.globalAlpha=.25+Math.random()*.5;
        var a=Math.random()*6.28,r=Math.random()*3.2;
        c.fillRect(x+Math.cos(a)*r,y+Math.sin(a)*r,1.4,1.4);
      }
    }
    c.globalAlpha=1;c.globalCompositeOperation='source-over';
  }
  var down=false,lx=0,ly=0;
  function pt(e){var r=cv.getBoundingClientRect();return[e.clientX-r.left,e.clientY-r.top]}
  cv.addEventListener('pointerdown',function(e){
    down=true;cv.setPointerCapture(e.pointerId);
    var p=pt(e);lx=p[0];ly=p[1];dust(lx,ly,lx,ly);
  });
  cv.addEventListener('pointermove',function(e){
    if(!down)return;var p=pt(e);dust(lx,ly,p[0],p[1]);lx=p[0];ly=p[1];
  });
  ['pointerup','pointercancel'].forEach(function(n){cv.addEventListener(n,function(){down=false})});

  /* tray */
  var chalks=document.querySelectorAll('.chalk'),eb=document.getElementById('eraser');
  function pick(btn){
    chalks.forEach(function(b){b.setAttribute('aria-pressed',b===btn)});
    eb.setAttribute('aria-pressed',btn===eb);
  }
  chalks.forEach(function(b){b.addEventListener('click',function(){cur=b.dataset.c;erase=false;pick(b)})});
  eb.addEventListener('click',function(){erase=true;pick(eb)});
  document.getElementById('clear').addEventListener('click',function(){c.clearRect(0,0,W,H)});

  /* celebration particles */
  var P=[],running=false;
  function shape(k,s){
    f.beginPath();
    if(k===0){for(var i=0;i<10;i++){var r=i%2?s*.42:s,a=i*Math.PI/5-Math.PI/2;f.lineTo(Math.cos(a)*r,Math.sin(a)*r)}f.closePath()}
    else if(k===1){f.arc(0,0,s*.6,0,7);f.moveTo(0,-s*.6);f.lineTo(s*.12,-s*.95);f.moveTo(s*.55,-s*.8);f.ellipse(s*.32,-s*.8,s*.23,s*.1,-.5,0,7)}
    else if(k===2){f.rect(-s*.15,-s*.7,s*.3,s*1.1);f.moveTo(-s*.15,s*.4);f.lineTo(0,s*.85);f.lineTo(s*.15,s*.4);f.moveTo(-s*.15,-s*.5);f.lineTo(s*.15,-s*.5)}
    else{f.moveTo(0,s*.4);f.bezierCurveTo(-s,-s*.3,-s*.3,-s*.95,0,-s*.38);f.bezierCurveTo(s*.3,-s*.95,s,-s*.3,0,s*.4)}
    f.stroke();
  }
  function loop(){
    running=true;f.clearRect(0,0,W,H);f.lineWidth=2.6;f.lineCap='round';f.lineJoin='round';
    for(var i=P.length-1;i>=0;i--){
      var p=P[i];p.vy+=.22;p.vx*=.99;p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;p.life++;
      if(p.y>H+40||p.life>280){P.splice(i,1);continue}
      f.save();f.translate(p.x,p.y);f.rotate(p.r);f.globalAlpha=Math.min(1,(280-p.life)/60);f.strokeStyle=p.c;
      shape(p.k,p.sz);f.restore();
    }
    if(P.length)requestAnimationFrame(loop);else{running=false;f.clearRect(0,0,W,H)}
  }
  function burst(x,y,n){
    for(var i=0;i<n;i++){
      var a=-Math.PI/2+(Math.random()-.5)*2.2,s=6+Math.random()*9;
      P.push({x:x,y:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,r:Math.random()*6,vr:(Math.random()-.5)*.25,k:i%4,c:cols[i%4],sz:10+Math.random()*12,life:0});
    }
    if(!running)loop();
  }
  document.getElementById('cheers').addEventListener('click',function(){
    burst(W*.2,H,28);burst(W*.5,H,34);burst(W*.8,H,28);
  });
  if(!reduce)setTimeout(function(){burst(W*.12,H,26);burst(W*.88,H,26)},4300);

  /* thank-you notes */
  var form=document.getElementById('form'),inp=document.getElementById('name'),notes=document.getElementById('notes');
  form.addEventListener('submit',function(e){
    e.preventDefault();
    var v=inp.value.trim().slice(0,40);if(!v)return;
    var li=document.createElement('li');li.textContent='Thank you, '+v;
    notes.appendChild(li);
    while(notes.children.length>3)notes.removeChild(notes.firstChild);
    inp.value='';burst(W/2,H,36);
  });
})();
