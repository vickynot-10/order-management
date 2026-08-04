"use client";
import AdminHeader from "./components/AdminHeader";
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
import { ChevronDown, PackageSearch, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";

const STATUS_OPTIONS = Object.values(ORDER_CONSTANTS) as OrderStatus[];

const STATUS_STYLES: Record<OrderStatus, string> = {
  [ORDER_CONSTANTS.PLACED]: "bg-blue-100 text-blue-700",
  [ORDER_CONSTANTS.DELIVERED]: "bg-green-100 text-green-700",
  [ORDER_CONSTANTS.CANCELLED]: "bg-red-100 text-red-700",
};

const AVATAR_STYLES = [
  "bg-violet-100 text-violet-700",
  "bg-teal-100 text-teal-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-sky-100 text-sky-700",
  "bg-emerald-100 text-emerald-700",
];

function getAvatarStyle(name: string) {
  const hash = name.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return AVATAR_STYLES[hash % AVATAR_STYLES.length];
}

function getInitial(name: string) {
  return name?.trim()?.[0]?.toUpperCase() || "?";
}

function getOrderTotal(products: any[]) {
  return products.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function OrderSkeleton() {
  return (
    <div className="rounded-xl border p-5 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
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
    <>
      <AdminHeader />
      <div className="p-6 flex flex-col gap-5">
        <h2 className="text-lg font-semibold">Orders</h2>

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
              <p className="text-sm text-muted-foreground">No Orders</p>
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
              className="rounded-xl border p-5 flex flex-col gap-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold ${getAvatarStyle(order.full_name)}`}
                  >
                    {getInitial(order.full_name)}
                  </div>
                  <div>
                    <p className="font-medium">{order.full_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.ordered_on).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Badge className={STATUS_STYLES[order.status]}>
                  {order.status}
                </Badge>
              </div>

              {(order.address || order.phone) && (
                <div className="flex flex-col gap-1 text-xs text-muted-foreground pl-1">
                  {order.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5" />
                      {order.address}
                    </div>
                  )}
                  {order.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5" />
                      {order.phone}
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-2 rounded-lg bg-muted/40 p-3">
                {order.products.map((item: any) => (
                  <div key={item.id} className="flex gap-3 items-center">
                    <img
                      src={item.image}
                      className="h-12 w-12 rounded-md object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.product_name}</p>
                      <p className="text-xs text-muted-foreground">
                        Qty {item.quantity} · ${item.price}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="flex justify-end pt-1 border-t">
                  <p className="text-sm font-semibold">
                    Total: ${getOrderTotal(order.products).toFixed(2)}
                  </p>
                </div>
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
    </>
  );
}
