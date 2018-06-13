/*
 * @file Contains the AutoAttachService.
 * @Author: Dennis Jung
 * @Author: Konrad Müller
 * @Date: 2018-06-13 20:32:28
 * @Last Modified by: Dennis Jung
 * @Last Modified time: 2018-06-13 20:33:01
 */


"use strict";
import * as vscode from "vscode";
import DebuggerService from "./debugger-service";
import ProcessService, { ProcessDetail } from "./process-service";

/**
 * The AutoAttachService. Provides start and stop functionality of the extension.
 *
 * @export
 * @class AutoAttachService
 */
export default class AutoAttachService {
	private static interval: NodeJS.Timer;
	private static pollInterval: number = 1000;

	/**
	 * Default coreclr attach debug config
	 *
	 * @private
	 * @static
	 * @type {vscode.DebugConfiguration}
	 * @memberof AutoAttachService
	 */
	private static defaultConfig: vscode.DebugConfiguration = {
		type: "coreclr",
		request: "attach",
		name: ".NET Core Attach - AUTO"
	};

	/**
	 * Start the AutoAttachService.
	 *
	 * @static
	 * @memberof AutoAttachService
	 */
	public static Start(): void {
		DebuggerService.Initialize();
		this.interval = setInterval(() => {
			ProcessService.GetProcesses(elements => {
				for (let element of elements) {
					if (
						(element.cml.startsWith('"dotnet" exec ') ||
							element.cml.startsWith("dotnet exec ")) &&
						this.CheckForWorkspace(element)
					) {
						DebuggerService.AttachDebugger(element.pid, this.defaultConfig);
					}
				}
			});
		}, this.pollInterval);
	}

	/**
	 * Check the process if it's within the current workspace.
	 *
	 * @private
	 * @static
	 * @param {ProcessDetail} process
	 * @returns {boolean}
	 * @memberof AutoAttachService
	 */
	private static CheckForWorkspace(process: ProcessDetail): boolean {
		if (vscode.workspace.workspaceFolders) {
			for (var element of vscode.workspace.workspaceFolders) {
				var path = vscode.Uri.file(
					process.cml
						.replace("dotnet exec ", "")
						.replace('"dotnet" exec ', "")
						.replace('"', "")
				);
				if (path.fsPath.includes(element.uri.fsPath)) {
					return true;
				}
			}
		}
		return false;
	}

	/**
	 * Stop the AutoAttachService.
	 *
	 * @static
	 * @memberof AutoAttachService
	 */
	public static Stop(): void {
		clearInterval(this.interval);
		DebuggerService.Terminate();
	}
}
