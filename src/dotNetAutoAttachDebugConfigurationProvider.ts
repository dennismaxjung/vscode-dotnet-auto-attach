/*
 * @file Contains the DotNetAutoAttachDebugConfigurationProvider.
 * @Author: Dennis Jung
 * @Author: Konrad Müller
 * @Date: 2018-06-15 14:46:07
 * @Last Modified by: Dennis Jung
 * @Last Modified time: 2019-01-15 12:00:43
 */

import {
	CancellationToken,
	DebugConfigurationProvider,
	ProviderResult,
	WorkspaceFolder
} from "vscode";
import DotNetAutoAttach from "./dotNetAutoAttach";
import IDotNetAutoAttachDebugConfiguration from "./interfaces/IDotNetAutoAttachDebugConfiguration";

/**
 * The DotNetAutoAttachDebugConfigurationProvider.
 *
 * @export
 * @class DotNetAutoAttachDebugConfigurationProvider
 * @implements {DebugConfigurationProvider}
 */
export default class DotNetAutoAttachDebugConfigurationProvider
	implements DebugConfigurationProvider {
	/**
	 * Resolves a [debug configuration](#DebugConfiguration) by filling in missing values or by adding/changing/removing attributes.
	 * If more than one debug configuration provider is registered for the same type, the resolveDebugConfiguration calls are chained
	 * in arbitrary order and the initial debug configuration is piped through the chain.
	 * Returning the value 'undefined' prevents the debug session from starting.
	 *
	 * @param folder The workspace folder from which the configuration originates from or undefined for a folderless setup.
	 * @param debugConfiguration The [debug configuration](#DebugConfiguration) to resolve.
	 * @param token A cancellation token.
	 * @return The resolved debug configuration or undefined.
	 */
	public resolveDebugConfiguration(
		folder: WorkspaceFolder | undefined,
		debugConfiguration: IDotNetAutoAttachDebugConfiguration,
		token?: CancellationToken
	): ProviderResult<IDotNetAutoAttachDebugConfiguration> {
		if (!debugConfiguration.type) {
			// If the config doesn't look functional force VSCode to open a configuration file https://github.com/Microsoft/vscode/issues/54213
			return null;
		}

		if (folder) {
			debugConfiguration.workspace = folder;
			DotNetAutoAttach.TaskService.StartDotNetWatchTask(debugConfiguration);
		}
		return undefined;
	}
}
