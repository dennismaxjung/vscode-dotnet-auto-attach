/*
 * @file The AutoAttachCache, stores information central.
 * @Author: Dennis Jung
 * @Author: Konrad Müller
 * @Date: 2018-06-15 12:30:24
 * @Last Modified by: Dennis Jung
 * @Last Modified time: 2018-06-15 12:33:26
 */

/**
 * The AutoAttachCacheService. Provides access to the central cache.
 *
 * @export
 * @class AutoAttachCacheService
 */
export default class AutoAttachCacheService {
	public constructor() {
		this.RunningAutoAttachTasks = new Array<any>();
	}

	public RunningAutoAttachTasks: Array<any>;
}
