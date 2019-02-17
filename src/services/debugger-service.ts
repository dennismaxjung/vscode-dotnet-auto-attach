/*
 * @file Contains the DebuggerService.
 * @Author: Dennis Jung
 * @Author: Konrad Müller
 * @Date: 2018-06-13 20:33:10
 * @Last Modified by: Dmitry Kosinov
 * @Last Modified time: 2019-02-06 16:27:33
 */

"use strict";
import * as vscode from "vscode";
import { debug, Disposable } from "vscode";
import DotNetAutoAttach from "../dotNetAutoAttach";

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
		this.disposables.add(
			debug.onDidTerminateDebugSession(
				DebuggerService.TryToRemoveDisconnectedDebugSession
			)
		);

		vscode.debug.onDidStartDebugSession(DebuggerService.AddDebugSession);
	}

	/**
	 * A list of all disposables.
	 *
	 * @private
	 * @type {Set<Disposable>}
	 * @memberof DebuggerService
	 */
	private disposables: Set<Disposable>;

	/** Adds real active debug session in cache when it starts */
	private static AddDebugSession(session: vscode.DebugSession): void {
		DotNetAutoAttach.Cache.ActiveDebugSessions.push(session);
	}

	/**
	 * Try's to remove deconnected debugging sessions.
	 *
	 * @private
	 * @static
	 * @param {vscode.DebugSession} session
	 * @memberof DebuggerService
	 */
	private static TryToRemoveDisconnectedDebugSession(
		session: vscode.DebugSession
	): void {
		DotNetAutoAttach.Cache.RunningDebugs.forEach((k, v) => {
			if (v === session.name) {
				setTimeout(() => {
					DotNetAutoAttach.Cache.RunningDebugs.remove(k);
					DotNetAutoAttach.Cache.DisconnectedDebugs.add(k);
				}, 2000);
			}
		});

		// Remove from active DebugSessions
		DotNetAutoAttach.Cache.ActiveDebugSessions = DotNetAutoAttach.Cache.ActiveDebugSessions.filter(
			s => s.name !== session.name
		);
	}

	/**
	 * Search for old debug session without runned processes.
	 * It happens when debugger stops on breakpoint and code changes with watch restart
	 * @param matchedPids
	 */
	public DisconnectOldDotNetDebugger(matchedPids: Array<number>) {
		let runningDebugs = DotNetAutoAttach.Cache.RunningDebugs.keys();

		// If matched processes does not have running debugs then we need to kill this debug
		for (var debug of runningDebugs) {
			if (matchedPids.indexOf(debug) < 0) {
				// Disconnect old debug
				const debugName = DotNetAutoAttach.Cache.RunningDebugs.getValue(debug);
				if (debugName) {
					const oldSession = DotNetAutoAttach.Cache.ActiveDebugSessions.find(
						s => s.name === debugName
					);
					if (oldSession) {
						oldSession.customRequest("disconnect");
					}
				}
			}
		}
	}

	/**
	 * Attaches the dotnet debugger to a specific process.
	 *
	 * @param {number} pid
	 * @param {vscode.DebugConfiguration} baseConfig
	 * @memberof DebuggerService
	 */
	public AttachDotNetDebugger(
		pid: number,
		baseConfig: vscode.DebugConfiguration,
		path: string
	): void {
		let task = DotNetAutoAttach.Cache.RunningAutoAttachTasks.values().find(t =>
			path.startsWith(t.ProjectFolderPath)
		);
		if (
			!DotNetAutoAttach.Cache.RunningDebugs.containsKey(pid) &&
			!DotNetAutoAttach.Cache.DisconnectedDebugs.has(pid) &&
			task
		) {
			baseConfig.processId = String(pid);
			baseConfig.name = task.Project + " - " + baseConfig.name + " - " + baseConfig.processId;
			DotNetAutoAttach.Cache.RunningDebugs.setValue(pid, baseConfig.name);
			vscode.debug.startDebugging(undefined, baseConfig);
		} else if (DotNetAutoAttach.Cache.DisconnectedDebugs.has(pid) && task) {
			DotNetAutoAttach.Cache.RunningDebugs.setValue(pid, "");
			DotNetAutoAttach.Cache.DisconnectedDebugs.delete(pid);

			vscode.window
				.showInformationMessage(
					`Debug disconnected. Reattach to ${task.Project} (${pid}) ?`,
					"Yes",
					"No",
					"Stop watch task"
				)
				.then(k => {
					if (k) {
						if (k === "Yes") {
							baseConfig.processId = String(pid);
							baseConfig.name += " - " + baseConfig.processId;
							DotNetAutoAttach.Cache.RunningDebugs.setValue(
								pid,
								baseConfig.name
							);
							vscode.debug.startDebugging(undefined, baseConfig);
						} else if (k === "Stop watch task") {
							if (task) {
								task.Terminate();
								setTimeout(() => {
									DotNetAutoAttach.Cache.DisconnectedDebugs.delete(pid);
									DotNetAutoAttach.Cache.RunningDebugs.remove(pid);
								}, 2000);
							}
						}
					} else {
						setTimeout(() => {
							DotNetAutoAttach.Cache.RunningDebugs.remove(pid);
							DotNetAutoAttach.Cache.DisconnectedDebugs.add(pid);
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
		this.disposables.forEach(k => {
			k.dispose();
		});
		this.disposables.clear();
	}
}
