import ProcessService from "./process-service";
import DebuggerService from "./debugger-service";
import * as vscode from "vscode";

"use strict";
export default class AutoAttachService {
  private static interval: NodeJS.Timer;
  private static pollInterval: number = 1000;
  private static pidsInDebug: Set<number> = new Set<number>();
  private static defaultConfig: vscode.DebugConfiguration = {
    type: "coreclr",
    request: "attach",
    name: ".NET Core Attach - AUTO"
  };

  public static Start(): void {

    this.interval = setInterval(()=>{
      
      ProcessService.GetProcesses((elements) => {
        for (let element of elements) {
          if (
            (element.cml.startsWith('"dotnet" exec ') ||
              element.cml.startsWith("dotnet exec ")) &&
            !this.pidsInDebug.has(element.pid)
          ) {
            this.StartDebug(element.pid);
          }
        }
      });
    },this.pollInterval);
  }

  private static StartDebug(pid: number): void {
    this.pidsInDebug.add(pid);
    DebuggerService.AttachDebugger(pid, this.defaultConfig);
  }

  public static Stop(): void {
    clearInterval(this.interval);
    this.pidsInDebug.clear();
  }
}
