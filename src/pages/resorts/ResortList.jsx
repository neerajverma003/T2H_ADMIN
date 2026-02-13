import { useEffect, useState } from "react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

// Custom alert function to replace Swal
const showAlert = (type, title, message) => {
  if (type === "success") {
    alert(`✅ ${title}\n\n${message}`);
  } else if (type === "error") {
    alert(`❌ ${title}\n\n${message}`);
  }
};

const HoneymoonResortList = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch all resorts
  const fetchResorts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/admin/resort/all", {
        headers: {
          "Authorization": `Bearer ${token || ""}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch resorts");
      const json = await res.json();
      // Handle both direct array and wrapped response
      setData(Array.isArray(json) ? json : json.data || []);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  // Edit resort
  const handleEdit = (id) => {
    navigate(`/resorts/edit/${id}`);
  };

  // Delete resort
  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this resort? This action cannot be undone.");
    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/admin/resort/delete/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token || ""}`,
        },
      });
      if (!res.ok) throw new Error("Delete failed");
      
      showAlert("success", "Deleted!", "Resort has been deleted successfully");
      fetchResorts();
    } catch {
      showAlert("error", "Error", "Failed to delete resort");
    }
  };

  useEffect(() => {
    fetchResorts();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
          Resort Listings
        </h1>
        <button
          onClick={() => navigate("/resorts/create")}
          className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg font-semibold"
        >
          + Create New Resort
        </button>
      </div>

      {isLoading && <p className="text-center">Loading resorts...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {data.map((trip) => {
          const { _id, title, contact_email, contact_phone, images } = trip;
          const imageUrl =
            images?.[0] || "https://via.placeholder.com/300?text=No+Image";

          return (
            <div
              key={_id}
              className="bg-white dark:bg-slate-900 rounded-lg shadow-md overflow-hidden flex flex-col"
            >
              <img src={imageUrl} alt={title} className="h-48 w-full object-cover" />

              <div className="p-4 flex-1">
                <h2 className="text-lg font-semibold truncate">{title}</h2>

                <p className="text-sm mt-2">
                  {contact_email && <span>Email: {contact_email}</span>}
                </p>

                <p className="text-sm">
                  {contact_phone && <span>Phone: {contact_phone}</span>}
                </p>
              </div>

              <div className="p-4 flex justify-end gap-4">
                <button onClick={() => handleEdit(_id)} title="Edit">
                  <PencilIcon className="h-5 w-5 text-blue-500" />
                </button>

                <button onClick={() => handleDelete(_id)} title="Delete">
                  <TrashIcon className="h-5 w-5 text-red-500" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HoneymoonResortList;
