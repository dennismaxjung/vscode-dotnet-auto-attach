/*
 * @file Contains the DotNetAutoAttach base class.
 * @Author: Dennis Jung
 * @Author: Konrad Müller
 * @Date: 2018-06-16 15:41:58
 * @Last Modified by: Dennis Jung
 * @Last Modified time: 2018-06-17 11:32:49
 */

import * as vscode from "vscode";
import { Disposable } from "vscode";
import DotNetAutoAttachDebugConfigurationProvider from "./dotNetAutoAttachDebugConfigurationProvider";
import AttachService from "./services/attach-service";
import CacheService from "./services/cache-service";
import DebuggerService from "./services/debugger-service";
import ProcessService from "./services/process-service";
import TaskService from "./services/task-service";

/**
 * The DotNetAutoAttach base class, contains instances of all it's services.
 *
 * @export
 * @class DotNetAutoAttach
 * @implements {Disposable}
 */
export default class DotNetAutoAttach implements Disposable {
	public static readonly Cache: CacheService = new CacheService();
	public static readonly TaskService: TaskService = new TaskService();
	public static readonly DebugService: DebuggerService = new DebuggerService();
	public static readonly ProcessService: ProcessService = new ProcessService();
	public static readonly AttachService: AttachService = new AttachService();
	private static disposables: Set<Disposable> = new Set<Disposable>();

	/**
	 * Start the DotNetAutoAttach.
	 *
	 * @static
	 * @memberof DotNetAutoAttach
	 */
	public static Start(): void {
		// Register AutoAttachDebugConfigurationProvider
		this.disposables.add(
			vscode.debug.registerDebugConfigurationProvider(
				"DotNetAutoAttach",
				new DotNetAutoAttachDebugConfigurationProvider()
			)
		);
		this.AttachService.StartTimer();
	}

	/**
	 * Stop the DotNetAutoAttach.
	 *
	 * @static
	 * @memberof DotNetAutoAttach
	 */
	public static Stop(): void {

		this.AttachService.StopTimer();

		DotNetAutoAttach.disposables.forEach(d => {
			d.dispose();
		});

		DotNetAutoAttach.disposables.clear();

		DotNetAutoAttach.Cache.dispose();
		DotNetAutoAttach.DebugService.dispose();
	}

	/**
	 * Dispose.
	 *
	 * @memberof DotNetAutoAttach
	 */
	public dispose() {
		DotNetAutoAttach.Cache.dispose();
		DotNetAutoAttach.DebugService.dispose();
		DotNetAutoAttach.TaskService.dispose();
		DotNetAutoAttach.ProcessService.dispose();
		DotNetAutoAttach.AttachService.dispose();

		DotNetAutoAttach.disposables.forEach(d => {
			d.dispose();
		});

		DotNetAutoAttach.disposables.clear();
	}
}
