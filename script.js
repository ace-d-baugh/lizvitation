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

function openMap() {
    const timestamp = new Date().getTime();
    
    const mapImageLeft = document.createElement('img');
    mapImageLeft.src = `map.gif?t=${timestamp}`; // Adds unique query parameter
    mapImageLeft.className = 'map-left';
    mapImageLeft.alt = '';
    
    const mapImageRight = document.createElement('img');
    mapImageRight.src = `map.gif?t=${timestamp}`; // Same timestamp for both
    mapImageRight.className = 'map-right';
    mapImageRight.alt = '';
    
    setTimeout(function () {
        const leftPanel = document.querySelector('.left-panel');
        leftPanel.appendChild(mapImageLeft);
        const rightPanel = document.querySelector('.right-panel');
        rightPanel.appendChild(mapImageRight);
    }, 2500);

    document.querySelector('.left-panel').classList.add('open');
    document.querySelector('.right-panel').classList.add('open');
    document.querySelector('#open-btn').classList.add('cloaked');
    document.querySelector('#close-btn').classList.remove('cloaked');
    document.querySelector('.invite-copy').classList.remove('cloaked');
    setTimeout(function () {
        document.querySelector('.map').classList.add('cloaked');
    }, 8000);
    document.querySelector('.wand').classList.add('spell');
}

function closeMap() {
    document.querySelector('.left-panel').classList.remove('open');
    document.querySelector('.right-panel').classList.remove('open');
    document.querySelector('#open-btn').classList.remove('cloaked');
    document.querySelector('#close-btn').classList.add('cloaked');
    document.querySelector('.invite-copy').classList.add('cloaked');
    document.querySelector('.map').classList.remove('cloaked');
    document.querySelector('.wand').classList.remove('spell');
    setTimeout(function () {
        document.querySelector('.map-left')?.classList.add('cloaked');
        document.querySelector('.map-right')?.classList.add('cloaked');
    }, 500);
    setTimeout(function () {
        const leftPanel = document.querySelector('.left-panel');
        leftPanel.innerHTML = '';
        const rightPanel = document.querySelector('.right-panel');
        rightPanel.innerHTML = '';
    }, 5000);
}

function generateCalendarLink() {
    // Event details
    const event = {
        title: "Elizabeth & Mason's Wedding Celebration",
        description: "Come celebrate our wedding with us! We're so excited to have you here!",
        location: "3409 Maguire Rd, Windermere, FL 34786",
        start: new Date("2025-10-12T22:00:00Z"), // 18:00 ET (UTC-4)
        end: new Date("2025-10-13T03:59:59Z"),   // 23:59:59 ET (UTC-4)
        url: "https://www.pinesatwindermere.com/"
    };

    // Format dates in YYYYMMDDTHHMMSSZ
    const formatDate = (date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    // Generate ICS content
    const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//xAI//Grok 3//EN',
        'BEGIN:VEVENT',
        `UID:${new Date().getTime()}@example.com`,
        `DTSTAMP:${formatDate(new Date())}`,
        `DTSTART:${formatDate(event.start)}`,
        `DTEND:${formatDate(event.end)}`,
        `SUMMARY:${event.title}`,
        `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
        `LOCATION:${event.location}`,
        `URL:${event.url}`,
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\r\n');

    // Create a Blob with the ICS content
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);

    // Update the download link
    const link = document.getElementById('calendarLink');
    link.href = url;

    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 750);
}

// Function to create shoe print
function createShoePrint(x, y, direction, isLeft) {
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

  document.body.appendChild(shoePrint);

  // Fade out after 2 seconds
  setTimeout(() => {
    shoePrint.classList.add('fade');
    setTimeout(() => {
      shoePrint.remove();
    }, 1000); // Wait for the fade transition to complete
  }, 2000);
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

    // Stop when off-screen
    if (currentX < 0 || currentX > window.innerWidth || currentY < 0 || currentY > window.innerHeight) {
      clearInterval(intervalId);
    }
  }, 1000); // Create a shoe print every 1 second
}

// Function to generate random shoe print trails
function generateShoePrintTrails() {
  let intervalId = setInterval(() => {
    let x = Math.random() * window.innerWidth;
    let y = Math.random() * window.innerHeight;
    let directions = ['up', 'down', 'left', 'right'];
    let direction = directions[Math.floor(Math.random() * directions.length)];

    // Start from edge of screen
    switch (direction) {
      case 'up':
        y = window.innerHeight;
        break;
      case 'down':
        y = 0;
        break;
      case 'left':
        x = window.innerWidth;
        break;
      case 'right':
        x = 0;
        break;
    }

    createShoePrintTrail(x, y, direction);
  }, 2000); // Generate a shoe print trail every 2 seconds

  return intervalId;
}

// Start generating shoe print trails when the map is opened
let trailIntervalId = null;
const originalOpenMap = openMap;
openMap = function() {
  originalOpenMap();
  trailIntervalId = generateShoePrintTrails();
}

const originalCloseMap = closeMap;
closeMap = function() {
  originalCloseMap();
  if (trailIntervalId !== null) {
    clearInterval(trailIntervalId);
    trailIntervalId = null;
  }
  stopShoePrints();
}
// Function to stop generating shoe prints
function stopShoePrints() {
  // No implementation needed in this case
}