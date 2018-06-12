"use strict";
import * as vscode from "vscode";
export default class DebuggerService {
  public static AttachDebugger(
    pid: number,
    cmd: string,
    baseConfig: vscode.DebugConfiguration
  ): void {}
}
