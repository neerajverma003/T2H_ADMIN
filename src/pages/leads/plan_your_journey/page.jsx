import { useEffect, useState } from "react";
import { apiClient } from "../../../stores/authStores";

// Delete journey API (calls backend admin route)
const deleteJourneyAPI = async (journeyId) => {
  return apiClient.delete(`/admin/plan-your-journey/${journeyId}`);
};

// --- React Component ---
const PlanYourJourney = () => {
  // --- State Management ---
  const [journeys, setJourneys] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Data Fetching ---
  useEffect(() => {
    const loadJourneys = async () => {
      try {
        setIsLoading(true);
        const res = await apiClient.get("/admin/plan-your-journey");
        if (res.data.Data) {
          setJourneys(res.data.Data);
        }
      } catch (err) {
        setError("Failed to load honeymoon journey requests. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    loadJourneys();
  }, []);

  // --- Event Handlers ---
  const handleDelete = async (journeyId) => {
    if (window.confirm("Are you sure you want to delete this honeymoon journey request?")) {
      try {
        await deleteJourneyAPI(journeyId);
        setJourneys((current) =>
          current.filter((journey) => journey._id !== journeyId)
        );
      } catch (err) {
        alert("Failed to delete the honeymoon journey request. Please try again.");
      }
    }
  };

  // --- Render Logic ---
  if (isLoading) {
    return (
      <div className="text-center p-8">
        <p className="text-slate-600 dark:text-slate-400">
          Loading honeymoon journey requests...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 bg-red-50 dark:bg-red-900/10 rounded-xl">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-y-8 p-4 md:p-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
          Trip to Honeymoon – Plan Your Journey Requests
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          View and manage honeymoon journey plans submitted by couples.
        </p>
      </div>

      {/* List of Journey Plans */}
      <div className="space-y-6">
        {journeys.length > 0 ? (
          journeys.map((journey) => (
            <div
              key={journey._id}
              className="rounded-xl border border-slate-200 bg-white shadow-sm transition-all
              duration-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="p-6">
                <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                  {/* Couple Details */}
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                      {journey.name}
                    </h2>

                    <div className="mt-2 text-sm text-slate-600 dark:text-slate-400 space-y-1">
                      <p>
                        <strong>Email:</strong>{" "}
                        <a
                          href={`mailto:${journey.email}`}
                          className="text-pink-600 hover:underline"
                        >
                          {journey.email}
                        </a>
                      </p>
                      <p>
                        <strong>Phone:</strong> {journey.phone}
                      </p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <h3 className="text-md font-medium text-slate-700 dark:text-slate-300">
                        Honeymoon Preferences:
                      </h3>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                        {journey.destination}
                      </p>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <div className="flex-shrink-0 mt-4 md:mt-0">
                    <button
                      onClick={() => handleDelete(journey._id)}
                      className="inline-flex items-center justify-center rounded-lg
                      bg-red-600 px-4 py-2 text-sm font-semibold text-white
                      shadow-sm transition-colors hover:bg-red-700
                      focus:outline-none focus:ring-2 focus:ring-red-500
                      focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 px-6 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700">
            <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200">
              No Honeymoon Requests Yet
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              When couples submit their honeymoon journey plans, they will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanYourJourney;
