function splitLines(h) {
  const lines = [[]];
  [...h.childNodes].forEach((node) => {
    if (node.nodeName === 'BR') lines.push([]);
    else lines[lines.length - 1].push(node);
  });

  h.innerHTML = '';
  lines.forEach((nodes, index) => {
    if (!nodes.length) return;
    const wrap = document.createElement('div');
    wrap.className = 'reveal-line';
    const inner = document.createElement('div');
    inner.className = 'reveal-line-inner';
    inner.style.setProperty('--d', `${0.18 + index * 0.14}s`);
    nodes.forEach((node) => inner.appendChild(node));
    wrap.appendChild(inner);
    h.appendChild(wrap);
  });
}

export function initScrollReveal() {
  const triggers = [...document.querySelectorAll('.reveal-trigger')];
  if (!triggers.length) return;

  triggers.forEach((trigger) => {
    const h = trigger.querySelector('h2.reveal-item');
    if (h && !h.querySelector('.reveal-line')) {
      splitLines(h);
      h.classList.remove('reveal-item');
    }

    let n = 0;
    trigger.querySelectorAll('.reveal-item').forEach((el) => {
      let delay = 0.1 + n++ * 0.12;
      if (el.classList.contains('about-index')) delay = 0;
      else if (el.classList.contains('about-kicker')) delay = 0.08;
      else if (el.tagName === 'P' && el.closest('.about-side')) delay = 0.7;
      else if (el.classList.contains('about-tags')) delay = 0.85;
      el.style.setProperty('--d', `${delay}s`);
    });

    trigger.querySelectorAll('.about-tags span').forEach((span, i) => {
      span.style.setProperty('--i', i);
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle('is-visible', entry.isIntersecting);
    });
  }, {
    threshold: 0.18,
    rootMargin: '-5% 0px -5% 0px'
  });

  triggers.forEach((trigger) => observer.observe(trigger));
  document.querySelectorAll('.about-rule').forEach((rule) => observer.observe(rule));
}
