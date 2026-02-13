import { useEffect, useState, useMemo } from "react";
import { apiClient } from "../../../stores/authStores";

const ITEMS_PER_PAGE = 10;

const ContactUs = () => {
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalContacts, setTotalContacts] = useState(0);

  const totalPages = useMemo(
    () => Math.ceil(totalContacts / ITEMS_PER_PAGE),
    [totalContacts]
  );

  // --- Fetch contacts ---
  const fetchContacts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get("/admin/get-contact");
      const data = response.data.Data || [];
      setTotalContacts(data.length);

      const start = (currentPage - 1) * ITEMS_PER_PAGE;
      setContacts(data.slice(start, start + ITEMS_PER_PAGE));
    } catch (err) {
      setError("Failed to load honeymoon inquiries. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [currentPage]);

  // --- Delete inquiry ---
  const handleDelete = async (_id) => {
    if (!window.confirm("Are you sure you want to delete this honeymoon inquiry?")) return;

    try {
      await apiClient.delete(`/admin/get-contact/${_id}`);
      alert("Inquiry deleted successfully!");
      fetchContacts();
    } catch (err) {
      alert("Failed to delete the inquiry. Please try again.");
    }
  };

  const goToNextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const goToPreviousPage = () =>
    setCurrentPage((prev) => Math.max(prev - 1, 1));

  return (
    <div className="flex flex-col gap-y-8 p-4 md:p-8">
      {/* PAGE HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
          Trip to Honeymoon – Contact Inquiries
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          View and manage inquiries submitted by couples planning their honeymoon.
        </p>
      </div>

      <div className="space-y-6">
        {isLoading ? (
          <p className="text-center p-8 text-slate-600 dark:text-slate-400">
            Loading honeymoon inquiries...
          </p>
        ) : error ? (
          <div className="text-center p-8 bg-red-50 dark:bg-red-900/10 rounded-xl">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        ) : contacts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-6">
              {contacts.map((contact) => (
                <div
                  key={contact._id}
                  className="rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-xs font-semibold uppercase tracking-wider text-pink-600 dark:text-pink-400">
                          {contact.subject || "Honeymoon Inquiry"}
                        </p>
                        <h2 className="mt-1 text-xl font-bold text-slate-800 dark:text-slate-100">
                          {contact.name}
                        </h2>
                        <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
                          <span>{contact.email}</span>
                          <span>{contact.phone_no}</span>
                        </div>
                      </div>

                      <div className="flex-shrink-0 mt-2 sm:mt-0">
                        <button
                          onClick={() => handleDelete(contact._id)}
                          className="inline-flex items-center justify-center rounded-lg
                          border border-red-600 px-4 py-2 text-sm font-semibold text-red-600
                          transition hover:bg-red-50 dark:text-red-400 dark:border-red-500
                          dark:hover:bg-red-500/10"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                        {contact.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* PAGINATION */}
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-x-2">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg border disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg border disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-16 px-6 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700">
            <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200">
              No Honeymoon Inquiries Yet
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              When couples reach out to plan their honeymoon, their messages will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactUs;
