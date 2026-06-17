---
title: Tag Taxonomy
tags: [meta, taxonomy]
updated: 2026-06-08
---

# Tag Taxonomy

Tags do one thing: **let you filter notes you haven't named yet**. Keep them shallow, plural-singular-consistent, lowercase-with-dashes.

## Three tag families

### 1. Source tags — where it came from
`#instagram` `#twitter` `#youtube` `#linkedin` `#tiktok`
`#notebook-lm` `#gemini` `#claude` `#own-thought`

### 2. Type tags — what kind of thing it is
`#video` `#tweet` `#thread` `#post` `#reel` `#article` `#essay`
`#note` `#journal` `#mental-diet` `#transcript` `#graded`
`#swipe` `#hook` `#headline` `#popup` `#vsl-component`

### 3. Domain tags — what it's about
`#copywriting` `#fiction` `#speech` `#cold-email` `#klaviyo` `#brand`
`#mindset` `#neuroscience` `#body` `#training` `#agency-ops`
`#zatreides` `#jarvis-solutions` `#chris-wells` `#gruns`

## Status tags — workflow state

`#wanted` — manually flagged for processing (used by `bulk_transcribe.py --wanted`)
`#review` — needs a second pass
`#shipped` — content went live somewhere
`#archive` — keep for reference but stop surfacing

## Rules

1. **No nested tags for the first 6 months.** Flat is faster to search. You can refactor later with Tag Wrangler.
2. **Source + type + 1-2 domain** is the standard 3-4 tag stack per note. Don't go to 8.
3. **If you find yourself wanting a tag that doesn't exist, add it here first** so this file stays the source of truth.
4. **Tags should be nouns,** not feelings. `#fitness-content` not `#interesting`.

## Tag-driven Dataview snippets you can paste anywhere

### Everything tagged #cold-email I haven't processed
````
```dataview
LIST FROM #cold-email
WHERE processed = false
```
````

### All grades in fiction lane, sorted by score
````
```dataview
TABLE total AS Score, date FROM "01-CRAFT/writing/graded"
WHERE lane = "fiction"
SORT total DESC
```
````

### Show me everything Halbert
````
```dataview
LIST FROM #halbert OR "01-CRAFT/writing/authors/gary-halbert"
```
````
