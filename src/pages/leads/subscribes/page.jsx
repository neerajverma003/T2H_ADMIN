import { useEffect, useState, useMemo } from "react";
import { apiClient } from "../../../stores/authStores";

const ITEMS_PER_PAGE = 10;

const Subscribe = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalSubscribers, setTotalSubscribers] = useState(0);

  const totalPages = useMemo(
    () => Math.ceil(totalSubscribers / ITEMS_PER_PAGE),
    [totalSubscribers]
  );

  // --- Fetch subscribers ---
  const fetchSubscribers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get("/admin/get-subscribe");
      const data = response.data.Data || [];
      setTotalSubscribers(data.length);

      const start = (currentPage - 1) * ITEMS_PER_PAGE;
      setSubscribers(data.slice(start, start + ITEMS_PER_PAGE));
    } catch (err) {
      setError("Failed to load honeymoon newsletter subscribers. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, [currentPage]);

  // --- Delete subscriber ---
  const handleDelete = async (subscriberId) => {
    if (!window.confirm("Are you sure you want to delete this honeymoon subscriber?")) return;

    try {
      await apiClient.delete(`/admin/get-subscribe/${subscriberId}`);
      setSubscribers((prev) => prev.filter((sub) => sub._id !== subscriberId));
      setTotalSubscribers((prev) => prev - 1);

      if (subscribers.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      }
    } catch (err) {
      alert("Failed to delete honeymoon subscriber. Please try again.");
    }
  };

  const goToNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const goToPreviousPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  return (
    <div className="flex flex-col gap-y-8 p-4 md:p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
          Trip to Honeymoon – Newsletter Subscribers
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Manage couples and users subscribed to honeymoon offers, deals, and updates.
        </p>
      </div>

      <div className="space-y-6">
        {isLoading ? (
          <p className="text-center p-8 text-slate-600 dark:text-slate-400">
            Loading honeymoon subscribers...
          </p>
        ) : error ? (
          <div className="text-center p-8 bg-red-50 dark:bg-red-900/10 rounded-xl">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        ) : subscribers.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subscribers.map((sub) => (
                <div
                  key={sub._id}
                  className="rounded-xl border border-slate-200 bg-white shadow-sm
                  transition-all duration-300 hover:shadow-md
                  dark:border-slate-800 dark:bg-slate-900 p-6 flex flex-col"
                >
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                      {sub.name}
                    </h2>

                    <div className="mt-2 text-sm text-slate-500 dark:text-slate-400 space-y-1">
                      <p>
                        Email:{" "}
                        <a
                          href={`mailto:${sub.email}`}
                          className="text-pink-600 hover:underline"
                        >
                          {sub.email}
                        </a>
                      </p>
                      <p>Phone: {sub.phone}</p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <button
                      onClick={() => handleDelete(sub._id)}
                      className="w-full inline-flex items-center justify-center rounded-lg
                      border border-red-600/30 px-4 py-2 text-sm font-semibold
                      text-red-600 shadow-sm transition-colors hover:bg-red-50
                      focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
                      dark:text-red-400 dark:border-red-500/30 dark:hover:bg-red-500/10"
                    >
                      Delete Subscriber
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-x-2">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-16 px-6 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700">
            <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200">
              No Honeymoon Subscribers Yet
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              When users subscribe for honeymoon updates, they will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Subscribe;
