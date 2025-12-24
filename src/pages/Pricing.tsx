import { PaymentPlans } from '@/components/PaymentPlans';
import { useNavigate } from 'react-router-dom';

export default function Pricing() {
  const navigate = useNavigate();

  const handlePaymentSuccess = () => {
    navigate('/app');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12 px-4 sm:px-6">
      {/* Header */}
      <div className="space-y-1 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Billing & Pricing</h2>
        <p className="text-muted-foreground text-sm sm:text-lg">
          Choose the plan that works best for you and upgrade your content creation experience.
        </p>
      </div>
      
      <PaymentPlans onSuccess={handlePaymentSuccess} />
    </div>
  );
}
