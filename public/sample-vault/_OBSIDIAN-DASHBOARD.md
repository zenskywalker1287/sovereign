---
title: SOVEREIGN — Home
tags: [meta, dashboard]
cssclasses: [wide]
---

# SOVEREIGN

> *Personal OS. Pin this tab.*

---

## ⚡ Inbox & captures (unprocessed)

```dataview
TABLE WITHOUT ID
  file.link AS "Note",
  source AS "Source",
  type AS "Type",
  saved_at AS "Saved"
FROM "08-LIBRARY"
WHERE processed = false AND url
SORT saved_at DESC
LIMIT 25
```

---

## ✍️ Recent grades

```dataview
TABLE WITHOUT ID
  file.link AS "Note",
  drill AS "Drill",
  lane AS "Lane",
  total AS "Score"
FROM "01-CRAFT/writing/graded"
SORT date DESC
LIMIT 10
```

---

## 📺 Watched (transcripts ready)

```dataview
TABLE WITHOUT ID
  file.link AS "Video",
  uploader AS "Channel",
  duration AS "Length"
FROM "08-LIBRARY"
WHERE source = "youtube" OR source = "instagram" OR source = "tiktok"
WHERE has_transcript = true OR source_method
SORT saved_at DESC
LIMIT 10
```

---

## 📓 Recent journal

```dataview
LIST WITHOUT ID file.link
FROM "00-INBOX/journal"
SORT file.name DESC
LIMIT 7
```

---

## 🧠 Mental diets this week

```dataview
LIST WITHOUT ID file.link
FROM "00-INBOX/mental-diet"
SORT file.name DESC
LIMIT 7
```

---

## 🎯 Active projects

[[03-OPS/active-projects|Open list]]

---

## Quick jumps

- [[_OBSIDIAN-SETUP]] — first-time setup
- [[_TAGS]] — tag taxonomy
- [[01-CRAFT/writing/authors/gary-halbert|Halbert bootcamp]]
- [[01-CRAFT/writing/authors/stephenie-meyer|Meyer bootcamp]]
- [[01-CRAFT/speech-training|Speech training]]
