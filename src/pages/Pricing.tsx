import { PaymentPlans } from '@/components/PaymentPlans';
import { useNavigate } from 'react-router-dom';

export default function Pricing() {
  const navigate = useNavigate();

  const handlePaymentSuccess = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-16">
        <PaymentPlans onSuccess={handlePaymentSuccess} />
      </div>
    </div>
  );
}