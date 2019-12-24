/*
 * @file Contains the DotNetAutoAttachProject.
 * @Author: Luiz Stangarlin
 * @Date: 2019-12-24 12:40:26
 * @Last Modified by: Luiz Stangarlin
 * @Last Modified time: 2019-12-24 12:40:26
 */

/**
 * The DotNetAutoAttachProject.
 *
 * @export
 * @class DotNetAutoAttachProject
 * @implements {DebugConfigurationProvider}
 */
export default class DotNetAutoAttachProject {

	/**
	 * The supported kinds of projects.
	 *
	 * @public
	 * @static
	 * @returns {Array<string>}
	 * @memberof DotNetAutoAttachProject
	 */
	private static supportedProjectKinds = [
		"csproj",
		"fsproj",
	];

	/**
	 * Get the list of support project file extensions.
	 *
	 * @public
	 * @static
	 * @returns {string}
	 * @memberof DotNetAutoAttachProject
	 */
	public static get SupportedFileExtensions(): Array<string> {
		return DotNetAutoAttachProject.supportedProjectKinds;
	}

	/**
	 * Get the glob for finding project files.
	 *
	 * @public
	 * @static
	 * @returns {string}
	 * @memberof DotNetAutoAttachProject
	 */
	public static get FilesGlob(): string {
		const glob =
			DotNetAutoAttachProject.supportedProjectKinds.join(",");
		return `**/*.{${glob}}`;
	}

	/**
	 * Regex for finding the project name.
	 *
	 * @public
	 * @static
	 * @returns {string}
	 * @memberof DotNetAutoAttachProject
	 */
	private static nameRegex: RegExp = (() => {
		const capture =
			DotNetAutoAttachProject.supportedProjectKinds.join("|");
		return RegExp(`/^.+(?:\/|\\).+[.](${capture})/`);
	})();

	/**
	 * Extract the project name from the project path.
	 *
	 * @public
	 * @static
	 * @returns {string | undefined}
	 * @memberof DotNetAutoAttachProject
	 */
	public static extractProjectName(fsPath: string): string | undefined {
		const name_regex = DotNetAutoAttachProject.nameRegex;
		let matches = name_regex.exec(fsPath);
		if (matches && matches.length === 1) {
			return matches[0];
		}
		return undefined;
	}

}
