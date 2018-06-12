"use strict";
export default class AutoAttachService {
  private static _interval: NodeJS.Timer;
  private static POLL_INTERVAL: number = 1000;

  public static Start(): void {
    this._interval = setInterval(() => {
      console.log("test");
    }, this.POLL_INTERVAL);
  }
  public static Stop(): void {
    clearInterval(this._interval);
  }
}
