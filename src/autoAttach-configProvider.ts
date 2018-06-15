"use strict";
import * as vscode from "vscode";
import {
	CancellationToken,
	DebugConfiguration,
	ProviderResult,
	WorkspaceFolder
} from "vscode";
import TerminalService from "./terminal-service";

/**
 * @deprecated Will be removed in next version.
 */
export default class AutoAttachDebugConfigProvider
	implements vscode.DebugConfigurationProvider {
	public constructor() {
		TerminalService.Initialize();
	}

	public resolveDebugConfiguration(
		folder: WorkspaceFolder | undefined,
		debugConfiguration: DebugConfiguration,
		token?: CancellationToken
	): ProviderResult<DebugConfiguration> {
		if (folder) {
			debugConfiguration.workspace = folder;
			TerminalService.StartWatcherTask(debugConfiguration);
		}

		return undefined;
	}
}
