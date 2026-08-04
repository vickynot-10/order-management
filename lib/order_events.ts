
import { EventEmitter } from "events";

declare global {
  var orderEvents: EventEmitter | undefined;
}

export const orderEvents = global.orderEvents ?? new EventEmitter();
if (!global.orderEvents) global.orderEvents = orderEvents;