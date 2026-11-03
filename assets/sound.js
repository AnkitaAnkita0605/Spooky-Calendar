// sound.js — tiny, synthesized sound effects for the Spooky October Calendar.
// No audio files needed. Sound is OFF until the visitor clicks the toggle.
//
// Usage:
//   1. Put this file in assets/ and add before </body>:  <script src="assets/sound.js"></script>
//   2. Add a button anywhere:  <button type="button" id="soundBtn">sound: off</button>
//   3. Call spookySound.play("rattle" | "scratch" | "flutter") where things happen.

(() => {
  let ctx = null;
  let on = false;
  try { on = localStorage.getItem("spooky-sound") === "on"; } catch (e) {}

  function audio() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  // One second of white noise, reused by every effect.
  let noiseBuf = null;
  function noise(c) {
    if (!noiseBuf) {
      noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    const s = c.createBufferSource();
    s.buffer = noiseBuf;
    return s;
  }

  const MASTER = 0.35; // overall volume, keep it quiet

  const sounds = {
    // Bony clicks for the swinging necklaces.
    rattle(c, t) {
      const hits = 6;
      for (let i = 0; i < hits; i++) {
        const at = t + i * (0.045 + Math.random() * 0.05);
        const src = noise(c), bp = c.createBiquadFilter(), g = c.createGain();
        bp.type = "bandpass"; bp.frequency.value = 2200 + Math.random() * 1800; bp.Q.value = 9;
        const peak = MASTER * (1 - i / hits) * 2.8;
        g.gain.setValueAtTime(0, at);
        g.gain.linearRampToValueAtTime(peak, at + 0.002);
        g.gain.exponentialRampToValueAtTime(0.0001, at + 0.04);
        src.connect(bp).connect(g).connect(c.destination);
        src.start(at, Math.random() * 0.5, 0.05);
      }
    },

    // Pen scratch while the red circle draws: a few quick back-and-forth strokes (~0.9s, like the draw).
    scratch(c, t) {
      const src = noise(c), hp = c.createBiquadFilter(), bp = c.createBiquadFilter(), g = c.createGain();
      hp.type = "highpass"; hp.frequency.value = 1500;
      bp.type = "bandpass"; bp.Q.value = 0.9; bp.frequency.value = 3800;
      g.gain.setValueAtTime(0, t);
      const strokes = 6, len = 0.15;
      for (let i = 0; i < strokes; i++) {
        const at = t + i * len, peak = MASTER * (0.5 + Math.random() * 0.15) * (i === strokes - 1 ? 0.6 : 1);
        g.gain.setValueAtTime(0.0001, at);
        g.gain.linearRampToValueAtTime(peak, at + 0.03);
        g.gain.linearRampToValueAtTime(peak * 0.7, at + len - 0.04);
        g.gain.linearRampToValueAtTime(0.0001, at + len - 0.005);
        bp.frequency.setValueAtTime(3000 + (i % 2) * 1400 + Math.random() * 400, at); // pen direction changes pitch
      }
      src.connect(hp).connect(bp).connect(g).connect(c.destination);
      src.start(t, 0, strokes * len + 0.05);
    },

    // Wing flutter that pans left to right, like the bat crossing the screen.
    flutter(c, t) {
      const dur = 1.2;
      const src = noise(c), lp = c.createBiquadFilter(), g = c.createGain(), amp = c.createGain();
      const lfo = c.createOscillator(), lfoGain = c.createGain();
      const pan = c.createStereoPanner ? c.createStereoPanner() : null;
      lp.type = "lowpass"; lp.frequency.value = 900;
      amp.gain.value = 0;
      lfo.type = "square"; lfo.frequency.value = 21; lfoGain.gain.value = 0.5;
      lfo.connect(lfoGain).connect(amp.gain);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(MASTER * 1.8, t + 0.15);
      g.gain.linearRampToValueAtTime(MASTER * 1.1, t + dur * 0.7);
      g.gain.linearRampToValueAtTime(0, t + dur);
      let node = src.connect(lp).connect(amp).connect(g);
      if (pan) {
        pan.pan.setValueAtTime(-0.9, t);
        pan.pan.linearRampToValueAtTime(0.9, t + dur);
        node = node.connect(pan);
      }
      node.connect(c.destination);
      src.start(t, 0, dur); lfo.start(t); lfo.stop(t + dur);
    }
  };

  function play(name, delay = 0) {
    if (!on || !sounds[name]) return;
    try { const c = audio(); sounds[name](c, c.currentTime + delay); } catch (e) {}
  }

  function setLabel(btn) {
    btn.textContent = on ? "sound: on" : "sound: off";
    btn.setAttribute("aria-pressed", String(on));
  }

  function wire() {
    const btn = document.getElementById("soundBtn");
    if (!btn) return;
    setLabel(btn);
    btn.addEventListener("click", () => {
      on = !on;
      try { localStorage.setItem("spooky-sound", on ? "on" : "off"); } catch (e) {}
      setLabel(btn);
      if (on) { audio(); play("rattle"); } // a little confirmation it works
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", wire);
  else wire();

  window.spookySound = { play, _sounds: sounds };
})();