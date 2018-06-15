/*
 * @file Contains the AutoAttachTask class.
 * @Author: Dennis Jung
 * @Author: Konrad Müller
 * @Date: 2018-06-15 14:34:31
 * @Last Modified by: Dennis Jung
 * @Last Modified time: 2018-06-15 19:19:14
 */

import { ShellExecution, Task, TaskExecution, WorkspaceFolder } from "vscode";

/**
 * The AutoAttachTask, represents a running AutoAttachTask
 *
 * @export
 * @class AutoAttachTask
 */
export default class AutoAttachTask {
	public constructor(taskExec: TaskExecution) {
		this._id = AutoAttachTask.GetIdFromTask(taskExec.task);
		this._workSpace = taskExec.task.scope as WorkspaceFolder;
		this._taskExec = taskExec;
	}
	private _id: string;
	private _workSpace: WorkspaceFolder;
	private _taskExec: TaskExecution;

	/**
	 * Get the Task ID.
	 *
	 * @readonly
	 * @type {string}
	 * @memberof AutoAttachTask
	 */
	public get Id(): string {
		return this._id;
	}
	/**
	 * Get the Workspace.
	 *
	 * @readonly
	 * @type {WorkspaceFolder}
	 * @memberof AutoAttachTask
	 */
	public get Workspace(): WorkspaceFolder {
		return this._workSpace;
	}

	/**
	 * Gets the Project.
	 *
	 * @readonly
	 * @type {string}
	 * @memberof AutoAttachTask
	 */
	public get Project(): string {
		return (this._taskExec.task.execution as ShellExecution)
			.commandLine as string;
	}

	/**
	 * Generates the TaskID from a task.
	 *
	 * @static
	 * @param {Task} task
	 * @returns {string}
	 * @memberof AutoAttachTask
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
	 * @memberof AutoAttachTask
	 */
	public Terminate(): void {
		this._taskExec.terminate();
	}
}
