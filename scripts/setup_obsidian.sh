#!/bin/bash
# SOVEREIGN — Obsidian one-shot setup.
# Downloads community plugins from GitHub releases and writes all .obsidian/ configs.
# Idempotent: safe to re-run. Existing files get overwritten with the latest defaults.
#
# Usage:  ./setup_obsidian.sh
#         VAULT=/custom/path ./setup_obsidian.sh

set -e
VAULT="${VAULT:-$HOME/Library/Mobile Documents/iCloud~md~obsidian/Documents/SOVEREIGN}"
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

if [ ! -d "$VAULT" ]; then
  echo "Vault not found: $VAULT" >&2
  exit 1
fi

OBS="$VAULT/.obsidian"
mkdir -p "$OBS/plugins"

echo "→ Installing community plugins from GitHub releases…"
install_plugin() {
  local id="$1" owner="$2" repo="$3" has_styles="$4"
  local dir="$OBS/plugins/$id"
  mkdir -p "$dir"
  printf "  · %s … " "$id"
  curl -fsSL "https://github.com/$owner/$repo/releases/latest/download/main.js"      -o "$dir/main.js"      || { echo "FAILED main.js"; return; }
  curl -fsSL "https://github.com/$owner/$repo/releases/latest/download/manifest.json" -o "$dir/manifest.json" || { echo "FAILED manifest.json"; return; }
  [ "$has_styles" = "yes" ] && curl -fsSL "https://github.com/$owner/$repo/releases/latest/download/styles.css" -o "$dir/styles.css" 2>/dev/null || true
  echo "ok"
}
install_plugin dataview           blacksmithgu  obsidian-dataview yes
install_plugin templater-obsidian SilentVoid13  Templater         yes
install_plugin tag-wrangler       pjeby         tag-wrangler      no

echo "→ Writing configs…"
cat > "$OBS/community-plugins.json" <<'EOF'
["dataview","templater-obsidian","tag-wrangler"]
EOF

cat > "$OBS/core-plugins.json" <<'EOF'
["file-explorer","global-search","switcher","graph","backlink","canvas","outgoing-link","tag-pane","properties","page-preview","daily-notes","templates","note-composer","command-palette","editor-status","bookmarks","outline","word-count","file-recovery"]
EOF

cat > "$OBS/daily-notes.json" <<'EOF'
{
  "folder": "00-INBOX",
  "format": "YYYY-MM-DD",
  "template": "05-SYSTEMS/templates/daily-note",
  "autorun": false
}
EOF

cat > "$OBS/plugins/templater-obsidian/data.json" <<'EOF'
{
  "command_timeout": 5,
  "templates_folder": "05-SYSTEMS/templates",
  "templates_pairs": [["", ""]],
  "trigger_on_file_creation": true,
  "auto_jump_to_cursor": true,
  "enable_system_commands": false,
  "shell_path": "",
  "user_scripts_folder": "",
  "enable_folder_templates": true,
  "folder_templates": [
    { "folder": "00-INBOX", "template": "05-SYSTEMS/templates/daily-note.md" }
  ],
  "enable_file_templates": false,
  "file_templates": [],
  "syntax_highlighting": true,
  "syntax_highlighting_mobile": false,
  "enabled_templates_hotkeys": [""],
  "startup_templates": []
}
EOF

cat > "$OBS/plugins/dataview/data.json" <<'EOF'
{
  "enableInlineDataview": true,
  "enableDataviewJs": true,
  "enableInlineDataviewJs": true,
  "renderNullAs": "-",
  "warnOnEmptyResult": true,
  "refreshEnabled": true,
  "refreshInterval": 2500,
  "defaultDateFormat": "yyyy-MM-dd",
  "defaultDateTimeFormat": "yyyy-MM-dd HH:mm:ss",
  "tableIdColumnName": "File",
  "tableGroupColumnName": "Group",
  "showResultCount": true,
  "allowHtml": true,
  "inlineQueryPrefix": "=",
  "inlineJsQueryPrefix": "$=",
  "inlineQueriesInCodeblocks": true,
  "prettyRenderInlineFields": true
}
EOF

cat > "$OBS/hotkeys.json" <<'EOF'
{
  "daily-notes": [{ "modifiers": ["Mod","Shift"], "key": "D" }],
  "switcher:open": [{ "modifiers": ["Mod"], "key": "O" }],
  "command-palette:open": [{ "modifiers": ["Mod"], "key": "K" }],
  "global-search:open": [{ "modifiers": ["Mod","Shift"], "key": "F" }],
  "graph:open": [{ "modifiers": ["Mod","Shift"], "key": "G" }],
  "file-explorer:reveal-active-file": [{ "modifiers": ["Mod","Shift"], "key": "R" }],
  "tag-pane:open": [{ "modifiers": ["Mod","Shift"], "key": "T" }],
  "bookmarks:open": [{ "modifiers": ["Mod","Shift"], "key": "B" }],
  "app:toggle-left-sidebar": [{ "modifiers": ["Mod"], "key": "\\" }],
  "app:toggle-right-sidebar": [{ "modifiers": ["Mod","Shift"], "key": "\\" }],
  "editor:toggle-source": [{ "modifiers": ["Mod"], "key": "E" }]
}
EOF

cat > "$OBS/app.json" <<'EOF'
{
  "useTab": true,
  "tabSize": 2,
  "promptDelete": true,
  "alwaysUpdateLinks": true,
  "showLineNumber": false,
  "spellcheck": true,
  "newFileFolderPath": "00-INBOX",
  "newLinkFormat": "shortest",
  "useMarkdownLinks": false,
  "attachmentFolderPath": "08-LIBRARY/attachments",
  "defaultViewMode": "source",
  "livePreview": true,
  "autoPairBrackets": true,
  "autoPairMarkdown": true,
  "smartIndentList": true,
  "foldHeading": true,
  "foldIndent": true,
  "showInlineTitle": true,
  "trustedAuthorsAlwaysAsk": false,
  "readableLineLength": true,
  "fileSortOrder": "alphabetical-reverse",
  "showFrontmatter": true
}
EOF

# Bookmarks are written by the bigger script — copy from staged file if it exists
if [ -f "$SCRIPT_DIR/_obsidian-bookmarks.json" ]; then
  cp "$SCRIPT_DIR/_obsidian-bookmarks.json" "$OBS/bookmarks.json"
fi

echo ""
echo "✓ Obsidian setup complete."
echo ""
echo "Next: open Obsidian → Settings → Community plugins → 'Turn on community plugins'."
echo "Then Cmd+R to reload. Pre-staged plugins will load."
