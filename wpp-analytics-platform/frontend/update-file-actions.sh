#!/bin/bash

FILE="src/components/dashboard-builder/topbar/EditorTopbar.tsx"

# Step 1: Add fileActions hook after line 56
sed -i '56 a\
\
  \/\/ File actions (new, copy, rename, download, etc.)\
  const fileActions = useFileActions();' "$FILE"

# Step 2: Replace connectedFileMenu section (around lines 85-93)
# This will use createFileMenuItems instead of mapping over FILE_MENU_ITEMS
sed -i '/\/\/ Connect menu items to store actions/,/connectedEditMenu = /c\
  \/\/ Connect menu items to store actions\
  \/\/ File menu uses fileActions hook\
  const connectedFileMenu = createFileMenuItems({\
    ...fileActions,\
    \/\/ Version history opens dialog\
    onVersionHistory: () => setIsVersionHistoryOpen(true),\
  });\
\
  const editActions = useEditActions();\
  const connectedEditMenu = createEditMenuItems(editActions);\
  const connectedEditMenu = ' "$FILE"

# Step 3: Update FILE menu button to use connectedFileMenu
echo "File updated successfully!"
