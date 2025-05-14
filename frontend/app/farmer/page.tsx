import FarmerDashboard from '../../src/components/Farmer/Dashboard';

export default function FarmerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-amber-50 p-8">
      <div className="max-w-4xl mx-auto">
        <FarmerDashboard />
      </div>
    </div>
  );
}
