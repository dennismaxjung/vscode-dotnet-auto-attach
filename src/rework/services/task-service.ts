/*
 * @file Contains the TaskService.
 * @Author: Dennis Jung
 * @Author: Konrad Müller
 * @Date: 2018-06-15 14:31:53
 * @Last Modified by: Dennis Jung
 * @Last Modified time: 2018-06-15 17:41:46
 */

import { Disposable, QuickPickOptions, ShellExecution, Task, TaskDefinition, TaskEndEvent, TaskExecution, tasks, Uri, window, workspace } from "vscode";
import AutoAttach from "../autoAttach";
import AutoAttachDebugConfiguration from "../models/AutoAttachDebugConfiguration";
import AutoAttachTask from "../models/AutoAttachTask";
import ProjectQuickPickItem from "../models/ProjectQuickPickItem";

/**
 * The TaskService, provides functions to manage tasks.
 *
 * @export
 * @class TaskService
 */
export default class TaskService implements Disposable {
	/**
	 * Creates an instance of TaskService.
	 * @memberof TaskService
	 */
	public constructor() {
		this.disposables = new Set<Disposable>();
		this.disposables.add(tasks.onDidEndTask(TaskService.TryToRemoveEndedTask));
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
	 * Try's to remove the Task of the TaskEndEvent from cache.
	 *
	 * @private
	 * @static
	 * @param {TaskEndEvent} event
	 * @memberof TaskService
	 */
	private static TryToRemoveEndedTask(event: TaskEndEvent) {
		var taskId = AutoAttachTask.GetIdFromTask(event.execution.task);
		if (taskId && taskId !== "") {
			AutoAttach.Cache.RunningAutoAttachTasks.remove(taskId);
		}
	}

	/**
	 * Start a task.
	 *
	 * @private
	 * @static
	 * @param {Task} task
	 * @memberof TaskService
	 */
	private static StartTask(task: Task): void {
		if (!AutoAttach.Cache.RunningAutoAttachTasks.containsKey(AutoAttachTask.GetIdFromTask(task))) {
			let tmp = tasks.executeTask(task);
			tmp.then((k: TaskExecution) => {
				let autoTask: AutoAttachTask = new AutoAttachTask(k);
				AutoAttach.Cache.RunningAutoAttachTasks.setValue(autoTask.Id, autoTask);
			});
		} else {
			window.showInformationMessage(".NET Watch Task already started for this project.");
		}
	}

	/**
	 * Generates a Tak out of a AutoAttachDebugConfiguration and a project uri path.
	 *
	 * @private
	 * @static
	 * @param {AutoAttachDebugConfiguration} config
	 * @param {string} [project=""]
	 * @returns {Task}
	 * @memberof TaskService
	 */
	private static GenerateTask(config: AutoAttachDebugConfiguration, projectUri: Uri | undefined): Task {
		let project = "";
		if (projectUri) {
			project = `--project "${projectUri.fsPath}" `;
		}
		let command = `dotnet watch ${project}run`;
		if (config.args) {
			if (typeof config.args === "string") {
				command += " " + (config.args as string);
			}
			if (Array.isArray(config.args)) {
				(config.args as Array<string>).forEach((k: string) => {
					command += " " + k;
				});
			}
		}

		let task: Task = new Task(
			({ type: "" } as TaskDefinition),
			config.workspace,
			"Watch",
			"DotNet Auto Attach",
			new ShellExecution(command, { env: config.env, cwd: config.workspace.uri.fsPath })
		);

		return task;
	}

	/**
	 * Start a new DotNet Watch Task
	 *
	 * @param {AutoAttachDebugConfiguration} config
	 * @memberof TaskService
	 */
	public StartDotNetWatchTask(config: AutoAttachDebugConfiguration) {
		workspace.findFiles("**/*.csproj").then(k => {
			var tmp = k.filter(m => m.toString().startsWith(config.workspace.uri.toString()));
			if (tmp.length >= 1) {
				let quickPickOptions: QuickPickOptions = {
					canPickMany: false,
					placeHolder: "Select the project to launch the DotNet Watch task for.",
					matchOnDescription: true,
					matchOnDetail: true
				};
				window.showQuickPick(tmp.map((k) => new ProjectQuickPickItem(k)), quickPickOptions).then(s => {
					if (s) {
						TaskService.StartTask(TaskService.GenerateTask(config, s.uri));
					}
				});

			}
			else {
				TaskService.StartTask(TaskService.GenerateTask(config, tmp[0]));
			}
		});
	}
	/**
	 * Dispose.
	 *
	 * @memberof TaskService
	 */
	public dispose() {
		this.disposables.forEach(k => k.dispose());
		this.disposables.clear();
	}
}

