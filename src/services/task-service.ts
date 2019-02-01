/*
 * @file Contains the TaskService.
 * @Author: Dennis Jung
 * @Author: Konrad Müller
 * @Date: 2018-06-15 14:31:53
 * @Last Modified by: Dennis Jung
 * @Last Modified time: 2018-06-16 15:44:50
 */

import {
	Disposable,
	ProcessExecution,
	QuickPickOptions,
	Task,
	TaskDefinition,
	TaskEndEvent,
	TaskExecution,
	TaskProcessStartEvent,
	tasks,
	Uri,
	window,
	workspace
} from "vscode";
import DotNetAutoAttach from "../dotNetAutoAttach";
import DotNetAutoAttachDebugConfiguration from "../interfaces/IDotNetAutoAttachDebugConfiguration";
import DotNetAutoAttachTask from "../models/DotNetAutoAttachTask";
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
		this.disposables.add(
			tasks.onDidStartTaskProcess(TaskService.IsWatcherStartedSetProcessId)
		);
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
		var taskId = DotNetAutoAttachTask.GetIdFromTask(event.execution.task);
		if (taskId && taskId !== "") {
			DotNetAutoAttach.Cache.RunningAutoAttachTasks.remove(taskId);
		}
	}

	/**
	 * Check if the started process task is a watcher task, Sets it process id.
	 *
	 * @private
	 * @static
	 * @param {TaskProcessStartEvent} event
	 * @memberof TaskService
	 */
	private static IsWatcherStartedSetProcessId(event: TaskProcessStartEvent) {
		let taskId = DotNetAutoAttachTask.GetIdFromTask(event.execution.task);
		if (DotNetAutoAttach.Cache.RunningAutoAttachTasks.containsKey(taskId)) {
			let task = DotNetAutoAttach.Cache.RunningAutoAttachTasks.getValue(
				taskId
			) as DotNetAutoAttachTask;
			task.ProcessId = event.processId;
			DotNetAutoAttach.Cache.RunningAutoAttachTasks.setValue(taskId, task);
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
		if (
			!DotNetAutoAttach.Cache.RunningAutoAttachTasks.containsKey(
				DotNetAutoAttachTask.GetIdFromTask(task)
			)
		) {
			let tmp = tasks.executeTask(task);
			tmp.then((k: TaskExecution) => {
				let autoTask: DotNetAutoAttachTask = new DotNetAutoAttachTask(k);
				DotNetAutoAttach.Cache.RunningAutoAttachTasks.setValue(
					autoTask.Id,
					autoTask
				);
			});
		} else {
			window.showInformationMessage(
				".NET Watch Task already started for the project " +
				task.definition.type.replace("Watch ", "")
			);
		}
	}

	/**
	 * Generates a Tak out of a AutoAttachDebugConfiguration and a project uri path.
	 *
	 * @private
	 * @static
	 * @param {DotNetAutoAttachDebugConfiguration} config
	 * @param {string} [project=""]
	 * @returns {Task}
	 * @memberof TaskService
	 */
	private static GenerateTask(
		config: DotNetAutoAttachDebugConfiguration,
		projectUri: Uri
	): Task {
		let projectName = "";
		const name_regex = /^.+(\/|\\)(.+).csproj/;
		let matches = name_regex.exec(projectUri.fsPath);
		if (matches && matches.length === 3) {
			projectName = matches[2];
		}

		let task: Task = new Task(
			{ type: "Watch " + projectName } as TaskDefinition,
			config.workspace,
			"Watch" + " " + projectName,
			"DotNet Auto Attach",
			new ProcessExecution(
				"dotnet",
				["watch", "--project", projectUri.fsPath, "run"].concat(config.args),
				{ cwd: config.workspace.uri.fsPath, env: config.env }
			),
			"$mscompile"
		);

		return task;
	}

	/**
	 * Start a new DotNet Watch Task
	 *
	 * @param {DotNetAutoAttachDebugConfiguration} config
	 * @memberof TaskService
	 */
	public StartDotNetWatchTask(config: DotNetAutoAttachDebugConfiguration) {

		if (!config.project || 0 === config.project.length) {
			workspace.findFiles("**/*.csproj").then(k => {
				var tmp = k.filter(m =>
					m.toString().startsWith(config.workspace.uri.toString())
				);
				if (tmp.length > 1) {
					let quickPickOptions: QuickPickOptions = {
						canPickMany: false,
						placeHolder:
							"Select the project to launch the DotNet Watch task for.",
						matchOnDescription: true,
						matchOnDetail: true
					};
					window
						.showQuickPick(
							tmp.map(k => new ProjectQuickPickItem(k)),
							quickPickOptions
						)
						.then(s => {
							if (s) {
								TaskService.StartTask(TaskService.GenerateTask(config, s.uri));
							}
						});
				} else {
					TaskService.StartTask(TaskService.GenerateTask(config, tmp[0]));
				}
			});
		} else {
			// TODO START with project from config.
			//TaskService.GenerateTask(config, config.project)
		}

	}
	/**
	 * Dispose.
	 *
	 * @memberof TaskService
	 */
	public dispose() {
		this.disposables.forEach(k => {
			k.dispose();
		});
		this.disposables.clear();
	}
}
