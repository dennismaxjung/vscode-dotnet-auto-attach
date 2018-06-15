import { Task, WorkspaceFolder, ShellExecution } from "vscode";

export default class AutoAttachTask {
	public constructor(task: Task, pid: number) {
		this._id = AutoAttachTask.GetIdFromTask(task);
		this._workSpace = task.scope as WorkspaceFolder;
		this._processId = pid;
	}
	private _id: string;
	private _workSpace: WorkspaceFolder;
	private _processId: number;

	public get Id(): string {
		return this._id;
	}
	public static GetIdFromTask(task: Task): string {
		if (task.scope as WorkspaceFolder) {
			if (task.scope) {
				return task.source + task.name + (task.scope as WorkspaceFolder).name;
			}
		}
		return "";
	}
}
