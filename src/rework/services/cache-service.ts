/*
 * @file Contains the CacheService, stores information central.
 * @Author: Dennis Jung
 * @Author: Konrad Müller
 * @Date: 2018-06-15 12:30:24
 * @Last Modified by: Dennis Jung
 * @Last Modified time: 2018-06-15 15:08:45
 */

import { Dictionary } from "typescript-collections";
import { Disposable } from "vscode";
import AutoAttachTask from "../models/AutoAttachTask";

/**
 * The CacheService. Provides access to the central cache.
 *
 * @export
 * @class CacheService
 */
export default class CacheService implements Disposable {

	/**
	 * Creates an instance of CacheService.
	 * @memberof CacheService
	 */
	public constructor() {
		this.RunningAutoAttachTasks = new Dictionary<string, AutoAttachTask>();
	}

	/**
	 * Cache of all running AutoAttachTasks.
	 *
	 * @type {Dictionary<string, AutoAttachTask>}
	 * @memberof CacheService
	 */
	public RunningAutoAttachTasks: Dictionary<string, AutoAttachTask>;

	/**
	 * Dispose the object.
	 *
	 * @memberof CacheService
	 */
	public dispose() {
		this.RunningAutoAttachTasks.forEach((k, v) => { v.Terminate(); });
		this.RunningAutoAttachTasks.clear();
	}

}
