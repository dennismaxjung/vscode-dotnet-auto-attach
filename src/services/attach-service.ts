/*
 * @file Contains the AttachService.
 * @Author: Dennis Jung
 * @Author: Konrad Müller
 * @Date: 2018-06-16 18:53:11
 * @Last Modified by: Luiz Stangarlin
 * @Last Modified time: 2019-12-25 02:52:24
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
	 * Get the default DebugConfiguration
	 *
	 * @private
	 * @static
	 * @returns {DebugConfiguration}
	 * @memberof AttachService
	 */
	private static GetDefaultConfig(): DebugConfiguration {
		return {
			type: "coreclr",
			request: "attach",
			name: ".NET Core Attach - AUTO"
		};
	}

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
		let processesToScan = new Array<ProcessDetail>();
		let runningTasks = DotNetAutoAttach.Cache.RunningAutoAttachTasks;
		runningTasks.forEach((k, v) => {
			if (v && v.ProcessId) {
				processesToScan = processesToScan.concat(
					DotNetAutoAttach.ProcessService.GetProcesses(v.ProcessId.toString())
				);
			}
		});
		let matchedProcesses = new Array<number>();

		const pathRgx = /(?:\"?dotnet(?:[.]exe)?\"? exec \"?(.+)\"?|^\"([^\"]+)\"|^([^ ]+[ ]))/;
		processesToScan.forEach(p => {
			let matches = pathRgx.exec(p.cml);
			if (matches && matches.length === 4) {
				matches.shift();
				let path = matches.join('');
				let workFolder = DotNetAutoAttach.AttachService.CheckForWorkspace(path);
				if (workFolder) {
					matchedProcesses.push(p.pid);

					DotNetAutoAttach.DebugService.AttachDotNetDebugger(
						p.pid,
						AttachService.GetDefaultConfig(),
						workFolder
					);
				}
			}
		});
		DotNetAutoAttach.DebugService.DisconnectOldDotNetDebugger(matchedProcesses);
	}

	/**
	 * Check the process if it's within the current workspace.
	 *
	 * @private
	 * @static
	 * @param {string} processArgument
	 * @returns {string | undefined}
	 * @memberof AttachService
	 */
	private CheckForWorkspace(processArgument: string): string | undefined {
		const rgx = /msbuild/gi; //false positive
		if (vscode.workspace.workspaceFolders && !rgx.test(processArgument)) {
			for (let element of vscode.workspace.workspaceFolders) {
				let workFolder = element.uri.fsPath;
				if (processArgument.includes(workFolder)) {
					return workFolder;
				}
			}
		}
		return undefined;
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
