/*
 * @file Contains the vscode extension.
 * @Author: Dennis Jung
 * @Author: Konrad Müller
 * @Date: 2018-06-13 20:32:01
 * @Last Modified by: Dennis Jung
 * @Last Modified time: 2018-06-17 11:38:01
 */

"use strict";
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import DotNetAutoAttach from "./dotNetAutoAttach";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	DotNetAutoAttach.Start();
}

// this method is called when your extension is deactivated
export function deactivate() {
	DotNetAutoAttach.Stop();
}
