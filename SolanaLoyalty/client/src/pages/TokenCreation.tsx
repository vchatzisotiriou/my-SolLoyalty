import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Upload, Loader2 } from "lucide-react";
import { useState, useContext } from "react";
import { WalletContext } from "@/App";
import { tokenService } from "@/lib/tokenService";
import { solanaApi } from "@/lib/solana";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";

export default function TokenCreation() {
  const { toast } = useToast();
  const { connected, businessInfo, accountType, walletAddress, connect, isLoading: isWalletLoading } = useContext(WalletContext);
  const [_, setLocation] = useLocation();
  
  const [tokenData, setTokenData] = useState({
    name: "",
    symbol: "",
    supply: 1000000,
    decimals: "6",
    mintable: false,
    freezable: false,
    earnRate: 10,
    expiration: "365",
    rewardTiers: "3",
    network: "devnet",
    multisig: false,
    securityNotes: ""
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTokenData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setTokenData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleCheckboxChange = (name: string, checked: boolean) => {
    setTokenData(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  // Create token mutation
  const createTokenMutation = useMutation({
    mutationFn: async () => {
      if (!businessInfo) {
        throw new Error("Business information required for token creation");
      }
      
      // 1. Create token on Solana blockchain (mocked for now)
      const solanaToken = await solanaApi.createToken(
        tokenData.name,
        tokenData.symbol,
        parseInt(tokenData.decimals),
        tokenData.supply,
        tokenData.mintable,
        tokenData.freezable
      );
      
      // 2. Save token information in our database
      return tokenService.createToken({
        businessId: businessInfo.id,
        name: tokenData.name,
        symbol: tokenData.symbol,
        supply: tokenData.supply,
        decimals: parseInt(tokenData.decimals),
        mintable: tokenData.mintable,
        freezable: tokenData.freezable,
        mintAuthority: walletAddress || solanaToken.mintAuthority
      });
    },
    onSuccess: (token) => {
      toast({
        title: "Token Created Successfully",
        description: `Your token ${token.symbol} was created and is now ready to use in your loyalty program.`,
      });
      
      // Redirect to business portal after successful token creation
      setTimeout(() => {
        setLocation("/business");
      }, 1500);
    },
    onError: (error) => {
      console.error("Error creating token:", error);
      toast({
        title: "Error Creating Token",
        description: "There was an error creating your token. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  const handleSubmit = async () => {
    if (!connected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to create a token.",
        variant: "destructive"
      });
      return;
    }
    
    if (!businessInfo) {
      toast({
        title: "Business Registration Required",
        description: "You need to register as a business to create a token.",
        variant: "destructive"
      });
      return;
    }
    
    if (!tokenData.name || !tokenData.symbol) {
      toast({
        title: "Missing Information",
        description: "Please provide both a token name and symbol.",
        variant: "destructive"
      });
      return;
    }
    
    createTokenMutation.mutate();
  };
  
  // Show a simplified view when not connected
  if (!connected) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Create Your Loyalty Token</h1>
            <p className="text-lg text-gray-600 mb-8">
              Connect your wallet to create a custom token for your loyalty program.
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
  
  // Show a message if not a business account
  if (accountType !== 'business' && businessInfo === null) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Business Registration Required</h1>
            <p className="text-lg text-gray-600 mb-8">
              You need to register as a business to create a loyalty token.
            </p>
            <Button 
              onClick={() => setLocation("/business")}
              className="bg-[#9945FF] hover:bg-opacity-90"
            >
              Go to Business Portal
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="py-6">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardContent className="pt-6">
            <h1 className="text-2xl font-semibold text-gray-900">Create Your Loyalty Token</h1>
            <p className="mt-1 text-sm text-gray-500">Set up your custom SPL token on the Solana blockchain for your loyalty program.</p>
            
            <div className="mt-6 space-y-6">
              {/* Step 1: Token Details */}
              <div>
                <h2 className="text-lg font-medium text-gray-900">Step 1: Token Details</h2>
                <div className="mt-3 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <Label htmlFor="token-name">Token Name</Label>
                    <div className="mt-1">
                      <Input 
                        id="token-name" 
                        name="name" 
                        value={tokenData.name}
                        onChange={handleChange}
                        placeholder="e.g. Coffee Rewards Token" 
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-3">
                    <Label htmlFor="token-symbol">Token Symbol</Label>
                    <div className="mt-1">
                      <Input 
                        id="token-symbol" 
                        name="symbol" 
                        value={tokenData.symbol}
                        onChange={handleChange}
                        placeholder="e.g. COFFEE" 
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-6">
                    <Label htmlFor="token-logo">Token Logo</Label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-[#9945FF] hover:text-[#03E1FF]">
                            <span>Upload a file</span>
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Tokenomics */}
              <div className="pt-5 border-t border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Step 2: Tokenomics</h2>
                <div className="mt-3 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <Label htmlFor="total-supply">Total Token Supply</Label>
                    <div className="mt-1">
                      <Input 
                        type="number" 
                        id="total-supply" 
                        name="supply" 
                        value={tokenData.supply}
                        onChange={handleChange}
                        placeholder="e.g. 1,000,000" 
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-3">
                    <Label htmlFor="decimals">Decimals</Label>
                    <div className="mt-1">
                      <Select 
                        value={tokenData.decimals}
                        onValueChange={(value) => handleSelectChange("decimals", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select decimals" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">0 (whole tokens only)</SelectItem>
                          <SelectItem value="2">2 (e.g. dollars and cents)</SelectItem>
                          <SelectItem value="6">6 (standard for most tokens)</SelectItem>
                          <SelectItem value="9">9 (high precision)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="sm:col-span-6">
                    <div className="flex items-start">
                      <Checkbox 
                        id="mintable" 
                        checked={tokenData.mintable}
                        onCheckedChange={(checked) => 
                          handleCheckboxChange("mintable", checked as boolean)
                        }
                      />
                      <div className="ml-3 text-sm">
                        <Label htmlFor="mintable" className="font-medium text-gray-700">Allow minting new tokens</Label>
                        <p className="text-gray-500">Enable the ability to create additional tokens in the future.</p>
                      </div>
                    </div>
                  </div>
                  <div className="sm:col-span-6">
                    <div className="flex items-start">
                      <Checkbox 
                        id="freezable" 
                        checked={tokenData.freezable}
                        onCheckedChange={(checked) => 
                          handleCheckboxChange("freezable", checked as boolean)
                        }
                      />
                      <div className="ml-3 text-sm">
                        <Label htmlFor="freezable" className="font-medium text-gray-700">Allow freezing accounts</Label>
                        <p className="text-gray-500">Enable the ability to freeze token accounts if needed.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: Smart Contract Rules */}
              <div className="pt-5 border-t border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Step 3: Smart Contract Rules</h2>
                <div className="mt-3 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-6">
                    <Label htmlFor="earn-rate">Earning Rate</Label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <Input 
                        type="number" 
                        id="earn-rate" 
                        name="earnRate" 
                        value={tokenData.earnRate}
                        onChange={handleChange}
                        placeholder="10" 
                        className="rounded-r-none" 
                      />
                      <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                        tokens per $1 spent
                      </span>
                    </div>
                  </div>
                  <div className="sm:col-span-3">
                    <Label htmlFor="expiration">Token Expiration</Label>
                    <div className="mt-1">
                      <Select 
                        value={tokenData.expiration}
                        onValueChange={(value) => handleSelectChange("expiration", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select expiration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="never">Never expire</SelectItem>
                          <SelectItem value="90">90 days</SelectItem>
                          <SelectItem value="180">180 days</SelectItem>
                          <SelectItem value="365">365 days</SelectItem>
                          <SelectItem value="custom">Custom period</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="sm:col-span-3">
                    <Label htmlFor="reward-tiers">Reward Tiers</Label>
                    <div className="mt-1">
                      <Select 
                        value={tokenData.rewardTiers}
                        onValueChange={(value) => handleSelectChange("rewardTiers", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select reward tiers" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Basic (1 tier)</SelectItem>
                          <SelectItem value="3">Standard (3 tiers)</SelectItem>
                          <SelectItem value="5">Premium (5 tiers)</SelectItem>
                          <SelectItem value="custom">Custom tiers</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4: Security & Deployment */}
              <div className="pt-5 border-t border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Step 4: Security & Deployment</h2>
                <div className="mt-3 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-6">
                    <Label htmlFor="deployment-network">Deployment Network</Label>
                    <div className="mt-1">
                      <Select 
                        value={tokenData.network}
                        onValueChange={(value) => handleSelectChange("network", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select network" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="devnet">Devnet (for testing)</SelectItem>
                          <SelectItem value="testnet">Testnet</SelectItem>
                          <SelectItem value="mainnet">Mainnet (production)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="sm:col-span-6">
                    <div className="flex items-start">
                      <Checkbox 
                        id="multisig" 
                        checked={tokenData.multisig}
                        onCheckedChange={(checked) => 
                          handleCheckboxChange("multisig", checked as boolean)
                        }
                      />
                      <div className="ml-3 text-sm">
                        <Label htmlFor="multisig" className="font-medium text-gray-700">Enable Multisig Authority</Label>
                        <p className="text-gray-500">Require multiple signatures for critical token operations.</p>
                      </div>
                    </div>
                  </div>
                  <div className="sm:col-span-6">
                    <Label htmlFor="additional-security">Additional Security Notes</Label>
                    <div className="mt-1">
                      <Textarea 
                        id="additional-security" 
                        name="securityNotes" 
                        value={tokenData.securityNotes}
                        onChange={handleChange}
                        rows={3} 
                        placeholder="Any specific security requirements or concerns..." 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-5 mt-5 border-t border-gray-200">
              <div className="flex justify-end">
                <Button variant="outline" className="mr-3">
                  Save Draft
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  className="bg-[#9945FF] hover:bg-opacity-90 focus:ring-[#9945FF]"
                >
                  Create Token
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
