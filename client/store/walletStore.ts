import { create } from 'zustand';
import api from '@/lib/axios';
import { useToastStore } from './toastStore';
import { useOnboardingStore } from './onboardingStore';

interface PricingPlan {
  id: number;
  name: string;
  stripe_price_id: string;
  amount: number;
  billing_type: string;
  description: string;
  is_active?: boolean;
}

interface SubscriptionStatus {
  is_subscribed: boolean;
}

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
}

interface Transaction {
  id: string;
  type: 'top_up' | 'payment' | 'refund' | 'deduction';
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  description: string;
  reference_id?: string;
  receipt_url?: string;
}

interface BillingHistory {
  id: number;
  reference_id: string;
  transaction_date: string;
  client_name: string;
  client_email: string;
  payment_method: string;
  amount: string;
  status: string;
  billing_title: string;
  currency: string;
  plan: string;
  users: number;
  invoice_pdf: string;
  hosted_invoice_url: string;
}

interface WalletState {
  isLoading: boolean;
  walletBalance: number;
  currency: string;
  pricingPlans: PricingPlan[];
  paymentMethods: PaymentMethod[];
  billingHistory: BillingHistory[];
  transactions: Transaction[];
  selectedPlan: PricingPlan | null;
  stripeCustomerId: string | null;
  subscriptionStatus: SubscriptionStatus | null;
  exchangeRates: Record<string, number>;
  
  // Actions
  fetchWalletBalance: () => Promise<void>;
  fetchPricingPlans: () => Promise<void>;
  fetchPaymentMethods: () => Promise<void>;
  fetchBillingHistory: () => Promise<void>;
  fetchTransactions: (params?: { page?: number; type?: string; status?: string }) => Promise<void>;
  fetchSubscriptionStatus: () => Promise<void>;
  getDisplayBalance: () => number;
  formatAmount: (amount: number, targetCurrency?: string) => string;
  createStripeCustomer: () => Promise<string | null>;
  createSetupIntent: () => Promise<{clientSecret: string, customerId: string} | null>;
  addPaymentMethod: (paymentMethodId: string) => Promise<boolean>;
  removePaymentMethod: (paymentMethodId: string) => Promise<boolean>;
  setSelectedPlan: (plan: PricingPlan) => void;
  subscribeToPlan: (planId: number, paymentMethodId: string) => Promise<boolean>;
  createCheckoutSession: (priceId: string, paymentMethodId: string) => Promise<string | null>;
  initiateTopUp: (amount: number, paymentMethodId?: string) => Promise<string | null>;
  settleInvoiceWithWallet: (invoiceId: string, amount: number) => Promise<boolean>;
  updateCurrency: (currency: 'USD' | 'EUR') => Promise<boolean>;
  healthCheck: () => Promise<boolean>;
}

export const useWalletStore = create<WalletState>()((set, get) => ({
  isLoading: false,
  walletBalance: 0,
  currency: 'USD',
  pricingPlans: [],
  paymentMethods: [],
  billingHistory: [],
  transactions: [],
  selectedPlan: null,
  stripeCustomerId: null,
  subscriptionStatus: null,
  exchangeRates: {
    'USD': 1.0,
    'EUR': 0.92, // Mock exchange rate: 1 USD = 0.92 EUR
  },

  fetchWalletBalance: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/wallet/balance/');
      const data = response.data.data || response.data;
      const backendCurrency = data?.currency;
      const currentCurrency = get().currency;
      
      set({ 
        walletBalance: Number(data?.balance || 0),
        // If the backend has a currency set, we use it. 
        // If not, we keep the user's current local preference.
        currency: backendCurrency || currentCurrency || 'USD',
        isLoading: false
      });
    } catch (error) {
      console.error('Failed to fetch wallet balance:', error);
      // Fallback to 0 if endpoint doesn't exist
      set({ walletBalance: 0, isLoading: false });
    }
  },

  fetchPricingPlans: async () => {
    set({ isLoading: true });
    try {
      const [plansResponse, statusResponse] = await Promise.all([
        api.get('/pricing-plans/'),
        api.get('/subscription/status/').catch(() => ({ data: { data: { is_subscribed: false } } }))
      ]);
      
      const isSubscribed = statusResponse.data.data?.is_subscribed || false;
      const subPlanName = statusResponse.data.data?.plan_name || '';
      
      const rawPlans = plansResponse.data.data || plansResponse.data || [];
      const plans = Array.isArray(rawPlans) ? rawPlans.map((plan: any) => ({
        ...plan,
        amount: Number(plan.amount) / 100,
        is_active: isSubscribed && (
          plan.name === subPlanName || 
          (subPlanName.toLowerCase().includes('meeting') && plan.name.toLowerCase().includes('meeting'))
        )
      })) : [];
      
      set({ 
        pricingPlans: plans, 
        selectedPlan: plans[0] || null, 
        subscriptionStatus: statusResponse.data.data,
        isLoading: false 
      });
    } catch (error) {
      console.error('Failed to fetch pricing plans:', error);
      set({ isLoading: false });
    }
  },

  fetchSubscriptionStatus: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/subscription/status/');
      set({ subscriptionStatus: response.data.data, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch subscription status:', error);
      set({ subscriptionStatus: { is_subscribed: false }, isLoading: false });
    }
  },

  fetchPaymentMethods: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/user/payment-methods/');
      const responseData = response.data.data || response.data || [];
      const methods = Array.isArray(responseData) ? responseData : [];
      set({ paymentMethods: methods, isLoading: false });
    } catch (error: any) {
      // Silently fail — backend may return 500 due to Stripe key/mode mismatch
      // (e.g. test-mode key used against a live-mode customer ID).
      // Don't show an error toast since this is a backend config issue the user can't resolve.
      console.warn('Payment methods unavailable:', error?.response?.status, error?.response?.data?.message || '');
      set({ paymentMethods: [], isLoading: false });
    }
  },

  fetchBillingHistory: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/billing-history/');
      console.log('Fetched billing history:', response.data);
      const responseData = response.data.data?.results || response.data.data || response.data || [];
      const history = Array.isArray(responseData) ? responseData : [];
      set({ billingHistory: history, isLoading: false });
    } catch (error: any) {
      console.error('Failed to fetch billing history:', error);
      set({ billingHistory: [], isLoading: false });
    }
  },

  fetchTransactions: async (params = {}) => {
    set({ isLoading: true });
    try {
      const response = await api.get('/wallet/transactions/', { params });
      const responseData = response.data.data?.results || response.data.data || response.data || [];
      const transactions = Array.isArray(responseData) ? responseData.map((tx: any) => ({
        ...tx,
        amount: Number(tx.amount || 0),
        type: tx.transaction_type // Standardize type field
      })) : [];
      
      set({ 
        transactions,
        isLoading: false 
      });
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      set({ isLoading: false, transactions: [] });
    }
  },

  createStripeCustomer: async () => {
    // Reuse existing ID if we already have it
    const currentId = get().stripeCustomerId;
    if (currentId) {
      console.log('✅ Reusing existing Stripe Customer ID:', currentId);
      return currentId;
    }

    try {
      console.log('🚀 Attempting to create/ensure Stripe customer on backend...');
      const response = await api.post('/user/create-stripe-customer/');
      
      // Use stripe_customer_id inside the 'data' envelope returned by CustomJSONRenderer
      const customerId = response.data.data?.stripe_customer_id || response.data.data?.customer_id;
      
      console.log('✅ Stripe Customer Ensured:', customerId);
      set({ stripeCustomerId: customerId });
      return customerId;
    } catch (error: any) {
      console.error('❌ Failed to create Stripe customer:', error);
      
      const status = error.response?.status;
      const statusText = error.response?.statusText || '';
      const serverMessage = error.response?.data?.message || error.response?.data?.error || '';
      
      let displayMessage = `Billing Error (${status}): ${statusText}`;
      if (serverMessage) displayMessage += ` - ${serverMessage}`;
      if (status === 500) displayMessage += ' (Check backend Stripe keys)';

      useToastStore.getState().addToast(displayMessage, 'error');
      return null;
    }
  },

  createSetupIntent: async () => {
    try {
      const response = await api.post('/setup-intent/');
      console.log('Setup intent created:', response.data);
      
      // Handle response format from backend CreateSetupIntent view inside the 'data' envelope
      const { client_secret, customer_id } = response.data.data || response.data;
      set({ stripeCustomerId: customer_id });
      return { clientSecret: client_secret, customerId: customer_id };
    } catch (error: any) {
      console.error('Failed to create setup intent:', error);
      const errorMessage = error.response?.data?.message || 'Failed to setup payment';
      useToastStore.getState().addToast(errorMessage, 'error');
      return null;
    }
  },

  addPaymentMethod: async (paymentMethodId: string) => {
    console.log('=== ADDING PAYMENT METHOD ===');
    console.log('Payment Method ID:', paymentMethodId);
    console.log('API Endpoint: /user/add-payment-method/');
    console.log('Payload:', { payment_method_id: paymentMethodId });
    
    try {
      const response = await api.post('/user/add-payment-method/', {
        payment_method_id: paymentMethodId
      });
      console.log('✅ Payment method API response:', response.data);
      
      // Refresh payment methods
      console.log('🔄 Refreshing payment methods...');
      await get().fetchPaymentMethods();
      const message = response.data?.message || 'Payment method added successfully';
      useToastStore.getState().addToast(message, 'success');
      return true;
    } catch (error: any) {
      console.error('❌ Failed to add payment method:', error);
      const status = error.response?.status;
      const serverMessage = error.response?.data?.message || 'Failed to add payment method';
      
      useToastStore.getState().addToast(`Error (${status}): ${serverMessage}`, 'error');
      return false;
    }
  },

  removePaymentMethod: async (paymentMethodId: string) => {
    try {
      await api.delete(`/user/payment-methods/${paymentMethodId}/`);
      
      // Refresh payment methods
      await get().fetchPaymentMethods();
      useToastStore.getState().addToast('Payment method removed successfully', 'success');
      return true;
    } catch (error) {
      console.error('Failed to remove payment method:', error);
      useToastStore.getState().addToast('Failed to remove payment method', 'error');
      return false;
    }
  },

  setSelectedPlan: (plan: PricingPlan) => {
    set({ selectedPlan: plan });
  },

  subscribeToPlan: async (planId: number, paymentMethodId: string) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/subscribe/', {
        plan_id: planId,
        payment_method_id: paymentMethodId
      });
      
      const message = response.data?.message || 'Successfully subscribed to plan!';
      useToastStore.getState().addToast(message, 'success');
      set({ isLoading: false });
      return true;
    } catch (error: any) {
      console.error('Failed to subscribe to plan:', error);
      const errorMessage = error.response?.data?.message || 'Failed to subscribe to plan';
      useToastStore.getState().addToast(errorMessage, 'error');
      set({ isLoading: false });
      return false;
    }
  },

  createCheckoutSession: async (priceId: string, paymentMethodId: string) => {
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const response = await api.post('/payments/create-checkout/', {
        price_id: priceId,
        payment_method_id: paymentMethodId,
        success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/payment/cancel`,
      });
      
      const data = response.data?.data || response.data;
      
      // Handle Direct Success
      if (data?.status === 'success') {
        useToastStore.getState().addToast('Subscription/Payment successful!', 'success');
        // Refresh local state immediately
        await Promise.all([
          get().fetchSubscriptionStatus(),
          get().fetchBillingHistory(),
          get().fetchWalletBalance(),
          get().fetchPricingPlans()
        ]);
        return null;
      }

      // Handle 3D Secure / Action Required
      if (data?.status === 'requires_action' && data?.client_secret) {
        const { loadStripe } = await import('@stripe/stripe-js');
        const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
        
        if (!stripe) throw new Error('Stripe failed to load');
        
        useToastStore.getState().addToast('Authentication required. Opening payment verification...', 'info');
        
        const { error, paymentIntent } = await stripe.confirmCardPayment(data.client_secret);
        
        if (error) {
          throw new Error(error.message);
        }
        
        useToastStore.getState().addToast('Payment verified successfully!', 'success');
        return null;
      }

      // Handle Checkout URL (Fallback or guest)
      if (data?.checkout_url) {
        useToastStore.getState().addToast('Redirecting to checkout...', 'success');
        return data.checkout_url;
      }

      return null;
    } catch (error: any) {
      console.error('Failed to create checkout session:', error);
      const status = error.response?.status;
      const serverError = error.response?.data?.error || error.response?.data?.message || error.response?.data;
      const errorMessage = typeof serverError === 'string' ? serverError : JSON.stringify(serverError) || error.message || 'Failed to create checkout session';
      
      useToastStore.getState().addToast(`Error (${status || 'Unknown'}): ${errorMessage}`, 'error');
      return null;
    }
  },

  initiateTopUp: async (amount: number, paymentMethodId?: string) => {
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const response = await api.post('/wallet/topup/', {
        amount,
        payment_method_id: paymentMethodId,
        success_url: `${origin}/account/wallet?success=true`,
        cancel_url: `${origin}/account/wallet?canceled=true`,
      });
      
      const data = response.data?.data || response.data;

      // Handle Direct Success
      if (data?.status === 'success') {
        // Small delay to ensure DB commit is visible to the next GET request
        await new Promise(resolve => setTimeout(resolve, 1000));
        await Promise.all([
          get().fetchWalletBalance(),
          get().fetchTransactions()
        ]);
        useToastStore.getState().addToast('Top-up successful', 'success');
        return null;
      }

      // Handle 3D Secure / Action Required
      if (data?.status === 'requires_action' && data?.client_secret) {
        const { loadStripe } = await import('@stripe/stripe-js');
        const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
        
        if (!stripe) throw new Error('Stripe failed to load');

        useToastStore.getState().addToast('Authentication required. Opening verification...', 'info');

        const { error, paymentIntent } = await stripe.confirmCardPayment(data.client_secret);
        
        if (error) {
          throw new Error(error.message);
        }

        if (paymentIntent?.status === 'succeeded') {
          // Small delay to ensure DB commit is visible to the next GET request
          await new Promise(resolve => setTimeout(resolve, 1000));
          await Promise.all([
            get().fetchWalletBalance(),
            get().fetchTransactions()
          ]);
          useToastStore.getState().addToast('Top-up completed successfully!', 'success');
          return null;
        }
      }
      
      // Handle Checkout URL (Guest/Fallback)
      if (data?.checkout_url) {
        return data.checkout_url;
      }
      
      return null;
    } catch (error: any) {
      console.error('Failed to initiate top-up:', error);
      const status = error.response?.status;
      const serverError = error.response?.data?.error || error.response?.data?.message || error.response?.data;
      const errorMessage = typeof serverError === 'string' ? serverError : JSON.stringify(serverError) || error.message || 'Failed to initiate top-up';
      
      useToastStore.getState().addToast(`Error (${status || 'Unknown'}): ${errorMessage}`, 'error');
      return null;
    }
  },

  settleInvoiceWithWallet: async (invoiceId: string, amount: number) => {
    try {
      await api.post('/wallet/pay-invoice/', {
        invoice_id: invoiceId,
        amount
      });
      
      await get().fetchWalletBalance();
      useToastStore.getState().addToast('Invoice settled using wallet balance', 'success');
      return true;
    } catch (error: any) {
      console.error('Failed to settle invoice:', error);
      const errorMessage = error.response?.data?.message || 'Insufficient wallet balance';
      useToastStore.getState().addToast(errorMessage, 'error');
      return false;
    }
  },

  updateCurrency: async (newCurrency: 'USD' | 'EUR') => {
    // Apply currency locally immediately so the UI responds right away
    set({ currency: newCurrency, isLoading: true });

    try {
      const { onboardingStatus, checkOnboardingStatus } = useOnboardingStore.getState();

      const payload = {
        ...onboardingStatus,
        currency: newCurrency,
        is_completed: true
      };

      delete (payload as any).id;
      delete (payload as any).created_at;
      delete (payload as any).updated_at;

      await api.post('/onboarding/submit/', payload);
      
      // Save to localStorage as a fallback to prevent re-prompting if backend is slow
      localStorage.setItem('orr-user-currency', newCurrency);

      // Refresh data without letting balance fetch overwrite the currency
      await Promise.all([
        get().fetchWalletBalance(),
        checkOnboardingStatus(),
      ]);

      // Re-assert after fetches to prevent any overwrite
      set({ currency: newCurrency, isLoading: false });

      useToastStore.getState().addToast('Currency updated successfully', 'success');
      return true;
    } catch (error: any) {
      // Backend failed, but keep the local currency choice so the UI still works
      console.warn('Currency backend sync failed — keeping local change:', error?.response?.status);
      set({ isLoading: false });
      // Still close the modal and show partial success
      useToastStore.getState().addToast('Currency applied locally. Sync will retry on next session.', 'info');
      return true; // Return true so the modal closes
    }
  },

  getDisplayBalance: () => {
    const { walletBalance, currency, exchangeRates } = get();
    // Assuming walletBalance from backend is always in USD (base currency)
    // If currency is EUR, we multiply by the rate.
    if (currency === 'EUR' && exchangeRates['EUR']) {
      return walletBalance * exchangeRates['EUR'];
    }
    return walletBalance;
  },

  formatAmount: (amount: number, targetCurrency?: string) => {
    const { currency, exchangeRates } = get();
    const activeCurrency = targetCurrency || currency;
    
    let displayAmount = amount;
    if (activeCurrency === 'EUR' && exchangeRates['EUR']) {
      displayAmount = amount * exchangeRates['EUR'];
    }
    
    const symbol = activeCurrency === 'EUR' ? '€' : '$';
    return `${symbol}${displayAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  },

  healthCheck: async () => {
    try {
      console.log('🚀 Running Backend Health Check...');
      const response = await api.get('/pricing-plans/');
      console.log('✅ Health Check (Public Endpoint) Success:', response.data);
      return true;
    } catch (error: any) {
      console.error('❌ Health Check Failed:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url
      });
      return false;
    }
  },
}));