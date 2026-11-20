
const d = invitationData;

const set = (id, value) => {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
};

// ===================================
// ДАННЫЕ ПРИГЛАШЕНИЯ
// ===================================

set('eventType', d.eventType);
set('brideName', d.brideName);

set(
  'brideNameSecond',
  d.brideName.charAt(0) +
  d.brideName.slice(1).toLowerCase() + 'нын'
);

set('invitationText', d.invitationText);
set('dateLong', d.dateLong);
set('eventTime', d.time);
set('venueName', d.venueName);
set('venueAddress', d.venueAddress);
set('hosts', d.hosts);

const date = new Date(d.dateISO);
const pad = n => String(n).padStart(2, '0');

set(
  'coverDate',
  `${pad(date.getDate())} · ${pad(date.getMonth() + 1)} · ${date.getFullYear()}`
);

const mapLink = document.getElementById('mapLink');

if (mapLink) {
  mapLink.href =
    'https://www.google.com/maps/search/?api=1&query=' +
    encodeURIComponent(d.mapSearch);
}

// ===================================
// КАЛЕНДАРЬ
// ===================================

const calendar = document.getElementById('calendar');

if (calendar) {
  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель',
    'Май', 'Июнь', 'Июль', 'Август',
    'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const weekdays = ['Дш', 'Шш', 'Шр', 'Бш', 'Жм', 'Иш', 'Жк'];

  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDay =
    (new Date(year, month, 1).getDay() + 6) % 7;

  const daysInMonth =
    new Date(year, month + 1, 0).getDate();

  let cells = `
    <div class="month-title">${monthNames[month]} ${year}</div>
  `;

  weekdays.forEach(w => {
    cells += `<span class="weekday">${w}</span>`;
  });

  for (let i = 0; i < firstDay; i++) {
    cells += '<span></span>';
  }

  for (let day = 1; day <= daysInMonth; day++) {
    cells += `
      <span class="day ${day === date.getDate() ? 'selected' : ''}">
        ${day}
      </span>
    `;
  }

  calendar.innerHTML = cells;
}

// ===================================
// ОБРАТНЫЙ ОТСЧЁТ
// ===================================

const previousValues = {};

function setAnimated(id, value) {
  const el = document.getElementById(id);
  if (!el) return;

  const next = String(value);

  if (
    previousValues[id] !== undefined &&
    previousValues[id] !== next
  ) {
    el.classList.remove('number-change');
    void el.offsetWidth;
    el.classList.add('number-change');
  }

  el.textContent = next;
  previousValues[id] = next;
}

function tick() {
  let diff = date.getTime() - Date.now();

  if (diff <= 0) {
    ['days', 'hours', 'minutes', 'seconds'].forEach(id => {
      setAnimated(id, '00');
    });
    return;
  }

  const days = Math.floor(diff / 86400000);
  diff %= 86400000;

  const hours = Math.floor(diff / 3600000);
  diff %= 3600000;

  const minutes = Math.floor(diff / 60000);
  diff %= 60000;

  const seconds = Math.floor(diff / 1000);

  setAnimated('days', pad(days));
  setAnimated('hours', pad(hours));
  setAnimated('minutes', pad(minutes));
  setAnimated('seconds', pad(seconds));
}

tick();
setInterval(tick, 1000);

// ===================================
// АНИМАЦИЯ ПОЯВЛЕНИЯ БЛОКОВ
// ===================================

const revealElements = document.querySelectorAll(
  '.frame > *, .calendar-card, .venue, .countdown-wrap, .hosts, .rsvp'
);

revealElements.forEach(el => {
  el.classList.add('reveal');
});

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealElements.forEach(el => observer.observe(el));
} else {
  revealElements.forEach(el => el.classList.add('visible'));
}

// ===================================
// ОТПРАВКА ОТВЕТОВ В TELEGRAM
// ===================================

const RSVP_URL = 'https://script.google.com/macros/s/AKfycbw-bk_b-OgECJRQWvX5r3JdSrEBrpJ4YNrnOhcbplq2XtlpshjVgPzzibEVRcPPtMsuaA/exec';
const rsvpForm = document.getElementById('rsvpForm');

if (rsvpForm) {
  rsvpForm.addEventListener('submit', async e => {
    e.preventDefault();

    const name =
      document.getElementById('guestName').value.trim();

    const answer =
      document.getElementById('attendance').value;

    const note =
      document.getElementById('formNote');

    const button =
      rsvpForm.querySelector('button[type="submit"]');

    if (!name || !answer) {
      note.textContent = 'Маалыматтарды толтуруңуз.';
      return;
    }

    if (RSVP_URL === 'ВСТАВЬ_ССЫЛКУ_GOOGLE_APPS_SCRIPT') {
      note.textContent =
        'Жөнөтүү кызматы азырынча туташтырыла элек.';
      return;
    }

    button.disabled = true;
    button.textContent = 'ЖӨНӨТҮЛҮҮДӨ...';

    note.textContent = 'Жообуңуз жөнөтүлүүдө...';

    try {
      await fetch(RSVP_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        },
        body: new URLSearchParams({
          name: name,
          attendance: answer
        })
      });

      note.textContent =
        'Жообуңуз кабыл алынды. Рахмат! ❤️';

      rsvpForm.reset();

    } catch (error) {
      console.error('Telegram жөнөтүү катасы:', error);

      note.textContent =
        'Ката кетти. Кийинчерээк кайра аракет кылыңыз.';

    } finally {
      button.disabled = false;
      button.textContent = 'ЖӨНӨТҮҮ';
    }
  });
}
