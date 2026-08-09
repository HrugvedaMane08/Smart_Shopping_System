export default function StatCard({ label, value, icon, accent = 'primary' }) {
  const accentStyles = {
    primary: 'bg-primary-50 text-primary-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <span className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${accentStyles[accent]}`}>
          {icon}
        </span>
      </div>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-sm text-slate-500 mt-1">{label}</p>
    </div>
  );
}