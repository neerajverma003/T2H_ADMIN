import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Loader2, FileText, Edit, Save, Heart } from "lucide-react";
import { apiClient } from "../../stores/authStores";

const HoneymoonPaymentMode = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [travelType, setTravelType] = useState("domestic");
  const [textContent, setTextContent] = useState("");

  // Fetch Honeymoon Payment Mode based on travelType
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsLoading(true);
        const res = await apiClient.get(
          `/admin/honeymoon/payment-mode/${travelType}`
        );

        const content =
          res?.data?.destinationPaymentModeData
            ?.honeymoon_payment_mode || "";

        setTextContent(content);
      } catch (error) {
        toast.error("Failed to load honeymoon payment mode.");
      } finally {
        setIsLoading(false);
      }
    };

    if (travelType) {
      fetchContent();
    }
  }, [travelType]);

  // Save updated honeymoon payment mode
  const handleSave = async () => {
    try {
      setIsSaving(true);
      await apiClient.post(`/admin/honeymoon/payment-mode`, {
        type: travelType,
        honeymoon_payment_mode: textContent,
      });
      toast.success("Honeymoon payment mode saved successfully 💕");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to save honeymoon payment mode.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTypeChange = (e) => {
    setTravelType(e.target.value);
  };

  return (
    <div className="flex flex-col gap-y-8 p-4 md:p-8">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
          Honeymoon Payment Mode <Heart className="text-pink-500" />
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Manage payment modes for honeymoon trips based on category.
        </p>
      </div>

      {/* Category Selection */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Select Category
            </label>
            <div className="flex gap-6">
              {["domestic", "international"].map((type) => (
                <label
                  key={type}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    value={type}
                    checked={travelType === type}
                    onChange={handleTypeChange}
                    className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-slate-300 dark:border-slate-600 bg-transparent"
                  />
                  <span className="capitalize text-slate-800 dark:text-slate-200">
                    {type}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Mode Content */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-x-3">
            <FileText className="size-6 text-slate-800 dark:text-slate-200" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
              Honeymoon Payment Mode Content
            </h2>
          </div>

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
              className="inline-flex items-center justify-center rounded-md bg-pink-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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

        <div className="mt-6 min-h-[300px]">
          {isLoading ? (
            <div className="text-center py-20 flex flex-col items-center justify-center">
              <Loader2 className="size-8 text-slate-400 animate-spin mb-2" />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Loading honeymoon payment mode...
              </p>
            </div>
          ) : isEditing ? (
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              className="w-full min-h-[300px] rounded-lg border border-slate-300 bg-transparent p-4 text-sm transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/80 dark:border-slate-700 dark:text-slate-50 dark:focus:ring-pink-600"
              placeholder="Enter honeymoon payment mode for this category..."
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

export default HoneymoonPaymentMode;
