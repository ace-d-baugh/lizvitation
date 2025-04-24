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
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}