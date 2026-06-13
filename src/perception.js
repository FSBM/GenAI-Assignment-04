import path from 'node:path'
import { SCREENSHOT_DIR } from '../config.js'
import { log } from './logger.js'



export async function getInteractiveElements(page) {
  const els = await page.evaluate(() => {
    const selectors = 'input, textarea, select, button, a[href], [role="button"], [contenteditable=true]';
    const out = [];
    let i = 0;
    for (const element of document.querySelectorAll(selectors)) {
      const r = element.getBoundingClientRect();
      const s = getComputedStyle(element);
      const visible = r.width > 1 && r.height > 1 && s.visibility !== "hidden" && s.opacity > 0 && s.display !== 'none' &&
        r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth;

      if (!visible) continue;

      let label = element.getAttribute('aria-label') || element.getAttribute('placeholder') || '';
      if (!label && element.id) {
        const l = document.querySelector('label[for="' + CSS.escape(element.id) + '"]');
        if (l) label = l.innerText;
      }
      if (!label) label = (element.innerText || element.value || '').trim();

      out.push({
        index: i++,
        tag: element.tagName.toLowerCase(),
        type: element.getAttribute('type') || '',
        label: (label || '').replace(/\s+/g, ' ').slice(0, 60),
        x: Math.round(r.left + r.width / 2),
        y: Math.round(r.top + r.height / 2),
        w: Math.round(r.width),
        h: Math.round(r.height)
      });
    }
    return out;
  });
  log.info(`Detected ${els.length} interactive elements detected`);
  return els;
}


export async function annotatedScreenshots(page, elements, name = 'annotated') {
  await page.evaluate((elements) => {
    document.querySelectorAll('.__agent_mark').forEach((e) => e.remove());
  
  for (const element of elements) {
    const boxing_div = document.createElement('div');
    boxing_div.className = '__agent_mark';
    Object.assign(boxing_div.style, {
      position: 'fixed', left: element.x - element.w / 2 + 'px', top: element.y - element.h / 2 + 'px',
      width: element.w + 'px', height: element.h + 'px', border: '2px solid #e11',
      zIndex:2147483647, pointerEvents:'none', boxSizing:'border-box'
    })
    const num_labeling = document.createElement('span');
    num_labeling.textContent = element.index;
    Object.assign(num_labeling.style, {
      position: 'absolute', top: '-10px', left: '0px', background: '#e11',
      color:'#fff',padding:'0px 4px'
    })
    boxing_div.appendChild(num_labeling);
    document.body.appendChild(boxing_div);
  }
  }, elements);

  const p = path.join(SCREENSHOT_DIR, `${name}.png`);
  await page.screenshot({ path: p });
  await page.evaluate(() => {
    document.querySelectorAll('.__agent_mark').forEach((e) => e.remove());
  })
  return p;
}

export function elementsToText(elements) {
  return elements.map((e) => {
    const typeSuffix = e.type ? '/' + e.type : '';
    return `[${e.index}] <${e.tag}${typeSuffix}> "${e.label}" at (${e.x},${e.y})`;
  }).join('\n');
}