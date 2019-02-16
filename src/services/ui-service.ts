/*
 * @file Contains the UiService.
 * @Author: Dennis Jung
 * @Author: Konrad Müller
 * @Date: 2019-02-02 10:33:23
 * @Last Modified by: Dennis Jung
 * @Last Modified time: 2019-02-16 23:46:01
 */

import { Disposable, QuickPickOptions, Uri, window } from "vscode";
import { DebugDisconnectedEnum } from "../enums/DebugDisconnectedEnum";
import { MultipleProjectsEnum } from "../enums/MultipleProjectsEnum";
import DotNetAutoAttachDebugConfiguration from "../interfaces/IDotNetAutoAttachDebugConfiguration";
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
	 * Opens a Multiple Project Found Information Message.
	 *
	 * @returns {(Thenable<MultipleProjectsEnum | undefined>)}
	 * @memberof UiService
	 */
	public MultipleProjectsFoundInformationMessage(): Thenable<MultipleProjectsEnum> {
		return window.showInformationMessage(
			"Multiple projects where found, would you like to select a specific for the launch config?",
			"Yes",
			"No"
		).then(ret => {
			switch (ret) {
				case "Yes":
					return MultipleProjectsEnum.Yes;
					break;
				case "No":
					return MultipleProjectsEnum.No;
					break;
				default:
					return MultipleProjectsEnum.Exit;
					break;
			}
		});
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
	 * Opens a ProjectDoesNotExist Error Message.
	 *
	 * @param {string} project
	 * @returns {(Thenable<string | undefined>)}
	 * @memberof UiService
	 */
	public ProjectDoesNotExistErrorMessage(debugConfig: DotNetAutoAttachDebugConfiguration): Thenable<string | undefined> {
		return window.showErrorMessage("The configured project (" + debugConfig.project + ") of the debug config '" + debugConfig.name + "' within launch.json could not be found!");
	}

	/**
	 * Dispose.
	 *
	 * @memberof UiService
	 */
	public dispose() {

	}

}
