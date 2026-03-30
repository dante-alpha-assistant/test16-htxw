"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CustomerForm } from "@/components/crm/customer-form";
import { CustomerTable } from "@/components/crm/customer-table";
import { StatsCards } from "@/components/crm/stats-cards";
import { UserMenu } from "@/components/auth/user-menu";
import { Plus } from "lucide-react";
import type { Customer, CustomerFormData } from "@/types/customer";

type DialogMode = "create" | "edit" | "delete" | null;

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selected, setSelected] = useState<Customer | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = useCallback(async () => {
    try {
      const res = await fetch("/api/customers");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setCustomers(data);
    } catch {
      setError("Failed to load customers.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleCreate = async (data: CustomerFormData) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create");
      }
      await fetchCustomers();
      setDialogMode(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create customer.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (data: CustomerFormData) => {
    if (!selected) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/customers/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update");
      }
      await fetchCustomers();
      setDialogMode(null);
      setSelected(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update customer.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/customers/${selected.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      await fetchCustomers();
      setDialogMode(null);
      setSelected(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete customer.");
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (customer: Customer) => {
    setSelected(customer);
    setDialogMode("edit");
  };

  const openDelete = (customer: Customer) => {
    setSelected(customer);
    setDialogMode("delete");
  };

  const closeDialog = () => {
    setDialogMode(null);
    setSelected(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="font-semibold">
            {process.env.NEXT_PUBLIC_APP_NAME ?? "CRM"}
          </h1>
          <UserMenu />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Customers</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Manage your customer relationships
            </p>
          </div>
          <Button onClick={() => setDialogMode("create")}>
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </div>

        {error && (
          <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            Loading customers...
          </div>
        ) : (
          <>
            <StatsCards customers={customers} />
            <CustomerTable
              customers={customers}
              onEdit={openEdit}
              onDelete={openDelete}
            />
          </>
        )}
      </main>

      {/* Create Dialog */}
      <Dialog open={dialogMode === "create"} onOpenChange={closeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Customer</DialogTitle>
          </DialogHeader>
          <CustomerForm
            onSubmit={handleCreate}
            onCancel={closeDialog}
            isLoading={submitting}
            submitLabel="Add Customer"
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={dialogMode === "edit"} onOpenChange={closeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
          </DialogHeader>
          {selected && (
            <CustomerForm
              initialData={selected}
              onSubmit={handleEdit}
              onCancel={closeDialog}
              isLoading={submitting}
              submitLabel="Save Changes"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={dialogMode === "delete"} onOpenChange={closeDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Customer</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">
              {selected?.name}
            </span>
            ? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={closeDialog} disabled={submitting}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={submitting}
            >
              {submitting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
