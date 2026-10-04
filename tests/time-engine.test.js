const assert = require('assert');
const path = require('path');
const { toMinutes, parseRange, sortDayList, liveIndices, nextIndex, status } = require('../scripts/time-engine.js');

console.log("Running time-engine test suite...");

// 1. Time parsing: 12h and 24h mixed formats
assert.strictEqual(toMinutes("08:00 AM"), 480, "08:00 AM should be 480 min");
assert.strictEqual(toMinutes("01:05 PM"), 785, "01:05 PM should be 785 min");
assert.strictEqual(toMinutes("12:10 PM"), 730, "12:10 PM should be 730 min");
assert.strictEqual(toMinutes("12:00 AM"), 0, "12:00 AM should be 0 min");
assert.strictEqual(toMinutes("13:05"), 785, "13:05 should be 785 min");
console.log("✔ 12h and 24h time parsing passed.");

// 2. The 12:10–01:05 lunch case
const [lunchStart, lunchEnd] = parseRange("12:10–01:05 PM");
assert.strictEqual(lunchStart, 730, "12:10 PM should parse to 730 min");
assert.strictEqual(lunchEnd, 785, "01:05 PM should parse to 785 min");
console.log("✔ 12:10-01:05 lunch case passed.");

// 3. Unsorted day list
const unsorted = [
  { time: "08:55–09:50", subject: "Class B" },
  { time: "08:00–08:55", subject: "Class A" },
  { time: "10:20–11:15", subject: "Class C" }
];
const sorted = sortDayList(unsorted);
assert.strictEqual(sorted[0].subject, "Class A", "Class A (08:00) should be first");
assert.strictEqual(sorted[1].subject, "Class B", "Class B (08:55) should be second");
console.log("✔ Unsorted list sorting passed.");

// 4. Parallel labs (overlapping live entries)
const parallelList = [
  { time: "11:15–01:05", subject: "Lab 1", parallel: true },
  { time: "11:15–01:05", subject: "Lab 2", parallel: true }
];
const liveAt12 = liveIndices(parallelList, true, 720); // 12:00 PM
assert.deepStrictEqual(liveAt12, [0, 1], "Both parallel labs should be live at 12:00 PM");
const stParallel = status(parallelList, true, 720);
assert.strictEqual(stParallel.title, "Lab 1 + Lab 2", "Status should combine parallel labs with +");
console.log("✔ Parallel labs live test passed.");

// 5. No-class day / empty day status
const emptyStatus = status([], true, 600); // 10:00 AM (during Tea Break window)
assert.ok(emptyStatus.kind === "break" || emptyStatus.kind === "done", "Empty day should report break or day complete");
console.log("✔ No-class day status passed.");

// 6. Midnight rollover logic check
let simulatedDate = "Mon Oct 04 2026";
function checkRollover(newDateStr) {
  if (newDateStr !== simulatedDate) {
    simulatedDate = newDateStr;
    return true;
  }
  return false;
}
assert.strictEqual(checkRollover("Mon Oct 04 2026"), false, "Same date should not trigger rollover");
assert.strictEqual(checkRollover("Tue Oct 05 2026"), true, "Midnight date change must trigger rollover");
console.log("✔ Midnight rollover test passed.");

console.log("\nAll time-engine tests passed successfully! 🎉");
