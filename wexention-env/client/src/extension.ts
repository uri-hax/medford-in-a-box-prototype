/* extension.ts
 * 
 * By: Liam Strand
 * On: Summer 2022
 * 
 * Provides a shim connecting the language server to VS Code. Handles making
 * requests to the language server and reporting responses.
 * 
 * Also handles most dependency management.
 * 
 */

"use strict";

import * as net from "net";
import * as path from "path";
import * as vscode from 'vscode';
import { ExtensionContext, ExtensionMode, workspace, window } from "vscode";
import {
    LanguageClient,
    LanguageClientOptions,
    ServerOptions,
} from "vscode-languageclient/node";
import * as cp from "child_process";

let client: LanguageClient;

const DEBUG_CLIENT = false;

function getClientOptions(): LanguageClientOptions {
    return {
        // Register the server for plain text documents
        documentSelector: [
            { scheme: "file", language: "medford" },
            { scheme: "untitled", language: "medford" },
        ],
        outputChannelName: "[pygls] MEDFORDLanguageServer",
        synchronize: {
            // Notify the server about file changes to '.clientrc files contain in the workspace
            fileEvents: workspace.createFileSystemWatcher("**/.clientrc"),
        },
    };
}

function installDependencies(pythonPath: string): void {
    try {
        // check if mfdls is installed already
        cp.execSync(`${pythonPath} -c "import pygls"`);
    } catch (e) {
        window.showWarningMessage(`Could not find pygls in ${pythonPath}, attempting to install now`);
        try {
            // if not, try to install it.
            cp.execSync(`${pythonPath} -m pip install pygls`);
        } catch (e) {
            window.showErrorMessage("Could not install pygls");
            throw new Error("could not install pygls")
        }
        window.showInformationMessage("Successfully installed pygls");
    }
}

function connectToLangServerTCP(addr: number): LanguageClient {
    const serverOptions: ServerOptions = () => {
        return new Promise((resolve, reject) => {
            const clientSocket = new net.Socket();
            clientSocket.on('error', (err) => {
                console.error('Error connecting to language server:', err);
                reject(err);
            });

            clientSocket.connect(addr, "127.0.0.1", () => {
                console.log(`Connected to language server at port ${addr}`);
                resolve({
                    reader: clientSocket,
                    writer: clientSocket,
                });
            });
        });
    };

    return new LanguageClient(
        `tcp lang server (port ${addr})`,
        serverOptions,
        getClientOptions()
    );
}


function startLangServer(
    command: string,
    args: string[],
    cwd: string
): LanguageClient {
    const serverOptions: ServerOptions = {
        args,
        command,
        options: { cwd },
    };

    return new LanguageClient(command, serverOptions, getClientOptions());
}

// sw - added more debugging
export function activate(context: ExtensionContext): void {
    console.log('Extension Path:', context.extensionPath);
    console.log('Path Type:', typeof context.extensionPath);
    if (typeof context.extensionPath !== 'string') {
        console.error('Context:', context);
        throw new Error('context.extensionPath is not a string');
    }

    if (context.extensionMode === ExtensionMode.Development && !DEBUG_CLIENT) {
        console.log('Running in Development Mode...');
        try {
            client = connectToLangServerTCP(2087);
            context.subscriptions.push(client.start());
        } catch (err) {
            console.error('Failed to connect to language server (TCP):', err);
        }
    } else {
        console.log('Running in Production Mode...');
        console.log('__dirname:', __dirname);
        if (typeof __dirname !== 'string') {
            throw new Error('__dirname is not a string');
        }

        const cwd = path.join(__dirname, "..", "..", "medford-language-server");
        console.log('Language server working directory (cwd):', cwd);

        const pythonPath = workspace
            .getConfiguration("python")
            .get<string>("pythonPath");
        console.log('Python Path:', pythonPath);

        if (!pythonPath) {
            throw new Error('`python.pythonPath` is not set in the VS Code settings.');
        }

        try {
            installDependencies(pythonPath);
            console.log('Dependencies checked/installed successfully.');
            client = startLangServer(pythonPath, ["-m", "mfdls"], cwd);
            context.subscriptions.push(
                client.start().catch((err) => {
                    console.error('Error starting the language client:', err);
                })
            );
        } catch (err) {
            console.error('Failed to start the language server:', err);
        }
    }
}


export function deactivate(): Thenable<void> {
    return client ? client.stop() : Promise.resolve();
}
``
