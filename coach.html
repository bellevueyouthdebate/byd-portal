/**
 * student.js - data loading and rendering for student.html
 */
(async function () {
  const user = BYD.guard(['student']);
  if (!user) return;
  BYD.initViewNav('home');

  let schedule = [], homework = [], rounds = [], pairings = [], attendance = [];

  async function loadAll() {
    try {
      [schedule, homework, rounds, attendance] = await Promise.all([
        BYD.call('getSchedule', {}),
        BYD.call('getHomework', {}),
        BYD.call('getRounds', {}),
        BYD.call('getAttendance', {})
      ]);
      pairings = await BYD.call('getPairings', {});
      renderHome();
      renderHomework();
      renderSchedule();
      renderRounds();
      renderAttendance();
    } catch (err) {
      BYD.toast(BYD.errorMessage(err), 'error');
    }
  }

  function isUpcoming(dateStr) { return dateStr >= BYD.todayIso(); }

  // ------------------------------------------------------------- home
  function renderHome() {
    document.getElementById('homeName').textContent = user.name.split(' ')[0];

    const upcoming = schedule.filter(function (s) { return isUpcoming(s.Date); })
      .sort(function (a, b) { return a.Date.localeCompare(b.Date); });
    document.getElementById('statNextPractice').textContent = upcoming.length ? BYD.fmtDate(upcoming[0].Date) : '\u2014';

    const in7 = new Date(); in7.setDate(in7.getDate() + 7);
    const in7Iso = in7.toISOString().slice(0, 10);
    const hwDueSoon = homework.filter(function (h) { return h.DueDate && h.DueDate >= BYD.todayIso() && h.DueDate <= in7Iso; });
    document.getElementById('statHwDue').textContent = hwDueSoon.length;

    const d30 = new Date(); d30.setDate(d30.getDate() - 30);
    const d30Iso = d30.toISOString().slice(0, 10);
    const recentAtt = attendance.filter(function (a) { return a.Date >= d30Iso; });
    document.getElementById('statAttendance').textContent = recentAtt.length;

    const schedHtml = upcoming.slice(0, 3).map(function (s) {
      return '<div class="flex justify-between items-center" style="padding:9px 0; border-bottom:1px solid var(--rule);">' +
        '<div><div style="font-weight:600;">' + BYD.escapeHtml(s.Title) + '</div>' +
        '<div class="text-sm text-muted">' + BYD.fmtDate(s.Date) + (s.StartTime ? ' &middot; ' + BYD.fmtTime(s.StartTime) : '') + '</div></div>' +
        '</div>';
    }).join('') || '<p class="text-muted text-sm mb-0">Nothing scheduled yet.</p>';
    document.getElementById('homeSchedulePreview').innerHTML = schedHtml;

    const hwHtml = homework.filter(function (h) { return !h.DueDate || h.DueDate >= BYD.todayIso(); })
      .sort(function (a, b) { return String(a.DueDate).localeCompare(String(b.DueDate)); })
      .slice(0, 3).map(function (h) {
        return '<div class="flex justify-between items-center" style="padding:9px 0; border-bottom:1px solid var(--rule);">' +
          '<div><div style="font-weight:600;">' + BYD.escapeHtml(h.Title) + '</div>' +
          '<div class="text-sm text-muted">Due ' + BYD.fmtDate(h.DueDate) + '</div></div></div>';
      }).join('') || '<p class="text-muted text-sm mb-0">No homework due soon.</p>';
    document.getElementById('homeHwPreview').innerHTML = hwHtml;
  }

  // --------------------------------------------------------- homework
  function renderHomework() {
    const body = document.getElementById('hwTableBody');
    const rows = homework.slice().sort(function (a, b) { return String(a.DueDate).localeCompare(String(b.DueDate)); });
    document.getElementById('hwEmpty').classList.toggle('hidden', rows.length > 0);
    body.innerHTML = rows.map(function (h) {
      const overdue = h.DueDate && h.DueDate < BYD.todayIso();
      return '<tr><td style="font-weight:600;">' + BYD.escapeHtml(h.Title) + '</td>' +
        '<td>' + BYD.escapeHtml(h.Description) + '</td>' +
        '<td class="font-mono">' + BYD.fmtDate(h.AssignedDate) + '</td>' +
        '<td class="font-mono"' + (overdue ? ' style="color:var(--absent); font-weight:700;"' : '') + '>' + BYD.fmtDate(h.DueDate) + '</td></tr>';
    }).join('');
  }

  // --------------------------------------------------------- schedule
  function renderSchedule() {
    const body = document.getElementById('scheduleTableBody');
    const rows = schedule.slice().sort(function (a, b) { return (a.Date + a.StartTime).localeCompare(b.Date + b.StartTime); });
    document.getElementById('scheduleEmpty').classList.toggle('hidden', rows.length > 0);
    body.innerHTML = rows.map(function (s) {
      return '<tr><td class="font-mono">' + BYD.fmtDate(s.Date) + '</td>' +
        '<td class="font-mono">' + BYD.fmtTime(s.StartTime) + (s.EndTime ? '\u2013' + BYD.fmtTime(s.EndTime) : '') + '</td>' +
        '<td style="font-weight:600;">' + BYD.escapeHtml(s.Title) + '</td>' +
        '<td>' + BYD.escapeHtml(s.Location) + '</td>' +
        '<td class="text-muted">' + BYD.escapeHtml(s.Notes) + '</td></tr>';
    }).join('');
  }

  // ----------------------------------------------------------- rounds
  function renderRounds() {
    const wrap = document.getElementById('roundsList');
    const sorted = rounds.slice().sort(function (a, b) { return b.Date.localeCompare(a.Date); });
    document.getElementById('roundsEmpty').classList.toggle('hidden', sorted.length > 0);
    wrap.innerHTML = sorted.map(function (r) {
      const rp = pairings.filter(function (p) { return p.RoundID === r.ID; });
      const rowsHtml = rp.map(function (p) {
        const mine = [p.Side1, p.Side2].join(' ').toLowerCase().indexOf(user.email.toLowerCase()) > -1
          || [p.Side1, p.Side2].join(' ').toLowerCase().indexOf(user.name.toLowerCase()) > -1;
        return '<tr' + (mine ? ' style="background:var(--ink-tint);"' : '') + '>' +
          '<td><span class="side-tag side-tag-1">' + BYD.escapeHtml(p.Side1Label || 'Aff') + '</span></td>' +
          '<td>' + BYD.escapeHtml(p.Side1) + '</td>' +
          '<td><span class="side-tag side-tag-2">' + BYD.escapeHtml(p.Side2Label || 'Neg') + '</span></td>' +
          '<td>' + BYD.escapeHtml(p.Side2) + '</td>' +
          '<td>' + BYD.escapeHtml(p.Room) + '</td>' +
          '<td>' + BYD.escapeHtml(p.Judge) + '</td></tr>';
      }).join('') || '<tr><td colspan="6" class="text-muted">No pairings posted for this round yet.</td></tr>';

      return '<div class="card">' +
        '<div class="card-head"><div><h2>' + BYD.escapeHtml(r.Label) + '</h2>' +
        '<div class="card-sub">' + BYD.fmtDate(r.Date) + (r.Format ? ' &middot; ' + BYD.escapeHtml(r.Format) : '') + '</div></div></div>' +
        (r.Notes ? '<p class="text-sm text-muted">' + BYD.escapeHtml(r.Notes) + '</p>' : '') +
        '<div class="table-wrap"><table><thead><tr><th></th><th>Side 1</th><th></th><th>Side 2</th><th>Room</th><th>Judge</th></tr></thead>' +
        '<tbody>' + rowsHtml + '</tbody></table></div></div>';
    }).join('');
  }

  // ------------------------------------------------------- attendance
  function renderAttendance() {
    document.getElementById('todayLabel').textContent = BYD.fmtDate(BYD.todayIso());
    const todayRecord = attendance.find(function (a) { return a.Date === BYD.todayIso(); });
    const badge = todayRecord ? statusBadge(todayRecord.Status) : '<span class="badge badge-unmarked">Not marked</span>';

    document.getElementById('markToday').innerHTML =
      '<div class="flex items-center justify-between gap-16" style="flex-wrap:wrap;">' +
      '<div class="text-sm">Current status: ' + badge + '</div>' +
      '<div class="flex gap-8">' +
      '<button class="btn btn-ghost btn-sm" id="markExcusedBtn">Mark excused</button>' +
      '<button class="btn btn-primary btn-sm" id="markPresentBtn">Mark present</button>' +
      '</div></div>';

    document.getElementById('markPresentBtn').addEventListener('click', function () { markAttendance('Present'); });
    document.getElementById('markExcusedBtn').addEventListener('click', function () { markAttendance('Excused'); });

    const body = document.getElementById('attendanceTableBody');
    const rows = attendance.slice().sort(function (a, b) { return b.Date.localeCompare(a.Date); });
    document.getElementById('attendanceEmpty').classList.toggle('hidden', rows.length > 0);
    body.innerHTML = rows.map(function (a) {
      return '<tr><td class="font-mono">' + BYD.fmtDate(a.Date) + '</td><td>' + statusBadge(a.Status) + '</td>' +
        '<td class="text-sm text-muted">' + (a.MarkedBy === user.email ? 'You' : BYD.escapeHtml(a.MarkedBy)) + '</td></tr>';
    }).join('');
  }

  function statusBadge(status) {
    const cls = status === 'Present' ? 'badge-present' : status === 'Absent' ? 'badge-absent' : status === 'Excused' ? 'badge-excused' : 'badge-unmarked';
    return '<span class="badge ' + cls + '">' + status + '</span>';
  }

  async function markAttendance(status) {
    try {
      await BYD.call('markMyAttendance', { date: BYD.todayIso(), status: status });
      BYD.toast('Marked ' + status.toLowerCase() + ' for today.', 'success');
      attendance = await BYD.call('getAttendance', {});
      renderAttendance();
      renderHome();
    } catch (err) {
      BYD.toast(BYD.errorMessage(err), 'error');
    }
  }

  // ---------------------------------------------------------- account
  document.getElementById('pwForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type=submit]');
    const original = btn.textContent;
    btn.disabled = true; btn.textContent = 'Updating\u2026';
    try {
      await BYD.call('changePassword', {
        currentPassword: document.getElementById('curPw').value,
        newPassword: document.getElementById('newPw').value
      });
      BYD.toast('Password updated.', 'success');
      e.target.reset();
    } catch (err) {
      BYD.toast(BYD.errorMessage(err), 'error');
    } finally {
      btn.disabled = false; btn.textContent = original;
    }
  });

  loadAll();
})();
