/*
 * @file Contains the DotNetAutoAttachTask class.
 * @Author: Dennis Jung
 * @Author: Konrad Müller
 * @Date: 2018-06-15 14:34:31
 * @Last Modified by: Luiz Stangarlin
 * @Last Modified time: 2019-12-25 02:41:25
 */

import { ProcessExecution, Task, TaskExecution, WorkspaceFolder } from "vscode";
import DotNetAutoAttachProject from "./dotNetAutoAttachProject";

/**
 * The DotNetAutoAttachTask, represents a running AutoAttachTask
 *
 * @export
 * @class DotNetAutoAttachTask
 */
export default class DotNetAutoAttachTask {
	/**
	 * Creates an instance of DotNetAutoAttachTask.
	 * @param {TaskExecution} taskExec
	 * @memberof DotNetAutoAttachTask
	 */
	public constructor(taskExec: TaskExecution) {
		this._id = DotNetAutoAttachTask.GetIdFromTask(taskExec.task);
		this._workSpace = taskExec.task.scope as WorkspaceFolder;
		this._taskExec = taskExec;
		this._processId = undefined;

		const proc = this._taskExec.task.execution as ProcessExecution;
		const cwd = proc.options ? proc.options.cwd : undefined;
		this._projectPath = proc.args[2];

		const name = DotNetAutoAttachProject.extractProjectName(this._projectPath);
		if (name) {
			this._project = name;
			this._projectFolderPath = cwd ? cwd : '';
		}
	}
	/**
	 * The Id
	 *
	 * @private
	 * @type {string}
	 * @memberof DotNetAutoAttachTask
	 */
	private _id: string;

	/**
	 * The WorkspaceFolder
	 *
	 * @private
	 * @type {WorkspaceFolder}
	 * @memberof DotNetAutoAttachTask
	 */
	private _workSpace: WorkspaceFolder;

	/**
	 * The ProcessId
	 *
	 * @private
	 * @type {(number | undefined)}
	 * @memberof DotNetAutoAttachTask
	 */
	private _processId: number | undefined;

	/**
	 * The ProjectPath
	 *
	 * @private
	 * @type {string}
	 * @memberof DotNetAutoAttachTask
	 */
	private _projectPath: string = "";

	/**
	 * The ProjectFolderPath
	 *
	 * @private
	 * @type {string}
	 * @memberof DotNetAutoAttachTask
	 */
	private _projectFolderPath: string = "";

	/**
	 * The Project
	 *
	 * @private
	 * @type {string}
	 * @memberof DotNetAutoAttachTask
	 */
	private _project: string = "";

	/**
	 * The TaskExecution
	 *
	 * @private
	 * @type {TaskExecution}
	 * @memberof DotNetAutoAttachTask
	 */
	private _taskExec: TaskExecution;

	/**
	 * Get the Task ID.
	 *
	 * @readonly
	 * @type {string}
	 * @memberof DotNetAutoAttachTask
	 */
	public get Id(): string {
		return this._id;
	}
	/**
	 * Get the Workspace.
	 *
	 * @readonly
	 * @type {WorkspaceFolder}
	 * @memberof DotNetAutoAttachTask
	 */
	public get Workspace(): WorkspaceFolder {
		return this._workSpace;
	}

	/**
	 * Gets the ProjectPath.
	 *
	 * @readonly
	 * @type {string}
	 * @memberof DotNetAutoAttachTask
	 */
	public get ProjectPath(): string {
		return this._projectPath;
	}

	/**
	 * Gets the ProjectFolderPath.
	 *
	 * @readonly
	 * @type {string}
	 * @memberof DotNetAutoAttachTask
	 */
	public get ProjectFolderPath(): string {
		return this._projectFolderPath;
	}

	/**
	 * Gets the Project
	 *
	 * @readonly
	 * @type {string}
	 * @memberof DotNetAutoAttachTask
	 */
	public get Project(): string {
		return this._project;
	}

	/**
	 * Gets the ProcessId.
	 *
	 * @type {(number | undefined)}
	 * @memberof DotNetAutoAttachTask
	 */
	public get ProcessId(): number | undefined {
		return this._processId;
	}
	/**
	 * Sets the ProcessId.
	 *
	 * @memberof DotNetAutoAttachTask
	 */
	public set ProcessId(num: number | undefined) {
		this._processId = num;
	}
	/**
	 * Generates the TaskID from a task.
	 *
	 * @static
	 * @param {Task} task
	 * @returns {string}
	 * @memberof DotNetAutoAttachTask
	 */
	public static GetIdFromTask(task: Task): string {
		if (task.scope) {
			if ((task.scope as WorkspaceFolder).name) {
				return task.source + task.name + (task.scope as WorkspaceFolder).name;
			}
		}
		return "";
	}

	/**
	 * Terminates the execution.
	 *
	 * @memberof DotNetAutoAttachTask
	 */
	public Terminate(): void {
		this._taskExec.terminate();
	}
}
