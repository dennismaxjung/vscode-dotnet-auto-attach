/*
 * @file Contains the TaskService.
 * @Author: Dennis Jung
 * @Author: Konrad Müller
 * @Date: 2018-06-15 14:31:53
 * @Last Modified by: Luiz Stangarlin
 * @Last Modified time: 2019-12-24 15:22:32
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
	window,
	workspace
} from "vscode";
import DotNetAutoAttach from "../dotNetAutoAttach";
import DotNetAutoAttachDebugConfiguration from "../interfaces/IDotNetAutoAttachDebugConfiguration";
import DotNetAutoAttachProject from "../models/dotNetAutoAttachProject";
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
		let projectPath = "";
		const name = DotNetAutoAttachProject.extractProjectName(projectUri.fsPath);
		const path = DotNetAutoAttachProject.extractProjectPath(projectUri.fsPath);
		if (name && path) {
			projectName = name;
			projectPath = path;
		}

		let task: Task = new Task(
			{ type: "Watch " + projectName } as TaskDefinition,
			config.workspace,
			"Watch" + " " + projectName,
			"DotNet Auto Attach",
			new ProcessExecution(
				"dotnet",
				["watch", "--project", projectPath, "run"].concat(config.args),
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
		if (filesFound.length === 0 || filesFound.length > 1) {
			return undefined;
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
		let isKnownProj = DotNetAutoAttachProject.SupportedFileExtensions
			.some(proj => project.endsWith(`.${proj}`));

		// if it is a full path to a .*proj file
		if (projectFile.scheme === "file" && isKnownProj) {
			return Promise.resolve(projectFile);
		}
		// if it is not a full path but only a name of a .*proj file
		else if (isKnownProj) {
			return workspace.findFiles(`**/${project}`).then(this.CheckFilesFound);
		}
		// if it is not a full path but only a folder name.
		else {
			const glob = DotNetAutoAttachProject.FilesGlob;
			return workspace.findFiles(`${project}/${glob}`).then(this.CheckFilesFound);
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
		const glob = DotNetAutoAttachProject.FilesGlob;
		workspace.findFiles(glob).then(k => {
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

		this.CheckProjectConfig(config.project).then(projectUri => {
			if (projectUri) {
				TaskService.StartTask(TaskService.GenerateTask(config, projectUri));
			}
			// if no project not found or it isn't unique show error message.
			else {
				DotNetAutoAttach.UiService.ProjectDoesNotExistErrorMessage(config).then(open => {
					if (open) {
						workspace.findFiles("**/launch.json").then(files => {
							if (files && files.length > 0) {
								workspace.openTextDocument(files[0]).then(doc => window.showTextDocument(doc));
							}
						}
						);
					}
				});
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
