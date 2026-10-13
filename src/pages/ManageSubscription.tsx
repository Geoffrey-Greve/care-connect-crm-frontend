import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SubscriptionPlan {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  userRange: string;
  isActive: boolean;
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "1",
    name: "Unrestricted Features 6 To 40 Users",
    monthlyPrice: 126.0,
    yearlyPrice: 1260.0, // 10 months price (2 months free)
    userRange: "6 - 40 Users Included",
    isActive: false,
  },
  {
    id: "2",
    name: "Unrestricted Features 41 To 80 Users",
    monthlyPrice: 240.0,
    yearlyPrice: 2400.0, // 10 months price (2 months free)
    userRange: "41 - 80 Users Included",
    isActive: false,
  },
  {
    id: "3",
    name: "Unrestricted Features 1 To 5 Users",
    monthlyPrice: 50.0,
    yearlyPrice: 500.0, // 10 months price (2 months free)
    userRange: "1 - 5 Users Included",
    isActive: true,
  },
];

const baseFeatures = [
  "7 Day Free Trial",
  "Users Included", // This will be replaced with plan-specific user range
  "HPA Plus Web and Mobile App",
  "Client Management",
  "Staff Management",
  "Progress Notes",
  "Generate Invoices",
  "Advanced Rostering",
  "Timesheets",
  "Staff Clock In / Clock Out",
  "Upload & Store Documents",
  "Client Goals",
  "Track Client Funds",
  "Shift Management",
  "NDIS Price Guide Integration",
  "XERO Accounting Integration",
  "Employee KPI Management",
  "Support",
];

export default function ManageSubscription() {
  const { toast } = useToast();
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [plans, setPlans] = useState<SubscriptionPlan[]>(subscriptionPlans);

  const handleSelectPlan = (planId: string) => {
    setPlans((prev) =>
      prev.map((plan) => ({
        ...plan,
        isActive: plan.id === planId,
      }))
    );
    const selectedPlan = plans.find((p) => p.id === planId);
    toast({
      title: "Success",
      description: `You have selected "${selectedPlan?.name}" plan.`,
    });
  };

  const handleCancelSubscription = () => {
    setPlans((prev) =>
      prev.map((plan) => ({
        ...plan,
        isActive: false,
      }))
    );
    toast({
      title: "Subscription Cancelled",
      description: "Your subscription has been cancelled successfully.",
    });
    setCancelDialogOpen(false);
  };

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  const getPrice = (plan: SubscriptionPlan) => {
    return billingPeriod === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
  };

  const getFeaturesWithUserRange = (plan: SubscriptionPlan) => {
    return baseFeatures.map((feature) => {
      if (feature === "Users Included") {
        return plan.userRange;
      }
      return feature;
    });
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Manage Subscription</h1>
        <Button
          variant="destructive"
          onClick={() => setCancelDialogOpen(true)}
          disabled={!plans.some((p) => p.isActive)}
        >
          Cancel Subscription
        </Button>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        {/* Billing Period Toggle */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center rounded-md border border-gray-200 bg-white p-1">
            <button
              type="button"
              onClick={() => setBillingPeriod("monthly")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${billingPeriod === "monthly"
                  ? "bg-primary text-white shadow-sm"
                  : "text-gray-700 hover:bg-gray-50"
                }`}
            >
              Pay Monthly
            </button>
            <button
              type="button"
              onClick={() => setBillingPeriod("yearly")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${billingPeriod === "yearly"
                  ? "bg-primary text-white shadow-sm"
                  : "text-gray-700 hover:bg-gray-50"
                }`}
            >
              Pay Yearly
            </button>
          </div>
        </div>

        {/* Subscription Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card key={plan.id} className="border rounded-lg overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-semibold mb-2">{plan.name}</CardTitle>
                <div className="space-y-1">
                  <div className="text-xl font-bold text-primary">{formatPrice(getPrice(plan))}</div>
                  <div className="text-sm text-muted-foreground">
                    {billingPeriod === "monthly" ? "Monthly Plan" : "Yearly Plan"}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Features List */}
                <div className="space-y-0 border-t">
                  {getFeaturesWithUserRange(plan).map((feature, index) => (
                    <div key={index} className="border-b last:border-b-0 border-dashed py-1.5">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <div className="pt-4">
                  {plan.isActive ? (
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      disabled
                    >
                      Live Subscription
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => handleSelectPlan(plan.id)}
                    >
                      Select this plan <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      {/* Cancel Subscription Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel your subscription? This action cannot be undone.
              You will lose access to all premium features after your current billing period ends.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelSubscription}
              className="bg-red-600 hover:bg-red-700"
            >
              Cancel Subscription
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

