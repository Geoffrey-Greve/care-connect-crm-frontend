import React, { useState, useMemo } from 'react';
import { Plus, Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, MoreVertical, Eye, Edit, Trash2, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';

// Mock funds data
const mockFunds = [
  {
    id: "FUND-001",
    fundType: "NDIS Plan",
    starts: "2024-01-01",
    expires: "2024-12-31",
    amount: 50000.00,
    balance: 32500.00,
  },
  {
    id: "FUND-002",
    fundType: "Core Support",
    starts: "2024-01-01",
    expires: "2024-12-31",
    amount: 25000.00,
    balance: 18000.00,
  },
  {
    id: "FUND-003",
    fundType: "Capacity Building",
    starts: "2024-01-01",
    expires: "2024-12-31",
    amount: 15000.00,
    balance: 12000.00,
  },
  {
    id: "FUND-004",
    fundType: "Capital Support",
    starts: "2024-01-01",
    expires: "2024-12-31",
    amount: 10000.00,
    balance: 7500.00,
  },
];

type FundSortField = 'fundType' | 'starts' | 'expires' | 'amount' | 'balance';
type FundSortDirection = 'asc' | 'desc' | null;

interface ClientFundsProps {
  clientName?: string;
}

const ClientFunds: React.FC<ClientFundsProps> = ({ clientName }) => {
  const { toast } = useToast();
  const [funds, setFunds] = useState(mockFunds);
  const [isAddFundOpen, setIsAddFundOpen] = useState(false);
  const [isUpdateFundOpen, setIsUpdateFundOpen] = useState(false);
  const [selectedFund, setSelectedFund] = useState<any>(null);
  const [fundSearch, setFundSearch] = useState("");
  const [fundSortField, setFundSortField] = useState<FundSortField | null>(null);
  const [fundSortDirection, setFundSortDirection] = useState<FundSortDirection>(null);
  const [fundCurrentPage, setFundCurrentPage] = useState(1);
  const [fundEntriesPerPage, setFundEntriesPerPage] = useState(10);
  const [fundForm, setFundForm] = useState({
    fundType: "",
    starts: "",
    expires: "",
    amount: "",
    balance: "",
  });

  const handleAddFund = () => {
    setFundForm({
      fundType: "",
      starts: "",
      expires: "",
      amount: "",
      balance: "",
    });
    setIsAddFundOpen(true);
  };

  const handleViewFund = (fund: any) => {
    setSelectedFund(fund);
    toast({
      title: "View Fund",
      description: `Viewing details for ${fund.fundType}`,
    });
  };

  const handleUpdateFund = (fund: any) => {
    setSelectedFund(fund);
    setFundForm({
      fundType: fund.fundType,
      starts: fund.starts,
      expires: fund.expires,
      amount: fund.amount.toString(),
      balance: fund.balance.toString(),
    });
    setIsUpdateFundOpen(true);
  };

  const handleDeleteFund = (fund: any) => {
    setFunds(funds.filter(f => f.id !== fund.id));
    toast({
      title: "Fund Deleted",
      description: `${fund.fundType} has been removed`,
    });
  };

  const handleFundSort = (field: FundSortField) => {
    if (fundSortField === field) {
      if (fundSortDirection === 'asc') {
        setFundSortDirection('desc');
      } else if (fundSortDirection === 'desc') {
        setFundSortField(null);
        setFundSortDirection(null);
      }
    } else {
      setFundSortField(field);
      setFundSortDirection('asc');
    }
  };

  const getFundSortIcon = (field: FundSortField) => {
    if (fundSortField !== field) {
      return <ChevronUp className="h-4 w-4 opacity-30" />;
    }
    return fundSortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  const handleFundSubmit = () => {
    // Validation
    if (!fundForm.fundType || !fundForm.starts || !fundForm.expires || !fundForm.amount || !fundForm.balance) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Amount validation
    const amount = parseFloat(fundForm.amount);
    const balance = parseFloat(fundForm.balance);

    if (isNaN(amount) || amount < 0) {
      toast({
        title: "Validation Error",
        description: "Amount must be a valid positive number",
        variant: "destructive",
      });
      return;
    }

    if (isNaN(balance) || balance < 0) {
      toast({
        title: "Validation Error",
        description: "Balance must be a valid positive number",
        variant: "destructive",
      });
      return;
    }

    if (balance > amount) {
      toast({
        title: "Validation Error",
        description: "Balance cannot exceed the total amount",
        variant: "destructive",
      });
      return;
    }

    // Date validation
    if (new Date(fundForm.expires) < new Date(fundForm.starts)) {
      toast({
        title: "Validation Error",
        description: "Expiry date cannot be before start date",
        variant: "destructive",
      });
      return;
    }

    if (isUpdateFundOpen && selectedFund) {
      // Update existing fund
      setFunds(funds.map(f =>
        f.id === selectedFund.id
          ? {
              ...f,
              fundType: fundForm.fundType,
              starts: fundForm.starts,
              expires: fundForm.expires,
              amount: amount,
              balance: balance,
            }
          : f
      ));
      toast({
        title: "Fund Updated",
        description: "Fund details have been updated successfully.",
      });
    } else {
      // Add new fund
      const newFund = {
        id: `FUND-${Date.now()}`,
        fundType: fundForm.fundType,
        starts: fundForm.starts,
        expires: fundForm.expires,
        amount: amount,
        balance: balance,
      };
      setFunds([...funds, newFund]);
      toast({
        title: "Fund Added",
        description: "New fund has been added successfully.",
      });
    }

    // Reset form
    setFundForm({
      fundType: "",
      starts: "",
      expires: "",
      amount: "",
      balance: "",
    });
    setIsAddFundOpen(false);
    setIsUpdateFundOpen(false);
    setSelectedFund(null);
  };

  // Filter and sort funds
  const filteredAndSortedFunds = useMemo(() => {
    let result = [...funds];

    // Apply search filter
    if (fundSearch) {
      const search = fundSearch.toLowerCase();
      result = result.filter(fund =>
        fund.fundType.toLowerCase().includes(search)
      );
    }

    // Apply sorting
    if (fundSortField && fundSortDirection) {
      result.sort((a, b) => {
        let aValue: string | number;
        let bValue: string | number;

        switch (fundSortField) {
          case 'fundType':
            aValue = a.fundType;
            bValue = b.fundType;
            break;
          case 'starts':
            aValue = a.starts;
            bValue = b.starts;
            break;
          case 'expires':
            aValue = a.expires;
            bValue = b.expires;
            break;
          case 'amount':
            aValue = a.amount;
            bValue = b.amount;
            break;
          case 'balance':
            aValue = a.balance;
            bValue = b.balance;
            break;
          default:
            return 0;
        }

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return fundSortDirection === 'asc'
            ? aValue - bValue
            : bValue - aValue;
        }

        return fundSortDirection === 'asc'
          ? aValue.toString().localeCompare(bValue.toString())
          : bValue.toString().localeCompare(aValue.toString());
      });
    }

    return result;
  }, [funds, fundSearch, fundSortField, fundSortDirection]);

  // Fund pagination
  const fundTotalPages = Math.ceil(filteredAndSortedFunds.length / fundEntriesPerPage);
  const fundStartIndex = (fundCurrentPage - 1) * fundEntriesPerPage;
  const fundEndIndex = fundStartIndex + fundEntriesPerPage;
  const paginatedFunds = filteredAndSortedFunds.slice(fundStartIndex, fundEndIndex);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Funds</CardTitle>
            <Button onClick={handleAddFund}>
              <Plus className="h-4 w-4 mr-2" />
              New Fund
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search and Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="relative flex-1 sm:flex-initial sm:w-[300px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search funds..."
                  value={fundSearch}
                  onChange={(e) => {
                    setFundSearch(e.target.value);
                    setFundCurrentPage(1);
                  }}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Show</span>
                <Select
                  value={fundEntriesPerPage.toString()}
                  onValueChange={(value) => {
                    setFundEntriesPerPage(Number(value));
                    setFundCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[80px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">entries</span>
              </div>
            </div>

            {/* Funds Table */}
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <button
                        onClick={() => handleFundSort('fundType')}
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                      >
                        Fund Type
                        {getFundSortIcon('fundType')}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        onClick={() => handleFundSort('starts')}
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                      >
                        Starts
                        {getFundSortIcon('starts')}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        onClick={() => handleFundSort('expires')}
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                      >
                        Expires
                        {getFundSortIcon('expires')}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        onClick={() => handleFundSort('amount')}
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                      >
                        Amount ($)
                        {getFundSortIcon('amount')}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        onClick={() => handleFundSort('balance')}
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                      >
                        Balance
                        {getFundSortIcon('balance')}
                      </button>
                    </TableHead>
                    <TableHead className="w-[100px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedFunds.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No funds found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedFunds.map((fund) => (
                      <TableRow key={fund.id}>
                        <TableCell className="font-medium">{fund.fundType}</TableCell>
                        <TableCell>{formatDate(fund.starts)}</TableCell>
                        <TableCell>{formatDate(fund.expires)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{formatCurrency(fund.amount)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{formatCurrency(fund.balance)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewFund(fund)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateFund(fund)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Update
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDeleteFund(fund)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground">
                Showing {fundStartIndex + 1} to {Math.min(fundEndIndex, filteredAndSortedFunds.length)} of {filteredAndSortedFunds.length} entries
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFundCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={fundCurrentPage === 1 || fundTotalPages === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: fundTotalPages }, (_, i) => i + 1).map((page) => {
                    if (
                      page === 1 ||
                      page === fundTotalPages ||
                      (page >= fundCurrentPage - 1 && page <= fundCurrentPage + 1)
                    ) {
                      return (
                        <Button
                          key={page}
                          variant={fundCurrentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setFundCurrentPage(page)}
                          className="w-10"
                        >
                          {page}
                        </Button>
                      );
                    } else if (page === fundCurrentPage - 2 || page === fundCurrentPage + 2) {
                      return <span key={page} className="px-2">...</span>;
                    }
                    return null;
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFundCurrentPage(prev => Math.min(fundTotalPages, prev + 1))}
                  disabled={fundCurrentPage === fundTotalPages || fundTotalPages === 0}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Fund Sheet */}
      <Sheet open={isAddFundOpen} onOpenChange={setIsAddFundOpen}>
        <SheetContent className="sm:max-w-[540px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>New Fund</SheetTitle>
            <SheetDescription>
              Add a new fund for this client. Fill in all required fields.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="fund-type">Fund Type <span className="text-destructive">*</span></Label>
              <Select
                value={fundForm.fundType}
                onValueChange={(value) => setFundForm({ ...fundForm, fundType: value })}
              >
                <SelectTrigger id="fund-type">
                  <SelectValue placeholder="Select fund type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NDIS Plan">NDIS Plan</SelectItem>
                  <SelectItem value="Core Support">Core Support</SelectItem>
                  <SelectItem value="Capacity Building">Capacity Building</SelectItem>
                  <SelectItem value="Capital Support">Capital Support</SelectItem>
                  <SelectItem value="Transport">Transport</SelectItem>
                  <SelectItem value="Consumables">Consumables</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fund-starts">Starts <span className="text-destructive">*</span></Label>
              <Input
                id="fund-starts"
                type="date"
                value={fundForm.starts}
                onChange={(e) => setFundForm({ ...fundForm, starts: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fund-expires">Expires <span className="text-destructive">*</span></Label>
              <Input
                id="fund-expires"
                type="date"
                value={fundForm.expires}
                onChange={(e) => setFundForm({ ...fundForm, expires: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fund-amount">Amount ($) <span className="text-destructive">*</span></Label>
              <Input
                id="fund-amount"
                type="number"
                step="0.01"
                min="0"
                value={fundForm.amount}
                onChange={(e) => setFundForm({ ...fundForm, amount: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fund-balance">Balance <span className="text-destructive">*</span></Label>
              <Input
                id="fund-balance"
                type="number"
                step="0.01"
                min="0"
                value={fundForm.balance}
                onChange={(e) => setFundForm({ ...fundForm, balance: e.target.value })}
                placeholder="0.00"
              />
            </div>
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => setIsAddFundOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleFundSubmit}>
              Add Fund
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Update Fund Sheet */}
      <Sheet open={isUpdateFundOpen} onOpenChange={setIsUpdateFundOpen}>
        <SheetContent className="sm:max-w-[540px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Update Fund</SheetTitle>
            <SheetDescription>
              Update fund information. Fill in all required fields.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="update-fund-type">Fund Type <span className="text-destructive">*</span></Label>
              <Select
                value={fundForm.fundType}
                onValueChange={(value) => setFundForm({ ...fundForm, fundType: value })}
              >
                <SelectTrigger id="update-fund-type">
                  <SelectValue placeholder="Select fund type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NDIS Plan">NDIS Plan</SelectItem>
                  <SelectItem value="Core Support">Core Support</SelectItem>
                  <SelectItem value="Capacity Building">Capacity Building</SelectItem>
                  <SelectItem value="Capital Support">Capital Support</SelectItem>
                  <SelectItem value="Transport">Transport</SelectItem>
                  <SelectItem value="Consumables">Consumables</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="update-fund-starts">Starts <span className="text-destructive">*</span></Label>
              <Input
                id="update-fund-starts"
                type="date"
                value={fundForm.starts}
                onChange={(e) => setFundForm({ ...fundForm, starts: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="update-fund-expires">Expires <span className="text-destructive">*</span></Label>
              <Input
                id="update-fund-expires"
                type="date"
                value={fundForm.expires}
                onChange={(e) => setFundForm({ ...fundForm, expires: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="update-fund-amount">Amount ($) <span className="text-destructive">*</span></Label>
              <Input
                id="update-fund-amount"
                type="number"
                step="0.01"
                min="0"
                value={fundForm.amount}
                onChange={(e) => setFundForm({ ...fundForm, amount: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="update-fund-balance">Balance <span className="text-destructive">*</span></Label>
              <Input
                id="update-fund-balance"
                type="number"
                step="0.01"
                min="0"
                value={fundForm.balance}
                onChange={(e) => setFundForm({ ...fundForm, balance: e.target.value })}
                placeholder="0.00"
              />
            </div>
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => setIsUpdateFundOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleFundSubmit}>
              Update Fund
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default ClientFunds;

