/*
 * @file Contains the DebuggerService.
 * @Author: Dennis Jung
 * @Author: Konrad Müller
 * @Date: 2018-06-13 20:33:10
 * @Last Modified by: Dennis Jung
 * @Last Modified time: 2018-06-15 17:32:11
 */

"use strict";
import * as vscode from "vscode";
import { debug, Disposable } from "vscode";
import AutoAttach from "../autoAttach";

/**
 * The DebuggerService. Provide functionality for starting, and manageing debug sessions.
 *
 * @export
 * @class DebuggerService
 */
export default class DebuggerService implements Disposable {

	/**
	 * Creates an instance of DebuggerService.
	 * @memberof DebuggerService
	 */
	public constructor() {
		this.disposables = new Set<Disposable>();
		this.disposables.add(debug.onDidTerminateDebugSession(DebuggerService.TryToRemoveDisconnectedDebugSession));
	}
	/**
	 * A list of all disposables.
	 *
	 * @private
	 * @type {Set<Disposable>}
	 * @memberof TaskService
	 */
	private disposables: Set<Disposable>;

	/**
	 * Try's to remove deconnected debugging sessions.
	 *
	 * @private
	 * @static
	 * @param {vscode.DebugSession} session
	 * @memberof DebuggerService
	 */
	private static TryToRemoveDisconnectedDebugSession(session: vscode.DebugSession): void {
		AutoAttach.Cache.RunningDebugs.forEach((k, v) => {
			if (v === session.name) {
				setTimeout(() => {
					AutoAttach.Cache.RunningDebugs.remove(k);
					AutoAttach.Cache.DisconnectedDebugs.add(k);
				}, 2000);
			}
		});
	}
	/**
	 * Attaches the dotnet debugger to a specific process.
	 *
	 * @param {number} pid
	 * @param {vscode.DebugConfiguration} baseConfig
	 * @memberof DebuggerService
	 */
	public AttachDotNetDebugger(pid: number, baseConfig: vscode.DebugConfiguration, path: string): void {
		let task = AutoAttach.Cache.RunningAutoAttachTasks.values().find(t => path.startsWith(t.Workspace.uri.fsPath));
		if (
			!AutoAttach.Cache.RunningDebugs.containsKey(pid) &&
			!AutoAttach.Cache.DisconnectedDebugs.has(pid) &&
			task
		) {
			baseConfig.processId = String(pid);
			baseConfig.name += " - " + baseConfig.processId;
			AutoAttach.Cache.RunningDebugs.setValue(pid, baseConfig.name);
			vscode.debug.startDebugging(undefined, baseConfig);
		} else if (
			AutoAttach.Cache.DisconnectedDebugs.has(pid) &&
			task
		) {
			AutoAttach.Cache.RunningDebugs.setValue(pid, "");
			AutoAttach.Cache.DisconnectedDebugs.delete(pid);

			let project = "";
			const name_regex = /^.+(\/|\\)(.+.csproj)/;
			let matches = name_regex.exec(task.Workspace.uri.fsPath);
			if (matches && matches.length === 3) {
				project = matches[2];
			}
			vscode.window
				.showInformationMessage(`Debug disconnected.\nReattach to ${project} (${pid}) ?`, "Yes", "No")
				.then(k => {
					if (k) {
						if (k === "Yes") {
							baseConfig.processId = String(pid);
							baseConfig.name += " - " + baseConfig.processId;
							AutoAttach.Cache.RunningDebugs.setValue(pid, baseConfig.name);
							vscode.debug.startDebugging(undefined, baseConfig);
						}
					} else {
						setTimeout(() => {
							AutoAttach.Cache.RunningDebugs.remove(pid);
							AutoAttach.Cache.DisconnectedDebugs.add(pid);
						}, 60000);
					}
				});
		}
	}


	/**
	 * Dispose
	 *
	 * @memberof DebuggerService
	 */
	public dispose(): void {
		this.disposables.forEach(k => k.dispose());
		this.disposables.clear();
	}
}
