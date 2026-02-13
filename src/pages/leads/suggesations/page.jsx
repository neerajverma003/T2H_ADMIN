import { useEffect, useState, useMemo } from "react";
import { apiClient } from "../../../stores/authStores";

const ITEMS_PER_PAGE = 10;

// Call backend to delete a suggestion
const deleteSuggestionAPI = async (suggestionId) => {
  return apiClient.delete(`/admin/get-suggestions/${suggestionId}`);
};

// Helper to load suggestions
const fetchSuggestions = async (page = 1) => {
  const response = await apiClient.get("/admin/get-suggestions");
  const data = response?.data?.Data || [];
  return { data, total: data.length };
};

const Suggestions = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalSuggestions, setTotalSuggestions] = useState(0);

  const totalPages = useMemo(
    () => Math.ceil(totalSuggestions / ITEMS_PER_PAGE),
    [totalSuggestions]
  );

  useEffect(() => {
    const loadSuggestions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, total } = await fetchSuggestions(currentPage);
        setSuggestions(data);
        setTotalSuggestions(total);
      } catch (err) {
        setError("Failed to load honeymoon suggestions. Please refresh the page.");
      } finally {
        setIsLoading(false);
      }
    };

    loadSuggestions();
  }, [currentPage]);

  const handleDelete = async (suggestionId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this honeymoon suggestion? This action cannot be undone."
      )
    ) {
      try {
        await deleteSuggestionAPI(suggestionId);

        if (suggestions.length === 1 && currentPage > 1) {
          setCurrentPage((prev) => prev - 1);
        } else {
          const { data, total } = await fetchSuggestions(currentPage);
          setSuggestions(data);
          setTotalSuggestions(total);
        }
      } catch (err) {
        alert("Failed to delete the honeymoon suggestion. Please try again.");
      }
    }
  };

  const goToNextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  const goToPreviousPage = () =>
    setCurrentPage((prev) => Math.max(prev - 1, 1));

  return (
    <div className="flex flex-col gap-y-8 p-4 md:p-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
          Trip to Honeymoon – User Suggestions
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Review feedback, ideas, and suggestions shared by couples and users.
        </p>
      </div>

      <div className="space-y-6">
        {isLoading ? (
          <p className="text-center p-8 text-slate-600 dark:text-slate-400">
            Loading honeymoon suggestions...
          </p>
        ) : error ? (
          <div className="text-center p-8 bg-red-50 dark:bg-red-900/10 rounded-xl">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        ) : suggestions.length > 0 ? (
          <>
            {/* Suggestions List */}
            <div className="space-y-6">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion._id}
                  className="rounded-xl border border-slate-200 bg-white shadow-sm
                  transition-all duration-300 hover:shadow-lg
                  dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                      {/* User Info */}
                      <div className="flex-1">
                        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                          {suggestion.name}
                        </h2>
                        <a
                          href={`mailto:${suggestion.email}`}
                          className="mt-1 block text-sm text-pink-600 hover:underline dark:text-pink-400"
                        >
                          {suggestion.email}
                        </a>
                      </div>

                      {/* Delete Button */}
                      <div className="flex-shrink-0 mt-4 md:mt-0">
                        <button
                          onClick={() => handleDelete(suggestion._id)}
                          className="inline-flex items-center justify-center rounded-lg
                          bg-red-50 px-4 py-2 text-sm font-semibold text-red-700
                          shadow-sm transition-colors hover:bg-red-100
                          focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
                          dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20
                          dark:focus:ring-offset-slate-900"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Suggestion Message */}
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                        {suggestion.message}
                      </p>
                    </div>
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
                  className="inline-flex items-center justify-center rounded-lg
                  border border-slate-300 bg-white px-4 py-2 text-sm font-semibold
                  text-slate-700 shadow-sm transition-colors hover:bg-slate-50
                  disabled:cursor-not-allowed disabled:opacity-50
                  dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300
                  dark:hover:bg-slate-700"
                >
                  Previous
                </button>
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center justify-center rounded-lg
                  border border-slate-300 bg-white px-4 py-2 text-sm font-semibold
                  text-slate-700 shadow-sm transition-colors hover:bg-slate-50
                  disabled:cursor-not-allowed disabled:opacity-50
                  dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300
                  dark:hover:bg-slate-700"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-16 px-6 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700">
            <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200">
              No Honeymoon Suggestions Yet
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              When users share feedback or ideas, they will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Suggestions;
