/*
 * @file Contains the DebuggerService.
 * @Author: Dennis Jung
 * @Author: Konrad Müller
 * @Date: 2018-06-13 20:33:10
 * @Last Modified by: Dennis Jung
 * @Last Modified time: 2018-06-13 20:33:35
 */

"use strict";
import * as Collections from "typescript-collections";
import * as vscode from "vscode";

/**
 * The DebuggerService. Provide functionality for starting, and manageing debug sessions.
 *
 * @export
 * @class DebuggerService
 */
export default class DebuggerService {
	/**
	 * The listener which is used to manage terminated debug sessions.
	 *
	 * @private
	 * @static
	 * @type {vscode.Disposable}
	 * @memberof DebuggerService
	 */
	private static listenerTerminateDebug: vscode.Disposable;

	/**
	 * A list of all active debugging sessions.
	 *
	 * @private
	 * @static
	 * @type {Collections.Dictionary<number, string>}
	 * @memberof DebuggerService
	 */
	private static inDebug: Collections.Dictionary<number, string> = new Collections.Dictionary<number, string>();

	/**
	 * A list of all debugging sessions which are diconnected.
	 *
	 * @private
	 * @static
	 * @type {Set<number>}
	 * @memberof DebuggerService
	 */
	private static hasDisconnected: Set<number> = new Set<number>();

	/**
	 * Initialize the DebuggerService
	 *
	 * @static
	 * @memberof DebuggerService
	 */
	public static Initialize(): void {
		this.listenerTerminateDebug = vscode.debug.onDidTerminateDebugSession(p => {
			this.inDebug.forEach((k, v) => {
				if (v === p.name) {
					setTimeout(() => {
						this.inDebug.remove(k);
						this.hasDisconnected.add(k);
					}, 2000);
				}
			});
		});
	}
	/**
	 * Terminate the DebuggerService
	 *
	 * @static
	 * @memberof DebuggerService
	 */
	public static Terminate(): void {
		this.listenerTerminateDebug.dispose();
		this.inDebug.clear();
	}

	/**
	 * Attaches the debugger to an specific process, with the given processId.
	 *
	 * @static
	 * @param {number} pid
	 * @param {vscode.DebugConfiguration} baseConfig
	 * @memberof DebuggerService
	 */
	public static AttachDebugger(pid: number, baseConfig: vscode.DebugConfiguration): void {
		if (!this.inDebug.containsKey(pid) && !this.hasDisconnected.has(pid)) {
			baseConfig.processId = String(pid);
			baseConfig.name += " - " + baseConfig.processId;
			this.inDebug.setValue(pid, baseConfig.name);
			vscode.debug.startDebugging(undefined, baseConfig);
		} else if (this.hasDisconnected.has(pid)) {
			this.inDebug.setValue(pid, "");
			this.hasDisconnected.delete(pid);
			vscode.window
				.showInformationMessage(`Debug ${pid} ?`, "Yes", "No")
				.then(k => {
					if (k) {
						if (k === "Yes") {
							baseConfig.processId = String(pid);
							baseConfig.name += " - " + baseConfig.processId;
							this.inDebug.setValue(pid, baseConfig.name);
							vscode.debug.startDebugging(undefined, baseConfig);
						}
					} else {
						setTimeout(() => {
							this.inDebug.remove(pid);
							this.hasDisconnected.add(pid);
						}, 60000);
					}
				});
		}
	}
}
