import { Card, CardContent } from "@/components/ui/card";
import { useContext, useState } from "react";
import { WalletContext } from "@/App";
import { formatDateRelative } from "@/lib/utils";
import QRCode from "@/components/ui/qr-code";
import { Check, ArrowLeftRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { rewardService } from "@/lib/rewardService";
import { tokenService } from "@/lib/tokenService";
import { walletService } from "@/lib/walletService";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import type { Transaction, Reward } from "@shared/schema";

export default function CustomerDashboard() {
  const { walletAddress, userInfo, connected, connect, isLoading: isWalletLoading } = useContext(WalletContext);
  const { toast } = useToast();
  const [redemptionLoading, setRedemptionLoading] = useState<number | null>(null);

  // Fetch rewards from businesses
  const { data: businesses } = useQuery({
    queryKey: ['/api/businesses'],
    enabled: connected && !!userInfo,
  });

  // For now, just get rewards from the first business
  const businessId = businesses?.[0]?.id;

  // Fetch transactions if user is connected
  const { 
    data: transactions = [],
    isLoading: isTransactionsLoading
  } = useQuery({
    queryKey: userInfo ? [`/api/users/${userInfo.id}/transactions`] : [],
    enabled: connected && !!userInfo,
  });

  // Fetch rewards if user is connected
  const { 
    data: rewards = [],
    isLoading: isRewardsLoading
  } = useQuery({
    queryKey: businessId ? [`/api/businesses/${businessId}/rewards`] : [],
    enabled: connected && !!userInfo && !!businessId,
  });

  // Fetch token info (from the first business for now)
  const { 
    data: token,
    isLoading: isTokenLoading 
  } = useQuery({
    queryKey: businessId ? [`/api/businesses/${businessId}/token`] : [],
    enabled: connected && !!userInfo && !!businessId,
  });

  // For demo purposes, fetch a mock token balance
  const { 
    data: tokenBalance = 0,
    isLoading: isBalanceLoading
  } = useQuery({
    queryKey: ['tokenBalance', userInfo?.id, token?.id],
    queryFn: () => walletService.getUserBalance(userInfo!.id, token?.tokenAddress || ""),
    enabled: connected && !!userInfo && !!token,
  });

  // Set up a mutation for redeeming rewards
  const redeemRewardMutation = useMutation({
    mutationFn: (rewardId: number) => {
      if (!userInfo || !businessId || !token) {
        throw new Error("Missing required information");
      }
      return rewardService.redeemReward(
        userInfo.id,
        businessId,
        rewardId,
        token.tokenAddress || ""
      );
    },
    onSuccess: () => {
      toast({
        title: "Reward Redeemed",
        description: "Your reward has been successfully redeemed!",
      });
      // Refresh transactions and token balance
      if (userInfo) {
        rewardService.REWARD_CACHE_KEYS.userTransactions(userInfo.id).forEach(key => {
          queryClient.invalidateQueries({ queryKey: [key] });
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Redemption Failed",
        description: "Failed to redeem reward. Please try again.",
        variant: "destructive"
      });
      console.error("Error redeeming reward:", error);
    },
    onSettled: () => {
      setRedemptionLoading(null);
    }
  });

  const handleRedeemReward = (rewardId: number) => {
    if (!connected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to redeem rewards.",
        variant: "destructive"
      });
      return;
    }
    
    if (!userInfo) {
      toast({
        title: "User Not Found",
        description: "Please register as a user to redeem rewards.",
        variant: "destructive"
      });
      return;
    }
    
    setRedemptionLoading(rewardId);
    redeemRewardMutation.mutate(rewardId);
  };

  const isLoading = isWalletLoading || isTransactionsLoading || isRewardsLoading || isTokenLoading || isBalanceLoading;

  // Show a simpler view when not connected
  if (!connected) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Welcome to SolLoyalty</h1>
            <p className="text-lg text-gray-600 mb-8">
              Connect your wallet to access your loyalty rewards and transactions.
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

  // Show loading state
  if (isLoading) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#9945FF]" />
            <p className="text-lg text-gray-600">Loading your loyalty rewards...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Your Loyalty Rewards</h1>
        
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Token Balance Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-[#14F195] rounded-md p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Token Balance</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        {tokenBalance} {token?.symbol || 'SLOY'}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </CardContent>
            <div className="bg-gray-50 px-4 py-4 sm:px-6">
              <div className="text-sm">
                <a href="#" className="font-medium text-[#9945FF] hover:text-[#03E1FF]">
                  View token details
                </a>
              </div>
            </div>
          </Card>

          {/* QR Code Card */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Earn Rewards</h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>Show this QR code to earn loyalty tokens with your purchase.</p>
              </div>
              <div className="mt-3 text-center">
                <QRCode value={walletAddress || ""} />
              </div>
            </CardContent>
            <div className="bg-gray-50 px-4 py-4 sm:px-6">
              <div className="text-sm">
                <a href="#" className="font-medium text-[#9945FF] hover:text-[#03E1FF]">
                  Download as image
                </a>
              </div>
            </div>
          </Card>

          {/* Recent Activity Card */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Activity</h3>
              <div className="mt-3">
                {transactions.length === 0 ? (
                  <div className="text-center py-4 text-sm text-gray-500">
                    No transactions yet
                  </div>
                ) : (
                  transactions.slice(0, 5).map((transaction: Transaction) => (
                    <div key={transaction.id} className="flex items-center py-2 border-b">
                      <div className={`w-8 h-8 flex items-center justify-center rounded-full ${
                        transaction.type === 'earn' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {transaction.type === 'earn' ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <ArrowLeftRight className="h-4 w-4" />
                        )}
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {transaction.type === 'earn' ? 'Earned' : 'Redeemed'} {Math.abs(transaction.amount)} {token?.symbol || 'SLOY'}
                        </p>
                        <p className="text-xs text-gray-500">{transaction.description}</p>
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDateRelative(transaction.createdAt)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
            <div className="bg-gray-50 px-4 py-4 sm:px-6">
              <div className="text-sm">
                <a href="#" className="font-medium text-[#9945FF] hover:text-[#03E1FF]">
                  View all activity
                </a>
              </div>
            </div>
          </Card>
        </div>

        {/* Rewards Marketplace */}
        <h2 className="mt-8 text-xl font-semibold text-gray-900">Rewards Marketplace</h2>
        
        {rewards.length === 0 ? (
          <div className="mt-4 text-center py-8 bg-white shadow overflow-hidden sm:rounded-lg">
            <p className="text-gray-500">No rewards available at the moment</p>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rewards.map((reward: Reward) => (
              <Card key={reward.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{reward.name}</h3>
                      <p className="mt-1 text-sm text-gray-500">{reward.description}</p>
                    </div>
                    <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      {reward.tokenCost} {token?.symbol || 'SLOY'}
                    </span>
                  </div>
                  <div className="mt-4">
                    <Button 
                      variant="outline" 
                      className="text-[#9945FF] bg-[#9945FF] bg-opacity-10 hover:bg-opacity-20 border-transparent focus:ring-[#9945FF]"
                      onClick={() => handleRedeemReward(reward.id)}
                      disabled={redemptionLoading === reward.id || tokenBalance < reward.tokenCost}
                    >
                      {redemptionLoading === reward.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Redeeming...
                        </>
                      ) : tokenBalance < reward.tokenCost ? (
                        "Insufficient balance"
                      ) : (
                        "Redeem reward"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
