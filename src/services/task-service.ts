/*
 * @file Contains the TaskService.
 * @Author: Dennis Jung
 * @Author: Konrad Müller
 * @Date: 2018-06-15 14:31:53
 * @Last Modified by: Dennis Jung
 * @Last Modified time: 2019-02-22 17:20:26
 */

import {
	Disposable,
	ProcessExecution,
	Task,
	TaskDefinition,
	TaskEndEvent,
	TaskExecution,
	TaskProcessStartEvent,
	tasks,
	Uri,
	workspace
} from "vscode";
import DotNetAutoAttach from "../dotNetAutoAttach";
import DotNetAutoAttachDebugConfiguration from "../interfaces/IDotNetAutoAttachDebugConfiguration";
import DotNetAutoAttachTask from "../models/DotNetAutoAttachTask";

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
			DotNetAutoAttach.UiService.TaskAlreadyStartedInformationMessage(task.definition.type.replace("Watch ", ""));
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
	 * Checks the files which where found.
	 *
	 * @private
	 * @param {Array<Uri>} filesFound
	 * @returns {(Uri | undefined)}
	 * @memberof TaskService
	 */
	private CheckFilesFound(filesFound: Array<Uri>): Uri | undefined {
		filesFound.sort((a, b) => a.toString().length - b.toString().length);
		if (filesFound.length === 0) {
			//TODO: Error message FileNotFound.
		} else if (filesFound.length > 1) {
			//TODO: Error message MultipleFilesFound.
		}
		else {
			return filesFound[0];
		}
	}

	/**
	 * Checks the Project config.
	 *
	 * @private
	 * @param {string} project
	 * @returns {(Thenable<Uri | undefined>)}
	 * @memberof TaskService
	 */
	private CheckProjectConfig(project: string): Thenable<Uri | undefined> {
		let projectFile = Uri.parse(project);
		let isCsproj = project.endsWith(".csproj");

		// if it is a full path to a .csproj file
		if (projectFile.scheme === "file" && isCsproj) {
			//TODO: Check if file exists!
			return Promise.resolve(projectFile);
		}
		// if it is not a full path but only a name of a .csproj file
		else if (isCsproj) {
			return workspace.findFiles("**/" + project).then(this.CheckFilesFound);
		}
		// if it is not a full path but only a folder name.
		else {
			return workspace.findFiles(project + "/**/*.csproj").then(this.CheckFilesFound);
		}
	}

	/**
	 * Start DotNetWatchTask when no project is configured.
	 *
	 * @private
	 * @param {DotNetAutoAttachDebugConfiguration} config
	 * @memberof TaskService
	 */
	private StartDotNetWatchTaskNoProjectConfig(config: DotNetAutoAttachDebugConfiguration): void {
		workspace.findFiles("**/*.csproj").then(k => {
			var tmp = k.filter(m =>
				m.toString().startsWith(config.workspace.uri.toString())
			);
			if (tmp.length > 1) {
				DotNetAutoAttach.UiService.OpenProjectQuickPick(tmp)
					.then(s => {
						if (s) {
							TaskService.StartTask(TaskService.GenerateTask(config, s.uri));
						}
					});
			} else {
				TaskService.StartTask(TaskService.GenerateTask(config, tmp[0]));
			}
		});
	}

	/**
	 * Start DotNetWatchTask when projcet is configured.
	 *
	 * @private
	 * @param {DotNetAutoAttachDebugConfiguration} config
	 * @memberof TaskService
	 */
	private StartDotNetWatchTaskWithProjectConfig(config: DotNetAutoAttachDebugConfiguration): void {

		this.CheckProjectConfig(config.project).then(value => {
			if (value) {
				TaskService.StartTask(TaskService.GenerateTask(config, value));
			}
		});
	}

	/**
	 * Start a new DotNet Watch Task
	 *
	 * @param {DotNetAutoAttachDebugConfiguration} config
	 * @memberof TaskService
	 */
	public StartDotNetWatchTask(config: DotNetAutoAttachDebugConfiguration) {
		// Check if there is a no project configured
		if (!config.project || 0 === config.project.length) {
			this.StartDotNetWatchTaskNoProjectConfig(config);
		} else {
			this.StartDotNetWatchTaskWithProjectConfig(config);
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
