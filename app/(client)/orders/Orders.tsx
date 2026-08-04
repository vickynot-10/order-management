"use client";
import { useGetOrders } from "@/hooks/queries/useOrders";
import { ORDER_CONSTANTS } from "@/constants";
import { OrderStatus } from "@/types/order.types";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, PackageSearch, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useOrderStatusStream } from "@/hooks/queries/useOrderEvents";

const STATUS_STYLES: Record<OrderStatus, string> = {
  [ORDER_CONSTANTS.PLACED]: "bg-blue-100 text-blue-700",
  [ORDER_CONSTANTS.DELIVERED]: "bg-green-100 text-green-700",
  [ORDER_CONSTANTS.CANCELLED]: "bg-red-100 text-red-700",
};

const STATUS_FLOW = [ORDER_CONSTANTS.PLACED, ORDER_CONSTANTS.DELIVERED];

function OrderStatusTimeline({ status }: { status: OrderStatus }) {
  if (status === ORDER_CONSTANTS.CANCELLED) {
    return (
      <div className="flex items-center gap-2 py-2">
        <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center">
          <X className="h-3.5 w-3.5 text-red-700" />
        </div>
        <p className="text-xs text-red-700 font-medium">Order cancelled</p>
      </div>
    );
  }

  const currentIndex = STATUS_FLOW.indexOf(status);

  return (
    <div className="flex items-center py-2">
      {STATUS_FLOW.map((step, i) => {
        const isDone = i <= currentIndex;
        const isLast = i === STATUS_FLOW.length - 1;
        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`h-6 w-6 rounded-full flex items-center justify-center ${
                  isDone ? "bg-green-100" : "bg-muted"
                }`}
              >
                {isDone ? (
                  <Check className="h-3.5 w-3.5 text-green-700" />
                ) : (
                  <div className="h-2 w-2 rounded-full bg-muted-foreground/40" />
                )}
              </div>
              <p
                className={`text-xs capitalize ${
                  isDone ? "text-foreground font-medium" : "text-muted-foreground"
                }`}
              >
                {step}
              </p>
            </div>
            {!isLast && (
              <div
                className={`flex-1 h-0.5 mx-2 mb-4 ${
                  i < currentIndex ? "bg-green-200" : "bg-muted"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function OrderSkeleton() {
  return (
    <div className="rounded-lg border p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-16 w-16 rounded-md" />
        <div className="flex flex-col gap-2 justify-center">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <Skeleton className="h-9 w-32" />
    </div>
  );
}

export default function ViewOrders() {
  const { data: orders, isLoading, isError } = useGetOrders();

  useOrderStatusStream()
  const { push } = useRouter();
  function Goback() {
    push("/products");
  }

  return (
    <div className="p-6 flex flex-col gap-4">
      <div className=" flex flex-row items-center gap-3">
        <Button onClick={Goback}>
          <ChevronLeft />
        </Button>
        <h2 className="text-lg font-semibold">Your Orders</h2>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <OrderSkeleton key={i} />
          ))}
        </div>
      )}

      {!isLoading && isError && (
        <p className="text-sm text-red-500">Failed to load orders.</p>
      )}

      {!isLoading && !isError && orders?.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 py-12">
          <PackageSearch className="h-16 w-16 text-muted-foreground" />
          <div className="text-center">
            <h3 className="text-lg font-semibold">No orders yet</h3>
            <p className="text-sm text-muted-foreground">
              Orders you place will show up here.
            </p>
          </div>
        </div>
      )}

      {!isLoading &&
        !isError &&
        orders &&
        orders.length > 0 &&
        orders.map((order: any) => (
          <div
            key={order._id}
            className="rounded-lg border p-4 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{order.full_name}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(order.ordered_on).toLocaleDateString()}
                </p>
              </div>
              <Badge className={STATUS_STYLES[order.status]}>
                {order.status}
              </Badge>
            </div>

            <OrderStatusTimeline status={order.status} />

            <div className="flex flex-col gap-2">
              {order.products.map((item: any) => (
                <div key={item.id} className="flex gap-3 items-center">
                  <img
                    src={item.image}
                    className="h-12 w-12 rounded-md object-cover"
                  />
                  <div>
                    <p className="text-sm font-medium">{item.product_name}</p>
                    <p className="text-xs text-muted-foreground">
                      Qty {item.quantity} · ${item.price}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}