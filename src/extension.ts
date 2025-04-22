import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
    console.log('Folder Structure Creator extension is now active');

    // Register the command for terminal integration
    let disposable = vscode.commands.registerCommand('folderStructureCreator.create', async () => {
        // Show an information message about how to use the extension
        vscode.window.showInformationMessage('Use "Folder Structure: Create from clipboard" or paste your structure in the Input Box that appears when running "Folder Structure: Create from input"');
    });

    // Register command to create from clipboard
    let clipboardCommand = vscode.commands.registerCommand('folderStructureCreator.createFromClipboard', async () => {
        const clipboardText = await vscode.env.clipboard.readText();
        if (!clipboardText) {
            vscode.window.showErrorMessage('No text in clipboard');
            return;
        }

        processStructureInput(clipboardText);
    });

    // Register command to create from input box
    let inputCommand = vscode.commands.registerCommand('folderStructureCreator.createFromInput', async () => {
        const inputText = await vscode.window.showInputBox({
            prompt: 'Paste your folder structure here',
            placeHolder: 'project/\n├── file.txt\n└── folder/',
            // Removing the multiline property
        });

        if (!inputText) {
            return; // User cancelled
        }

        processStructureInput(inputText);
    });

    context.subscriptions.push(disposable, clipboardCommand, inputCommand);
}

function processStructureInput(inputText: string): void {
    // Get the workspace folder
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        vscode.window.showErrorMessage('No workspace folder is open');
        return;
    }

    const workspaceRoot = workspaceFolders[0].uri.fsPath;
    
    try {
        createFolderStructure(inputText, workspaceRoot);
        vscode.window.showInformationMessage('Folder structure created successfully!');
    } catch (error) {
        vscode.window.showErrorMessage(`Error creating folder structure: ${error instanceof Error ? error.message : String(error)}`);
    }
}

function createFolderStructure(inputText: string, baseWorkspacePath: string): void {
    // Improved folder structure parser
    const lines = inputText.split('\n');
    
    let baseDir = '';
    let pathStack: string[] = [];
    let indentationLevels = new Map<number, number>();
    
    // Process each line
    for (const line of lines) {
        const trimmedLine = line.trim();
        
        // Skip empty lines
        if (!trimmedLine) {
            continue;
        }
        
        // Extract base directory
        if (!baseDir && trimmedLine.includes('/')) {
            // Look for patterns like "create folder project/" or just "project/"
            const baseDirMatch = trimmedLine.match(/(?:create\s+folder\s+)?(\S+)\//i);
            if (baseDirMatch) {
                baseDir = baseDirMatch[1].trim();
                
                // Create the base directory
                const fullBasePath = path.join(baseWorkspacePath, baseDir);
                if (!fs.existsSync(fullBasePath)) {
                    fs.mkdirSync(fullBasePath, { recursive: true });
                    console.log(`Created base directory: ${fullBasePath}`);
                }
                
                pathStack = [baseDir];
                continue;
            }
        }
        
        // Process structure lines
        const indentationMatch = line.match(/^(\s*)(├──|└──|│\s+└──)/);
        if (indentationMatch) {
            const indentation = indentationMatch[1].length;
            const indentationType = indentationMatch[2];
            
            // Extract the item name
            let itemName = '';
            const parts = line.split(indentationType);
            if (parts.length > 1) {
                itemName = parts[1].trim();
            }
            
            if (!itemName) {
                continue;
            }
            
            // Handle the path stack based on indentation
            if (indentationLevels.size === 0) {
                // First level after base directory
                indentationLevels.set(indentation, 1);
            } else {
                // Check if we've seen this indentation level before
                const existingLevel = indentationLevels.get(indentation);
                
                if (existingLevel !== undefined) {
                    // We know this level, adjust path stack to match
                    while (pathStack.length > existingLevel) {
                        pathStack.pop();
                    }
                } else {
                    // New indentation level, must be deeper
                    indentationLevels.set(indentation, pathStack.length + 1);
                }
            }
            
            // Determine if item is a file or directory
            const isDirectory = itemName.endsWith('/');
            const cleanName = isDirectory ? itemName.slice(0, -1) : itemName;
            
            // Create the file or directory
            const parentPath = path.join(baseWorkspacePath, ...pathStack);
            const fullPath = path.join(parentPath, cleanName);
            
            if (isDirectory) {
                if (!fs.existsSync(fullPath)) {
                    fs.mkdirSync(fullPath, { recursive: true });
                    console.log(`Created directory: ${fullPath}`);
                }
                pathStack.push(cleanName);
            } else {
                if (!fs.existsSync(fullPath)) {
                    fs.writeFileSync(fullPath, '');
                    console.log(`Created file: ${fullPath}`);
                }
            }
        }
    }
}

export function deactivate() {}