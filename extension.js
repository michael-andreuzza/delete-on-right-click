const vscode = require('vscode');
const fs = require('fs');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    console.log('Congratulations, your extension "delete-content" is now active!');

    // Register the command for deleting content from the editor
    let disposableEditorCommand = vscode.commands.registerCommand('delete-content.deleteContent', function () {
        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found.');
            return;
        }

        let doc = editor.document;
        if (doc.isUntitled) {
            vscode.window.showErrorMessage('Cannot delete content of unsaved file.');
            return;
        }

        let selection = editor.selection;
        let start = selection.start;
        let end = selection.end;

        // If there's a selection, delete the selected content
        if (!selection.isEmpty) {
            let deleteRange = new vscode.Range(start, end);
            editor.edit(editBuilder => {
                editBuilder.delete(deleteRange);
            });
        } else {
            // If no selection, delete the entire content of the file
            let fullRange = doc.validateRange(new vscode.Range(0, 0, Infinity, Infinity));
            editor.edit(editBuilder => {
                editBuilder.delete(fullRange);
            });
        }
    });

    // Register the command for deleting content from the Explorer context menu
    let disposableExplorerCommand = vscode.commands.registerCommand('delete-content.deleteFileContent', function (resource) {
        if (!resource) {
            vscode.window.showErrorMessage('No file selected for deletion.');
            return;
        }

        // Ensure resource is treated as an array
        const resources = Array.isArray(resource) ? resource : [resource];

        resources.forEach((res, index) => {
            if (res && res.fsPath) {
                console.log(`Deleting content of file ${index + 1}:`, res.fsPath); // Debug log
                fs.writeFile(res.fsPath, '', (err) => {
                    if (err) {
                        vscode.window.showErrorMessage('Failed to delete file content: ' + err.message);
                    } else {
                        vscode.window.showInformationMessage('File content deleted successfully: ' + res.fsPath);
                        console.log(`Content deleted for file ${index + 1}:`, res.fsPath); // Debug log
                    }
                });
            } else {
                console.log('No valid resource path provided for file', index + 1); // Debug log
            }
        });
    });

    context.subscriptions.push(disposableEditorCommand);
    context.subscriptions.push(disposableExplorerCommand);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
