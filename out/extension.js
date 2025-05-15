"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
function activate(context) {
    console.log('Folder Structure Creator extension is now active');
    // Command: Create from Clipboard
    let clipboardCommand = vscode.commands.registerCommand('folderStructureCreator.createFromClipboard', async () => {
        const clipboardText = await vscode.env.clipboard.readText();
        if (!clipboardText || clipboardText.trim() === '') {
            vscode.window.showErrorMessage('No text in clipboard');
            return;
        }
        processStructureInput(clipboardText);
    });
    // Command: Create from Input
    let inputCommand = vscode.commands.registerCommand('folderStructureCreator.createFromInput', async () => {
        const inputText = await vscode.window.showInputBox({
            prompt: 'Paste your folder structure here',
            placeHolder: 'project/\n├── file.txt\n└── folder/',
        });
        if (!inputText || inputText.trim() === '') {
            vscode.window.showErrorMessage('Input was empty.');
            return;
        }
        processStructureInput(inputText);
    });
    context.subscriptions.push(clipboardCommand, inputCommand);
}
function processStructureInput(inputText) {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        vscode.window.showErrorMessage('No workspace folder is open');
        return;
    }
    const workspaceRoot = workspaceFolders[0].uri.fsPath;
    try {
        createFolderStructure(inputText, workspaceRoot);
        vscode.window.showInformationMessage('Folder structure created successfully!');
    }
    catch (error) {
        vscode.window.showErrorMessage(`Error: ${error.message}`);
    }
}
function createFolderStructure(inputText, baseWorkspacePath) {
    const lines = inputText.split('\n').map(line => line.replace(/\r$/, '')).filter(line => line.trim() !== '');
    if (lines.length === 0)
        throw new Error('Empty input');
    // Parse root directory (first line)
    let rootLine = lines[0].trim();
    if (rootLine.endsWith('/'))
        rootLine = rootLine.slice(0, rootLine.length - 1); // remove trailing /
    rootLine = rootLine.trim();
    if (rootLine === '')
        throw new Error('Root directory name is empty or invalid.');
    const rootDir = rootLine;
    const rootPath = path.join(baseWorkspacePath, rootDir);
    // Make sure root folder exists
    if (!fs.existsSync(rootPath))
        fs.mkdirSync(rootPath, { recursive: true });
    // Stack keeps track of [level, absolutePath]
    let stack = [{ level: 0, absPath: rootPath }];
    // Process each additional line (start from 1)
    for (let i = 1; i < lines.length; i++) {
        let line = lines[i];
        if (!line.trim())
            continue;
        // Find index of tree symbol
        const treeSymbolIdx = line.search(/[├└]/);
        if (treeSymbolIdx === -1)
            continue; // Ignore malformed
        // Level: (spaces or pipes before tree symbol) / 4 + 1
        let level = Math.floor(treeSymbolIdx / 4) + 1;
        // Extract the name after ── (supports comments after #)
        let match = line.match(/[├└]─+\s*([^\s#][^#]*)/);
        if (!match)
            continue;
        let name = match[1].trim();
        if (!name)
            continue; // skip empty
        let isDir = false;
        // Support both trailing / and .ext as valid folders/files
        if (name.endsWith('/')) {
            isDir = true;
            name = name.slice(0, -1).trim();
        }
        else if (name.match(/^[^\.]+$/)) {
            // If no extension and not ending with /, still treat as directory (optional: remove this if you want stricter checking)
            // isDir = true;
        }
        if (name === '')
            continue;
        // Adjust stack for the current level
        while (stack.length > 0 && stack[stack.length - 1].level >= level) {
            stack.pop();
        }
        // Find parent path
        const parentAbs = stack.length > 0 ? stack[stack.length - 1].absPath : baseWorkspacePath;
        const absPath = path.join(parentAbs, name);
        if (isDir) {
            if (!fs.existsSync(absPath))
                fs.mkdirSync(absPath, { recursive: true });
            stack.push({ level, absPath });
        }
        else {
            // Ensure parent dir exists
            const parentDir = path.dirname(absPath);
            if (!fs.existsSync(parentDir))
                fs.mkdirSync(parentDir, { recursive: true });
            if (!fs.existsSync(absPath))
                fs.writeFileSync(absPath, '');
        }
    }
}
function deactivate() { }
//# sourceMappingURL=extension.js.map