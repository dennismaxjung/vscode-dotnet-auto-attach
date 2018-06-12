import * as child_process from "child_process";
//import { getProcessTree } from 'windows-process-tree';

export default class ProcessService {
  public static GetProcesses(cf: (processDetails: Array<ProcessDetail>) => void): void {
    if (process.platform === "win32") {
      this.getProcessDetailsWindows(cf);
    } else {
        //TODO: Add Linux & MAC
    }
  }

  private static getProcessDetailsWindows(cf: (processDetails: Array<ProcessDetail>) => void): void {
    const cmlPattern = /^(.+)\s+([0-9]+)\s+([0-9]+)$/;
    let args = ["process", "get", "ProcessId,ParentProcessId,CommandLine"];
    child_process.execFile(
      "wmic.exe",
      args,
      { maxBuffer: 1000 * 1024 },
      (err, stdout, stderr) => {
        if (err) {
          throw err;
        }
        if (stderr.length > 0) {
          return cf(new Array<ProcessDetail>());
        }
        var processLines = stdout
          .split("\r\n")
          .map(str => {
            return str.trim();
          })
          .filter(str => cmlPattern.test(str));
        
        var processDetails = new Array<ProcessDetail>();
        processLines.forEach(str => {
          let s = cmlPattern.exec(str);
          if (s && s.length === 4) {
            processDetails.push(new ProcessDetail(s[3], s[2], s[1]));
          }
        });
        cf(processDetails);
      }
    );
  }
}

export class ProcessDetail {
  constructor(pid: number | string, ppid: number | string, cml: string) {
    if (typeof pid === "string") {
      this.pid = Number(pid);
    } else {
      this.pid = pid;
    }
    if (typeof ppid === "string") {
      this.ppid = Number(ppid);
    } else {
      this.ppid = ppid;
    }

    this.cml = cml;
  }
  public pid: number;
  public ppid: number;
  public cml: string;
}
