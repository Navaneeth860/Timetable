(function(root, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    factory(exports);
  } else {
    factory(root);
  }
})(typeof self !== 'undefined' ? self : this, function(exports) {
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
    if (!t) return [0, 0];
    const str = String(t).replace(/–|—|-/g, "–");
    if (!str.includes("–")) return [0, 0];
    const parts = str.split("–");
    if (parts.length < 2) return [0, 0];

    let startStr = parts[0].trim();
    let endStr = parts[1].trim();

    if (endStr.includes("AM") && !startStr.includes("AM") && !startStr.includes("PM")) {
      startStr += " AM";
    } else if (endStr.includes("PM") && !startStr.includes("AM") && !startStr.includes("PM")) {
      let startH = parseInt(startStr.split(":")[0], 10);
      if (startH === 12 || startH < 8) {
        startStr += " PM";
      } else {
        startStr += " AM";
      }
    }

    return [toMinutes(startStr), toMinutes(endStr)];
  }

  function sortDayList(list) {
    if (!Array.isArray(list)) return list;
    return list.slice().sort((a, b) => {
      const s1 = parseRange(a.time)[0];
      const s2 = parseRange(b.time)[0];
      return s1 - s2;
    });
  }

  function sortData(data) {
    if (!data || typeof data !== "object") return;
    for (const branch of Object.keys(data)) {
      if (branch === "lastUpdated" || branch === "DATA_VERSION") continue;
      const branchObj = data[branch] || {};
      for (const section of Object.keys(branchObj)) {
        const secObj = branchObj[section] || {};
        for (const day of Object.keys(secObj)) {
          if (Array.isArray(secObj[day])) {
            secObj[day] = sortDayList(secObj[day]);
          }
        }
      }
    }
  }

  function liveIndices(list, isToday, nowMin) {
    if (!isToday || !Array.isArray(list)) return [];
    const indices = [];
    list.forEach((item, i) => {
      const [s, e] = parseRange(item.time);
      if (s > 0 && nowMin >= s && nowMin < e) {
        indices.push(i);
      }
    });
    return indices;
  }

  function nextIndex(list, isToday, nowMin) {
    if (!isToday || !Array.isArray(list)) return -1;
    return list.findIndex(item => {
      const [s] = parseRange(item.time);
      return s > nowMin;
    });
  }

  function status(list, isToday, nowMin, breaks) {
    if (!isToday) return null;
    breaks = breaks || [["09:50", "10:20", "Tea Break"], ["01:05", "02:00", "Lunch Break"]];

    if (Array.isArray(list) && list.length > 0) {
      const lis = liveIndices(list, true, nowMin);
      if (lis.length > 0) {
        const liveItems = lis.map(i => list[i]);
        const title = liveItems.map(item => item.subject).join(" + ");
        const minEnd = Math.min(...liveItems.map(item => parseRange(item.time)[1]));
        return { kind: "live", label: "Live now", title: title, target: minEnd, prefix: "Ends in " };
      }

      const br = breaks.find(([s, e]) => nowMin >= toMinutes(s) && nowMin < toMinutes(e));
      if (br) {
        const ni = nextIndex(list, true, nowMin);
        const nextTitle = ni >= 0 ? `Next: ${list[ni].subject}` + (list[ni].venue ? `, Room ${list[ni].venue}` : "") : "Enjoy your break";
        return { kind: "break", label: br[2], title: nextTitle, target: toMinutes(br[1]), prefix: "Ends in " };
      }

      const ni = nextIndex(list, true, nowMin);
      if (ni >= 0) {
        const item = list[ni];
        const prevLiveOrBreak = list.some(item => {
          const [s, e] = parseRange(item.time);
          return nowMin >= s && nowMin < e;
        });
        const isFreePeriod = !prevLiveOrBreak && ni > 0;
        return {
          kind: isFreePeriod ? "break" : "next",
          label: isFreePeriod ? "Free Period" : "Next class",
          title: item.subject + (item.venue ? `, Room ${item.venue}` : ""),
          target: parseRange(item.time)[0],
          prefix: "Starts in "
        };
      }
    }

    const br = breaks.find(([s, e]) => nowMin >= toMinutes(s) && nowMin < toMinutes(e));
    if (br) return { kind: "break", label: br[2], title: "Enjoy your break", target: toMinutes(br[1]), prefix: "Ends in " };

    return { kind: "done", label: "Day complete", title: "No more classes today", target: null, prefix: "" };
  }

  exports.toMinutes = toMinutes;
  exports.parseRange = parseRange;
  exports.sortDayList = sortDayList;
  exports.sortData = sortData;
  exports.liveIndices = liveIndices;
  exports.nextIndex = nextIndex;
  exports.status = status;

  if (typeof window !== 'undefined' && exports !== window) {
    window.toMinutes = toMinutes;
    window.parseRange = parseRange;
    window.sortDayList = sortDayList;
    window.sortData = sortData;
    window.liveIndices = liveIndices;
    window.nextIndex = nextIndex;
    window.status = status;
  }
});
