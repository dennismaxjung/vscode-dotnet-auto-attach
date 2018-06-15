/*
 * @file Contains the ProcessService.
 * @Author: Dennis Jung
 * @Author: Konrad Müller
 * @Date: 2018-06-13 20:34:03
 * @Last Modified by: Dennis Jung
 * @Last Modified time: 2018-06-15 20:03:23
 */

import * as child_process from "child_process";
import { Disposable } from "vscode";
import ProcessDetail from "../models/ProcessDetail";

/**
 * The ProcessService. Provides functionality to scan and parse processes running.
 *
 * @export
 * @class ProcessService
 */
export default class ProcessService implements Disposable {
	/**
	 * Dispose
	 *
	 * @memberof ProcessService
	 */
	public dispose(): void {

	}

	public GetProcesses(): Array<ProcessDetail> {
		if (process.platform === "win32") {
			return this.getProcessDetailsFromWindows();
		} else {
			//TODO: Add Linux & MAC
			return new Array<ProcessDetail>();
		}
	}

	private getProcessDetailsFromWindows(): Array<ProcessDetail> {
		const cmlPattern = /^(.+)\s+([0-9]+)\s+([0-9]+)$/;
		let args = ["process", "get", "ProcessId,ParentProcessId,CommandLine"];

		var tmp = child_process.execFileSync("wmic.exe", args);

		var processLines = tmp
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

		return processDetails;
	}
}

