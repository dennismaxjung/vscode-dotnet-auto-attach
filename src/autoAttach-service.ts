"use strict";
import * as vscode from "vscode";
import DebuggerService from "./debugger-service";
import ProcessService, { ProcessDetail } from "./process-service";

export default class AutoAttachService {
	private static interval: NodeJS.Timer;
	private static pollInterval: number = 1000;

	private static defaultConfig: vscode.DebugConfiguration = {
		type: "coreclr",
		request: "attach",
		name: ".NET Core Attach - AUTO"
	};

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

	public static Stop(): void {
		clearInterval(this.interval);
		DebuggerService.Terminate();
	}
}
