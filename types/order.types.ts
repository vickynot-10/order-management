import { CartItem } from "./product.types";
import { ORDER_CONSTANTS } from "@/constants";
export type OrderStatus = (typeof ORDER_CONSTANTS)[keyof typeof ORDER_CONSTANTS];

 export type Order = {
  _id: string;
  full_name: string;
  address: string;
  phone: string;
  products: CartItem[];
  ordered_on: string;
  status: OrderStatus;
};
