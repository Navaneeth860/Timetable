const fs = require('fs');
const path = require('path');

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

function validateData(dataPath) {
  let raw;
  try {
    raw = fs.readFileSync(dataPath, 'utf8');
  } catch (err) {
    console.error(`Failed to read file at ${dataPath}:`, err.message);
    process.exit(1);
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    console.error(`Failed to parse JSON in ${dataPath}:`, err.message);
    process.exit(1);
  }

  let errors = [];

  for (const branch of Object.keys(data)) {
    const branchObj = data[branch] || {};
    for (const section of Object.keys(branchObj)) {
      const secObj = branchObj[section] || {};
      for (const day of Object.keys(secObj)) {
        const list = secObj[day];
        if (!Array.isArray(list)) continue;

        let prevStart = -1;

        list.forEach((item, i) => {
          const t = item.time || "";
          const [s, e] = parseRange(t);

          if (s === 0 || e === 0) {
            errors.push(`${branch} / ${section} / ${day} / index ${i}: unparsable time "${t}"`);
            return;
          }

          if (e <= s) {
            errors.push(`${branch} / ${section} / ${day} / index ${i}: end time (${e}) <= start time (${s}) for "${t}"`);
          }

          if (s < prevStart) {
            errors.push(`${branch} / ${section} / ${day} / index ${i}: entry not sorted by start time (${t} starts at ${s} min, after prev ${prevStart} min)`);
          } else {
            prevStart = s;
          }
        });

        // Check for overlaps
        for (let i = 0; i < list.length; i++) {
          const [s1, e1] = parseRange(list[i].time);
          if (s1 === 0 || e1 === 0) continue;

          for (let j = i + 1; j < list.length; j++) {
            const [s2, e2] = parseRange(list[j].time);
            if (s2 === 0 || e2 === 0) continue;

            if (s2 < e1 && s1 < e2) {
              const p1 = !!list[i].parallel;
              const p2 = !!list[j].parallel;
              if (!p1 || !p2) {
                errors.push(`${branch} / ${section} / ${day}: overlapping entries at index ${i} ("${list[i].subject}" ${list[i].time}) and index ${j} ("${list[j].subject}" ${list[j].time}) without parallel flag`);
              }
            }
          }
        }
      }
    }
  }

  if (errors.length > 0) {
    console.error(`Validation failed with ${errors.length} error(s):`);
    errors.forEach(err => console.error(" - " + err));
    process.exit(1);
  } else {
    console.log("Validation passed! 0 errors found.");
    process.exit(0);
  }
}

const targetPath = process.argv[2] || path.join(__dirname, '..', 'data.json');
validateData(targetPath);
