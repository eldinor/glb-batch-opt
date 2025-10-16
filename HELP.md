# GLB Batch Optimizer — Quick Help

## What this app does

Optimize one or more .glb files in the browser using Babylon.js, glTF-Transform and other tools under the hood of the GLB Batch Optimizer. You can configure many optimization passes (texture compression, mesh simplification, pruning, etc.), preview a selected result, and download the optimized files (individually or as a ZIP).

## Upload models

- Drag & drop .glb files into the left uploader, or click "Select Files" and choose .glb files.
- Only .glb files are accepted.

## Configure optimization

Use the right sidebar to toggle/adjust optimization steps. Common options:

- Texture Compression: Choose format (WebP/JPEG/PNG), set quality (Auto/Manual), and optional resize.
- Deduplication, Flatten, Join, Weld, Quantize, Resample, Instance, Sparse, Palette, Normals, Metal-Rough, Materials options, Centering, Meshopt, Simplify.
- Changes are saved to localStorage automatically.

## User settings (header → User Settings)

- File suffix: Add a suffix to optimized filenames.
- Shorten file names: Truncate long names to a maximum length.
- Dark Theme: Toggle the dark theme (applies an inversion filter).

## Processing & preview

- Each file shows status: Pending → Processing → Completed (or Error).
- For completed items, original/optimized sizes and reduction are shown.
- Click a completed file to preview it in the 3D viewer.

## Re-run optimization (Reload)

- Use the "Reload" button in the header to re-run optimization on all uploaded files using:
  - The same original GLB data (no need to re-upload)
  - The current settings in the right sidebar
- The app updates each file’s optimized output and keeps your current selection when possible.

## Download results

- Single file: Click the ↓ button next to a completed file to download its optimized GLB. The filename respects your File Suffix and shortening preferences.
- All files: Use "Download as Zip" (in the Files panel) when at least one file is completed.

## Managing files

- Remove a single file with the × button on the file item.
- Clear all files with the "Clear All" button in the Files list header.

## Notes & tips

- All processing is done locally in your browser; models are not uploaded to a server.
- Large models and heavy options (e.g., high texture sizes, simplify) may take time to process.
- Reload relies on the original data stored in memory for this session. Refreshing the page clears it, so you’ll need to re-upload.

## Troubleshooting

- If downloads don’t start, ensure your browser allows pop-ups for this page.
- If the Zip button is disabled, ensure at least one file is completed.
- Check the browser console for detailed logs/errors.
