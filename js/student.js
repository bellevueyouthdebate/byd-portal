/**
 * student.js - data loading and rendering for student.html
 */
(async function () {
  const user = BYD.guard(['student']);
  if (!user) return;
  BYD.initViewNav('home');
  initSurveyWatcher();

  let schedule = [], homework = [], rounds = [], pairings = [], attendance = [], seasons = [], rfds = [], settings = [];

  async function loadAll() {
    try {
      [schedule, homework, rounds, attendance, seasons, rfds, settings] = await Promise.all([
        BYD.call('getSchedule', {}),
        BYD.call('getHomework', {}),
        BYD.call('getRounds', {}),
        BYD.call('getAttendance', {}),
        BYD.call('getSeasons', {}),
        BYD.call('getRFDs', {}),
        BYD.call('getSettings', {})
      ]);
      pairings = await BYD.call('getPairings', {});
      renderHome();
      renderHomework();
      renderSchedule();
      renderRounds();
      renderRFDs();
      renderAttendance();
      renderSeasonSummary();
      renderReportDateOptions();
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
      const overdue = h.DueDate && h.DueDate < BYD.todayIso() && !h.completed;
      const linkBtn = h.SubmissionUrl
        ? '<a href="' + BYD.escapeHtml(h.SubmissionUrl) + '" target="_blank" rel="noopener" class="btn btn-secondary btn-sm">Submit / View Link ↗</a>'
        : '<span class="text-muted text-sm">\u2014</span>';
      const completeBtn = '<button class="btn ' + (h.completed ? 'btn-ghost' : 'btn-primary') + ' btn-sm" data-hw-id="' + h.ID + '" data-hw-done="' + (!h.completed) + '">' +
        (h.completed ? '✓ Completed' : 'Mark Completed') + '</button>';

      return '<tr><td style="font-weight:600;">' + BYD.escapeHtml(h.Title) + '</td>' +
        '<td>' + BYD.escapeHtml(h.Description) + '</td>' +
        '<td class="font-mono">' + BYD.fmtDate(h.AssignedDate) + '</td>' +
        '<td class="font-mono"' + (overdue ? ' style="color:var(--absent); font-weight:700;"' : '') + '>' + BYD.fmtDate(h.DueDate) + '</td>' +
        '<td>' + linkBtn + '</td>' +
        '<td>' + completeBtn + '</td></tr>';
    }).join('');

    body.querySelectorAll('button[data-hw-id]').forEach(function (btn) {
      btn.addEventListener('click', async function () {
        const id = btn.dataset.hwId;
        const completed = btn.dataset.hwDone === 'true';
        try {
          await BYD.call('toggleHomeworkComplete', { id: id, completed: completed });
          BYD.toast(completed ? 'Marked assignment as completed.' : 'Marked assignment as incomplete.', 'success');
          homework = await BYD.call('getHomework', {});
          renderHomework();
          renderHome();
        } catch (err) {
          BYD.toast(BYD.errorMessage(err), 'error');
        }
      });
    });
  }

  // --------------------------------------------------------- schedule
  function renderSchedule() {
    const sheetSetting = settings.find(function (s) { return s.Key === 'ScheduleSheetUrl'; });
    const sheetContainer = document.getElementById('scheduleSheetContainer');
    if (sheetSetting && sheetSetting.Value) {
      sheetContainer.classList.remove('hidden');
      document.getElementById('scheduleSheetExternalLink').href = sheetSetting.Value;
      let embedUrl = sheetSetting.Value;
      if (embedUrl.indexOf('/edit') > -1) {
        embedUrl = embedUrl.replace(/\/edit.*$/, '/pubhtml?widget=true&amp;headers=false');
      }
      document.getElementById('scheduleSheetIframe').src = embedUrl;
    } else {
      sheetContainer.classList.add('hidden');
    }

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

  // ----------------------------------------------------------- RFDs
  function renderRFDs() {
    const wrap = document.getElementById('rfdsList');
    const sorted = rfds.slice().sort(function (a, b) { return (b.Date || '').localeCompare(a.Date || ''); });
    document.getElementById('rfdsEmpty').classList.toggle('hidden', sorted.length > 0);
    wrap.innerHTML = sorted.map(function (r) {
      const pairing = pairings.find(function (p) { return p.ID === r.PairingID; });
      const round = rounds.find(function (rd) { return rd.ID === r.RoundID; });
      return '<div class="rfd-card">' +
        '<div class="flex items-center justify-between gap-12 mb-8 flex-wrap">' +
        '<div><strong style="font-size:16px;">' + BYD.escapeHtml((round ? round.Label : 'Round') + ' Feedback') + '</strong>' +
        '<div class="text-sm text-muted">Judge: ' + BYD.escapeHtml(r.JudgeName || r.JudgeEmail) + ' &middot; ' + BYD.fmtDate(r.Date) + '</div></div>' +
        '<span class="rfd-winner-badge">🏆 Winner: ' + BYD.escapeHtml(r.Winner) + '</span>' +
        '</div>' +
        (pairing ? '<p class="text-sm text-muted mb-8"><strong>Teams:</strong> ' + BYD.escapeHtml(pairing.Side1) + ' vs ' + BYD.escapeHtml(pairing.Side2) + '</p>' : '') +
        '<div class="mb-12"><strong>Reason for Decision (RFD):</strong><p class="mt-4 text-sm" style="white-space:pre-wrap;">' + BYD.escapeHtml(r.Decision) + '</p></div>' +
        (r.Feedback ? '<div><strong>Debater Feedback:</strong><p class="mt-4 text-sm text-muted" style="white-space:pre-wrap;">' + BYD.escapeHtml(r.Feedback) + '</p></div>' : '') +
        '</div>';
    }).join('');
  }

  // ------------------------------------------------------- attendance
  function renderAttendance() {
    const todayIso = BYD.todayIso();
    document.getElementById('todayLabel').textContent = BYD.fmtDate(todayIso);
    const scheduledDates = schedule.map(function (s) { return s.Date; });
    const isPracticeToday = scheduledDates.indexOf(todayIso) > -1;

    const todayRecord = attendance.find(function (a) { return a.Date === todayIso; });
    let statusNotice = '';

    if (isPracticeToday) {
      if (todayRecord) {
        statusNotice = 'Today is a scheduled practice. Coach marked status: ' + statusBadge(todayRecord.Status);
      } else {
        statusNotice = 'Today is a scheduled practice date. Coach has not marked your attendance yet.';
      }
    } else {
      statusNotice = 'No practice is scheduled for today (' + BYD.fmtDate(todayIso) + '). Attendance is only taken on scheduled practice dates.';
    }

    document.getElementById('markToday').innerHTML =
      '<div class="text-sm" style="line-height:1.6;">' + statusNotice + '</div>';

    const body = document.getElementById('attendanceTableBody');
    const rows = attendance.slice().sort(function (a, b) { return b.Date.localeCompare(a.Date); });
    document.getElementById('attendanceEmpty').classList.toggle('hidden', rows.length > 0);
    body.innerHTML = rows.map(function (a) {
      return '<tr><td class="font-mono">' + BYD.fmtDate(a.Date) + '</td><td>' + statusBadge(a.Status) + '</td>' +
        '<td class="text-sm text-muted">' + BYD.escapeHtml(a.MarkedBy || 'Coach') + '</td></tr>';
    }).join('');
  }

  function statusBadge(status) {
    const cls = status === 'Present' ? 'badge-present' : status === 'Absent' ? 'badge-absent' : status === 'Excused' ? 'badge-excused' : 'badge-unmarked';
    return '<span class="badge ' + cls + '">' + status + '</span>';
  }

  // -------------------------------------------------------------- seasons
  function renderSeasonSummary() {
    const el = document.getElementById('seasonSummary');
    if (!seasons.length) {
      el.innerHTML = '<p class="text-muted text-sm mb-0">No active season for your group yet.</p>';
      return;
    }
    el.innerHTML = seasons.map(function (s) {
      const cls = s.points >= s.missBudget ? 'badge-absent' : s.points >= s.missBudget - 1 ? 'badge-excused' : 'badge-present';
      return '<div class="flex justify-between items-center" style="padding:9px 0; border-bottom:1px solid var(--rule);">' +
        '<div><div style="font-weight:600;">' + BYD.escapeHtml(s.name) + '</div>' +
        '<div class="text-sm text-muted">' + BYD.fmtDate(s.startDate) + ' \u2013 ' + BYD.fmtDate(s.endDate) + '</div></div>' +
        '<span class="badge ' + cls + '">' + s.points + ' / ' + s.missBudget + ' points</span></div>';
    }).join('');
  }

  function renderReportDateOptions() {
    const select = document.getElementById('reportDateSelect');
    const upcoming = schedule.filter(function (s) { return s.Date > BYD.todayIso(); })
      .sort(function (a, b) { return a.Date.localeCompare(b.Date); });
    if (!upcoming.length) {
      select.innerHTML = '<option value="">No upcoming practices scheduled</option>';
      select.disabled = true;
      return;
    }
    select.disabled = false;
    select.innerHTML = upcoming.map(function (s) {
      return '<option value="' + s.Date + '">' + BYD.fmtDate(s.Date) + (s.Title ? ' \u2013 ' + BYD.escapeHtml(s.Title) : '') + '</option>';
    }).join('');
  }

  document.getElementById('reportAbsenceForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const date = document.getElementById('reportDateSelect').value;
    if (!date) return;
    const btn = e.target.querySelector('button[type=submit]');
    const original = btn.textContent;
    btn.disabled = true; btn.textContent = 'Reporting\u2026';
    try {
      await BYD.call('reportAbsence', { date: date });
      BYD.toast('Absence reported for ' + BYD.fmtDate(date) + '.', 'success');
      [attendance, seasons] = await Promise.all([BYD.call('getAttendance', {}), BYD.call('getSeasons', {})]);
      renderAttendance();
      renderSeasonSummary();
    } catch (err) {
      BYD.toast(BYD.errorMessage(err), 'error');
    } finally {
      btn.disabled = false; btn.textContent = original;
    }
  });

  async function markAttendance(status) {
    try {
      await BYD.call('markMyAttendance', { date: BYD.todayIso(), status: status });
      BYD.toast('Marked ' + status.toLowerCase() + ' for today.', 'success');
      [attendance, seasons] = await Promise.all([BYD.call('getAttendance', {}), BYD.call('getSeasons', {})]);
      renderAttendance();
      renderSeasonSummary();
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

  // ----------------------------------------------------- check-in survey
  function initSurveyWatcher() {
    const banner = document.getElementById('surveyBanner');
    const countdownEl = document.getElementById('surveyCountdown');
    const respondBtn = document.getElementById('surveyRespondBtn');
    let currentSurveyId = null;
    let tickHandle = null;

    async function poll() {
      try {
        const survey = await BYD.call('getActiveSurvey', {});
        if (!survey) {
          banner.classList.add('hidden');
          clearInterval(tickHandle);
          currentSurveyId = null;
          return;
        }
        currentSurveyId = survey.id;
        banner.classList.remove('hidden');
        banner.classList.toggle('done', survey.iResponded);
        respondBtn.classList.toggle('hidden', survey.iResponded);
        respondBtn.textContent = "I'm here";
        clearInterval(tickHandle);
        tick(survey.expiresAt);
        tickHandle = setInterval(function () { tick(survey.expiresAt); }, 1000);
      } catch (err) {
        // Stay quiet - this is a background poll, not a user-initiated action.
      }
    }

    function tick(expiresAt) {
      const msLeft = new Date(expiresAt).getTime() - new Date().getTime();
      if (msLeft <= 0) {
        countdownEl.textContent = '0:00';
        clearInterval(tickHandle);
        setTimeout(poll, 1500); // give the server a moment to finalize, then refresh
        return;
      }
      const s = Math.floor(msLeft / 1000);
      countdownEl.textContent = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
    }

    respondBtn.addEventListener('click', async function () {
      if (!currentSurveyId) return;
      respondBtn.disabled = true;
      try {
        await BYD.call('respondToSurvey', { surveyId: currentSurveyId });
        BYD.toast("You're checked in!", 'success');
        banner.classList.add('done');
        respondBtn.classList.add('hidden');
      } catch (err) {
        BYD.toast(BYD.errorMessage(err), 'error');
      } finally {
        respondBtn.disabled = false;
      }
    });

    poll();
    setInterval(poll, 15000); // catch newly-started check-ins even with no survey currently open
    document.addEventListener('byd:view', function (e) {
      if (e.detail.view === 'attendance') { loadAll(); } // refresh once they check attendance after responding
    });
  }
})();
