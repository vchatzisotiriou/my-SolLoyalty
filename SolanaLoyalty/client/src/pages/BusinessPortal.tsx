import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Edit, CheckCircle, XCircle, Plus, Loader2 } from "lucide-react";
import { formatDateFull, formatAddress } from "@/lib/utils";
import { useContext, useState } from "react";
import { WalletContext } from "@/App";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { tokenService } from "@/lib/tokenService";
import { rewardService } from "@/lib/rewardService";
import { walletService } from "@/lib/walletService";
import { Reward } from "@shared/schema";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function BusinessPortal() {
  const { toast } = useToast();
  const { connected, businessInfo, connect, isLoading: isWalletLoading } = useContext(WalletContext);
  const [_, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [createRewardForm, setCreateRewardForm] = useState({
    name: '',
    description: '',
    tokenCost: 100,
    isActive: true
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Get token info for this business
  const { 
    data: token,
    isLoading: isTokenLoading 
  } = useQuery({
    queryKey: businessInfo ? [`/api/businesses/${businessInfo.id}/token`] : [],
    enabled: connected && !!businessInfo,
  });
  
  // Get rewards for this business
  const { 
    data: rewards = [], 
    isLoading: isRewardsLoading 
  } = useQuery({
    queryKey: businessInfo ? [`/api/businesses/${businessInfo.id}/rewards`] : [],
    enabled: connected && !!businessInfo,
  });
  
  // Get transactions for this business
  const { 
    data: transactions = [], 
    isLoading: isTransactionsLoading 
  } = useQuery({
    queryKey: businessInfo ? [`/api/businesses/${businessInfo.id}/transactions`] : [],
    enabled: connected && !!businessInfo,
  });
  
  const handleCreateReward = async () => {
    if (!businessInfo) return;
    
    try {
      const newReward = await rewardService.createReward({
        businessId: businessInfo.id,
        name: createRewardForm.name,
        description: createRewardForm.description,
        tokenCost: createRewardForm.tokenCost,
        isActive: createRewardForm.isActive
      });
      
      toast({
        title: "Reward Created",
        description: `${newReward.name} has been added to your rewards.`,
      });
      
      // Reset form and close dialog
      setCreateRewardForm({
        name: '',
        description: '',
        tokenCost: 100,
        isActive: true
      });
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error creating reward:", error);
      toast({
        title: "Error Creating Reward",
        description: "There was an error creating the reward. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCreateRewardForm(prev => ({
      ...prev,
      [name]: name === 'tokenCost' ? parseInt(value) : value
    }));
  };
  
  // Calculate token statistics
  const totalCirculating = token?.supply || 0;
  const totalRedeemed = transactions
    ?.filter(t => t.type === 'redeem')
    ?.reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0;
  
  // Filter transactions by search term
  const filteredTransactions = transactions.filter(t => 
    t.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const isLoading = isWalletLoading || isTokenLoading || isRewardsLoading || isTransactionsLoading;
  
  // Show a simplified view when not connected
  if (!connected) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Business Portal</h1>
            <p className="text-lg text-gray-600 mb-8">
              Connect your wallet to manage your loyalty program.
            </p>
            <Button 
              onClick={connect}
              disabled={isWalletLoading}
              className="bg-[#9945FF] hover:bg-opacity-90"
            >
              {isWalletLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Connect Wallet"
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // If business doesn't have a token yet, prompt to create one
  if (connected && businessInfo && !token) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Create Your Loyalty Token</h1>
            <p className="text-lg text-gray-600 mb-8">
              You need to create a loyalty token before you can manage your rewards program.
            </p>
            <Button 
              onClick={() => setLocation("/token-creation")}
              className="bg-[#9945FF] hover:bg-opacity-90"
            >
              Create Token
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#9945FF]" />
            <p className="text-lg text-gray-600">Loading business information...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Business Portal</h1>
        
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Token Analytics Card */}
          <Card>
            <CardContent className="pt-5">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Token Analytics</h3>
              <div className="mt-2 flex justify-between">
                <div>
                  <p className="text-sm text-gray-500">Circulating Supply</p>
                  <p className="text-2xl font-semibold text-gray-900">{totalCirculating.toLocaleString()} {token?.symbol}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Redeemed</p>
                  <p className="text-2xl font-semibold text-gray-900">{totalRedeemed.toLocaleString()} {token?.symbol}</p>
                </div>
              </div>
              {/* Placeholder for chart */}
              <div className="h-40 w-full mt-4 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-gray-400">Token Distribution Chart</div>
              </div>
            </CardContent>
            <div className="bg-gray-50 px-4 py-4 sm:px-6">
              <div className="text-sm">
                <a href="#" className="font-medium text-[#9945FF] hover:text-[#03E1FF]">
                  View detailed analytics
                </a>
              </div>
            </div>
          </Card>

          {/* Rewards Management Card */}
          <Card>
            <CardContent className="pt-5">
              <div className="flex justify-between items-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Rewards Management</h3>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-1" /> Add Reward
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Reward</DialogTitle>
                      <DialogDescription>
                        Add a new reward that customers can redeem with their loyalty tokens.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                      <div>
                        <Label htmlFor="reward-name">Reward Name</Label>
                        <Input 
                          id="reward-name" 
                          name="name" 
                          value={createRewardForm.name} 
                          onChange={handleInputChange} 
                          placeholder="e.g. Free Coffee"
                        />
                      </div>
                      <div>
                        <Label htmlFor="reward-description">Description</Label>
                        <Textarea 
                          id="reward-description" 
                          name="description" 
                          value={createRewardForm.description} 
                          onChange={handleInputChange} 
                          placeholder="Describe what customers will receive"
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="reward-cost">Token Cost</Label>
                        <Input 
                          id="reward-cost" 
                          name="tokenCost" 
                          type="number" 
                          value={createRewardForm.tokenCost} 
                          onChange={handleInputChange} 
                          min={1}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                      <Button onClick={handleCreateReward}>Create Reward</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="mt-4 space-y-3">
                {rewards.length > 0 ? (
                  rewards.map((reward: Reward) => (
                    <div key={reward.id} className="flex justify-between items-center p-2 border rounded hover:bg-gray-50">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{reward.name}</h4>
                        <p className="text-xs text-gray-500">{reward.tokenCost} {token?.symbol}</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-sm text-gray-500">
                    No rewards created yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* POS Integration Card */}
          <Card>
            <CardContent className="pt-5">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Point of Sale Integration</h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>Connect your existing POS system to automatically issue loyalty tokens.</p>
              </div>
              <div className="mt-4 space-y-3">
                <div className="flex items-center">
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-green-100 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">Shopify Integration</h4>
                    <p className="text-xs text-gray-500">Connected on May 12, 2023</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-400">
                    <XCircle className="h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">Square POS</h4>
                    <p className="text-xs text-gray-500">Not connected</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-400">
                    <XCircle className="h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">Custom API</h4>
                    <p className="text-xs text-gray-500">Not configured</p>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <Button className="bg-[#9945FF] hover:bg-opacity-90 focus:ring-[#9945FF]">
                  Add Integration
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customer Activity Table */}
        <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">Customer Activity</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Recent token transactions by your customers.</p>
            </div>
            <div>
              <div className="relative rounded-md shadow-sm w-64">
                <Input 
                  type="text" 
                  name="search" 
                  id="search" 
                  className="pr-10" 
                  placeholder="Search transactions" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.slice(0, 10).map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                            {transaction.userId ? 'U' : 'G'}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              Customer #{transaction.userId || 'Guest'}
                            </div>
                            <div className="text-sm text-gray-500 font-mono">
                              {formatAddress('wallet-address-placeholder', 4, 4)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {transaction.type === 'earn' ? 'Earned tokens' : 'Redeemed tokens'}
                        </div>
                        <div className="text-sm text-gray-500">{transaction.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {transaction.type === 'earn' ? '+' : '-'}{Math.abs(transaction.amount)} {token?.symbol}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          transaction.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : transaction.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateFull(transaction.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
            <Button variant="outline" className="mr-3" disabled={filteredTransactions.length <= 10}>
              Previous
            </Button>
            <Button variant="outline" disabled={filteredTransactions.length <= 10}>
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
