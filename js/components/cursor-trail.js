export function initCursor() {
  const dot=document.querySelector('.cursor-dot'), canvas=document.getElementById('cursorTrail'), ctx=canvas.getContext('2d');
  let targetX=innerWidth/2,targetY=innerHeight/2,trailX=targetX,trailY=targetY,visible=false,lastTime=performance.now(),lastPointerX=targetX,lastPointerY=targetY;
  const ribbon=[]; const RIBBON_POINTS=14;
  function resizeTrail(){
    const d=devicePixelRatio||1;
    canvas.width=innerWidth*d; canvas.height=innerHeight*d;
    canvas.style.width=innerWidth+'px'; canvas.style.height=innerHeight+'px';
    ctx.setTransform(d,0,0,d,0,0);
  }
  addEventListener('resize',resizeTrail);resizeTrail();
  function clearCursor(){
    visible=false; canvas.style.opacity='0'; dot.style.opacity='0'; ribbon.length=0;
    ctx.clearRect(0,0,innerWidth,innerHeight);
  }
  addEventListener('pointerenter',e=>{
    visible=true; targetX=trailX=e.clientX; targetY=trailY=e.clientY; lastPointerX=targetX; lastPointerY=targetY;
    ribbon.length=0; canvas.style.opacity='1'; dot.style.opacity='1';
  });
  addEventListener('pointermove',e=>{
    targetX=e.clientX; targetY=e.clientY;
    dot.style.left=targetX+'px'; dot.style.top=targetY+'px';
    if(!visible){visible=true;canvas.style.opacity='1';dot.style.opacity='1'}
  });
  addEventListener('pointerleave',clearCursor);
  addEventListener('mouseleave',clearCursor);
  addEventListener('blur',clearCursor);
  function drawTrail(t){
    const dt=Math.min((t-lastTime)/16.67,2); lastTime=t;
    const vx=targetX-lastPointerX, vy=targetY-lastPointerY;
    lastPointerX=targetX; lastPointerY=targetY;
    trailX+=(targetX-trailX)*Math.min(.24*dt,1);
    trailY+=(targetY-trailY)*Math.min(.24*dt,1);
    const speed=Math.min(1,Math.hypot(vx,vy)/38);
    if(visible){
      ribbon.unshift({x:trailX,y:trailY,w:1.4+speed*2.1});
      if(ribbon.length>RIBBON_POINTS)ribbon.pop();
    }
    ctx.clearRect(0,0,innerWidth,innerHeight);
    if(visible&&ribbon.length>2){
      const head=ribbon[0], tail=ribbon[ribbon.length-1];
      const grad=ctx.createLinearGradient(tail.x,tail.y,head.x,head.y);
      grad.addColorStop(0,'rgba(250,69,0,0)');
      grad.addColorStop(.42,'rgba(250,69,0,.10)');
      grad.addColorStop(.78,'rgba(255,105,45,.34)');
      grad.addColorStop(1,'rgba(255,190,145,.88)');
      ctx.beginPath();
      ctx.moveTo(tail.x,tail.y);
      for(let i=ribbon.length-2;i>=0;i--){
        const p=ribbon[i], q=ribbon[Math.min(i+1,ribbon.length-1)];
        ctx.quadraticCurveTo(q.x,q.y,(q.x+p.x)/2,(q.y+p.y)/2);
      }
      ctx.lineTo(head.x,head.y);
      ctx.strokeStyle=grad; ctx.lineCap='round'; ctx.lineJoin='round';
      ctx.lineWidth=head.w; ctx.shadowBlur=12+speed*10; ctx.shadowColor='rgba(250,69,0,.30)'; ctx.stroke(); ctx.shadowBlur=0;
    }
    requestAnimationFrame(drawTrail);
  }
  requestAnimationFrame(drawTrail);
}