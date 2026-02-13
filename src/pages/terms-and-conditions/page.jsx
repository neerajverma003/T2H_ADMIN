import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { usePlaceStore } from "../../stores/usePlaceStore";
import { Loader2, FileText, Edit, Save, MapPin, Heart } from "lucide-react";

const HoneymoonTermsAndCondition = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [travelType, setTravelType] = useState("domestic");

  // Holds destination ID
  const [selectedPlaceId, setSelectedPlaceId] = useState("");

  const [textContent, setTextContent] = useState("");

  const {
    destinationList,
    isListLoading,
    currentTermsContent,
    isContentLoading,
    fetchDestinationList,
    fetchHoneymoonTermsContent,
    updateHoneymoonTermsContent,
  } = usePlaceStore();

  // Fetch destination list on travel type change
  useEffect(() => {
    fetchDestinationList(travelType);
    setSelectedPlaceId("");
  }, [travelType, fetchDestinationList]);

  // Fetch honeymoon terms when destination changes
  useEffect(() => {
    if (selectedPlaceId) {
      fetchHoneymoonTermsContent(selectedPlaceId);
      setIsEditing(false);
    } else {
      setTextContent("");
    }
  }, [selectedPlaceId, fetchHoneymoonTermsContent]);

  // Sync textarea with store content
  useEffect(() => {
    setTextContent(currentTermsContent);
  }, [currentTermsContent]);

  // Save honeymoon terms
  const handleSave = async () => {
    if (!selectedPlaceId) {
      toast.warn("Please select a destination to save honeymoon terms.");
      return;
    }

    setIsSaving(true);
    const data = {
      id: selectedPlaceId,
      honeymoon_terms_and_conditions: textContent,
    };

    await updateHoneymoonTermsContent(data);

    setIsSaving(false);
    setIsEditing(false);
    toast.success("Honeymoon terms saved successfully 💕");
  };

  return (
    <div className="flex flex-col gap-y-8 p-4 md:p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
          Honeymoon Trip Terms Management <Heart className="text-pink-500" />
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Manage destination-wise terms & conditions for honeymoon trips.
        </p>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Select Category
            </label>
            <div className="flex gap-6">
              {["domestic", "international"].map((type) => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value={type}
                    checked={travelType === type}
                    onChange={(e) => setTravelType(e.target.value)}
                    className="h-4 w-4 text-pink-600 focus:ring-pink-500"
                  />
                  <span className="capitalize text-slate-800 dark:text-slate-200">
                    {type}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Destination */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Select Destination
            </label>
            <select
              value={selectedPlaceId}
              onChange={(e) => setSelectedPlaceId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-3 pr-10 text-sm focus:ring-pink-500 focus:border-pink-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50"
              disabled={isListLoading}
            >
              <option value="">
                {isListLoading
                  ? "Loading Destinations..."
                  : "-- Select Destination --"}
              </option>
              {destinationList.map((place) => (
                <option key={place._id} value={place._id}>
                  {place.destination_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        className={`rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all dark:border-slate-800 dark:bg-slate-900 ${
          !selectedPlaceId ? "opacity-50" : ""
        }`}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-x-3">
            <FileText className="size-6 text-slate-800 dark:text-slate-200" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
              Honeymoon Terms & Conditions
            </h2>
          </div>

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              disabled={!selectedPlaceId || isSaving || isContentLoading}
              className="inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 disabled:opacity-50"
            >
              <Edit className="mr-2 h-4 w-4" /> Edit
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center rounded-md bg-pink-600 px-4 py-2 text-sm font-semibold text-white hover:bg-pink-700"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
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
          {isContentLoading ? (
            <div className="text-center py-20">
              <Loader2 className="size-8 animate-spin mx-auto text-slate-400" />
              <p className="text-sm mt-2 text-slate-500">
                Loading honeymoon terms…
              </p>
            </div>
          ) : selectedPlaceId ? (
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              readOnly={!isEditing}
              disabled={!isEditing}
              className="w-full min-h-[300px] rounded-lg border border-slate-300 bg-transparent p-4 text-sm focus:ring-pink-500 dark:border-slate-700 dark:text-slate-50"
              placeholder="Enter honeymoon terms & conditions for this destination..."
            />
          ) : (
            <div className="text-center py-20">
              <MapPin className="size-8 mx-auto text-slate-400 mb-2" />
              <p className="text-sm text-slate-500">
                Please select a destination to manage honeymoon terms.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HoneymoonTermsAndCondition;
