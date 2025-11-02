import { PaymentPlans } from '@/components/PaymentPlans';
import { useNavigate } from 'react-router-dom';

export default function Pricing() {
  const navigate = useNavigate();

  const handlePaymentSuccess = () => {
    navigate('/');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Billing & Pricing</h2>
        <p className="text-muted-foreground">
          Choose the plan that works best for you and upgrade your content creation experience.
        </p>
      </div>
      
      <PaymentPlans onSuccess={handlePaymentSuccess} />
    </div>
  );
}