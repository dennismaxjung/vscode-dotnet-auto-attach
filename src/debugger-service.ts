"use strict";
import * as vscode from "vscode";
export default class DebuggerService {
  public static AttachDebugger(
    pid: number,
    baseConfig: vscode.DebugConfiguration
  ): void {
    baseConfig.processId = String(pid);
    vscode.debug.startDebugging(undefined, baseConfig);
  }
}
