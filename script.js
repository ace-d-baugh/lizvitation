//create a blank object with name and gender properties
const guest = {
    name: '',
    gender: ''
};

//get the guest name and gender from the url variables
const urlParams = new URLSearchParams(window.location.search);
guest.name = urlParams.get('n') || 'Guest';
guest.gender = getWitch(urlParams.get('g'));

//get the witch from the gender
function getWitch(gender) {
    if (gender === 'm') return 'Wizard';
    else if (gender === 'f') return 'Witch';
    else if (gender === 'g') return 'Magic Folk';
    else return 'Muggle';
}

//set the guest name and gender in the invite
document.querySelector('.guest-name').textContent = guest.name;
document.querySelector('.guest-gender').textContent = guest.gender;

const REVEAL_MS = 8000;        // matches the panel's transition-delay + duration in style.css (6s + 2s)
const CLOSE_ROTATE_MS = 2000;  // matches the panel's base (no-delay) transition duration
const MAP_VIDEO_SRC = 'map.mp4';
const MAP_VIDEO_REVERSE_SRC = 'map-reverse.mp4';
const MAP_VIDEO_DURATION_MS = 4800; // fallback if the "ended" event doesn't fire

// Warm the browser's cache while the guest is looking at the landing screen,
// so neither the reveal nor the close animation stalls waiting on a download.
fetch(MAP_VIDEO_SRC, { cache: 'force-cache' }).catch(() => {});
fetch(MAP_VIDEO_REVERSE_SRC, { cache: 'force-cache' }).catch(() => {});

function createMapVideo(className, src, loop, autoplay = true) {
    const video = document.createElement('video');
    video.src = src;
    video.className = className;
    video.muted = true;
    video.autoplay = autoplay;
    video.loop = loop;
    video.preload = 'auto';
    video.playsInline = true;
    video.setAttribute('aria-hidden', 'true');
    return video;
}

// Pending timeouts for each direction are tracked so a click on one
// button mid-animation can cancel whatever the other one had queued,
// instead of both sequences fighting over the same elements.
let openTimers = [];
let closeTimers = [];

function clearTimers(timers) {
    timers.forEach(clearTimeout);
    timers.length = 0;
}

function openMap() {
    clearTimers(closeTimers);
    // in case a previous close hadn't cleaned these up yet
    document.querySelector('.map-left')?.remove();
    document.querySelector('.map-right')?.remove();

    const mapVideoLeft = createMapVideo('map-left', MAP_VIDEO_SRC, true);
    const mapVideoRight = createMapVideo('map-right', MAP_VIDEO_SRC, true);

    openTimers.push(setTimeout(function () {
        const leftPanel = document.querySelector('.left-panel');
        leftPanel.appendChild(mapVideoLeft);
        const rightPanel = document.querySelector('.right-panel');
        rightPanel.appendChild(mapVideoRight);
    }, 2500));

    // landing (button + names) disappears; the map is already showing as
    // the backdrop, so it just sits there over the speckled background
    // until the doors swing open below
    document.querySelector('.left-panel').classList.add('open');
    document.querySelector('.right-panel').classList.add('open');
    document.querySelector('#landing').classList.add('cloaked');
    document.querySelector('#close-btn').classList.remove('cloaked');
    document.querySelector('.invite-copy').classList.remove('cloaked');
    openTimers.push(setTimeout(function () {
        document.querySelector('.map').classList.add('cloaked');
        // the letter is now the only thing on screen - let the page
        // scroll so a tall invite can be read on mobile
        document.body.classList.add('letter-open');
    }, REVEAL_MS));
    document.querySelector('.wand').classList.add('spell');

    // wait a frame for the now-uncloaked letter to lay out so the shoe
    // layer has real dimensions to wander around in
    requestAnimationFrame(() => requestAnimationFrame(startShoePrints));
}

// The reverse of openMap(): the page jumps back to the top immediately (so
// a guest scrolled deep into the letter on mobile isn't left stranded
// mid-page once it's hidden), then the letter stays exactly where that
// puts it and stays visible while the doors swing shut over it (instead of
// vanishing the instant the button is clicked); only once the doors have
// fully covered it do we hide the letter, since doing that any earlier
// would be visible. The reverse clip is already loaded and paused on the
// doors (showing the same fully-drawn frame the forward clip ends on)
// before they even start closing, so there's no gap or forward replay
// glimpse - it only starts playing once the doors are shut, un-drawing the
// map back to nothing before the landing screen (button + names) returns.
//
// Note: .map itself is never cloaked here, only its video children -
// #landing lives inside .map, and visibility is an inherited CSS property,
// so cloaking .map would hide #landing too no matter what its own class
// says.
function closeMap() {
    clearTimers(openTimers);

    window.scrollTo(0, 0);
    document.body.classList.remove('letter-open');
    document.querySelector('#close-btn').classList.add('cloaked');
    document.querySelector('.wand').classList.remove('spell');
    stopShoePrints();

    // bring the map backdrop back in case the guest waited out the full
    // reveal (it would already be cloaked), so the doors are visible
    document.querySelector('.map').classList.remove('cloaked');

    // swap in the reverse clip now, paused on its first frame (the fully
    // drawn map, same as what the looping forward clip is already
    // showing) - a seamless swap with nothing visibly changing yet
    document.querySelector('.map-left')?.remove();
    document.querySelector('.map-right')?.remove();
    const reverseLeft = createMapVideo('map-left', MAP_VIDEO_REVERSE_SRC, false, false);
    const reverseRight = createMapVideo('map-right', MAP_VIDEO_REVERSE_SRC, false, false);
    document.querySelector('.left-panel').appendChild(reverseLeft);
    document.querySelector('.right-panel').appendChild(reverseRight);

    // doors are still in their rotated-open state; removing "open" swings
    // them shut over the panel's base 2s transition. The letter behind
    // stays visible and un-cloaked the whole time, so it's progressively
    // covered by the doors rather than vanishing early.
    document.querySelector('.left-panel').classList.remove('open');
    document.querySelector('.right-panel').classList.remove('open');

    closeTimers.push(setTimeout(function () {
        // doors are fully shut now, so it's safe to hide the letter -
        // doing it any earlier would be visible
        document.querySelector('.invite-copy').classList.add('cloaked');

        // now that the doors are closed, run the un-drawing animation
        reverseLeft.play();
        reverseRight.play();

        let finished = false;
        const finishClose = function () {
            if (finished) return;
            finished = true;
            reverseLeft.remove();
            reverseRight.remove();
            document.querySelector('#landing').classList.remove('cloaked');
        };
        reverseLeft.addEventListener('ended', finishClose, { once: true });
        // belt-and-suspenders in case "ended" never fires (e.g. autoplay
        // was blocked)
        closeTimers.push(setTimeout(finishClose, MAP_VIDEO_DURATION_MS));
    }, CLOSE_ROTATE_MS));
}

/* ---- Save The Date (.ics) ---- */

// Times are Eastern; October 10 2026 falls in EDT (UTC-4), so 6:00 PM ET = 22:00 UTC.
const weddingEvent = {
    uid: 'mason-elizabeth-wedding-2026-10-10@lizvitation',
    title: "Mason & Elizabeth's Wedding Celebration",
    description: "Come celebrate our wedding with us! We're so excited to have you here!",
    location: 'Orange County Sportsman Association, 9020 Kilgore Rd, Orlando, FL 32836',
    start: new Date('2026-10-10T22:00:00Z'), // 18:00 ET
    end: new Date('2026-10-11T03:00:00Z'),   // 23:00 ET
    url: 'https://www.ocsaclub.com/'
};

// Format dates in YYYYMMDDTHHMMSSZ
function formatIcsDate(date) {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

// RFC 5545 requires backslashes, semicolons, commas and newlines to be escaped
function escapeIcsText(value) {
    return String(value)
        .replace(/\\/g, '\\\\')
        .replace(/;/g, '\\;')
        .replace(/,/g, '\\,')
        .replace(/\r?\n/g, '\\n');
}

// RFC 5545 caps content lines at 75 octets; continuations start with a space
function foldIcsLine(line) {
    if (line.length <= 75) return line;
    const parts = [line.slice(0, 75)];
    let rest = line.slice(75);
    while (rest.length > 74) {
        parts.push(' ' + rest.slice(0, 74));
        rest = rest.slice(74);
    }
    if (rest.length) parts.push(' ' + rest);
    return parts.join('\r\n');
}

function buildIcs(event) {
    return [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'PRODID:-//Sepulveda Wedding//Invitation//EN',
        'BEGIN:VEVENT',
        `UID:${event.uid}`,
        `DTSTAMP:${formatIcsDate(new Date())}`,
        `DTSTART:${formatIcsDate(event.start)}`,
        `DTEND:${formatIcsDate(event.end)}`,
        `SUMMARY:${escapeIcsText(event.title)}`,
        `DESCRIPTION:${escapeIcsText(event.description)}`,
        `LOCATION:${escapeIcsText(event.location)}`,
        `URL:${event.url}`,
        'END:VEVENT',
        'END:VCALENDAR'
    ].map(foldIcsLine).join('\r\n');
}

// Build the download up front so the link is armed before anyone taps it.
function attachCalendarLink() {
    const link = document.getElementById('calendarLink');
    if (!link) return;
    const blob = new Blob([buildIcs(weddingEvent)], { type: 'text/calendar;charset=utf-8' });
    link.href = URL.createObjectURL(blob);
}

/* ---- Countdown: flip clock (months / days / hours / minutes / seconds) ---- */

const COUNTDOWN_UNITS = ['months', 'days', 'hours', 'minutes', 'seconds'];
const countdownCards = {}; // unit -> { card, leaf*Span, flap*Span, flap*El, value }

// Decorative display fonts often have built-in spacing above/below the
// glyph ink that isn't symmetric, so flex/line-height centering alone can
// still look visibly off-center. Rather than guess a pixel nudge, render
// a hidden probe with the exact same box/font, measure where the digit's
// actual ink lands with a Range (real rendering, not font-file metrics),
// and set the correction as a CSS variable the flip cards read.
function calibrateCountdownDigitOffset() {
    const probe = document.createElement('div');
    probe.style.cssText = 'position:absolute; visibility:hidden; left:-9999px; top:-9999px; ' +
        'display:flex; align-items:center; justify-content:center; ' +
        'width:2.6rem; height:2.9rem; font-family:var(--fun); font-size:1.4rem;';
    const span = document.createElement('span');
    span.textContent = '8';
    probe.appendChild(span);
    document.body.appendChild(probe);

    const boxRect = probe.getBoundingClientRect();
    const range = document.createRange();
    range.selectNodeContents(span);
    const glyphRect = range.getBoundingClientRect();

    document.body.removeChild(probe);
    if (!glyphRect.height) return; // measurement failed - leave the default (0px)

    const boxCenter = boxRect.top + boxRect.height / 2;
    const glyphCenter = glyphRect.top + glyphRect.height / 2;
    const shift = boxCenter - glyphCenter;

    document.documentElement.style.setProperty('--countdown-digit-shift', shift.toFixed(2) + 'px');
}

if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(calibrateCountdownDigitOffset);
} else {
    calibrateCountdownDigitOffset();
}

function buildCountdown(el) {
    COUNTDOWN_UNITS.forEach(function (unit) {
        const wrap = document.createElement('div');
        wrap.className = 'countdown-unit';

        const card = document.createElement('div');
        card.className = 'countdown-card';

        function makeHalf(cls) {
            const half = document.createElement('div');
            half.className = 'countdown-half ' + cls;
            const span = document.createElement('span');
            span.textContent = '00';
            half.appendChild(span);
            card.appendChild(half);
            return { half, span };
        }

        // two static halves (never animate) show the currently-settled
        // digit; two flaps sit over them and do the actual flipping
        const leafTop = makeHalf('countdown-leaf-top');
        const leafBottom = makeHalf('countdown-leaf-bottom');
        const flapBottom = makeHalf('countdown-flap-bottom');
        const flapTop = makeHalf('countdown-flap-top');

        const label = document.createElement('div');
        label.className = 'countdown-label';
        label.textContent = unit;

        wrap.appendChild(card);
        wrap.appendChild(label);
        el.appendChild(wrap);

        countdownCards[unit] = {
            card,
            leafTopSpan: leafTop.span,
            leafBottomSpan: leafBottom.span,
            flapTopSpan: flapTop.span,
            flapBottomSpan: flapBottom.span,
            flapTopEl: flapTop.half,
            flapBottomEl: flapBottom.half,
            value: null,
            resetTimer: null
        };
    });
}

// Calendar-aware breakdown - months have variable lengths, so this isn't
// just millisecond division: it counts whole months elapsed first, then
// fills in the remainder as days/hours/minutes/seconds.
function getCountdownParts(target) {
    const now = new Date();
    if (target <= now) return null;

    let months = 0;
    let cursor = new Date(now);
    while (true) {
        const next = new Date(cursor);
        next.setMonth(next.getMonth() + 1);
        if (next > target) break;
        cursor = next;
        months++;
    }

    let remainingMs = target - cursor;
    const days = Math.floor(remainingMs / 86400000);
    remainingMs -= days * 86400000;
    const hours = Math.floor(remainingMs / 3600000);
    remainingMs -= hours * 3600000;
    const minutes = Math.floor(remainingMs / 60000);
    remainingMs -= minutes * 60000;
    const seconds = Math.floor(remainingMs / 1000);

    return { months, days, hours, minutes, seconds };
}

function flipTo(unit, newValue) {
    const c = countdownCards[unit];
    if (!c) return;
    const padded = String(newValue).padStart(2, '0');
    if (c.value === padded) return; // unchanged, nothing to flip

    if (c.value === null || prefersReducedMotion()) {
        // first render, or motion reduced - just set it, no animation
        c.leafTopSpan.textContent = padded;
        c.leafBottomSpan.textContent = padded;
        c.flapTopSpan.textContent = padded;
        c.flapBottomSpan.textContent = padded;
        c.value = padded;
        return;
    }

    // the top flap still shows the OLD digit as it falls away; the new
    // digit goes underneath it (leaf-top) and onto the incoming bottom
    // flap now, hidden until each is actually revealed
    c.leafTopSpan.textContent = padded;
    c.flapBottomSpan.textContent = padded;
    c.card.classList.add('flipping');

    clearTimeout(c.resetTimer);
    c.resetTimer = setTimeout(function () {
        c.card.classList.remove('flipping');
        // land both flaps back at rest instantly, caught up with the new
        // digit, ready for the next flip
        c.flapTopEl.style.transition = 'none';
        c.flapBottomEl.style.transition = 'none';
        c.flapTopSpan.textContent = padded;
        c.leafBottomSpan.textContent = padded;
        void c.card.offsetWidth; // force reflow while transitions are off
        c.flapTopEl.style.transition = '';
        c.flapBottomEl.style.transition = '';
        c.value = padded;
    }, 500); // matches the .2s delay + .25s duration of the slower flap
}

function renderCountdown() {
    const el = document.getElementById('countdown');
    if (!el) return;

    const parts = getCountdownParts(weddingEvent.start);
    if (!parts) {
        el.classList.add('countdown-done');
        el.textContent = 'The magic is happening!';
        return;
    }

    if (!Object.keys(countdownCards).length) buildCountdown(el);

    flipTo('months', parts.months);
    flipTo('days', parts.days);
    flipTo('hours', parts.hours);
    flipTo('minutes', parts.minutes);
    flipTo('seconds', parts.seconds);
}

/* ---- Marauder's Map footprints ---- */

// Every interval is tracked so they can all be torn down together.
let shoePrintTimers = [];

function shoeLayer() {
    return document.querySelector('.shoe-layer');
}

// Footprints wander within the letter's own footprint (pun intended),
// not the full viewport, so they stay confined to the invitation text.
function shoeBounds() {
    const layer = shoeLayer();
    if (!layer) return { width: 0, height: 0 };
    return { width: layer.clientWidth, height: layer.clientHeight };
}

// Function to create shoe print
function createShoePrint(x, y, direction, isLeft) {
  const layer = shoeLayer();
  if (!layer) return;

  const shoePrint = document.createElement('div');
  shoePrint.classList.add('shoe-print');

  // Determine the rotation based on the direction
  let rotation;
  switch (direction) {
    case 'up':
      rotation = 'rotate(0deg)';
      break;
    case 'down':
      rotation = 'rotate(180deg)';
      break;
    case 'left':
      rotation = 'rotate(-90deg)';
      break;
    case 'right':
      rotation = 'rotate(90deg)';
      break;
    default:
      rotation = 'rotate(0deg)';
  }

  // Alternate between left and right shoe prints
  if (isLeft) {
    shoePrint.style.transform = `${rotation} scaleX(1)`;
  } else {
    shoePrint.style.transform = `${rotation} scaleX(-1)`;
  }

  shoePrint.style.top = `${y}px`;
  shoePrint.style.left = `${x}px`;

  layer.appendChild(shoePrint);

  // Fade out after 2 seconds
  const fadeTimer = setTimeout(() => {
    shoePrint.classList.add('fade');
    const removeTimer = setTimeout(() => {
      shoePrint.remove();
    }, 1000); // Wait for the fade transition to complete
    shoePrintTimers.push(removeTimer);
  }, 2000);
  shoePrintTimers.push(fadeTimer);
}

// Function to create shoe print trail
function createShoePrintTrail(x, y, direction) {
  let currentX = x;
  let currentY = y;
  let isOffset = false;
  let intervalId = setInterval(() => {
    createShoePrint(currentX, currentY, direction, isOffset);

    // Update position based on direction
    switch (direction) {
      case 'up':
        currentY -= 40;
        if (isOffset) {
          currentX += 15;
        } else {
          currentX -= 15;
        }
        isOffset = !isOffset;
        break;
      case 'down':
        currentY += 40;
        if (isOffset) {
          currentX += 15;
        } else {
          currentX -= 15;
        }
        isOffset = !isOffset;
        break;
      case 'left':
        currentX -= 40;
        if (isOffset) {
          currentY += 15;
        } else {
          currentY -= 15;
        }
        isOffset = !isOffset;
        break;
      case 'right':
        currentX += 40;
        if (isOffset) {
          currentY += 15;
        } else {
          currentY -= 15;
        }
        isOffset = !isOffset;
        break;
    }

    // Stop when it wanders outside the letter
    const bounds = shoeBounds();
    if (currentX < 0 || currentX > bounds.width || currentY < 0 || currentY > bounds.height) {
      clearInterval(intervalId);
    }
  }, 1000); // Create a shoe print every 1 second

  shoePrintTimers.push(intervalId);
}

// Function to generate random shoe print trails that wander around the
// invitation text for as long as the letter stays open.
function startShoePrints() {
  if (prefersReducedMotion()) return;
  if (shoePrintTimers.length) return; // already running

  let intervalId = setInterval(() => {
    const bounds = shoeBounds();
    if (!bounds.width || !bounds.height) return;

    let x = Math.random() * bounds.width;
    let y = Math.random() * bounds.height;
    let directions = ['up', 'down', 'left', 'right'];
    let direction = directions[Math.floor(Math.random() * directions.length)];

    // Start from the edge of the letter
    switch (direction) {
      case 'up':
        y = bounds.height;
        break;
      case 'down':
        y = 0;
        break;
      case 'left':
        x = bounds.width;
        break;
      case 'right':
        x = 0;
        break;
    }

    createShoePrintTrail(x, y, direction);
  }, 2000); // Generate a shoe print trail every 2 seconds

  shoePrintTimers.push(intervalId);
}

// Tear down the generator, every trail it spawned, and any prints still on screen
function stopShoePrints() {
  shoePrintTimers.forEach(clearInterval);
  shoePrintTimers.forEach(clearTimeout);
  shoePrintTimers = [];

  const layer = shoeLayer();
  if (layer) layer.innerHTML = '';
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* ---- Wiring ---- */

document.getElementById('open-btn').addEventListener('click', openMap);
document.getElementById('close-btn').addEventListener('click', closeMap);
attachCalendarLink();
renderCountdown();
setInterval(renderCountdown, 1000);
