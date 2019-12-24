/*
 * @file Contains the DotNetAutoAttachProject.
 * @Author: Luiz Stangarlin
 * @Date: 2019-12-24 12:40:26
 * @Last Modified by: Luiz Stangarlin
 * @Last Modified time: 2019-12-24 15:14:39
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
	 * @private
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
	 * @private
	 * @static
	 * @returns {string}
	 * @memberof DotNetAutoAttachProject
	 */
	private static nameRegex: RegExp = (() => {
		const capture =
			DotNetAutoAttachProject.supportedProjectKinds.join("|");
		return RegExp(`^.*[\\/\\\\](.+[.](${capture}))$`);
	})();

	/**
	 * Regex for finding the project path without root.
	 *
	 * @private
	 * @static
	 * @returns {string}
	 * @memberof DotNetAutoAttachProject
	 */
	private static rootRegex: RegExp = /^[\\/\\\\](.+)$/;

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
		const matches = name_regex.exec(fsPath);
		if (matches && matches.length === 3) {
			return matches[1];
		}
		return undefined;
	}

	/**
	 * Extract the project name from the project path.
	 *
	 * @public
	 * @static
	 * @returns {string | undefined}
	 * @memberof DotNetAutoAttachProject
	 */
	public static extractProjectPath(fsPath: string): string | undefined {
		const root_regex = DotNetAutoAttachProject.rootRegex;
		const matches = root_regex.exec(fsPath);
		if (matches && matches.length === 2) {
			return matches[1];
		}
		return undefined;
	}

}
