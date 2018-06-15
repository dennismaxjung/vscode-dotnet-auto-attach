import { QuickPickItem, Uri } from "vscode";

export default class ProjectQuickPickItem implements QuickPickItem {
	public constructor(uri: Uri) {
		const name_regex = /^.+(\/|\\)(.+).csproj/;
		let matches = name_regex.exec(uri.fsPath);
		if (matches && matches.length === 3) {
			this.label = matches[2];
		}
		//this.description = "desc";
		this.detail = uri.fsPath;
		this.uri = uri;

	}
	public label: string = "";
	public description?: string | undefined;
	public detail?: string | undefined;
	public picked?: boolean | undefined;
	public readonly uri: Uri;


}
