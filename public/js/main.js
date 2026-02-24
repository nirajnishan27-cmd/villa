/* ═══════════════════════════════
   NIVRRITII — Main Scripts
   ═══════════════════════════════ */

// ── Custom Cursor ──
const cur = document.getElementById('cursor');
const cr  = document.getElementById('cring');
let mx = 0, my = 0, rx = 0, ry = 0;
document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cur.style.left = mx + 'px';
  cur.style.top  = my + 'px';
});
(function loop() {
  rx += (mx - rx) * 0.12;
  ry += (my - ry) * 0.12;
  cr.style.left = rx + 'px';
  cr.style.top  = ry + 'px';
  requestAnimationFrame(loop);
})();

// ── Nav Scroll ──
window.addEventListener('scroll', () => {
  document.getElementById('nav').classList.toggle('scrolled', scrollY > 60);
});

// ── Mobile Menu ── (fixed: removed stray 'x' bug)
function toggleMob() {
  let m = document.getElementById('mob');
  if (!m) {
    m = document.createElement('div');
    m.id = 'mob';
    m.style.cssText = 'position:fixed;top:62px;left:0;right:0;z-index:499;background:rgba(13,43,26,0.98);backdrop-filter:blur(16px);padding:2rem 1.5rem;display:flex;flex-direction:column;gap:1.3rem;';
    [
      ['About',     '#about'],
      ['Amenities', '#amenities'],
      ['Gallery',   '#gallery'],
      ['Reviews',   '#reviews'],
      ['Location',  '#map-section'],
      ['Book Now',  '#booking']
    ].forEach(([t, h]) => {
      const a = document.createElement('a');
      a.textContent = t;
      a.href = h;
      a.style.cssText = 'color:#fefdf8;font-size:1.1rem;text-decoration:none;letter-spacing:0.06em;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:0.8rem;';
      a.onclick = () => m.remove();
      m.appendChild(a);
    });
    const wa = document.createElement('a');
    wa.href = 'https://wa.me/917406012727';
    wa.target = '_blank';
    wa.textContent = '💬 WhatsApp: +91 74060 12727';
    wa.style.cssText = 'color:#25D366;font-size:1rem;text-decoration:none;font-weight:500;';
    m.appendChild(wa);
    document.body.appendChild(m);
  } else {
    m.remove();
  }
}

// ── Scroll Reveal ──
const obs = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('in'), i * 90);
      obs.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.rev, .rev-l, .rev-r').forEach(el => obs.observe(el));

// ── Enquiry Form ──
async function handleSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById('submitBtn');
  const msg = document.getElementById('form-msg');
  const p = {
    firstName: document.getElementById('firstName').value,
    lastName:  document.getElementById('lastName').value,
    email:     document.getElementById('email').value,
    phone:     document.getElementById('phone').value,
    checkin:   document.getElementById('checkin').value,
    checkout:  document.getElementById('checkout').value,
    guests:    document.getElementById('guests').value,
    message:   document.getElementById('message').value,
  };
  if (!p.firstName || !p.email || !p.checkin || !p.checkout) {
    showMsg(msg, '#fff0f0', '#c0392b', '⚠️ Please fill in name, email, and dates.');
    return;
  }
  btn.textContent = 'Sending…';
  btn.disabled = true;
  try {
    const r = await fetch('/api/enquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(p)
    });
    const d = await r.json();
    if (d.success) {
      showMsg(msg, '#edf7ee', '#0d2b1a', '✅ ' + d.message);
      btn.textContent = '✓ Sent!';
      btn.style.background = '#2d7a4a';
    } else {
      showMsg(msg, '#fff0f0', '#c0392b', '❌ ' + (d.error || 'Something went wrong.'));
      btn.textContent = 'Send Enquiry';
      btn.disabled = false;
    }
  } catch {
    showMsg(msg, '#fff0f0', '#c0392b', '❌ Network error. Try WhatsApp instead!');
    btn.textContent = 'Send Enquiry';
    btn.disabled = false;
  }
}

function showMsg(el, bg, color, text) {
  el.style.display     = 'block';
  el.style.background  = bg;
  el.style.color       = color;
  el.style.padding     = '.8rem 1rem';
  el.style.borderRadius = '6px';
  el.style.marginBottom = '.8rem';
  el.style.fontSize    = '.85rem';
  el.textContent = text;
}
