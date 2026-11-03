let DATA = {};

const order = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const short = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
};
const breaks = [
  ["09:50", "10:20", "Tea Break"],
  ["01:05", "02:00", "Lunch Break"],
];

let currentBranch = localStorage.getItem("timetable_branch") || "CSE";
let currentCluster = localStorage.getItem("timetable_cluster") || "B";
let currentSection = localStorage.getItem("timetable_section") || "3B1 [3D]";
let selectedDay;

// Temporary staging values while the filter modal is open
let tempBranch = currentBranch;
let tempCluster = currentCluster;
let tempSection = currentSection;

// DOM references
const branchEl = document.getElementById("branchSelect");
const clusterEl = document.getElementById("clusterSelect");
const sectionEl = document.getElementById("sectionSelect");
const filterModal = document.getElementById("filterModal");
const filtersBtn = document.getElementById("filtersBtn");
const filterModalClose = document.getElementById("filterModalClose");
const filterCancelBtn = document.getElementById("filterCancelBtn");
const filterApplyBtn = document.getElementById("filterApplyBtn");

const dayEl = document.getElementById("days");
const classesEl = document.getElementById("classes");
const titleEl = document.getElementById("title");
const subtitleEl = document.getElementById("subtitle");
const dateEl = document.getElementById("dateLabel");
const todayBadgeEl = document.getElementById("todayBadge");
const todayJumpEl = document.getElementById("todayJump");

// Bunk DOM references
const bunkLogBtn = document.getElementById("bunkLogBtn");
const bunkTopCount = document.getElementById("bunkTopCount");
const bunkModal = document.getElementById("bunkModal");
const bunkModalTitle = document.getElementById("bunkModalTitle");
const bunkModalSubtitle = document.getElementById("bunkModalSubtitle");
const bunkModalClose = document.getElementById("bunkModalClose");
const bunkCancelBtn = document.getElementById("bunkCancelBtn");
const bunkRemoveBtn = document.getElementById("bunkRemoveBtn");
const bunkSaveBtn = document.getElementById("bunkSaveBtn");

const bunkMetaCard = document.getElementById("bunkMetaCard");
const bunkMetaSubject = document.getElementById("bunkMetaSubject");
const bunkMetaType = document.getElementById("bunkMetaType");
const bunkMetaTime = document.getElementById("bunkMetaTime");
const bunkMetaDate = document.getElementById("bunkMetaDate");
const bunkMetaVenue = document.getElementById("bunkMetaVenue");

const typeIntentional = document.getElementById("typeIntentional");
const typeUnintentional = document.getElementById("typeUnintentional");
const bunkTitleInput = document.getElementById("bunkTitleInput");
const bunkDescInput = document.getElementById("bunkDescInput");

const dayBunkBtn = document.getElementById("dayBunkBtn");
const dayBunkText = document.getElementById("dayBunkText");

// All Bunks Modal DOM references
const allBunksModal = document.getElementById("allBunksModal");
const allBunksModalClose = document.getElementById("allBunksModalClose");
const statTotalBunks = document.getElementById("statTotalBunks");
const statIntentionalBunks = document.getElementById("statIntentionalBunks");
const statUnintentionalBunks = document.getElementById(
  "statUnintentionalBunks",
);
const natureFilterPills = document.getElementById("natureFilterPills");
const bunkSubjectFilter = document.getElementById("bunkSubjectFilter");
const bunkMonthFilter = document.getElementById("bunkMonthFilter");
const bunkLogList = document.getElementById("bunkLogList");

const statusEl = document.getElementById("status");
const statusBadgeEl = document.getElementById("statusBadge");
const statusPillEl = document.getElementById("statusPill");
const statusTitleEl = document.getElementById("statusTitle");
const statusTimeEl = document.getElementById("statusTime");
const statusVenueEl = document.getElementById("statusVenue");
const countdownLabelEl = document.getElementById("countdownLabel");
const countdownEl = document.getElementById("countdown");
const countdownSubEl = document.getElementById("countdownSub");

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function cleanHeroSubject(subject) {
  if (!subject) return "Class";
  let s = String(subject);
  s = s.replace(/\s*\([A-Za-z0-9\s,\-/&|]+\)/g, (match) => {
    if (/\b[A-E]\d|\b\w{2,4}-\w{2,4}\b/i.test(match)) return "";
    return match;
  });
  s = s.replace(/\s*\[LAB-[^\]]+\]/gi, "");
  return s.trim() || subject;
}

function cleanHeroVenue(item) {
  let v = (item.venue || "").trim();
  if (!v && item.subject) {
    const match = item.subject.match(/\[([^\]]+)\]/);
    if (match) v = match[1];
  }
  if (!v) return "Campus";
  if (/^\d+[A-Za-z]?$/.test(v)) return "Room " + v;
  return v;
}

function formatHeroTitle(item) {
  if (!item) return "Class";
  const code = (item.course_code || "").trim();
  if (code && code.length >= 3) {
    return code.slice(-3).toUpperCase();
  }
  return cleanHeroSubject(item.subject);
}

function populateBranchSelect() {
  branchEl.innerHTML = "";
  const branches = Object.keys(DATA);
  branches.forEach((b) => {
    const opt = document.createElement("option");
    opt.value = b;
    opt.textContent = b;
    if (b === tempBranch) opt.selected = true;
    branchEl.appendChild(opt);
  });
  if (!branches.includes(tempBranch) && branches.length > 0) {
    tempBranch = branches[0];
  }
}

function populateClusterSelect() {
  clusterEl.innerHTML = "";
  if (tempBranch === "CSE" || tempBranch === "AIML") {
    const clusters =
      tempBranch === "AIML" ?
        ["All", "A", "B"]
      : ["All", "A", "B", "C", "D", "E"];
    clusters.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = c === "All" ? "All Clusters" : `Cluster ${c}`;
      if (c === tempCluster) opt.selected = true;
      clusterEl.appendChild(opt);
    });
    if (!clusters.includes(tempCluster)) {
      tempCluster = "All";
    }
  } else {
    const opt = document.createElement("option");
    opt.value = "All";
    opt.textContent = "All Sections";
    opt.selected = true;
    clusterEl.appendChild(opt);
    tempCluster = "All";
  }
}

function populateSectionSelect() {
  sectionEl.innerHTML = "";
  const branchData = DATA[tempBranch] || {};
  let sections = Object.keys(branchData);

  if (
    (tempBranch === "CSE" || tempBranch === "AIML") &&
    tempCluster !== "All"
  ) {
    sections = sections.filter((sec) => sec.startsWith(`3${tempCluster}`));
  }

  if (
    sections.length === 0 &&
    (tempBranch === "CSE" || tempBranch === "AIML") &&
    tempCluster !== "All"
  ) {
    sections = [`3${tempCluster}1`, `3${tempCluster}2`, `3${tempCluster}3`].map(
      (s) => `${s} (Coming Soon)`,
    );
  }

  sections.forEach((sec) => {
    const opt = document.createElement("option");
    const val = sec.replace(" (Coming Soon)", "");
    opt.value = val;
    opt.textContent = sec;
    if (val === tempSection) opt.selected = true;
    sectionEl.appendChild(opt);
  });

  const validValues = sections.map((s) => s.replace(" (Coming Soon)", ""));
  if (!validValues.includes(tempSection)) {
    tempSection = validValues[0] || "";
  }
}

function syncModalSelectors() {
  populateBranchSelect();
  populateClusterSelect();
  populateSectionSelect();
}

branchEl.onchange = (e) => {
  tempBranch = e.target.value;
  tempCluster = "All";
  populateClusterSelect();
  populateSectionSelect();
};

clusterEl.onchange = (e) => {
  tempCluster = e.target.value;
  populateSectionSelect();
};

sectionEl.onchange = (e) => {
  tempSection = e.target.value;
};

// Filter Modal Controls
if (filtersBtn) {
  filtersBtn.onclick = () => {
    tempBranch = currentBranch;
    tempCluster = currentCluster;
    tempSection = currentSection;
    syncModalSelectors();
    if (filterModal.showModal) {
      filterModal.showModal();
    } else {
      filterModal.setAttribute("open", "");
    }
  };
}

function closeFilterModal() {
  if (filterModal.close) {
    filterModal.close();
  } else {
    filterModal.removeAttribute("open");
  }
}

if (filterModalClose) filterModalClose.onclick = closeFilterModal;
if (filterCancelBtn) filterCancelBtn.onclick = closeFilterModal;

if (filterApplyBtn) {
  filterApplyBtn.onclick = () => {
    currentBranch = tempBranch;
    currentCluster = tempCluster;
    currentSection = tempSection;
    localStorage.setItem("timetable_branch", currentBranch);
    localStorage.setItem("timetable_cluster", currentCluster);
    localStorage.setItem("timetable_section", currentSection);
    if (typeof gtag === "function") {
      gtag("event", "select_timetable", {
        branch: currentBranch,
        cluster: currentCluster,
        section: currentSection,
      });
    }
    closeFilterModal();
    render(selectedDay || todayName());
  };
}

// Close dialog when clicking on backdrop
filterModal.addEventListener("click", (e) => {
  const rect = filterModal.getBoundingClientRect();
  const isInDialog =
    rect.top <= e.clientY &&
    e.clientY <= rect.top + rect.height &&
    rect.left <= e.clientX &&
    e.clientX <= rect.left + rect.width;
  if (!isInDialog) {
    closeFilterModal();
  }
});

function todayName() {
  return new Intl.DateTimeFormat("en-IN", { weekday: "long" }).format(
    new Date(),
  );
}

function getWeekdayDate(dayName) {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const targetIdx = days.indexOf(dayName);
  const now = new Date();
  const currentIdx = now.getDay();
  const diff = targetIdx - currentIdx;
  const d = new Date(now);
  d.setDate(now.getDate() + diff);
  return d;
}

function formatDayPillDate(dateObj) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
  }).format(dateObj);
}

function formatFullDate(dateObj) {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(dateObj);
}

// ==========================================
// Bunk Storage & Interaction Engine
// ==========================================
const BUNK_STORAGE_KEY = "timetable_bunks_v1";

function getAllBunks() {
  try {
    return JSON.parse(localStorage.getItem(BUNK_STORAGE_KEY)) || {};
  } catch (e) {
    return {};
  }
}

function saveAllBunks(data) {
  try {
    localStorage.setItem(BUNK_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save bunks to localStorage:", e);
  }
}

function getISODateForDay(dayName) {
  const d = getWeekdayDate(dayName);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getPeriodBunkKey(time, code, subject) {
  const cleanTime = (time || "").trim().replace(/\s+/g, "");
  const cleanCode = (code || "").trim();
  const cleanSubj = (subject || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  return `${cleanTime}_${cleanCode || cleanSubj}`;
}

function updateBunkTopBadge() {
  const all = getAllBunks();
  let count = 0;
  Object.values(all).forEach((dayObj) => {
    if (dayObj && dayObj.periods) {
      count += Object.keys(dayObj.periods).length;
    }
  });
  if (bunkTopCount) bunkTopCount.textContent = count;
}

let activeBunkContext = null;

function closeBunkModal() {
  if (bunkModal) {
    if (bunkModal.close) {
      bunkModal.close();
    } else {
      bunkModal.removeAttribute("open");
    }
  }
  activeBunkContext = null;
}

if (bunkModalClose) bunkModalClose.onclick = closeBunkModal;
if (bunkCancelBtn) bunkCancelBtn.onclick = closeBunkModal;

if (bunkModal) {
  bunkModal.addEventListener("click", (e) => {
    const rect = bunkModal.getBoundingClientRect();
    const isInDialog =
      rect.top <= e.clientY &&
      e.clientY <= rect.top + rect.height &&
      rect.left <= e.clientX &&
      e.clientX <= rect.left + rect.width;
    if (!isInDialog) {
      closeBunkModal();
    }
  });
}

function openPeriodBunkModal(item, d) {
  const isoDate = getISODateForDay(d);
  const periodKey = getPeriodBunkKey(item.time, item.course_code, item.subject);
  const all = getAllBunks();
  const dayData = all[isoDate] || { isFullDay: false, periods: {} };
  const existing = dayData.periods ? dayData.periods[periodKey] : null;

  activeBunkContext = {
    mode: "period",
    day: d,
    date: isoDate,
    periodKey: periodKey,
    item: item,
    isExisting: !!existing,
  };

  bunkModalTitle.textContent = existing ? "Edit Bunk" : "Log Bunk";
  bunkModalSubtitle.textContent =
    "Specify whether this was intentional or unintentional (OD/event)";

  bunkMetaCard.style.display = "block";
  bunkMetaSubject.textContent = item.subject || "Class";
  bunkMetaType.textContent = (item.type || "theory").toUpperCase();
  bunkMetaTime.textContent = item.time || "Period";
  bunkMetaDate.textContent = formatFullDate(getWeekdayDate(d));
  bunkMetaVenue.textContent = item.venue ? `Room ${item.venue}` : "Campus";

  if (existing) {
    if (
      existing.bunkNature === "unintentional" ||
      existing.type === "unintentional"
    ) {
      typeUnintentional.checked = true;
    } else {
      typeIntentional.checked = true;
    }
    bunkTitleInput.value = existing.title || "";
    bunkDescInput.value = existing.description || "";
    bunkRemoveBtn.style.display = "inline-flex";
    bunkRemoveBtn.textContent = "Unbunk Period";
  } else {
    typeIntentional.checked = true;
    bunkTitleInput.value = "";
    bunkDescInput.value = "";
    bunkRemoveBtn.style.display = "none";
  }

  if (bunkModal.showModal) {
    bunkModal.showModal();
  } else {
    bunkModal.setAttribute("open", "");
  }
  bunkTitleInput.focus();
}

function openDayBunkModal(d) {
  const isoDate = getISODateForDay(d);
  const list = getTimetable(d);
  if (!list || !list.length) return;

  const all = getAllBunks();
  const dayData = all[isoDate] || { isFullDay: false, periods: {} };
  const isAllBunked =
    dayData.isFullDay ||
    (Object.keys(dayData.periods || {}).length === list.length &&
      list.length > 0);

  activeBunkContext = {
    mode: "day",
    day: d,
    date: isoDate,
    list: list,
    isExisting: isAllBunked,
  };

  bunkModalTitle.textContent =
    isAllBunked ? "Manage Full Day Bunk" : "Bunk Entire Day";
  bunkModalSubtitle.textContent = `Mark all ${list.length} periods on ${d} as bunked`;

  bunkMetaCard.style.display = "block";
  bunkMetaSubject.textContent = `All Classes (${list.length} periods)`;
  bunkMetaType.textContent = "FULL DAY";
  bunkMetaTime.textContent = "All Day";
  bunkMetaDate.textContent = formatFullDate(getWeekdayDate(d));
  bunkMetaVenue.textContent = `${currentBranch} · ${currentSection}`;

  if (isAllBunked) {
    const firstKey = Object.keys(dayData.periods || {})[0];
    const sample = dayData.periods?.[firstKey];
    if (
      sample &&
      (sample.bunkNature === "unintentional" || sample.type === "unintentional")
    ) {
      typeUnintentional.checked = true;
    } else {
      typeIntentional.checked = true;
    }
    bunkTitleInput.value = sample?.title || "";
    bunkDescInput.value = sample?.description || "";
    bunkRemoveBtn.style.display = "inline-flex";
    bunkRemoveBtn.textContent = "Unbunk Full Day";
  } else {
    typeIntentional.checked = true;
    bunkTitleInput.value = "";
    bunkDescInput.value = "";
    bunkRemoveBtn.style.display = "none";
  }

  if (bunkModal.showModal) {
    bunkModal.showModal();
  } else {
    bunkModal.setAttribute("open", "");
  }
  bunkTitleInput.focus();
}

if (bunkSaveBtn) {
  bunkSaveBtn.onclick = () => {
    if (!activeBunkContext) return;
    const all = getAllBunks();
    const date = activeBunkContext.date;
    if (!all[date]) {
      all[date] = { isFullDay: false, periods: {} };
    }
    if (!all[date].periods) {
      all[date].periods = {};
    }

    const bunkNature =
      typeUnintentional.checked ? "unintentional" : "intentional";
    const title = bunkTitleInput.value.trim();
    const description = bunkDescInput.value.trim();
    const now = Date.now();

    if (activeBunkContext.mode === "period") {
      const item = activeBunkContext.item;
      const key = activeBunkContext.periodKey;
      all[date].periods[key] = {
        periodKey: key,
        day: activeBunkContext.day,
        date: date,
        time: item.time || "",
        subject: item.subject || "Class",
        courseCode: item.course_code || "",
        venue: item.venue || "",
        classType: (item.type || "theory").toLowerCase(),
        bunkNature: bunkNature,
        type: bunkNature,
        title:
          title ||
          (bunkNature === "intentional" ? "Personal Bunk" : "OD / Leave"),
        description: description,
        createdAt: now,
      };
    } else if (activeBunkContext.mode === "day") {
      all[date].isFullDay = true;
      activeBunkContext.list.forEach((item) => {
        const key = getPeriodBunkKey(item.time, item.course_code, item.subject);
        all[date].periods[key] = {
          periodKey: key,
          day: activeBunkContext.day,
          date: date,
          time: item.time || "",
          subject: item.subject || "Class",
          courseCode: item.course_code || "",
          venue: item.venue || "",
          classType: (item.type || "theory").toLowerCase(),
          bunkNature: bunkNature,
          type: bunkNature,
          title:
            title ||
            (bunkNature === "intentional" ? "Full Day Bunk" : (
              "Full Day OD / Leave"
            )),
          description: description,
          createdAt: now,
        };
      });
    }

    saveAllBunks(all);
    updateBunkTopBadge();
    closeBunkModal();
    render(selectedDay);
    if (allBunksModal && allBunksModal.open) {
      updateFilterDropdownOptions(getFlattenedBunkList());
      renderAllBunksDashboard();
    }
  };
}

if (bunkRemoveBtn) {
  bunkRemoveBtn.onclick = () => {
    if (!activeBunkContext) return;
    const all = getAllBunks();
    const date = activeBunkContext.date;

    if (all[date]) {
      if (activeBunkContext.mode === "period") {
        delete all[date].periods[activeBunkContext.periodKey];
        all[date].isFullDay = false;
        if (Object.keys(all[date].periods).length === 0) {
          delete all[date];
        }
      } else if (activeBunkContext.mode === "day") {
        delete all[date];
      }
      saveAllBunks(all);
    }

    updateBunkTopBadge();
    closeBunkModal();
    render(selectedDay);
    if (allBunksModal && allBunksModal.open) {
      updateFilterDropdownOptions(getFlattenedBunkList());
      renderAllBunksDashboard();
    }
  };
}

// ==========================================
// All Bunks Dashboard & Filtering Engine
// ==========================================
let currentNatureFilter = "all";
let currentSubjectFilter = "all";
let currentMonthFilter = "all";

function getFlattenedBunkList() {
  const all = getAllBunks();
  const list = [];
  Object.keys(all).forEach((dateStr) => {
    const dayObj = all[dateStr];
    if (dayObj && dayObj.periods) {
      Object.keys(dayObj.periods).forEach((periodKey) => {
        const p = dayObj.periods[periodKey];
        list.push({
          ...p,
          date: dateStr,
          periodKey: periodKey,
        });
      });
    }
  });
  return list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

function closeAllBunksModal() {
  if (allBunksModal) {
    if (allBunksModal.close) {
      allBunksModal.close();
    } else {
      allBunksModal.removeAttribute("open");
    }
  }
}

if (allBunksModalClose) allBunksModalClose.onclick = closeAllBunksModal;

if (allBunksModal) {
  allBunksModal.addEventListener("click", (e) => {
    const rect = allBunksModal.getBoundingClientRect();
    const isInDialog =
      rect.top <= e.clientY &&
      e.clientY <= rect.top + rect.height &&
      rect.left <= e.clientX &&
      e.clientX <= rect.left + rect.width;
    if (!isInDialog) {
      closeAllBunksModal();
    }
  });
}

function updateFilterDropdownOptions(allBunksList) {
  if (!bunkSubjectFilter || !bunkMonthFilter) return;

  // 1. Unique Subjects
  const currentSubjectVal = bunkSubjectFilter.value;
  bunkSubjectFilter.innerHTML = '<option value="all">All Subjects</option>';
  const subjects = [
    ...new Set(allBunksList.map((b) => b.subject).filter(Boolean)),
  ].sort();
  subjects.forEach((subj) => {
    const opt = document.createElement("option");
    opt.value = subj;
    opt.textContent = subj;
    if (subj === currentSubjectVal) opt.selected = true;
    bunkSubjectFilter.appendChild(opt);
  });
  if (!subjects.includes(currentSubjectVal)) {
    currentSubjectFilter = "all";
    bunkSubjectFilter.value = "all";
  }

  // 2. Unique Months
  const currentMonthVal = bunkMonthFilter.value;
  bunkMonthFilter.innerHTML = '<option value="all">All Months</option>';
  const monthMap = new Map();
  allBunksList.forEach((b) => {
    if (b.date) {
      const parts = b.date.split("-");
      if (parts.length >= 2) {
        const key = `${parts[0]}-${parts[1]}`;
        const d = new Date(
          parseInt(parts[0], 10),
          parseInt(parts[1], 10) - 1,
          1,
        );
        const label = new Intl.DateTimeFormat("en-IN", {
          month: "short",
          year: "numeric",
        }).format(d);
        monthMap.set(key, label);
      }
    }
  });

  monthMap.forEach((label, key) => {
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = label;
    if (key === currentMonthVal) opt.selected = true;
    bunkMonthFilter.appendChild(opt);
  });
  if (!monthMap.has(currentMonthVal)) {
    currentMonthFilter = "all";
    bunkMonthFilter.value = "all";
  }
}

function renderAllBunksDashboard() {
  if (!bunkLogList) return;
  const allBunksList = getFlattenedBunkList();

  // Summary counts
  const total = allBunksList.length;
  const intentionalCount = allBunksList.filter(
    (b) => b.type === "intentional",
  ).length;
  const unintentionalCount = allBunksList.filter(
    (b) => b.type === "unintentional",
  ).length;

  if (statTotalBunks) statTotalBunks.textContent = total;
  if (statIntentionalBunks) statIntentionalBunks.textContent = intentionalCount;
  if (statUnintentionalBunks)
    statUnintentionalBunks.textContent = unintentionalCount;

  // Apply filters
  const filtered = allBunksList.filter((b) => {
    if (currentNatureFilter !== "all" && b.type !== currentNatureFilter) {
      return false;
    }
    if (currentSubjectFilter !== "all" && b.subject !== currentSubjectFilter) {
      return false;
    }
    if (
      currentMonthFilter !== "all" &&
      !b.date.startsWith(currentMonthFilter)
    ) {
      return false;
    }
    return true;
  });

  bunkLogList.innerHTML = "";

  if (filtered.length === 0) {
    bunkLogList.innerHTML = `
            <div class="bunk-empty-box">
              <div class="bunk-empty-icon">${total === 0 ? "🎉" : "🔍"}</div>
              <div class="bunk-empty-title">${
                total === 0 ?
                  "No bunks recorded yet!"
                : "No matching bunks found"
              }</div>
              <div class="bunk-empty-sub">
                ${
                  total === 0 ?
                    "You haven't marked any classes as bunked yet. Tap '+ Bunk' on any class card to record one."
                  : "Try clearing or changing your filters above to view other records."
                }
              </div>
            </div>
          `;
    return;
  }

  filtered.forEach((b) => {
    const card = document.createElement("div");
    const isIntentional = b.type === "intentional";
    card.className = `bunk-item-card ${
      isIntentional ? "intentional" : "unintentional"
    }`;

    const dateObj = new Date(b.date + "T00:00:00");
    const formattedDate = formatFullDate(dateObj);
    const natureLabel = isIntentional ? "🎯 Intentional" : "📋 Unintentional";
    const typeLabel = (b.classType || "theory").toUpperCase();

    card.innerHTML = `
            <div class="bunk-item-top">
              <div class="bunk-item-subject-box">
                <span class="bunk-item-subject">${escapeHtml(b.subject)}</span>
                ${
                  b.courseCode ?
                    `<span class="bunk-item-code">📘 ${escapeHtml(
                      b.courseCode,
                    )}</span>`
                  : ""
                }
              </div>
              <div class="bunk-item-badges">
                <span class="bunk-badge-type">${escapeHtml(typeLabel)}</span>
                <span class="bunk-badge-nature ${
                  isIntentional ? "intentional" : "unintentional"
                }">${escapeHtml(natureLabel)}</span>
              </div>
            </div>

            <div class="bunk-item-meta">
              <span>📅 ${escapeHtml(formattedDate)}</span>
              <span class="bunk-item-meta-dot">•</span>
              <span>⏰ ${escapeHtml(b.time || "Period")}</span>
              // ${
              //   b.venue ?
              //     `<span class="bunk-item-meta-dot">•</span><span>📍 Room ${escapeHtml(
              //       b.venue,
              //     )}</span>`
              //   : ""
              // }
            </div>

            <div class="bunk-item-content">
              <div class="bunk-item-title">📌 ${escapeHtml(
                b.title || "No Reason Specified",
              )}</div>
              ${
                b.description ?
                  `<div class="bunk-item-desc">💬 ${escapeHtml(
                    b.description,
                  )}</div>`
                : ""
              }
            </div>

            <div class="bunk-item-actions">
              <button type="button" class="bunk-action-btn edit-bunk-btn">✏️ Edit</button>
              <button type="button" class="bunk-action-btn delete delete-bunk-btn">✕ Remove</button>
            </div>
          `;

    const editBtn = card.querySelector(".edit-bunk-btn");
    editBtn.onclick = () => {
      closeAllBunksModal();
      openPeriodBunkModal(
        {
          time: b.time,
          subject: b.subject,
          course_code: b.courseCode,
          venue: b.venue,
          type: b.classType,
        },
        b.day,
      );
    };

    const deleteBtn = card.querySelector(".delete-bunk-btn");
    deleteBtn.onclick = () => {
      const all = getAllBunks();
      if (all[b.date]?.periods) {
        delete all[b.date].periods[b.periodKey];
        if (Object.keys(all[b.date].periods).length === 0) {
          delete all[b.date];
        }
        saveAllBunks(all);
        updateBunkTopBadge();
        updateFilterDropdownOptions(getFlattenedBunkList());
        renderAllBunksDashboard();
        render(selectedDay);
      }
    };

    bunkLogList.appendChild(card);
  });
}

function openAllBunksModal() {
  if (!allBunksModal) {
    console.error("allBunksModal element not found in DOM");
    return;
  }
  const allBunksList = getFlattenedBunkList();
  updateFilterDropdownOptions(allBunksList);
  renderAllBunksDashboard();

  if (allBunksModal.showModal) {
    allBunksModal.showModal();
  } else {
    allBunksModal.setAttribute("open", "");
  }
}

// Nature filter pill click listeners
if (natureFilterPills) {
  natureFilterPills.querySelectorAll(".nature-pill").forEach((btn) => {
    btn.onclick = () => {
      natureFilterPills
        .querySelectorAll(".nature-pill")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentNatureFilter = btn.dataset.nature || "all";
      renderAllBunksDashboard();
    };
  });
}

// Subject filter change listener
if (bunkSubjectFilter) {
  bunkSubjectFilter.onchange = (e) => {
    currentSubjectFilter = e.target.value;
    renderAllBunksDashboard();
  };
}

// Month filter change listener
if (bunkMonthFilter) {
  bunkMonthFilter.onchange = (e) => {
    currentMonthFilter = e.target.value;
    renderAllBunksDashboard();
  };
}

if (bunkLogBtn) {
  bunkLogBtn.onclick = () => {
    openAllBunksModal();
  };
}

function toMinutes(v) {
  if (!v) return 0;
  let str = String(v).trim().toUpperCase();
  let isPM = str.includes("PM");
  let isAM = str.includes("AM");
  str = str.replace("AM", "").replace("PM", "").trim();
  let parts = str.split(":");
  if (parts.length < 2) return 0;
  let h = parseInt(parts[0], 10);
  let m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return 0;

  if (isPM && h < 12) h += 12;
  if (isAM && h === 12) h = 0;
  if (!isAM && !isPM && h <= 5) h += 12;

  return h * 60 + m;
}

function parseRange(t) {
  if (!t || !t.includes("–")) return [0, 0];
  const parts = t.split("–");
  if (parts.length < 2) return [0, 0];

  let startStr = parts[0].trim();
  let endStr = parts[1].trim();

  if (
    endStr.includes("AM") &&
    !startStr.includes("AM") &&
    !startStr.includes("PM")
  ) {
    startStr += " AM";
  } else if (
    endStr.includes("PM") &&
    !startStr.includes("AM") &&
    !startStr.includes("PM")
  ) {
    let startH = parseInt(startStr.split(":")[0], 10);
    if (startH === 12 || startH < 8) {
      startStr += " PM";
    } else {
      startStr += " AM";
    }
  }

  return [toMinutes(startStr), toMinutes(endStr)];
}

function isToday(d) {
  return d === todayName();
}
function nowMin() {
  const n = new Date();
  return n.getHours() * 60 + n.getMinutes() + n.getSeconds() / 60;
}

function consolidateTimetable(rawList) {
  if (!Array.isArray(rawList)) return rawList;
  const list = [...rawList].sort(
    (a, b) => parseRange(a.time)[0] - parseRange(b.time)[0],
  );
  const result = [];

  for (let i = 0; i < list.length; i++) {
    const cur = { ...list[i] };
    const [curStart, curEnd] = parseRange(cur.time);

    if (i < list.length - 1) {
      const next = list[i + 1];
      const [nextStart, nextEnd] = parseRange(next.time);

      const isSameSubjectAndCodeAndType =
        cur.course_code &&
        next.course_code &&
        cur.course_code === next.course_code &&
        cur.subject &&
        next.subject &&
        cur.subject === next.subject &&
        cur.type &&
        next.type &&
        cur.type === next.type;

      // Continuous if current ends exactly when next starts
      if (isSameSubjectAndCodeAndType && curEnd === nextStart) {
        const startStr = cur.time.split("–")[0].trim();
        const endStr = next.time.split("–")[1].trim();
        cur.time = `${startStr}–${endStr}`;
        cur.isDouble = true;
        if (!cur.faculty && next.faculty) cur.faculty = next.faculty;
        if (!cur.venue && next.venue) cur.venue = next.venue;
        i++; // skip merged period
      }
    }
    result.push(cur);
  }
  return result;
}

function getTimetable(d) {
  const list = DATA[currentBranch]?.[currentSection]?.[d] || null;
  if (!Array.isArray(list)) return list;
  return consolidateTimetable(list);
}

function liveIndex(list, d) {
  if (!isToday(d) || !list) return -1;
  const n = nowMin();
  return list.findIndex((item) => {
    const [s, e] = parseRange(item.time);
    return s > 0 && n >= s && n < e;
  });
}

function nextIndex(list, d) {
  if (!isToday(d) || !list) return -1;
  const n = nowMin();
  return list.findIndex((item) => {
    const [s] = parseRange(item.time);
    return s > n;
  });
}

function status(list, d) {
  const isCurrentDay = isToday(d);
  if (!list || !list.length) {
    if (!isCurrentDay) {
      return {
        kind: "preview",
        badge: d.toUpperCase(),
        pill: "SCHEDULE",
        title: "No classes scheduled",
        time: "Free day",
        venue: "Campus",
        target: null,
        prefix: "",
        sub: "Day off 🎉",
      };
    }
    return {
      kind: "done",
      badge: "DAY COMPLETE",
      pill: "ALL DONE",
      title: "No classes scheduled today",
      time: "See you tomorrow!",
      venue: "Campus",
      target: null,
      prefix: "",
      sub: "Enjoy your day! 🎉",
    };
  }

  if (!isCurrentDay) {
    const first = list[0];
    return {
      kind: "preview",
      badge: d.toUpperCase(),
      pill: "SCHEDULE",
      title: formatHeroTitle(first),
      time: `${list.length} classes scheduled`,
      venue: cleanHeroVenue(first),
      target: null,
      prefix: "Classes",
      sub: "total periods",
    };
  }

  const n = nowMin();
  const li = liveIndex(list, d);
  if (li >= 0) {
    const item = list[li];
    return {
      kind: "live",
      badge: "LIVE NOW",
      pill: "IN PROGRESS",
      title: formatHeroTitle(item),
      time: item.time || "",
      venue: cleanHeroVenue(item),
      target: parseRange(item.time)[1],
      prefix: "Ends in",
      sub: "until class ends",
    };
  }

  const br = breaks.find(([s, e]) => n >= toMinutes(s) && n < toMinutes(e));
  if (br) {
    return {
      kind: "break",
      badge: "BREAK TIME",
      pill: "RELAX",
      title: br[2],
      time: `${br[0]}–${br[1]}`,
      venue: "Cafeteria / Campus",
      target: toMinutes(br[1]),
      prefix: "Ends in",
      sub: "until break ends",
    };
  }

  const ni = nextIndex(list, d);
  if (ni >= 0) {
    const item = list[ni];
    return {
      kind: "next",
      badge: "NEXT CLASS",
      pill: "UP NEXT",
      title: formatHeroTitle(item),
      time: item.time || "",
      venue: cleanHeroVenue(item),
      target: parseRange(item.time)[0],
      prefix: "Starts in",
      sub: "until class",
    };
  }

  return {
    kind: "done",
    badge: "DAY COMPLETE",
    pill: "ALL DONE",
    title: "No more classes today",
    time: "See you tomorrow!",
    venue: "Campus",
    target: null,
    prefix: "",
    sub: "Have a great evening! 🎉",
  };
}

function duration(sec) {
  sec = Math.max(0, Math.ceil(sec));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m} min`;
  return `${s}s`;
}

function updateStatus(list, d) {
  const x = status(list, d);
  if (!x) {
    statusEl.classList.remove("visible");
    return;
  }
  statusEl.className = `status visible ${x.kind}`;
  statusBadgeEl.textContent = x.badge;
  statusPillEl.textContent = x.pill;
  statusTitleEl.textContent = x.title;

  if (x.venue) {
    statusVenueEl.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> ${escapeHtml(x.venue)}`;
  } else {
    statusVenueEl.innerHTML = "";
  }

  if (x.time) {
    statusTimeEl.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> ${escapeHtml(x.time)}`;
  } else {
    statusTimeEl.innerHTML = "";
  }

  countdownLabelEl.textContent = x.prefix;
  if (x.target === null) {
    countdownEl.textContent =
      x.kind === "preview" ? String(list ? list.length : 0) : "✓";
  } else {
    countdownEl.textContent = duration((x.target - nowMin()) * 60);
  }
  countdownSubEl.textContent = x.sub;
}

function addBreak(b) {
  const [s, e, l] = b;
  const i = document.createElement("div");
  i.className = "break-row";
  i.innerHTML = `
    <div class="time">
      <span>${escapeHtml(s)}</span>
      <span>${escapeHtml(e)}</span>
    </div>
    <div class="break-card">☕ ${escapeHtml(l)} (${escapeHtml(s)}–${escapeHtml(e)})</div>
  `;
  classesEl.appendChild(i);
}

function render(d, scroll = false) {
  selectedDay = d;
  const today = todayName();
  const viewToday = d === today;
  const list = getTimetable(d);

  subtitleEl.textContent = `${currentBranch} · ${currentSection}`;
  titleEl.textContent = viewToday ? "Today's Timetable" : `${d}'s Timetable`;

  const li = liveIndex(list, d);
  const ni = nextIndex(list, d);
  const st = status(list, d);

  todayBadgeEl.textContent =
    li >= 0 ? "● LIVE NOW"
    : st?.kind === "break" ? "☕ BREAK"
    : "Today";
  todayBadgeEl.classList.toggle("live-badge", li >= 0);
  todayBadgeEl.classList.toggle("break-badge", li < 0 && st?.kind === "break");

  const selectedDateObj = getWeekdayDate(d);
  const isoDate = getISODateForDay(d);
  const allBunks = getAllBunks();
  const dayBunks = allBunks[isoDate] || { isFullDay: false, periods: {} };

  dateEl.textContent = formatFullDate(selectedDateObj);
  todayJumpEl.classList.toggle("visible", !viewToday);
  dayEl
    .querySelectorAll("button")
    .forEach((b) => b.classList.toggle("active", b.dataset.day === d));

  // Day Bunk Button State
  if (dayBunkBtn) {
    if (!list || !list.length) {
      dayBunkBtn.style.display = "none";
    } else {
      dayBunkBtn.style.display = "inline-flex";
      const isAllBunked =
        dayBunks.isFullDay ||
        (Object.keys(dayBunks.periods || {}).length === list.length &&
          list.length > 0);
      dayBunkBtn.classList.toggle("is-bunked", isAllBunked);
      if (isAllBunked) {
        dayBunkText.textContent = "🏖️ Full Day Bunked (Manage)";
      } else {
        dayBunkText.textContent = "🚷 Bunk Full Day";
      }
      dayBunkBtn.onclick = () => openDayBunkModal(d);
    }
  }

  classesEl.innerHTML = "";
  updateStatus(list, d);

  if (list === null) {
    classesEl.innerHTML = `
      <div class="empty">
        <div style="font-size:36px;margin-bottom:8px">🚀</div>
        <strong style="font-size:16px;color:var(--text)">Coming Soon!!</strong><br>
        <span style="font-size:12px;margin-top:6px;display:inline-block">Timetable data for ${escapeHtml(currentBranch)} - ${escapeHtml(currentSection)} will be updated shortly!</span>
      </div>`;
    return;
  }

  if (!list.length) {
    classesEl.innerHTML = `
      <div class="empty">
        <strong style="font-size:16px;color:var(--text)">No classes scheduled</strong><br>
        <span style="font-size:12px;margin-top:6px;display:inline-block">Enjoy your day! 🎉</span>
      </div>`;
    return;
  }

  list.forEach((item, i) => {
    const t = item.time || "";
    const s = item.subject || "";
    const c = item.course_code || "";
    const r = item.venue || "";
    const tr = item.faculty || "";
    const typeStr = (item.type || "theory").toUpperCase();
    let grpStr = "";
    if (Array.isArray(item.groups)) {
      grpStr = item.groups
        .map(
          (g) =>
            `${g.group}${g.faculty ? " (" + g.faculty + ")" : ""}${g.venue ? " @ " + g.venue : ""}`,
        )
        .join(", ");
    } else {
      grpStr = item.groups || "";
    }

    const periodKey = getPeriodBunkKey(t, c, s);
    const bunkData = dayBunks.periods ? dayBunks.periods[periodKey] : null;
    const isBunked = !!bunkData;
    const bunkType =
      bunkData ? bunkData.bunkNature || bunkData.type || "intentional" : "";

    const el = document.createElement("article");
    const live = i === li;
    const next = i === ni && li < 0;
    const [startMin, endMin] = parseRange(t);
    const done = viewToday && !live && endMin > 0 && endMin <= nowMin();

    el.className = `class${item.isDouble ? " double" : ""}${live ? " live" : ""}${done ? " done" : ""}`;

    const parts = t.split("–");
    const startStr = parts[0] ? parts[0].trim() : t;
    const endStr = parts[1] ? parts[1].trim() : "";

    const codeHtml = c ? `<div class="code">📘 ${escapeHtml(c)}</div>` : "";
    const roomHtml = r ? `<div class="code">📍 ${escapeHtml(r)}</div>` : "";
    const teacherHtml =
      tr ? `<div class="code">👨‍🏫 ${escapeHtml(tr)}</div>` : "";
    const groupHtml =
      grpStr ?
        `<div class="code" style="color:var(--accent);font-weight:700">👥 Groups: ${escapeHtml(grpStr)}</div>`
      : "";

    const cardBunkClass = isBunked ? ` bunked bunk-${bunkType}` : "";
    const bunkBtnHtml = `
      <button type="button" class="bunk-card-btn${isBunked ? " is-bunked " + bunkType : ""}" data-idx="${i}" aria-label="Toggle bunk for this class">
        ${
          isBunked ?
            bunkType === "intentional" ?
              "🎯 Bunked"
            : "📋 OD"
          : "+ Bunk"
        }
      </button>
    `;

    let bunkNoteHtml = "";
    if (isBunked) {
      const typeLabel =
        bunkType === "intentional" ?
          "🎯 INTENTIONAL BUNK"
        : "📋 UNINTENTIONAL / OD";
      const metaLabel = (
        bunkData.classType ||
        item.type ||
        "theory"
      ).toUpperCase();
      bunkNoteHtml = `
        <div class="bunk-note-badge ${bunkType}">
          <div class="bunk-note-header">
            <span class="bunk-note-type">${escapeHtml(typeLabel)}</span>
            <span class="bunk-note-meta">${escapeHtml(metaLabel)}</span>
          </div>
          ${bunkData.title ? `<div class="bunk-note-title">${escapeHtml(bunkData.title)}</div>` : ""}
          ${bunkData.description ? `<div class="bunk-note-desc">${escapeHtml(bunkData.description)}</div>` : ""}
        </div>
      `;
    }

    el.innerHTML = `
      <div class="time">
        <span>${escapeHtml(startStr)}</span>
        <span>${escapeHtml(endStr)}</span>
      </div>
      <div class="card${live ? " live" : ""}${next ? " next" : ""}${cardBunkClass}">
        <div class="top-right-badges">
          <span class="type">${escapeHtml(typeStr)}</span>
          ${bunkBtnHtml}
        </div>
        <div class="subject">${escapeHtml(s || "Class")}</div>
        ${codeHtml}
        ${roomHtml}
        ${teacherHtml}
        ${groupHtml}
        ${bunkNoteHtml}
      </div>`;

    const bunkBtn = el.querySelector(".bunk-card-btn");
    if (bunkBtn) {
      bunkBtn.onclick = (e) => {
        e.stopPropagation();
        openPeriodBunkModal(item, d);
      };
    }

    classesEl.appendChild(el);

    const end = endMin;
    const b = breaks.find(([bs]) => toMinutes(bs) === end);
    if (b) addBreak(b);
    if (i < list.length - 1) {
      const nextStart = parseRange(list[i + 1].time)[0];
      const gapBreak = breaks.find(
        ([bs, be]) =>
          toMinutes(bs) >= end &&
          toMinutes(be) <= nextStart &&
          !breaks.some(([pbs]) => toMinutes(pbs) === end),
      );
      if (gapBreak) addBreak(gapBreak);
    }
  });

  if (scroll && li >= 0) {
    setTimeout(
      () =>
        classesEl.children[li]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        }),
      150,
    );
  }
}

let lastMinute = -1;
const DATA_CACHE_KEY = "timetable_cached_data_v2";

function initAppWithData(data) {
  DATA = data;

  if (!DATA[currentBranch]) {
    currentBranch = Object.keys(DATA)[0] || "CSE";
  }
  if (!DATA[currentBranch][currentSection]) {
    const available = Object.keys(DATA[currentBranch]);
    if (available.length > 0) currentSection = available[0];
  }

  if (dayEl && dayEl.children.length === 0) {
    order.forEach((d) => {
      const dateObj = getWeekdayDate(d);
      const pillDate = formatDayPillDate(dateObj);
      const b = document.createElement("button");
      b.type = "button";
      b.className = "day";
      b.dataset.day = d;
      b.innerHTML = `<span class="day-name">${short[d]}</span><span class="day-date">${pillDate}</span>`;
      if (d === todayName()) b.classList.add("today-day");
      b.onclick = () => render(d);
      dayEl.appendChild(b);
    });

    if (todayBadgeEl) {
      todayBadgeEl.onclick = () => render(todayName(), true);
    }
    if (todayJumpEl) {
      todayJumpEl.onclick = () => render(todayName(), true);
    }
  }

  updateBunkTopBadge();

  if (!selectedDay) {
    const initial = order.includes(todayName()) ? todayName() : "Monday";
    render(initial, true);
  } else {
    render(selectedDay);
  }
}

// 1. Instant load from localStorage cache if available
try {
  const cachedData = localStorage.getItem(DATA_CACHE_KEY);
  if (cachedData) {
    const parsed = JSON.parse(cachedData);
    if (parsed && typeof parsed === "object") {
      initAppWithData(parsed);
    }
  }
} catch (e) {
  console.warn("Could not read cached timetable data from localStorage:", e);
}

// 2. Fetch fresh data from data.json and update localStorage cache
fetch("./data.json?v=2.1", { cache: "no-cache" })
  .then((res) => res.json())
  .then((data) => {
    try {
      localStorage.setItem(DATA_CACHE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn("Could not save timetable data to localStorage cache:", e);
    }
    initAppWithData(data);
  })
  .catch((err) => {
    console.error("Failed to load timetable data:", err);
    if (!DATA || Object.keys(DATA).length === 0) {
      classesEl.innerHTML = `
              <div class="empty">
                <strong style="font-size:16px;color:var(--text)">Offline Mode</strong><br>
                <span style="font-size:12px;margin-top:6px;display:inline-block">No cached timetable data found. Please connect to the internet once to load the schedule.</span>
              </div>`;
    }
  });

setInterval(() => {
  const list = getTimetable(selectedDay);
  if (selectedDay === todayName()) {
    const currentMin = Math.floor(nowMin());
    if (currentMin !== lastMinute) {
      lastMinute = currentMin;
      render(selectedDay);
    } else {
      updateStatus(list, selectedDay);
    }
  }
}, 1000);
