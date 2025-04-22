# Folder Structure Creator

A Visual Studio Code extension that allows you to create folder structures by pasting ASCII tree representations.

## Features

- Create folder structures from ASCII tree representations
- Support for standard tree characters like ├──, └── and nested structures
- Two convenient ways to use:
  - Copy structure to clipboard and use keyboard shortcut
  - Use input box to enter structure directly

## Usage

### Method 1: Clipboard (Recommended)

1. Copy a folder structure to your clipboard, for example:
wav2lip_project/
├── requirements.txt
├── download_models.py
├── inference.py
├── face_detection/
│   └── detection.py
└── models/
└── wav2lip.py

2. Press `Ctrl+Alt+F` (or `Cmd+Alt+F` on Mac)
3. The folder structure will be created in your current workspace

### Method 2: Input Box

1. Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`)
2. Select "Folder Structure: Create from input"
3. Paste your folder structure in the input box
4. Press Enter to create the structure

## Requirements

- Visual Studio Code 1.60.0 or higher

## Extension Settings

This extension contributes the following commands:

* `folderStructureCreator.create`: Show information about using the extension
* `folderStructureCreator.createFromClipboard`: Create folder structure from clipboard
* `folderStructureCreator.createFromInput`: Create folder structure from input box

## Known Issues

- The input box has limited space - for complex structures, use the clipboard method

## Release Notes

### 1.0.0

Initial release of Folder Structure Creator