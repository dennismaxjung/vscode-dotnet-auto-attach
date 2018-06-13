"use strict";
import * as vscode from "vscode";
import * as Collections from "typescript-collections";
export default class DebuggerService {
  private static listenerTerminateDebug: vscode.Disposable;
  private static inDebug: Collections.Dictionary<
    number,
    string
  > = new Collections.Dictionary<number, string>();
  private static hasDisconnected: Set<number> = new Set<number>();
  public static Initialize(): void {
    this.listenerTerminateDebug = vscode.debug.onDidTerminateDebugSession(p => {
      this.inDebug.forEach((k, v) => {
        if (v === p.name) {
          setTimeout(() => {
            this.inDebug.remove(k);
            this.hasDisconnected.add(k);
          }, 2000);
        }
      });
    });
  }

  public static Terminate(): void {
    this.listenerTerminateDebug.dispose();
    this.inDebug.clear();
  }

  public static AttachDebugger(
    pid: number,
    baseConfig: vscode.DebugConfiguration
  ): void {
    if (!this.inDebug.containsKey(pid) && !this.hasDisconnected.has(pid)) {
      baseConfig.processId = String(pid);
      baseConfig.name += " - " + baseConfig.processId;
      this.inDebug.setValue(pid, baseConfig.name);
      vscode.debug.startDebugging(undefined, baseConfig);
    } else if (this.hasDisconnected.has(pid)) {
      this.inDebug.setValue(pid, "");
      this.hasDisconnected.delete(pid);
      vscode.window
        .showInformationMessage(`Debug ${pid} ?`, "Yes", "No")
        .then(k => {
          if (k) {
            if (k === "Yes") {
              baseConfig.processId = String(pid);
              baseConfig.name += " - " + baseConfig.processId;
              this.inDebug.setValue(pid, baseConfig.name);
              vscode.debug.startDebugging(undefined, baseConfig);
            }
          } else {
            setTimeout(() => {
              this.inDebug.remove(pid);
              this.hasDisconnected.add(pid);
            }, 60000);
          }
        });
    }
  }
}
