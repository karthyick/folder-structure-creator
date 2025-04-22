# Folder Structure Creator

A Visual Studio Code extension that allows you to create folder structures by pasting ASCII tree representations.

## Features

- Create folder structures from text representations directly in the terminal
- Use the "create folder" command followed by your folder structure
- Alternatively, copy your folder structure to clipboard and use the command palette

## How to Use

### Method 1: Terminal Command

1. Open the terminal in VS Code
2. Type `create folder` followed by your folder structure, for example:

```
create folder my_project/ 
├── requirements.txt 
├── src/ 
│   └── main.py 
└── tests/ 
    └── test_main.py
```

### Method 2: Clipboard

1. Copy your folder structure to clipboard
2. Press `Ctrl+Alt+F` (or `Cmd+Alt+F` on Mac)
3. The folder structure will be created in your workspace

## Installation

1. Download the VSIX file
2. In VS Code, go to Extensions view (Ctrl+Shift+X)
3. Click "..." in the top right of Extensions view
4. Select "Install from VSIX..."
5. Choose the downloaded VSIX file

## Building from Source

1. Clone this repository
2. Run `npm install` to install dependencies
3. Run `npm run compile` to compile the extension
4. Run `vsce package` to create a VSIX file

## License
