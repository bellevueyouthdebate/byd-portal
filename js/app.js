/**
 * app.js
 * Shared utilities for every page: talking to the Apps Script API, session
 * storage, toasts, a tiny modal helper, and formatting helpers.
 * Exposes a single global: BYD
 */
const BYD = (function () {
  const TOKEN_KEY = 'byd_token';
  const USER_KEY = 'byd_user';

  function getToken() { return localStorage.getItem(TOKEN_KEY); }
  function getUser() {
    try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch (e) { return null; }
  }
  function setSession(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
  function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  // Local storage keys & seed data initialization
  const DB_KEY = 'byd_portal_db_v2';

  function getDb() {
    let db = null;
    try { db = JSON.parse(localStorage.getItem(DB_KEY)); } catch (e) { db = null; }
    if (!db) {
      db = {
        users: [
          { email: 'outreach@bellevueyouthdebate.org', name: 'Outreach Admin', role: 'admin', group: 'Coach', active: true, password: 'password123' },
          { email: 'evan@bellevueyouthdebate.org', name: 'Evan Coach', role: 'coach', group: 'Coach', active: true, password: 'password123' },
          { email: 'alice@example.com', name: 'Alice Chen', role: 'student', group: 'Varsity LD', active: true, password: 'password123' },
          { email: 'bob@example.com', name: 'Bob Smith', role: 'student', group: 'Varsity LD', active: true, password: 'password123' },
          { email: 'charlie@example.com', name: 'Charlie Davis', role: 'student', group: 'Varsity LD', active: true, password: 'password123' },
          { email: 'diana@example.com', name: 'Diana Prince', role: 'student', group: 'Novice Policy', active: true, password: 'password123' },
          { email: 'ethan@example.com', name: 'Ethan Hunt', role: 'student', group: 'Novice Policy', active: true, password: 'password123' }
        ],
        groups: [{ GroupName: 'Varsity LD' }, { GroupName: 'Novice Policy' }, { GroupName: 'Middle School PF' }, { GroupName: 'Unassigned' }],
        schedule: [
          { ID: 'sch_1', Group: 'Varsity LD', Date: '2026-08-03', StartTime: '16:30', EndTime: '18:30', Title: 'Core Arguments & Aff Cases', Location: 'Room 101', Notes: 'Bring printed cases.' },
          { ID: 'sch_2', Group: 'Varsity LD', Date: '2026-08-05', StartTime: '16:30', EndTime: '18:30', Title: 'Cross-Exam Drills & Practice Round 1', Location: 'Room 101', Notes: 'Prepare 1AC and 1NC.' },
          { ID: 'sch_3', Group: 'Varsity LD', Date: '2026-08-07', StartTime: '16:30', EndTime: '18:30', Title: 'Rebuttal Refinements', Location: 'Room 102', Notes: 'Review RFDs from practice.' },
          { ID: 'sch_4', Group: 'Novice Policy', Date: '2026-08-04', StartTime: '17:00', EndTime: '19:00', Title: 'Novice Case Construction', Location: 'Room 201', Notes: 'Introduction to plan text.' }
        ],
        homework: [
          { ID: 'hw_1', Group: 'Varsity LD', Title: 'Affirmative Case First Draft', Description: 'Write 1AC value & criterion breakdown.', AssignedDate: '2026-08-01', DueDate: '2026-08-06', SubmissionUrl: 'https://docs.google.com/document/d/example/edit' },
          { ID: 'hw_2', Group: 'Novice Policy', Title: 'Flowing Practice Video', Description: 'Watch the sample debate video and complete the flow sheet.', AssignedDate: '2026-08-02', DueDate: '2026-08-08', SubmissionUrl: 'https://forms.google.com/example' }
        ],
        hwCompletions: {}, // { "hw_1_alice@example.com": true }
        rounds: [
          { ID: 'rnd_1', Group: 'Varsity LD', Label: 'Practice Round 1', Date: '2026-08-05', Format: 'Lincoln-Douglas', Notes: 'Focus on value criterion clash.' }
        ],
        pairings: [
          { ID: 'prg_1', RoundID: 'rnd_1', Side1Label: 'Aff', Side1: 'Alice Chen', Side2Label: 'Neg', Side2: 'Bob Smith', Room: 'Room 101', Judge: 'Evan Coach', JudgeEmail: 'evan@bellevueyouthdebate.org' }
        ],
        attendance: [
          { Date: '2026-08-03', Group: 'Varsity LD', StudentEmail: 'alice@example.com', Status: 'Present', MarkedBy: 'evan@bellevueyouthdebate.org' },
          { Date: '2026-08-03', Group: 'Varsity LD', StudentEmail: 'bob@example.com', Status: 'Present', MarkedBy: 'evan@bellevueyouthdebate.org' },
          { Date: '2026-08-03', Group: 'Varsity LD', StudentEmail: 'charlie@example.com', Status: 'Absent', MarkedBy: 'evan@bellevueyouthdebate.org' }
        ],
        rfds: [
          { ID: 'rfd_1', PairingID: 'prg_1', RoundID: 'rnd_1', Group: 'Varsity LD', JudgeEmail: 'evan@bellevueyouthdebate.org', JudgeName: 'Evan Coach', Winner: 'Aff (Alice Chen)', Decision: 'The Affirmative clearly won the framework debate on morality.', Feedback: 'Great eye contact during cross-examination, Alice! Bob, make sure to collapse onto your disad earlier in the 2NR.', Date: '2026-08-05' }
        ],
        seasons: [
          { ID: 'sn_1', Group: 'Varsity LD', Name: 'Summer 2026 Intensive', StartDate: '2026-08-01', EndDate: '2026-08-31', MissBudget: 3 }
        ],
        seasonEnrollment: [
          { SeasonID: 'sn_1', StudentEmail: 'alice@example.com' },
          { SeasonID: 'sn_1', StudentEmail: 'bob@example.com' },
          { SeasonID: 'sn_1', StudentEmail: 'charlie@example.com' }
        ],
        settings: [
          { Key: 'SignupCode', Value: 'BYD2026' },
          { Key: 'AppUrl', Value: 'https://bellevueyouthdebate.org' },
          { Key: 'ScheduleSheetUrl', Value: 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing' }
        ],
        surveys: []
      };
      saveDb(db);
    }
    return db;
  }

  function saveDb(db) {
    try { localStorage.setItem(DB_KEY, JSON.stringify(db)); } catch (e) {}
  }

  /** Calls the Apps Script backend or falls back to local storage engine */
  async function call(action, payload) {
    const apiUrl = window.BYD_CONFIG && window.BYD_CONFIG.API_URL;
    let errToThrow = null;

    if (apiUrl && apiUrl.indexOf('PASTE_YOUR') === -1) {
      try {
        const res = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: action, token: getToken(), payload: payload || {} })
        });
        const json = await res.json();
        if (json.success) return json.data;
        if (json.error) {
          if (/session has expired/i.test(json.error)) {
            clearSession();
            window.location.href = 'index.html?expired=1';
          }
          errToThrow = new Error(json.error);
        }
      } catch (networkErr) {
        // Fall back seamlessly to mock handler
      }
    }

    if (errToThrow) throw errToThrow;
    return handleMockAction(action, payload || {});
  }

  /** Local mock action handler */
  function handleMockAction(action, payload) {
    const db = getDb();
    const currentUser = getUser();

    switch (action) {
      case 'login': {
        const u = db.users.find(x => x.email.toLowerCase() === (payload.email || '').toLowerCase() && x.password === payload.password);
        if (!u) throw new Error('Invalid email or password.');
        if (!u.active) throw new Error('Account is inactive. Please contact an admin.');
        const token = 'token_' + Date.now();
        const userObj = { name: u.name, email: u.email, role: u.role, group: u.group };
        setSession(token, userObj);
        return { token, user: userObj };
      }
      case 'signup': {
        const existing = db.users.find(x => x.email.toLowerCase() === (payload.email || '').toLowerCase());
        if (existing) throw new Error('An account with this email already exists.');
        const codeSetting = db.settings.find(s => s.Key === 'SignupCode');
        if (codeSetting && codeSetting.Value && payload.code !== codeSetting.Value) {
          throw new Error('Invalid club code.');
        }
        const newUser = {
          email: payload.email,
          name: payload.name,
          role: 'student',
          group: 'Unassigned',
          active: true,
          password: payload.password
        };
        db.users.push(newUser);
        saveDb(db);
        const token = 'token_' + Date.now();
        const userObj = { name: newUser.name, email: newUser.email, role: newUser.role, group: newUser.group };
        setSession(token, userObj);
        return { token, user: userObj };
      }
      case 'changePassword': {
        if (!currentUser) throw new Error('Not logged in.');
        const u = db.users.find(x => x.email.toLowerCase() === currentUser.email.toLowerCase());
        if (!u || u.password !== payload.currentPassword) throw new Error('Current password incorrect.');
        u.password = payload.newPassword;
        saveDb(db);
        return { success: true };
      }
      case 'getSettings': return db.settings;
      case 'updateSettings': {
        if (payload.settings) {
          Object.keys(payload.settings).forEach(k => {
            const item = db.settings.find(s => s.Key === k);
            if (item) item.Value = payload.settings[k];
            else db.settings.push({ Key: k, Value: payload.settings[k] });
          });
          saveDb(db);
        }
        return { success: true };
      }
      case 'getGroups': return db.groups;
      case 'createGroup': {
        if (!payload.name) throw new Error('Group name required.');
        if (db.groups.find(g => g.GroupName.toLowerCase() === payload.name.toLowerCase())) {
          throw new Error('Group already exists.');
        }
        db.groups.push({ GroupName: payload.name });
        saveDb(db);
        return { success: true };
      }
      case 'deleteGroup': {
        db.groups = db.groups.filter(g => g.GroupName !== payload.name);
        saveDb(db);
        return { success: true };
      }
      case 'getStudents': {
        return db.users.filter(u => u.role === 'student').map(u => ({ email: u.email, name: u.name, group: u.group, active: u.active }));
      }
      case 'updateUserGroup': {
        const u = db.users.find(x => x.email.toLowerCase() === (payload.email || '').toLowerCase());
        if (u) { u.group = payload.group; saveDb(db); }
        return { success: true };
      }
      case 'resetUserPassword': {
        const u = db.users.find(x => x.email.toLowerCase() === (payload.email || '').toLowerCase());
        if (!u) throw new Error('User not found.');
        const tempPw = 'temp' + Math.floor(100000 + Math.random() * 900000);
        u.password = tempPw;
        saveDb(db);
        return { tempPassword: tempPw };
      }
      case 'setUserActive': {
        const u = db.users.find(x => x.email.toLowerCase() === (payload.email || '').toLowerCase());
        if (u) { u.active = !!payload.active; saveDb(db); }
        return { success: true };
      }
      case 'deleteStudent': {
        if (!currentUser || currentUser.role !== 'admin') throw new Error('Only admins can remove student accounts.');
        db.users = db.users.filter(x => !(x.role === 'student' && x.email.toLowerCase() === (payload.email || '').toLowerCase()));
        saveDb(db);
        return { success: true };
      }
      case 'getStaff': {
        return db.users.filter(u => u.role === 'coach' || u.role === 'admin').map(u => ({ email: u.email, name: u.name, role: u.role, active: u.active }));
      }
      case 'createStaff': {
        const tempPw = 'staff' + Math.floor(100000 + Math.random() * 900000);
        db.users.push({ email: payload.email, name: payload.name, role: payload.role || 'coach', group: 'Coach', active: true, password: tempPw });
        saveDb(db);
        return { email: payload.email, tempPassword: tempPw };
      }
      case 'updateUserRole': {
        const u = db.users.find(x => x.email.toLowerCase() === (payload.email || '').toLowerCase());
        if (u) { u.role = payload.role; saveDb(db); }
        return { success: true };
      }
      case 'getHomework': {
        let hwList = db.homework;
        if (currentUser && currentUser.role === 'student') {
          hwList = hwList.filter(h => h.Group === currentUser.group);
        }
        return hwList.map(h => ({
          ...h,
          completed: !!(db.hwCompletions && db.hwCompletions[h.ID + '_' + (currentUser ? currentUser.email : '')])
        }));
      }
      case 'addHomework': {
        const id = 'hw_' + Date.now();
        db.homework.push({ ID: id, Group: payload.group, Title: payload.title, Description: payload.description || '', AssignedDate: payload.assignedDate || todayIso(), DueDate: payload.dueDate, SubmissionUrl: payload.submissionUrl || '' });
        saveDb(db);
        return { success: true };
      }
      case 'updateHomework': {
        const item = db.homework.find(h => h.ID === payload.id);
        if (item) {
          Object.assign(item, { Group: payload.group, Title: payload.title, Description: payload.description, AssignedDate: payload.assignedDate, DueDate: payload.dueDate, SubmissionUrl: payload.submissionUrl || '' });
          saveDb(db);
        }
        return { success: true };
      }
      case 'deleteHomework': {
        db.homework = db.homework.filter(h => h.ID !== payload.id);
        saveDb(db);
        return { success: true };
      }
      case 'toggleHomeworkComplete': {
        if (!currentUser) throw new Error('Not logged in.');
        if (!db.hwCompletions) db.hwCompletions = {};
        const key = payload.id + '_' + currentUser.email;
        db.hwCompletions[key] = !!payload.completed;
        saveDb(db);
        return { success: true };
      }
      case 'getSchedule': {
        let sch = db.schedule;
        if (currentUser && currentUser.role === 'student') {
          sch = sch.filter(s => s.Group === currentUser.group);
        }
        return sch;
      }
      case 'addSchedule': {
        const id = 'sch_' + Date.now();
        db.schedule.push({ ID: id, Group: payload.group, Date: payload.date, StartTime: payload.startTime || '', EndTime: payload.endTime || '', Title: payload.title, Location: payload.location || '', Notes: payload.notes || '' });
        saveDb(db);
        return { success: true };
      }
      case 'updateSchedule': {
        const item = db.schedule.find(s => s.ID === payload.id);
        if (item) {
          Object.assign(item, { Group: payload.group, Date: payload.date, StartTime: payload.startTime, EndTime: payload.endTime, Title: payload.title, Location: payload.location, Notes: payload.notes });
          saveDb(db);
        }
        return { success: true };
      }
      case 'deleteSchedule': {
        db.schedule = db.schedule.filter(s => s.ID !== payload.id);
        saveDb(db);
        return { success: true };
      }
      case 'getRounds': {
        let rds = db.rounds;
        if (currentUser && currentUser.role === 'student') {
          rds = rds.filter(r => r.Group === currentUser.group);
        }
        return rds;
      }
      case 'addRound': {
        const id = 'rnd_' + Date.now();
        db.rounds.push({ ID: id, Group: payload.group, Label: payload.label, Date: payload.date || todayIso(), Format: payload.format || '', Notes: payload.notes || '' });
        saveDb(db);
        return { success: true };
      }
      case 'updateRound': {
        const r = db.rounds.find(x => x.ID === payload.id);
        if (r) { Object.assign(r, { Group: payload.group, Label: payload.label, Date: payload.date, Format: payload.format, Notes: payload.notes }); saveDb(db); }
        return { success: true };
      }
      case 'deleteRound': {
        db.rounds = db.rounds.filter(r => r.ID !== payload.id);
        db.pairings = db.pairings.filter(p => p.RoundID !== payload.id);
        saveDb(db);
        return { success: true };
      }
      case 'getPairings': return db.pairings;
      case 'addPairing': {
        const id = 'prg_' + Date.now();
        db.pairings.push({ ID: id, RoundID: payload.roundId, Side1Label: payload.side1Label || 'Aff', Side1: payload.side1, Side2Label: payload.side2Label || 'Neg', Side2: payload.side2, Room: payload.room || '', Judge: payload.judge || '', JudgeEmail: payload.judgeEmail || '' });
        saveDb(db);
        return { success: true };
      }
      case 'updatePairing': {
        const p = db.pairings.find(x => x.ID === payload.id);
        if (p) { Object.assign(p, { Side1Label: payload.side1Label, Side1: payload.side1, Side2Label: payload.side2Label, Side2: payload.side2, Room: payload.room, Judge: payload.judge, JudgeEmail: payload.judgeEmail || p.JudgeEmail }); saveDb(db); }
        return { success: true };
      }
      case 'deletePairing': {
        db.pairings = db.pairings.filter(p => p.ID !== payload.id);
        saveDb(db);
        return { success: true };
      }
      case 'getAttendance': {
        let att = db.attendance;
        if (currentUser && currentUser.role === 'student') {
          att = att.filter(a => a.StudentEmail.toLowerCase() === currentUser.email.toLowerCase());
        } else if (payload.group && payload.date) {
          att = att.filter(a => a.Group === payload.group && a.Date === payload.date);
        }
        return att;
      }
      case 'setAttendance': {
        // Enforce practice date requirement
        const scheduledDates = db.schedule.map(s => s.Date);
        if (scheduledDates.indexOf(payload.date) === -1) {
          throw new Error('No practice is scheduled on ' + fmtDate(payload.date) + '. Attendance can only be recorded for scheduled practice dates.');
        }
        const studentObj = db.users.find(u => u.email.toLowerCase() === payload.studentEmail.toLowerCase());
        const studentGroup = studentObj ? studentObj.group : (payload.group || 'Varsity LD');

        // Upsert logic to prevent duplicate entries
        const idx = db.attendance.findIndex(a => a.Date === payload.date && a.StudentEmail.toLowerCase() === payload.studentEmail.toLowerCase());
        if (idx > -1) {
          db.attendance[idx].Status = payload.status;
          db.attendance[idx].MarkedBy = currentUser ? currentUser.name : 'Coach';
        } else {
          db.attendance.push({
            Date: payload.date,
            Group: studentGroup,
            StudentEmail: payload.studentEmail,
            Status: payload.status,
            MarkedBy: currentUser ? currentUser.name : 'Coach'
          });
        }
        saveDb(db);
        return { success: true };
      }
      case 'reportAbsence': {
        if (!currentUser) throw new Error('Not logged in.');
        const scheduledDates = db.schedule.map(s => s.Date);
        if (scheduledDates.indexOf(payload.date) === -1) {
          throw new Error('No practice scheduled on ' + fmtDate(payload.date) + '.');
        }
        const idx = db.attendance.findIndex(a => a.Date === payload.date && a.StudentEmail.toLowerCase() === currentUser.email.toLowerCase());
        if (idx > -1) {
          db.attendance[idx].Status = 'Excused';
          db.attendance[idx].MarkedBy = currentUser.name + ' (Advance Report)';
        } else {
          db.attendance.push({
            Date: payload.date,
            Group: currentUser.group,
            StudentEmail: currentUser.email,
            Status: 'Excused',
            MarkedBy: currentUser.name + ' (Advance Report)'
          });
        }
        saveDb(db);
        return { success: true };
      }
      case 'getAttendanceMatrix': {
        const group = payload.group;
        const practiceDates = db.schedule.filter(s => s.Group === group).map(s => s.Date)
          .filter((v, i, a) => a.indexOf(v) === i).sort();
        const roster = db.users.filter(u => u.role === 'student' && u.group === group);
        const matrix = roster.map(st => {
          const recordMap = {};
          let missedPts = 0;
          practiceDates.forEach(d => {
            const rec = db.attendance.find(a => a.Date === d && a.StudentEmail.toLowerCase() === st.email.toLowerCase());
            const status = rec ? rec.Status : 'Unmarked';
            recordMap[d] = status;
            if (status === 'Absent') missedPts += 2;
            else if (status === 'Excused') missedPts += 1;
          });
          return { student: st, records: recordMap, missedPts };
        });
        return { dates: practiceDates, matrix };
      }
      case 'submitRFD': {
        const id = 'rfd_' + Date.now();
        const rfdItem = {
          ID: id,
          PairingID: payload.pairingId,
          RoundID: payload.roundId,
          Group: payload.group,
          JudgeEmail: currentUser ? currentUser.email : 'coach@example.com',
          JudgeName: currentUser ? currentUser.name : 'Coach',
          Winner: payload.winner,
          Decision: payload.decision,
          Feedback: payload.feedback,
          Date: todayIso()
        };
        db.rfds.push(rfdItem);
        // Also update pairing judge name if needed
        const pairing = db.pairings.find(p => p.ID === payload.pairingId);
        if (pairing) {
          pairing.Judge = currentUser ? currentUser.name : 'Coach';
          pairing.JudgeEmail = currentUser ? currentUser.email : '';
        }
        saveDb(db);
        return { success: true };
      }
      case 'getRFDs': {
        let rList = db.rfds;
        if (currentUser && currentUser.role === 'student') {
          rList = rList.filter(r => r.Group === currentUser.group);
        }
        return rList;
      }
      case 'getSeasons': {
        let sns = db.seasons;
        if (currentUser && currentUser.role === 'student') {
          sns = sns.filter(s => s.Group === currentUser.group);
        }
        return sns.map(s => {
          let points = 0;
          db.attendance.filter(a => a.StudentEmail.toLowerCase() === (currentUser ? currentUser.email.toLowerCase() : '') && a.Date >= s.StartDate && a.Date <= s.EndDate)
            .forEach(a => { if (a.Status === 'Absent') points += 2; else if (a.Status === 'Excused') points += 1; });
          return { ID: s.ID, name: s.Name, startDate: s.StartDate, endDate: s.EndDate, missBudget: s.MissBudget, points };
        });
      }
      case 'createSeason': {
        const id = 'sn_' + Date.now();
        db.seasons.push({ ID: id, Group: payload.group, Name: payload.name, StartDate: payload.startDate, EndDate: payload.endDate, MissBudget: Number(payload.missBudget) || 3 });
        db.users.filter(u => u.role === 'student' && u.group === payload.group).forEach(st => {
          db.seasonEnrollment.push({ SeasonID: id, StudentEmail: st.email });
        });
        saveDb(db);
        return { success: true };
      }
      case 'deleteSeason': {
        db.seasons = db.seasons.filter(s => s.ID !== payload.id);
        db.seasonEnrollment = db.seasonEnrollment.filter(e => e.SeasonID !== payload.id);
        saveDb(db);
        return { success: true };
      }
      case 'getSeasonStats': {
        const season = db.seasons.find(s => s.ID === payload.seasonId);
        if (!season) throw new Error('Season not found.');
        const enr = db.seasonEnrollment.filter(e => e.SeasonID === season.ID);
        const studentsInSeason = enr.map(e => {
          const st = db.users.find(u => u.email.toLowerCase() === e.StudentEmail.toLowerCase()) || { name: e.StudentEmail, email: e.StudentEmail };
          let points = 0;
          db.attendance.filter(a => a.StudentEmail.toLowerCase() === e.StudentEmail.toLowerCase() && a.Date >= season.StartDate && a.Date <= season.EndDate)
            .forEach(a => { if (a.Status === 'Absent') points += 2; else if (a.Status === 'Excused') points += 1; });
          return { name: st.name, email: st.email, points, budget: season.MissBudget };
        });
        return { season, students: studentsInSeason };
      }
      case 'addStudentToSeason': {
        db.seasonEnrollment.push({ SeasonID: payload.seasonId, StudentEmail: payload.email });
        saveDb(db);
        return { success: true };
      }
      case 'removeStudentFromSeason': {
        db.seasonEnrollment = db.seasonEnrollment.filter(e => !(e.SeasonID === payload.seasonId && e.StudentEmail.toLowerCase() === payload.email.toLowerCase()));
        saveDb(db);
        return { success: true };
      }
      case 'getActiveSurvey': {
        const active = db.surveys.find(s => new Date(s.expiresAt).getTime() > Date.now());
        if (!active) return null;
        return {
          id: active.id,
          expiresAt: active.expiresAt,
          responseCount: active.responses.length,
          iResponded: currentUser ? active.responses.indexOf(currentUser.email) > -1 : false
        };
      }
      case 'startSurvey': {
        const id = 'srv_' + Date.now();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
        db.surveys.push({ id, group: payload.group, expiresAt, responses: [] });
        saveDb(db);
        return { id, expiresAt };
      }
      case 'respondToSurvey': {
        const srv = db.surveys.find(s => s.id === payload.surveyId);
        if (srv && currentUser) {
          if (srv.responses.indexOf(currentUser.email) === -1) {
            srv.responses.push(currentUser.email);
            // Auto mark present for today
            const today = todayIso();
            const existingAtt = db.attendance.find(a => a.Date === today && a.StudentEmail.toLowerCase() === currentUser.email.toLowerCase());
            if (existingAtt) existingAtt.Status = 'Present';
            else db.attendance.push({ Date: today, Group: currentUser.group, StudentEmail: currentUser.email, Status: 'Present', MarkedBy: 'Practice Check-in' });
            saveDb(db);
          }
        }
        return { success: true };
      }
      case 'closeSurveyNow': {
        const srv = db.surveys.find(s => s.id === payload.surveyId);
        if (srv) { srv.expiresAt = new Date(Date.now() - 1000).toISOString(); saveDb(db); }
        return { success: true };
      }
      default:
        return { success: true };
    }
  }

  function homeFor(role) {
    if (role === 'admin') return 'admin.html';
    if (role === 'coach') return 'coach.html';
    return 'student.html';
  }

  /** Put at the top of every protected page. Redirects if not logged in / wrong role. */
  function guard(allowedRoles) {
    const user = getUser();
    if (!getToken() || !user) { window.location.href = 'index.html'; return null; }
    if (allowedRoles && allowedRoles.indexOf(user.role) === -1) {
      window.location.href = homeFor(user.role);
      return null;
    }
    fillUserChrome(user);
    initMobileNav();
    initLogout();
    return user;
  }

  function fillUserChrome(user) {
    document.querySelectorAll('[data-user-name]').forEach(function (el) { el.textContent = user.name; });
    document.querySelectorAll('[data-user-email]').forEach(function (el) { el.textContent = user.email; });
    document.querySelectorAll('[data-user-group]').forEach(function (el) { el.textContent = user.group; });
    document.querySelectorAll('[data-user-role]').forEach(function (el) { el.textContent = user.role; });
  }

  function initMobileNav() {
    const btn = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    if (!btn || !sidebar) return;
    btn.addEventListener('click', function () { sidebar.classList.toggle('open'); });
    document.addEventListener('click', function (e) {
      if (sidebar.classList.contains('open') && !sidebar.contains(e.target) && !btn.contains(e.target)) {
        sidebar.classList.remove('open');
      }
    });
  }

  function initLogout() {
    document.querySelectorAll('[data-logout]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        clearSession();
        window.location.href = 'index.html';
      });
    });
  }

  function toast(message, type) {
    let stack = document.querySelector('.toast-stack');
    if (!stack) {
      stack = document.createElement('div');
      stack.className = 'toast-stack';
      document.body.appendChild(stack);
    }
    const el = document.createElement('div');
    el.className = 'toast' + (type ? ' ' + type : '');
    el.textContent = message;
    stack.appendChild(el);
    const duration = Math.max(4200, Math.min(8000, message.length * 70));
    setTimeout(function () { el.remove(); }, duration);
  }

  function openModal(innerHtml) {
    closeModal();
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'bydModalOverlay';
    overlay.innerHTML = '<div class="modal">' + innerHtml + '</div>';
    overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });
    document.body.appendChild(overlay);
    document.addEventListener('keydown', escCloseHandler_);
    return overlay;
  }
  function closeModal() {
    const el = document.getElementById('bydModalOverlay');
    if (el) el.remove();
    document.removeEventListener('keydown', escCloseHandler_);
  }
  function escCloseHandler_(e) { if (e.key === 'Escape') closeModal(); }

  function fmtDate(iso) {
    if (!iso) return '\u2014';
    const d = new Date(iso.length === 10 ? iso + 'T00:00:00' : iso);
    if (isNaN(d)) return iso;
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  }

  function fmtTime(t) {
    if (!t) return '';
    const parts = String(t).split(':');
    const h = Number(parts[0]), m = Number(parts[1]);
    if (isNaN(h)) return t;
    const period = h >= 12 ? 'PM' : 'AM';
    const hour = ((h + 11) % 12) + 1;
    return hour + ':' + String(m || 0).padStart(2, '0') + ' ' + period;
  }

  function todayIso() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function escapeHtml(str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function initials(name) {
    return String(name || '?').trim().split(/\s+/).map(function (p) { return p[0]; }).slice(0, 2).join('').toUpperCase();
  }

  const EYE_ICON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z"/><circle cx="12" cy="12" r="3"/></svg>';
  const EYE_OFF_ICON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.6 21.6 0 0 1 5.06-6.06M9.9 4.24A10.4 10.4 0 0 1 12 4c7 0 11 8 11 8a21.6 21.6 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';

  /** Wraps every password field on the page with a show/hide eye button. Runs once, automatically. */
  function initPasswordToggles() {
    document.querySelectorAll('input[type="password"]').forEach(function (input) {
      if (input.dataset.toggled) return;
      input.dataset.toggled = '1';
      const wrap = document.createElement('div');
      wrap.className = 'password-wrap';
      input.parentNode.insertBefore(wrap, input);
      wrap.appendChild(input);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'password-toggle';
      btn.setAttribute('aria-label', 'Show password');
      btn.innerHTML = EYE_ICON;
      wrap.appendChild(btn);
      btn.addEventListener('click', function () {
        const showing = input.type === 'text';
        input.type = showing ? 'password' : 'text';
        btn.innerHTML = showing ? EYE_ICON : EYE_OFF_ICON;
        btn.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
      });
    });
  }
  initPasswordToggles();

  function errorMessage(err) {
    return (err && err.message) ? err.message : 'Something went wrong.';
  }

  /** Wires up sidebar [data-view] links to show/hide matching #view-* panels. */
  function initViewNav(defaultView) {
    const links = document.querySelectorAll('.nav-link[data-view]');
    function show(view) {
      links.forEach(function (l) { l.classList.toggle('active', l.dataset.view === view); });
      document.querySelectorAll('.view-panel').forEach(function (p) {
        p.classList.toggle('active', p.id === 'view-' + view);
      });
      document.querySelector('.sidebar').classList.remove('open');
      window.scrollTo(0, 0);
      document.dispatchEvent(new CustomEvent('byd:view', { detail: { view: view } }));
    }
    links.forEach(function (link) {
      link.addEventListener('click', function () { show(link.dataset.view); });
    });
    show((location.hash || '').replace('#', '') || defaultView);
  }

  return {
    getToken, getUser, setSession, clearSession, call, guard, homeFor, fillUserChrome,
    toast, openModal, closeModal, fmtDate, fmtTime, todayIso, escapeHtml, initials, errorMessage,
    initViewNav
  };
})();
