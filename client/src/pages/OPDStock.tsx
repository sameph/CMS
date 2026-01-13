import { useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listInventory, createInventoryItem, transferStock, deleteInventoryItem } from '@/services/inventory';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Package, ArrowRightLeft, Search, Calendar, Plus, Pill } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface OPDItemDoc { _id: string; name: string; category: string; quantity: number; unit: string; expiryDate?: string; reorderLevel?: number; }

export default function OPDStock() {
  const [search, setSearch] = useState('');
  const qc = useQueryClient();
  const { data: items = [] } = useQuery({ queryKey: ['inventory', 'opd'], queryFn: () => listInventory({ location: 'opd' }) });
  const [openAdd, setOpenAdd] = useState(false);
  const [openTransfer, setOpenTransfer] = useState<null | OPDItemDoc>(null);

  const addMutation = useMutation({
    mutationFn: (body: Partial<OPDItemDoc>) => createInventoryItem({ ...body, location: 'opd' as const }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['inventory', 'opd'] }); setOpenAdd(false); toast.success('Item added to OPD stock'); },
    onError: (e: any) => toast.error(e?.message || 'Failed to add item'),
  });

  const transferMutation = useMutation({
    mutationFn: (payload: { itemId: string; quantity: number; to: 'central'|'opd' }) => transferStock(payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['inventory', 'opd'] }); qc.invalidateQueries({ queryKey: ['inventory', 'central'] }); setOpenTransfer(null); toast.success('Transferred to Drug Store'); },
    onError: (e: any) => toast.error(e?.message || 'Transfer failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteInventoryItem(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['inventory', 'opd'] }); toast.success('Item deleted'); },
    onError: (e:any) => toast.error(e?.message || 'Delete failed'),
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return items.filter(i => i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q));
  }, [items, search]);

  const getStockStatus = (it: OPDItemDoc) => {
    if (it.quantity === 0) return { label: 'Out', color: 'bg-destructive/10 text-destructive border-destructive/20' };
    if ((it.reorderLevel ?? 0) >= 0 && it.quantity <= (it.reorderLevel ?? 0)) return { label: 'Low', color: 'bg-warning/10 text-warning border-warning/20' };
    return { label: 'OK', color: 'bg-success/10 text-success border-success/20' };
  };

  const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' }) : '-';

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get('name') || '').trim();
    if (!name) { toast.error('Item name is required'); return; }
    addMutation.mutate({
      name,
      category: String(fd.get('category') || ''),
      quantity: Number(fd.get('quantity') || 0),
      unit: String(fd.get('unit') || ''),
      expiryDate: String(fd.get('expiryDate') || '') || undefined,
      reorderLevel: Number(fd.get('reorderLevel') || 0),
    });
  };

  const handleTransferToStore = (opdItem: OPDItemDoc, qty: number) => {
    if (qty <= 0) { toast.error('Quantity must be greater than 0'); return; }
    if (qty > opdItem.quantity) { toast.error('Not enough stock in OPD'); return; }
    transferMutation.mutate({ itemId: opdItem._id, quantity: qty, to: 'central' });
  };

  return (
    <DashboardLayout title="OPD Stock" subtitle="Manage OPD room inventory and transfer to Drug Store">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{items.length}</p>
              <p className="text-sm text-muted-foreground">OPD Items</p>
            </div>
          </div>
          <div className="rounded-xl border border-warning/20 bg-warning/5 p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
              <ArrowRightLeft className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{items.filter(i => i.quantity <= i.reorderLevel).length}</p>
              <p className="text-sm text-muted-foreground">Low Stock</p>
            </div>
          </div>
          <div className="rounded-xl border border-success/20 bg-success/5 p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
              <Pill className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{items.reduce((a,b)=>a+b.quantity,0)}</p>
              <p className="text-sm text-muted-foreground">Total Units</p>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search OPD items..." value={search} onChange={(e)=>setSearch(e.target.value)} />
          </div>

          <Dialog open={openAdd} onOpenChange={setOpenAdd}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" />Add OPD Item</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add OPD Stock Item</DialogTitle>
                <DialogDescription>Record an item available in the OPD room</DialogDescription>
              </DialogHeader>
              <form className="space-y-4" onSubmit={handleAdd}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1"><Label>Name</Label><Input name="name" placeholder="e.g., Paracetamol 500mg" required /></div>
                  <div className="space-y-1"><Label>Category</Label><Input name="category" placeholder="e.g., Analgesic" /></div>
                  <div className="space-y-1"><Label>Quantity</Label><Input name="quantity" type="number" min={0} defaultValue={0} /></div>
                  <div className="space-y-1"><Label>Unit</Label><Input name="unit" placeholder="tablets, vials" /></div>
                  <div className="space-y-1"><Label>Reorder Level</Label><Input name="reorderLevel" type="number" min={0} defaultValue={0} /></div>
                  <div className="space-y-1 col-span-2"><Label>Expiry Date</Label><Input name="expiryDate" type="date" /></div>
                </div>
                <div className="flex justify-end gap-2"><Button variant="outline" type="button" onClick={()=>setOpenAdd(false)}>Cancel</Button><Button type="submit">Add</Button></div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Item ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(it => {
                const st = getStockStatus(it);
                return (
                  <TableRow key={it._id} className="hover:bg-accent/50">
                    <TableCell className="font-mono text-sm text-primary">{it._id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10"><Pill className="h-4 w-4 text-primary"/></div>
                        <span className="font-medium">{it.name}</span>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="secondary">{it.category}</Badge></TableCell>
                    <TableCell>{it.quantity.toLocaleString()} <span className="text-muted-foreground text-sm">{it.unit}</span></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-muted-foreground"><Calendar className="h-3 w-3" />{formatDate(it.expiryDate)}</div>
                    </TableCell>
                    <TableCell><Badge variant="outline" className={cn(st.color)}>{st.label}</Badge></TableCell>
                    <TableCell className="text-right space-x-2">
                      <Dialog open={openTransfer?._id === it._id} onOpenChange={(o)=>setOpenTransfer(o ? it : null)}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-2"><ArrowRightLeft className="h-4 w-4"/>Transfer to Store</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Transfer to Drug Store</DialogTitle>
                            <DialogDescription>Move quantity from OPD to central store</DialogDescription>
                          </DialogHeader>
                          <TransferForm item={it} onTransfer={handleTransferToStore} onCancel={() => setOpenTransfer(null)} />
                        </DialogContent>
                      </Dialog>
                      <Button variant="destructive" size="sm" onClick={()=>{ if (confirm('Delete this OPD item?')) deleteMutation.mutate(it._id); }}>Delete</Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mb-3 opacity-50" />
              <p>No OPD items found</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function TransferForm({ item, onTransfer, onCancel }: { item: OPDItemDoc; onTransfer: (item: OPDItemDoc, qty: number) => void; onCancel: () => void }) {
  const [qty, setQty] = useState<number>(0);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Item</Label>
          <Input value={item.name} disabled />
        </div>
        <div className="space-y-1">
          <Label>Available</Label>
          <Input value={`${item.quantity} ${item.unit}`} disabled />
        </div>
        <div className="space-y-1 col-span-2">
          <Label>Quantity to Transfer</Label>
          <Input type="number" min={0} max={item.quantity} value={qty} onChange={(e)=>setQty(Number(e.target.value))} />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={()=>onTransfer(item, qty)}>Transfer</Button>
      </div>
    </div>
  );
}
