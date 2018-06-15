import * as vscode from "vscode";
import { Disposable } from "vscode";
import AutoAttachDebugConfigurationProvider from "./autoAttachDebugConfigurationProvider";
import CacheService from "./services/cache-service";
import DebuggerService from "./services/debugger-service";
import TaskService from "./services/task-service";

export default class AutoAttach implements Disposable {
	public static readonly Cache: CacheService = new CacheService();
	public static readonly TaskService: TaskService = new TaskService();
	public static readonly DebugService: DebuggerService = new DebuggerService();
	private static disposables: Set<Disposable> = new Set<Disposable>();

	public static Start(): void {
		// Register AutoAttachDebugConfigurationProvider
		this.disposables.add(
			vscode.debug.registerDebugConfigurationProvider(
				"DotNetAutoAttach",
				new AutoAttachDebugConfigurationProvider()
			)
		);
	}

	public static Stop(): void {}

	public dispose() {
		AutoAttach.disposables.forEach(d => {
			d.dispose();
		});
		AutoAttach.disposables.clear();
	}
}
