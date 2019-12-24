/*
 * @file Contains the ProjectQuickPickItem
 * @Author: Dennis Jung
 * @Author: Konrad Müller
 * @Date: 2018-06-15 16:42:53
 * @Last Modified by: Luiz Stangarlin
 * @Last Modified time: 2019-12-24 12:22:33
 */

import { QuickPickItem, Uri } from "vscode";
import DotNetAutoAttachProject from "./dotNetAutoAttachProject";

/**
 * The ProjectQuickPickItem. Represents Project that can be selected from
 * a list of projects.
 *
 * @export
 * @class ProjectQuickPickItem
 * @implements {QuickPickItem}
 */
export default class ProjectQuickPickItem implements QuickPickItem {
	/**
	 * Creates an instance of ProjectQuickPickItem.
	 * @param {Uri} uri
	 * @memberof ProjectQuickPickItem
	 */
	public constructor(uri: Uri) {
		const name = DotNetAutoAttachProject.extractProjectName(uri.fsPath);
		if (name) {
			this.label = name;
		}
		this.detail = uri.fsPath;
		this.uri = uri;
	}
	/**
	 * A human readable string which is rendered prominent.
	 */
	public label: string = "";

	/**
	 * A human readable string which is rendered less prominent.
	 */
	public description?: string;

	/**
	 * A human readable string which is rendered less prominent.
	 */
	public detail?: string;

	/**
	 * Optional flag indicating if this item is picked initially.
	 * (Only honored when the picker allows multiple selections.)
	 *
	 * @see [QuickPickOptions.canPickMany](#QuickPickOptions.canPickMany)
	 */
	public picked?: boolean;
	/**
	 * The Uri of the Project which is not rendered.
	 *
	 * @type {Uri}
	 * @memberof ProjectQuickPickItem
	 */
	public readonly uri: Uri;
}
