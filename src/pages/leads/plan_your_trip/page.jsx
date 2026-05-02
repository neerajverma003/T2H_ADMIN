import { useEffect, useState } from "react";
import { apiClient } from "../../../stores/authStores";

const TripRequests = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadRequests = async () => {
      try {
        setIsLoading(true);
        const res = await apiClient.get("/admin/plan-your-trip");
        if (res.data.Data) {
          setRequests(res.data.Data);
        }
      } catch (err) {
        setError("Failed to load honeymoon trip requests.");
      } finally {
        setIsLoading(false);
      }
    };
    loadRequests();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Delete this trip request?")) {
      try {
        await apiClient.delete(`/admin/plan-your-trip/${id}`);
        setRequests(requests.filter((r) => r._id !== id));
      } catch (err) {
        alert("Failed to delete.");
      }
    }
  };

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading requests...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Honeymoon Trip Requests</h1>
        <p className="text-slate-600 dark:text-slate-400">Detailed journey plans submitted by couples via the "Plan Your Honeymoon" form.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {requests.length > 0 ? (
          requests.map((req) => (
            <div key={req._id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all hover:shadow-lg">
              <div className="p-6">
                {/* Header: Customer Info */}
                <div className="flex flex-wrap justify-between items-start gap-4 border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{req.name}</h2>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm font-medium text-slate-500">
                      <span className="flex items-center gap-1">📧 {req.email}</span>
                      <span className="flex items-center gap-1">📞 {req.phone_no}</span>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(req._id)} className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-all text-sm font-bold">Delete Request</button>
                </div>

                {/* Body: Trip Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Location & Dates */}
                  <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Route & Timing</h3>
                    <div className="space-y-2">
                      <p className="text-sm font-semibold">📍 <span className="text-slate-500">From:</span> {req.from || "N/A"}</p>
                      <p className="text-sm font-semibold">🎯 <span className="text-slate-500">To:</span> {req.to || "N/A"}</p>
                      <p className="text-sm font-semibold">📅 <span className="text-slate-500">Dates:</span> {req.fromDate || "N/A"} to {req.toDate || "N/A"}</p>
                      <p className="text-sm font-semibold">⏱️ <span className="text-slate-500">Duration:</span> {req.NumberodDays} Days</p>
                    </div>
                  </div>

                  {/* Travelers & Purpose */}
                  <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Travelers & Purpose</h3>
                    <div className="space-y-2">
                      <p className="text-sm font-semibold">👫 <span className="text-slate-500">Adults:</span> {req.adults}</p>
                      <p className="text-sm font-semibold">👶 <span className="text-slate-500">Kids:</span> {req.kids}</p>
                      <p className="text-sm font-semibold">💡 <span className="text-slate-500">Purpose:</span> {req.purpose}</p>
                      <p className="text-sm font-semibold">📞 <span className="text-slate-500">Consultation:</span> {req.consultation ? "Yes Please" : "No"}</p>
                    </div>
                  </div>

                  {/* Budget */}
                  <div className="space-y-3 bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">Estimated Budget</h3>
                    <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400">₹{req.budget}</p>
                    <p className="text-xs text-indigo-400/80 font-medium italic">Submitted on: {new Date(req.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
            <p className="text-slate-400 font-medium">No detailed honeymoon trip requests found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TripRequests;
