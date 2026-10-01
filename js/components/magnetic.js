export function initMagnetic() {
  document.querySelectorAll('.magnetic').forEach(el=>{
    el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();el.style.setProperty('--mx',`${(e.clientX-(r.left+r.width/2))*.08}px`);el.style.setProperty('--my',`${(e.clientY-(r.top+r.height/2))*.08}px`)});
    el.addEventListener('pointerleave',()=>{el.style.setProperty('--mx','0px');el.style.setProperty('--my','0px')});
  });
}