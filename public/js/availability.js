/**
 * availability.js — NIVRRITII Live Availability Calendar
 * Fetches iCal from /api/availability, parses blocked dates,
 * renders a 2-month calendar with live status.
 */
(function () {
  'use strict';

  /* ── iCAL PARSER ─────────────────────────────────────────── */
  function parseIcal(text) {
    var blocked = [];
    var events = text.split('BEGIN:VEVENT');
    events.shift(); // remove header

    events.forEach(function (ev) {
      var dtstart = ev.match(/DTSTART(?:;VALUE=DATE)?:(\d{8})/);
      var dtend   = ev.match(/DTEND(?:;VALUE=DATE)?:(\d{8})/);
      if (!dtstart || !dtend) return;

      var start = parseDate(dtstart[1]);
      var end   = parseDate(dtend[1]);

      // Add every date from start up to (not including) end
      var cur = new Date(start);
      while (cur < end) {
        blocked.push(toKey(cur));
        cur.setDate(cur.getDate() + 1);
      }
    });
    return blocked;
  }

  function parseDate(str) {
    // str = YYYYMMDD
    return new Date(
      parseInt(str.slice(0,4)),
      parseInt(str.slice(4,6)) - 1,
      parseInt(str.slice(6,8))
    );
  }

  function toKey(d) {
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2,'0');
    var day = String(d.getDate()).padStart(2,'0');
    return y + '-' + m + '-' + day;
  }

  function today() { return toKey(new Date()); }

  /* ── CALENDAR RENDER ─────────────────────────────────────── */
  var MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];
  var DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  function renderCalendar(container, blockedSet, year, month) {
    var firstDay = new Date(year, month, 1).getDay();
    var daysInMonth = new Date(year, month + 1, 0).getDate();
    var todayKey = today();

    var html = '<div class="av-month">';
    html += '<div class="av-month-title">' + MONTHS[month] + ' ' + year + '</div>';
    html += '<div class="av-grid">';

    // Day headers
    DAYS.forEach(function(d) {
      html += '<div class="av-day-hdr">' + d + '</div>';
    });

    // Empty cells before first day
    for (var i = 0; i < firstDay; i++) {
      html += '<div class="av-cell av-empty"></div>';
    }

    // Day cells
    for (var d = 1; d <= daysInMonth; d++) {
      var key = year + '-' + String(month+1).padStart(2,'0') + '-' + String(d).padStart(2,'0');
      var isPast    = key < todayKey;
      var isBlocked = blockedSet.has(key);
      var isToday   = key === todayKey;

      var cls = 'av-cell';
      if (isPast)       cls += ' av-past';
      else if (isBlocked) cls += ' av-blocked';
      else              cls += ' av-available';
      if (isToday)      cls += ' av-today';

      html += '<div class="' + cls + '">' + d + '</div>';
    }

    html += '</div></div>'; // close grid + month
    return html;
  }

  /* ── INIT ────────────────────────────────────────────────── */
  function init() {
    var containers = document.querySelectorAll('[data-availability]');
    if (!containers.length) return;

    containers.forEach(function(container) {
      container.innerHTML = '<div class="av-loading">Loading availability…</div>';
    });

    fetch('/api/availability')
      .then(function(r) { return r.text(); })
      .then(function(text) {
        var blockedDates = parseIcal(text);
        var blockedSet   = new Set(blockedDates);

        var now   = new Date();
        var year  = now.getFullYear();
        var month = now.getMonth();

        containers.forEach(function(container) {
          var months = parseInt(container.dataset.months) || 2;
          var html = '<div class="av-calendars">';

          for (var i = 0; i < months; i++) {
            var m = (month + i) % 12;
            var y = year + Math.floor((month + i) / 12);
            html += renderCalendar(container, blockedSet, y, m);
          }

          html += '</div>';
          html += '<div class="av-legend">';
          html += '<span class="av-legend-item"><span class="av-dot av-dot--available"></span>Available</span>';
          html += '<span class="av-legend-item"><span class="av-dot av-dot--blocked"></span>Booked</span>';
          html += '<span class="av-legend-item"><span class="av-dot av-dot--past"></span>Past</span>';
          html += '</div>';

          container.innerHTML = html;
        });
      })
      .catch(function() {
        containers.forEach(function(container) {
          container.innerHTML = '<div class="av-error">Could not load availability. <a href="https://wa.me/917406012727" target="_blank">WhatsApp us for dates →</a></div>';
        });
      });
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();