import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { mockDrugStore } from '@/data/mockData';
import { DrugStoreItem } from '@/types/clinic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, Plus, Package, AlertTriangle, Calendar, Pill } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function DrugStore() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredItems = mockDrugStore.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockItems = filteredItems.filter(item => item.quantity <= item.reorderLevel);
  const expiringItems = filteredItems.filter(item => {
    const expiryDate = new Date(item.expiryDate);
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
    return expiryDate <= threeMonthsFromNow;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStockStatus = (item: DrugStoreItem) => {
    if (item.quantity === 0) {
      return { label: 'Out of Stock', color: 'bg-destructive/10 text-destructive border-destructive/20' };
    }
    if (item.quantity <= item.reorderLevel) {
      return { label: 'Low Stock', color: 'bg-warning/10 text-warning border-warning/20' };
    }
    return { label: 'In Stock', color: 'bg-success/10 text-success border-success/20' };
  };

  const getExpiryStatus = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const threeMonths = new Date();
    threeMonths.setMonth(threeMonths.getMonth() + 3);

    if (expiry <= now) {
      return { label: 'Expired', color: 'text-destructive' };
    }
    if (expiry <= threeMonths) {
      return { label: 'Expiring Soon', color: 'text-warning' };
    }
    return { label: 'Valid', color: 'text-muted-foreground' };
  };

  const handleAddItem = () => {
    toast.success('Item added to drug store');
    setIsAddDialogOpen(false);
  };

  return (
    <DashboardLayout title="Drug Store" subtitle="Manage medication inventory and supplies">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{mockDrugStore.length}</p>
              <p className="text-sm text-muted-foreground">Total Items</p>
            </div>
          </div>
          <div className="rounded-xl border border-success/20 bg-success/5 p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
              <Pill className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{mockDrugStore.filter(i => i.quantity > i.reorderLevel).length}</p>
              <p className="text-sm text-muted-foreground">In Stock</p>
            </div>
          </div>
          <div className="rounded-xl border border-warning/20 bg-warning/5 p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
              <AlertTriangle className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{lowStockItems.length}</p>
              <p className="text-sm text-muted-foreground">Low Stock</p>
            </div>
          </div>
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
              <Calendar className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{expiringItems.length}</p>
              <p className="text-sm text-muted-foreground">Expiring Soon</p>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search medications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {user?.role === 'opd' && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Item</DialogTitle>
                  <DialogDescription>Add a new medication or supply to the drug store</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Item Name</Label>
                      <Input id="name" placeholder="e.g., Paracetamol 500mg" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Input id="category" placeholder="e.g., Analgesic" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input id="quantity" type="number" placeholder="0" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unit">Unit</Label>
                      <Input id="unit" placeholder="e.g., tablets, vials" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Price per Unit ($)</Label>
                      <Input id="price" type="number" step="0.01" placeholder="0.00" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reorderLevel">Reorder Level</Label>
                      <Input id="reorderLevel" type="number" placeholder="0" />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input id="expiryDate" type="date" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddItem}>Add Item</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Low Stock Alerts */}
        {lowStockItems.length > 0 && (
          <div className="rounded-xl border border-warning/30 bg-warning/5 p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <h3 className="font-semibold text-foreground">Low Stock Alerts</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {lowStockItems.map(item => (
                <Badge key={item.id} variant="outline" className="bg-warning/10 text-warning border-warning/20">
                  {item.name} ({item.quantity} {item.unit})
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Inventory Table */}
        <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Item ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Price/Unit</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => {
                const stockStatus = getStockStatus(item);
                const expiryStatus = getExpiryStatus(item.expiryDate);
                return (
                  <TableRow key={item.id} className="hover:bg-accent/50">
                    <TableCell className="font-mono text-sm text-primary">{item.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                          <Pill className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium">{item.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{item.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'font-semibold',
                          item.quantity <= item.reorderLevel && 'text-warning',
                          item.quantity === 0 && 'text-destructive'
                        )}>
                          {item.quantity.toLocaleString()}
                        </span>
                        <span className="text-muted-foreground text-sm">{item.unit}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">${item.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className={cn('flex items-center gap-1', expiryStatus.color)}>
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(item.expiryDate)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={stockStatus.color}>
                        {stockStatus.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {filteredItems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mb-3 opacity-50" />
              <p>No items found</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
