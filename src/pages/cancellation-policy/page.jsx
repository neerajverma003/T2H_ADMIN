import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Loader2, FileText, Edit, Save } from "lucide-react";
import { apiClient } from "../../stores/authStores";

const HoneymoonCancellationPolicy = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [textContent, setTextContent] = useState("");

  // Load the honeymoon cancellation policy
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsLoading(true);
        const res = await apiClient.get(
          `/admin/honeymoon-cancellation-policy`
        );

        setTextContent(
          res?.data?.data?.honeymoon_cancellation_policy || ""
        );
      } catch (error) {
        console.error(
          "Error fetching honeymoon cancellation policy:",
          error
        );
        toast.error("Failed to load honeymoon cancellation policy.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, []);

  // Save updated honeymoon cancellation policy
  const handleSave = async () => {
    try {
      setIsSaving(true);
      await apiClient.put(`/admin/honeymoon-cancellation-policy`, {
        honeymoon_cancellation_policy: textContent,
      });
      toast.success("Honeymoon cancellation policy saved successfully 💕");
      setIsEditing(false);
    } catch (error) {
      console.error(
        "Error saving honeymoon cancellation policy:",
        error
      );
      toast.error("Failed to save honeymoon cancellation policy.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-y-8 p-4 md:p-8">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
          Honeymoon Trip Cancellation Policy
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          View, edit, and manage the cancellation policy for honeymoon trips.
        </p>
      </div>

      {/* Content Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-x-3">
            <FileText className="size-6 text-slate-800 dark:text-slate-200" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
              Honeymoon Cancellation Policy Content
            </h2>
          </div>

          <div className="flex items-center gap-x-3">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                disabled={isSaving || isLoading}
                className="inline-flex items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-slate-600"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 min-h-[300px]">
          {isLoading ? (
            <div className="text-center py-20 flex flex-col items-center justify-center">
              <Loader2 className="size-8 text-slate-400 animate-spin mb-2" />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Loading honeymoon policy...
              </p>
            </div>
          ) : isEditing ? (
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              className="w-full min-h-[300px] rounded-lg border border-slate-300 bg-transparent p-4 text-sm transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/80 dark:border-slate-700 dark:text-slate-50 dark:focus:ring-blue-600"
              placeholder="Enter honeymoon cancellation policy..."
            />
          ) : (
            <div className="p-2 text-slate-700 dark:text-slate-300 text-base leading-relaxed whitespace-pre-line">
              {textContent}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HoneymoonCancellationPolicy;
