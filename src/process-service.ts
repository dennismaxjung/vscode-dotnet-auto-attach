import * as child_process from 'child_process';
import { getProcessTree } from 'windows-process-tree';

export default class ProcessService {
    public static FindProcesses(processFoundCallback: (pid: number, cmd: string) => void) : void {

        const rootPid = parseInt(process.env['VSCODE_PID']);
        console.log(rootPid);
        if (process.platform === 'win32') {
            child_process.spawn('cmd.exe');
            getProcessTree(process.pid, (tree) => {
              console.log(tree);
            });
        }
    }
}