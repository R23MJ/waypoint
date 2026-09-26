import * as chrono from "chrono-node";
import { Context, Priority, RecurrenceRule, RecurrenceFreq } from "./types";

export interface ParsedQuickAdd {
  cleanTitle: string;
  dueDate: string | null;
  priority: Priority | null;
  contextIds: string[];
  recurrence: RecurrenceRule | null;
  matchedDateText: string | null;
  matchedContextNames: string[];
}

const RECURRENCE_PATTERNS: { regex: RegExp; freq: RecurrenceFreq; interval?: (m: RegExpMatchArray) => number }[] = [
  { regex: /\bevery\s+day\b|\bdaily\b/i, freq: "daily" },
  { regex: /\bevery\s+(\d+)\s+days?\b/i, freq: "daily", interval: (m) => parseInt(m[1], 10) },
  { regex: /\bevery\s+week\b|\bweekly\b/i, freq: "weekly" },
  { regex: /\bevery\s+(\d+)\s+weeks?\b/i, freq: "weekly", interval: (m) => parseInt(m[1], 10) },
  { regex: /\bevery\s+month\b|\bmonthly\b/i, freq: "monthly" },
  { regex: /\bevery\s+(\d+)\s+months?\b/i, freq: "monthly", interval: (m) => parseInt(m[1], 10) },
];

// Todoist-style: p1 = high, p2 = normal, p3 = low. Also accepts plain words.
const PRIORITY_PATTERNS: { regex: RegExp; priority: Priority }[] = [
  { regex: /(?:^|\s)p1\b/i, priority: "high" },
  { regex: /(?:^|\s)p2\b/i, priority: "normal" },
  { regex: /(?:^|\s)p3\b/i, priority: "low" },
  { regex: /!high\b/i, priority: "high" },
  { regex: /!low\b/i, priority: "low" },
];

export function parseQuickAdd(rawText: string, contexts: Context[]): ParsedQuickAdd {
  let text = rawText;
  let dueDate: string | null = null;
  let matchedDateText: string | null = null;
  let priority: Priority | null = null;
  let recurrence: RecurrenceRule | null = null;
  const contextIds: string[] = [];
  const matchedContextNames: string[] = [];

  // 1a. "every <weekday>" — weekly recurrence, and use that weekday as the
  // first occurrence's due date (e.g. "every monday" → next Monday).
  const weekdayMatch = text.match(
    /\bevery\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/i
  );
  if (weekdayMatch) {
    recurrence = { freq: "weekly", interval: 1 };
    const wdResults = chrono.parse(weekdayMatch[1], new Date(), { forwardDate: true });
    if (wdResults.length > 0) {
      dueDate = wdResults[0].start.date().toISOString().slice(0, 10);
      matchedDateText = weekdayMatch[1];
    }
    text = text.replace(weekdayMatch[0], " ");
  }

  // 1b. Other recurrence keywords (checked before date parsing so "every
  // day" isn't swallowed as a one-off date).
  if (!recurrence) {
    for (const p of RECURRENCE_PATTERNS) {
      const m = text.match(p.regex);
      if (m) {
        recurrence = { freq: p.freq, interval: p.interval ? p.interval(m) : 1 };
        text = text.replace(p.regex, " ");
        break;
      }
    }
  }

  // 2. Priority shorthand.
  for (const p of PRIORITY_PATTERNS) {
    const m = text.match(p.regex);
    if (m) {
      priority = p.priority;
      text = text.replace(p.regex, " ");
      break;
    }
  }

  // 3. Context tags — @name, matched case-insensitively against existing
  // contexts. Unrecognized @tokens are left alone (might just be an email
  // or a mention, not a context).
  const ctxRegex = /@([a-zA-Z][\w-]*)/g;
  let ctxMatch: RegExpExecArray | null;
  while ((ctxMatch = ctxRegex.exec(text))) {
    const name = ctxMatch[1].toLowerCase();
    const found = contexts.find((c) => c.name.toLowerCase() === name || c.name.toLowerCase().startsWith(name));
    if (found && !contextIds.includes(found.id)) {
      contextIds.push(found.id);
      matchedContextNames.push(found.name);
      text = text.replace(ctxMatch[0], " ");
    }
  }

  // 4. Date/time phrase — only if no recurrence claimed the sentence
  // already (avoids chrono misreading "every monday" as "next Monday").
  if (!recurrence) {
    const results = chrono.parse(text, new Date(), { forwardDate: true });
    if (results.length > 0) {
      const r = results[0];
      dueDate = r.start.date().toISOString().slice(0, 10);
      matchedDateText = r.text;
      text = text.replace(r.text, " ");
    }
  }

  const cleanTitle = text.replace(/\s+/g, " ").trim();

  return { cleanTitle, dueDate, priority, contextIds, recurrence, matchedDateText, matchedContextNames };
}
