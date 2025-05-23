
"use client";
import type { ReactNode } from 'react';
import { memo, useCallback } from 'react'; // Added memo, useCallback
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"; // Added CardFooter
import { Separator } from "@/components/ui/separator";
import { CheckCircle, CreditCard, Download, ShieldCheck, DollarSign, RefreshCw, Edit } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link'; // Added Link import

// Mock Data
const currentPlanData = { // Renamed to avoid conflict
  name: "Pro Plan",
  price: 29,
  billingCycle: "monthly",
  features: [
    "Unlimited projects",
    "Unlimited tasks",
    "Advanced collaboration tools",
    "Priority support",
    "100GB storage",
  ],
  nextBillingDate: "August 15, 2024",
  renewalAmount: 29,
};

const paymentMethodsData = [ // Renamed
  { id: "pm_1", type: "Visa", last4: "4242", expiry: "12/25", isDefault: true },
  { id: "pm_2", type: "Mastercard", last4: "5555", expiry: "06/27", isDefault: false },
];

const billingHistoryData = [ // Renamed
  { id: "inv_1", date: "July 15, 2024", amount: 29, status: "Paid", description: "Pro Plan - Monthly" },
  { id: "inv_2", date: "June 15, 2024", amount: 29, status: "Paid", description: "Pro Plan - Monthly" },
  { id: "inv_3", date: "May 15, 2024", amount: 29, status: "Paid", description: "Pro Plan - Monthly" },
];

interface Plan {
  name: string;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
  isCurrent: boolean;
  highlight?: string;
}
const availablePlansData: Plan[] = [ // Renamed and typed
  { 
    name: "Basic", 
    priceMonthly: 0, 
    priceYearly: 0,
    features: ["5 Projects", "50 Tasks", "Basic Collaboration", "Community Support", "1GB Storage"],
    isCurrent: false,
  },
  { 
    name: "Pro", 
    priceMonthly: 29, 
    priceYearly: 290,
    features: ["Unlimited projects", "Unlimited tasks", "Advanced collaboration", "Priority support", "100GB Storage"],
    isCurrent: true,
    highlight: "Most Popular" 
  },
  { 
    name: "Business", 
    priceMonthly: 79, 
    priceYearly: 790,
    features: ["Everything in Pro", "Team roles & permissions", "Dedicated account manager", "SSO Integration", "1TB Storage"],
    isCurrent: false,
  },
];

interface PaymentMethod {
  id: string;
  type: string;
  last4: string;
  expiry: string;
  isDefault: boolean;
}

interface BillingHistoryEntry {
  id: string;
  date: string;
  amount: number;
  status: "Paid" | "Failed" | "Pending";
  description: string;
}

const MemoizedPlanCard = memo(function PlanCard({ plan, onPlanChange }: { plan: Plan, onPlanChange: (planName: string) => void }) {
  return (
    <Card className={`flex flex-col ${plan.isCurrent ? 'border-primary border-2' : ''} ${plan.highlight ? 'shadow-xl scale-[1.02]' : 'shadow-md'}`}>
        {plan.highlight && <Badge variant="default" className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">{plan.highlight}</Badge>}
        <CardHeader className="items-center text-center">
            <CardTitle className="text-2xl">{plan.name}</CardTitle>
            <CardDescription className="text-3xl font-bold">${plan.priceMonthly}<span className="text-sm font-normal text-muted-foreground">/mo</span></CardDescription>
            {plan.priceYearly > 0 && <CardDescription className="text-xs text-muted-foreground">or ${plan.priceYearly}/year (Save {((1 - plan.priceYearly / (plan.priceMonthly * 12)) * 100).toFixed(0)}%)</CardDescription>}
        </CardHeader>
        <CardContent className="flex-grow space-y-2">
            <ul className="space-y-1.5 text-sm text-muted-foreground">
                {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                    <CheckCircle className="mr-2 mt-0.5 h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                </li>
                ))}
            </ul>
        </CardContent>
        <CardFooter className="pt-2"> {/* Use CardFooter for consistency */}
            <Button 
                className="w-full" 
                variant={plan.isCurrent ? "outline" : "default"}
                onClick={() => !plan.isCurrent && onPlanChange(plan.name)}
                disabled={plan.isCurrent}
            >
                {plan.isCurrent ? "Current Plan" : `Choose ${plan.name}`}
            </Button>
        </CardFooter>
    </Card>
  );
});

const MemoizedPaymentMethodItem = memo(function PaymentMethodItem({ method, onSetDefault, onEdit, onRemove }: { method: PaymentMethod, onSetDefault: () => void, onEdit: () => void, onRemove: () => void }) {
  return (
    <li className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-center">
        <CreditCard className="mr-3 h-6 w-6 text-muted-foreground" />
        <div>
          <p className="font-medium">{method.type} ending in {method.last4}</p>
          <p className="text-sm text-muted-foreground">Expires {method.expiry}</p>
        </div>
        {method.isDefault && <Badge variant="secondary" className="ml-3">Default</Badge>}
      </div>
      <div className="flex gap-2">
        {!method.isDefault && <Button variant="ghost" size="sm" onClick={onSetDefault}>Set as Default</Button>}
        <Button variant="ghost" size="sm" onClick={onEdit}><Edit className="h-4 w-4 mr-1" /> Edit</Button>
        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={onRemove}>Remove</Button>
      </div>
    </li>
  );
});

const MemoizedBillingHistoryRow = memo(function BillingHistoryRow({ invoice, onDownload }: { invoice: BillingHistoryEntry, onDownload: () => void }) {
  return (
    <TableRow>
      <TableCell className="font-medium">{invoice.id.replace("inv_", "#INV-00")}</TableCell>
      <TableCell>{invoice.date}</TableCell>
      <TableCell>{invoice.description}</TableCell>
      <TableCell className="text-right">${invoice.amount.toFixed(2)}</TableCell>
      <TableCell className="text-center">
        <Badge variant={invoice.status === 'Paid' ? 'default' : 'destructive'} className={invoice.status === 'Paid' ? 'bg-green-500 hover:bg-green-600' : ''}>
          {invoice.status}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <Button variant="outline" size="sm" onClick={onDownload}>
          <Download className="mr-1 h-4 w-4" /> Download
        </Button>
      </TableCell>
    </TableRow>
  );
});

export default function BillingPage() {
  const { toast } = useToast();

  const handlePlanChange = useCallback((planName: string) => {
    toast({
      title: "Plan Change Requested",
      description: `You've requested to switch to the ${planName}. Follow the next steps to confirm.`,
    });
    console.log(`Changing plan to ${planName}`);
  }, [toast]);

  const handleAddPaymentMethod = useCallback(() => {
     toast({
      title: "Add Payment Method",
      description: "Redirecting to secure payment gateway... (Simulated)",
    });
  }, [toast]);

  const handleSetDefaultPayment = useCallback(() => toast({title: "Set as Default Clicked"}), [toast]);
  const handleEditPayment = useCallback(() => toast({title: "Edit Payment Method", description: "This would open a modal or form."}), [toast]);
  const handleRemovePayment = useCallback(() => toast({title: "Remove Payment Method", variant: "destructive"}), [toast]);
  const handleDownloadInvoice = useCallback((invoiceId: string) => toast({title: "Download Invoice", description: `Downloading invoice ${invoiceId}`}), [toast]);


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing & Subscription</h1>
        <p className="text-muted-foreground">Manage your subscription, payment methods, and view billing history.</p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <DollarSign className="mr-2 h-6 w-6 text-primary" /> Current Plan: {currentPlanData.name}
              </CardTitle>
              <CardDescription>
                Your current subscription details. Renews on {currentPlanData.nextBillingDate} for ${currentPlanData.renewalAmount}.
              </CardDescription>
            </div>
            <Button variant="outline" onClick={() => toast({title: "Manage Subscription Clicked"})}>Manage Subscription</Button>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {currentPlanData.features.map((feature, index) => (
              <li key={index} className="flex items-center">
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                {feature}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="flex items-center">
                <RefreshCw className="mr-2 h-6 w-6 text-primary" /> Available Plans
            </CardTitle>
            <CardDescription>Choose a plan that best suits your needs.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {availablePlansData.map((plan) => (
              <MemoizedPlanCard key={plan.name} plan={plan} onPlanChange={handlePlanChange} />
            ))}
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
                <CardTitle className="flex items-center">
                    <CreditCard className="mr-2 h-6 w-6 text-primary" /> Payment Methods
                </CardTitle>
                <CardDescription>Manage your saved payment methods.</CardDescription>
            </div>
            <Button variant="outline" onClick={handleAddPaymentMethod}>
                <PlusCircleIcon className="mr-2 h-4 w-4" /> Add New Method
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {paymentMethodsData.length > 0 ? (
            <ul className="space-y-4">
              {paymentMethodsData.map((method) => (
                <MemoizedPaymentMethodItem 
                  key={method.id} 
                  method={method}
                  onSetDefault={handleSetDefaultPayment}
                  onEdit={handleEditPayment}
                  onRemove={handleRemovePayment}
                />
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No payment methods saved.</p>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Download className="mr-2 h-6 w-6 text-primary" /> Billing History
          </CardTitle>
          <CardDescription>View and download your past invoices.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {billingHistoryData.map((invoice) => (
                <MemoizedBillingHistoryRow 
                  key={invoice.id} 
                  invoice={invoice} 
                  onDownload={() => handleDownloadInvoice(invoice.id)}
                />
              ))}
              {billingHistoryData.length === 0 && (
                 <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                        No billing history available.
                    </TableCell>
                 </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="shadow-lg bg-secondary/30 border-primary/50">
        <CardHeader>
            <CardTitle className="flex items-center">
                <ShieldCheck className="mr-2 h-6 w-6 text-primary" /> Security & Trust
            </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>Your payment information is processed securely by our payment partner (e.g., Stripe or PayPal). We do not store your full credit card details on our servers.</p>
            <p>All transactions are encrypted using SSL technology. If you have any questions about billing or security, please <Button variant="link" className="p-0 h-auto" asChild><Link href="/support">contact support</Link></Button>.</p>
        </CardContent>
      </Card>
    </div>
  );
}

interface PlusCircleProps extends React.SVGProps<SVGSVGElement> {}
const PlusCircleIcon = (props: PlusCircleProps) => ( // This component is small, memoization might be overkill unless proven bottleneck
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);