#!/usr/bin/env bash

# ==============================================================================
# combine_text_files_to_txt.sh
#
# Reads **text-based** files recursively (excluding node_modules), filtering by
# common web dev extensions, and saves content to 'project_output.txt'.
#
# Usage:
#   1. Save as combine_text_files_to_txt.sh
#   2. chmod +x combine_text_files_to_txt.sh
#   3. ./combine_text_files_to_txt.sh
#   4. Enter path.
#   5. Open project_output.txt and copy content.
# ==============================================================================

# --- Configuration ---
OUTPUT_FILE="project_output.txt"
FILE_COUNT=0

# --- Prompt and Validate ---
read -p "Enter the full path to the folder containing your project files: " TARGET_FOLDER
TARGET_FOLDER=${TARGET_FOLDER%/}

if [ -z "$TARGET_FOLDER" ]; then
  echo "❌ Error: No folder path entered." >&2
  exit 1
fi
if [ ! -d "$TARGET_FOLDER" ]; then
  echo "❌ Error: Folder not found at '$TARGET_FOLDER'. Please check the path." >&2
  exit 1
fi

# --- Prepare Output File ---
> "$OUTPUT_FILE"
echo "🔄 Initialized output file: $(pwd)/$OUTPUT_FILE" >&2

echo "-----------------------------------------------------" >&2
echo "Processing files in: $TARGET_FOLDER (excluding node_modules, filtering text files)" >&2
echo "Saving output to: $OUTPUT_FILE" >&2
echo "-----------------------------------------------------" >&2

# --- Core Logic ---
# Find files, excluding node_modules AND filtering by likely text extensions
# Note: Parentheses \( \) group the -name conditions
{
  find "$TARGET_FOLDER" -path '*/node_modules' -prune -o \
  \( \
    -name '*.vue' -o \
    -name '*.js' -o \
    -name '*.mjs' -o \
    -name '*.cjs' -o \
    -name '*.ts' -o \
    -name '*.mts' -o \
    -name '*.cts' -o \
    -name '*.jsx' -o \
    -name '*.tsx' -o \
    -name '*.css' -o \
    -name '*.scss' -o \
    -name '*.sass' -o \
    -name '*.less' -o \
    -name '*.html' -o \
    -name '*.htm' -o \
    -name '*.json' -o \
    -name '*.yaml' -o \
    -name '*.yml' -o \
    -name '*.md' -o \
    -name '*.txt' -o \
    -name '*.svg' -o \
    -name '*.config.js' -o \
    -name '*.config.mjs' -o \
    -name '*.config.ts' -o \
    -name 'vite.config.*' -o \
    -name 'tailwind.config.*' -o \
    -name 'postcss.config.*' -o \
    -name 'tsconfig.*' -o \
    -name 'jsconfig.*' -o \
    -name '.env*' -o \
    -name 'LICENSE' -o \
    -name 'README*' -o \
    -name '.gitignore' -o \
    -name '.npmrc' -o \
    -name '.editorconfig' -o \
    -name '.eslintrc*' -o \
    -name '.prettier*' \
  \) -type f -print0 | while IFS= read -r -d $'\0' file; do
    RELATIVE_PATH="${file#$TARGET_FOLDER/}"
    echo "   L Processing Text File: $RELATIVE_PATH" >&2 # Debug message

    # Write separators and content to the file (stdout)
    echo ""
    echo "--- File: $RELATIVE_PATH ---"
    echo ""
    # Use cat, assuming files passing the extension filter are text
    cat "$file" 2>/dev/null
    echo ""
    echo "--- End File: $RELATIVE_PATH ---"
    echo ""

    ((FILE_COUNT++))
  done
} > "$OUTPUT_FILE" # Redirect stdout of the { block } to the output file

# --- Completion Message ---
echo "-----------------------------------------------------" >&2
if [ "$FILE_COUNT" -gt 0 ]; then
  echo "✅ Finished processing $FILE_COUNT text files." >&2
  echo "   Output saved to: $(pwd)/$OUTPUT_FILE" >&2
else
  echo "⚠️ Warning: Processed 0 text files matching the filters." >&2
  echo "   Please check the input path and folder contents/extensions." >&2
  echo "   Output file path: $(pwd)/$OUTPUT_FILE" >&2
fi
echo "-----------------------------------------------------" >&2

exit 0