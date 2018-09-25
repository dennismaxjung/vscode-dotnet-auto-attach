/*
 * @file Contains the AttachService.
 * @Author: Dennis Jung
 * @Author: Konrad Müller
 * @Date: 2018-06-16 18:53:11
 * @Last Modified by: Dennis Jung
 * @Last Modified time: 2018-06-17 11:41:55
 */

import { clearInterval, setInterval } from "timers";
import { DebugConfiguration, Disposable } from "vscode";
import * as vscode from "vscode";
import DotNetAutoAttach from "../dotNetAutoAttach";
import ProcessDetail from "../models/ProcessDetail";

/**
 * The AttachService
 *
 * @export
 * @class AttachService
 */
export default class AttachService implements Disposable {
	/**
	 * Creates an instance of AttachService.
	 * @memberof AttachService
	 */
	public constructor() {
		this.disposables = new Set<Disposable>();
		this.timer = undefined;
	}

	/**
	 * The intervall between the poll.
	 *
	 * @private
	 * @static
	 * @type {number}
	 * @memberof AttachService
	 */
	private static interval: number = 1000;

	/**
	 * The default DebugConfiguration
	 *
	 * @private
	 * @static
	 * @type {DebugConfiguration}
	 * @memberof AttachService
	 */
	private static defaultConfig: DebugConfiguration = {
		type: "coreclr",
		request: "attach",
		name: ".NET Core Attach - AUTO"
	};

	/**
	 * A list of all disposables.
	 *
	 * @private
	 * @type {Set<Disposable>}
	 * @memberof AttachService
	 */
	private disposables: Set<Disposable>;

	/**
	 * The poll timer.
	 *
	 * @private
	 * @type {NodeJS.Timer}
	 * @memberof AttachService
	 */
	private timer: NodeJS.Timer | undefined;

	/**
	 * Start the timer to scan for attach.
	 *
	 * @memberof AttachService
	 */
	public StartTimer(): void {
		this.timer = setInterval(this.ScanToAttach, AttachService.interval);
	}

	/**
	 * Stop the timer to scan for attach.
	 *
	 * @memberof AttachService
	 */
	public StopTimer(): void {
		if (this.timer) {
			clearInterval(this.timer);
		}
	}

	/**
	 * Scan processes if its attachable, then try to attach debugger.
	 *
	 * @private
	 * @memberof AttachService
	 */
	private ScanToAttach(): void {
		var processesToScan = new Array<ProcessDetail>();
		var runningTasks = DotNetAutoAttach.Cache.RunningAutoAttachTasks;
		runningTasks.forEach((k, v) => {
			if (v && v.ProcessId) {
				processesToScan = processesToScan.concat(
					DotNetAutoAttach.ProcessService.GetProcesses(v.ProcessId.toString())
				);
			}
		});
		processesToScan.forEach(p => {
			if (
				(p.cml.startsWith('"dotnet" exec ') ||
					p.cml.startsWith("dotnet exec ")) &&
				DotNetAutoAttach.AttachService.CheckForWorkspace(p)
			) {
				const pathRgx = /^\"?dotnet\"? exec \"?(.+)\"?/;
				let matches = pathRgx.exec(p.cml);
				let path = "";
				if (matches && matches.length === 2) {
					path = matches[1];
				}
				DotNetAutoAttach.DebugService.AttachDotNetDebugger(
					p.pid,
					AttachService.defaultConfig,
					path
				);
			}
		});
	}

	/**
	 * Check the process if it's within the current workspace.
	 *
	 * @private
	 * @static
	 * @param {ProcessDetail} process
	 * @returns {boolean}
	 * @memberof AttachService
	 */
	private CheckForWorkspace(process: ProcessDetail): boolean {
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
	 * Dispose.
	 *
	 * @memberof AttachService
	 */
	public dispose(): void {
		this.disposables.forEach(k => {
			k.dispose();
		});
		this.StopTimer();
	}
}
