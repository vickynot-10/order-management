"use client";
import { useEffect, useState } from "react";
import {
  useGetAdminOrders,
  useUpdateOrderStatus,
} from "@/hooks/queries/useOrders";
import { ORDER_CONSTANTS } from "@/constants";
import { OrderStatus } from "@/types/order.types";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, PackageSearch } from "lucide-react";
import { toast } from "sonner";

const STATUS_OPTIONS = Object.values(ORDER_CONSTANTS) as OrderStatus[];

const STATUS_STYLES: Record<OrderStatus, string> = {
  [ORDER_CONSTANTS.PLACED]: "bg-blue-100 text-blue-700",
  [ORDER_CONSTANTS.DELIVERED]: "bg-green-100 text-green-700",
  [ORDER_CONSTANTS.CANCELLED]: "bg-red-100 text-red-700",
};

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
  const { data: orders, isLoading, isError } = useGetAdminOrders();
  const { mutate: updateStatus, isPending } = useUpdateOrderStatus();

  const handleStatusChange = (orderId: string, status: OrderStatus) => {
    updateStatus(
      { order_id: orderId, status },
      {
        onSuccess: () => toast.success(`Order marked as ${status}`),
        onError: () => toast.error("Failed to update order status"),
      },
    );
  };

  return (
    <div className="p-6 flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Your Orders</h2>

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

            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  className="w-fit"
                >
                  Update status <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {STATUS_OPTIONS.map((status) => (
                  <DropdownMenuItem
                    key={status}
                    disabled={status === order.status}
                    onClick={() => handleStatusChange(order._id, status)}
                  >
                    {status}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
    </div>
  );
}
