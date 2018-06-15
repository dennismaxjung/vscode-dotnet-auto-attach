/*
 * @file Contains the AutoAttachDebugConfiguration.
 * @Author: Dennis Jung
 * @Author: Konrad Müller
 * @Date: 2018-06-15 14:36:43
 * @Last Modified by: Dennis Jung
 * @Last Modified time: 2018-06-15 14:37:21
 */

import { DebugConfiguration, WorkspaceFolder } from "vscode";

/**
 * The AutoAttachDebugConfiguration class, extends the vscode.DebugConfiguration
 *
 * @export
 * @interface AutoAttachDebugConfiguration
 * @extends {DebugConfiguration}
 */
export default interface IAutoAttachDebugConfiguration extends DebugConfiguration {
	workspace: WorkspaceFolder;
	args: Array<string> | string;
	env?: { [key: string]: string; };

}
