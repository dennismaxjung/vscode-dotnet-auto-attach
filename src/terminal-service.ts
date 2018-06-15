import {
	DebugConfiguration,
	ShellExecution,
	Task,
	WorkspaceFolder
} from "vscode";
import * as vscode from "vscode";

/**
 * The TerminalService, provides access to the integrated terminal.
 *
 * @export
 * @class TerminalService
 */
export default class TerminalService {
	private static openTask: Set<string> = new Set<string>();

	public static Initialize() {
		vscode.tasks.onDidEndTask(k => {
			this.openTask.delete(
				k.execution.task.source +
					k.execution.task.name +
					(k.execution.task.scope as WorkspaceFolder).name
			);
		});
	}

	public static StartWatcherTask(config: DebugConfiguration) {
		let command = "dotnet watch run";
		if (config.args) {
			if (config.args as string) {
				command += " " + (config.args as string);
			}
			if (config.args as Array<string>) {
				(config.args as Array<string>).forEach((k: string) => {
					command += " " + k;
				});
			}
		}

		if (config.workspace) {
			let work = config.workspace as WorkspaceFolder;

			var taskDefinition: vscode.TaskDefinition = { type: "" };
			var task: Task = new Task(
				taskDefinition,
				work,
				`Watch`,
				"DotNet Auto Attach",
				new ShellExecution(command, { env: config.env, cwd: work.uri.fsPath })
			);

			if (
				!this.openTask.has(
					task.source + task.name + (task.scope as WorkspaceFolder).name
				)
			) {
				var tmp = vscode.tasks.executeTask(task);

				tmp.then(k => {
					this.openTask.add(
						k.task.source + k.task.name + (k.task.scope as WorkspaceFolder).name
					);
				});
			}
		}
	}
}
