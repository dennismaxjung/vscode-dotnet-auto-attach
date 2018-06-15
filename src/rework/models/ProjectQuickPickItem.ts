/*
 * @file Contains the ProjectQuickPickItem
 * @Author: Dennis Jung
 * @Author: Konrad Müller
 * @Date: 2018-06-15 16:42:53
 * @Last Modified by: Dennis Jung
 * @Last Modified time: 2018-06-15 16:43:29
 */

import { QuickPickItem, Uri } from "vscode";

/**
 * The ProjectQuickPickItem.
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
		const name_regex = /^.+(\/|\\)(.+).csproj/;
		let matches = name_regex.exec(uri.fsPath);
		if (matches && matches.length === 3) {
			this.label = matches[2];
		}
		this.detail = uri.fsPath;
		this.uri = uri;

	}
	public label: string = "";
	public description?: string | undefined;
	public detail?: string | undefined;
	public picked?: boolean | undefined;
	public readonly uri: Uri;


}
