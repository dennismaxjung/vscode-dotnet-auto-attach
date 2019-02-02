/*
 * @file Contains the UiService.
 * @Author: Dennis Jung
 * @Author: Konrad Müller
 * @Date: 2019-02-02 10:33:23
 * @Last Modified by: Dennis Jung
 * @Last Modified time: 2019-02-02 11:30:26
 */

import { Disposable, QuickPickOptions, Uri, window } from "vscode";
import { DebugDisconnectedEnum } from "../enums/DebugDisconnectedEnum";
import ProjectQuickPickItem from "../models/ProjectQuickPickItem";

/**
 * The UiService, proviedes functions for ui actions.
 *
 * @export
 * @class UiService
 */
export default class UiService implements Disposable {

	/**
	 * Opens a Project Quick Pick
	 *
	 * @private
	 * @param {Uri[]} uris
	 * @returns {(Thenable<ProjectQuickPickItem | undefined>)}
	 * @memberof TaskService
	 */
	public OpenProjectQuickPick(uris: Array<Uri>): Thenable<ProjectQuickPickItem | undefined> {
		let quickPickOptions: QuickPickOptions = {
			canPickMany: false,
			placeHolder:
				"Select the project to launch the DotNet Watch task for.",
			matchOnDescription: true,
			matchOnDetail: true
		};
		return window
			.showQuickPick(
				uris.map(k => new ProjectQuickPickItem(k)),
				quickPickOptions
			);
	}

	/**
	 * Opens a Debug Disconnected Information Message.
	 *
	 * @param {string} projectName
	 * @param {number} processId
	 * @returns {(Thenable<string | undefined>)}
	 * @memberof UiService
	 */
	public DebugDisconnectedInformationMessage(projectName: string, processId: number): Thenable<DebugDisconnectedEnum> {
		return window
			.showInformationMessage(
				`Debug disconnected. Reattach to ${projectName} (${processId}) ?`,
				"Yes",
				"No",
				"Stop watch task"
			).then(ret => {
				switch (ret) {
					case "Yes":
						return DebugDisconnectedEnum.Yes;
						break;
					case "Stop watch task":
						return DebugDisconnectedEnum.Stop;
						break;
					default:
						return DebugDisconnectedEnum.No;
						break;
				}
			}
			);
	}

	/**
	 * Opens a Task already started Information Message.
	 *
	 * @param {string} projectName
	 * @returns {(Thenable<string | undefined>)}
	 * @memberof UiService
	 */
	public TaskAlreadyStartedInformationMessage(projectName: string): Thenable<string | undefined> {
		return window.showInformationMessage(
			".NET Watch Task already started for the project " + projectName);
	}

	/**
	 * Dispose.
	 *
	 * @memberof UiService
	 */
	public dispose() {

	}

}
