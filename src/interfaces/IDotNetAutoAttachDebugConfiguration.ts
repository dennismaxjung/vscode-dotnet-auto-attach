/*
 * @file Contains the DotNetAutoAttachDebugConfiguration.
 * @Author: Dennis Jung
 * @Author: Konrad Müller
 * @Date: 2018-06-15 14:36:43
 * @Last Modified by: Dennis Jung
 * @Last Modified time: 2018-06-16 13:37:16
 */

import { DebugConfiguration, WorkspaceFolder } from "vscode";

/**
 * The DotNetAutoAttachDebugConfiguration class, extends the vscode.DebugConfiguration
 *
 * @export
 * @interface DotNetAutoAttachDebugConfiguration
 * @extends {DebugConfiguration}
 */
export default interface IDotNetAutoAttachDebugConfiguration
	extends DebugConfiguration {
	workspace: WorkspaceFolder;
	args: Array<string>;
	env?: { [key: string]: string };
}
