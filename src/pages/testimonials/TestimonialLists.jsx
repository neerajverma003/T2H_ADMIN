// import { useState, useEffect } from "react";
// import { Loader2, Play, Trash2, MapPin, Eye } from "lucide-react";
// import { toast } from "react-toastify";
// import { apiClient } from "../../stores/authStores"; // ✅ FIXED

// const TestimonialListPage = () => {
//   const [testimonials, setTestimonials] = useState([]);
//   const [isFetching, setIsFetching] = useState(false);
//   const [deletingId, setDeletingId] = useState(null);

//   useEffect(() => {
//     fetchTestimonials();
//   }, []);

//   const fetchTestimonials = async () => {
//     try {
//       setIsFetching(true);
//       const res = await apiClient.get("/admin/testimonial-video");
//       if (res.data.success) setTestimonials(res.data.data || []);
//       else toast.error(res.data.message || "Failed to fetch testimonials");
//     } catch {
//       toast.error("Failed to fetch testimonials");
//     } finally {
//       setIsFetching(false);
//     }
//   };

//   const handleDeleteTestimonial = async (id) => {
//     if (!window.confirm("Delete this testimonial?")) return;
//     try {
//       setDeletingId(id);
//       const res = await apiClient.delete(`/admin/testimonial-video/${id}`);
//       if (res.data.success) {
//         toast.success("Testimonial deleted 💔");
//         fetchTestimonials();
//       }
//     } catch {
//       toast.error("Failed to delete testimonial");
//     } finally {
//       setDeletingId(null);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-pink-50 dark:bg-slate-950 p-6">
//       <div className="max-w-7xl mx-auto bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-lg border-2 border-pink-200 dark:border-pink-800">

//         <h1 className="text-2xl font-extrabold mb-6 flex items-center border-b border-pink-300 pb-3 text-pink-700">
//           <Play className="mr-3" size={28} />
//           Honeymoon Testimonials
//         </h1>

//         {isFetching ? (
//           <div className="flex justify-center py-12">
//             <Loader2 className="h-10 w-10 animate-spin text-pink-600" />
//           </div>
//         ) : testimonials.length === 0 ? (
//           <div className="text-center py-16">
//             <Play size={48} className="mx-auto mb-4 text-pink-400" />
//             <p className="text-slate-600">No honeymoon testimonials yet</p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//             {testimonials.map((t) => (
//               <div
//                 key={t._id}
//                 className="rounded-xl border-2 border-pink-200 overflow-hidden shadow hover:shadow-xl transition bg-white dark:bg-slate-800"
//               >
//                 {/* VIDEO */}
//                 <div className="relative group bg-black">
//                   <video
//                     src={t.video_url}
//                     className="w-full h-48 object-cover"
//                     muted
//                   />
//                   <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
//                     <Play className="text-white" size={48} />
//                   </div>
//                 </div>

//                 {/* CONTENT */}
//                 <div className="p-4">
//                   <h3 className="font-bold text-pink-700 truncate mb-1">
//                     {t.title}
//                   </h3>

//                   <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
//                     <MapPin size={14} />
//                     {t.location}
//                   </div>

//                   <span
//                     className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold mb-3 ${
//                       t.visibility === "Public"
//                         ? "bg-green-100 text-green-800"
//                         : "bg-orange-100 text-orange-800"
//                     }`}
//                   >
//                     <Eye size={12} />
//                     {t.visibility}
//                   </span>

//                   <p className="text-xs text-slate-500 mb-4">
//                     Uploaded: {new Date(t.createdAt).toLocaleDateString()}
//                   </p>

//                   <button
//                     onClick={() => handleDeleteTestimonial(t._id)}
//                     disabled={deletingId === t._id}
//                     className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold transition"
//                   >
//                     {deletingId === t._id ? "Deleting..." : "Delete"}
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default TestimonialListPage;



import { useState, useEffect } from "react";
import { Loader2, Play, Trash2, MapPin, Eye } from "lucide-react";
import { toast } from "react-toastify";
import { apiClient } from "../../stores/authStores";

const TestimonialListPage = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setIsFetching(true);
      const res = await apiClient.get("/admin/testimonial-video");
      if (res.data.success) setTestimonials(res.data.data || []);
      else toast.error(res.data.message || "Failed to fetch testimonials");
    } catch {
      toast.error("Failed to fetch testimonials");
    } finally {
      setIsFetching(false);
    }
  };

  const handleDeleteTestimonial = async (id) => {
    if (!window.confirm("Delete this testimonial?")) return;
    try {
      setDeletingId(id);
      const res = await apiClient.delete(`/admin/testimonial-video/${id}`);
      if (res.data.success) {
        toast.success("Testimonial deleted 💔");
        fetchTestimonials();
      }
    } catch {
      toast.error("Failed to delete testimonial");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6">

      <div className="max-w-7xl mx-auto bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-blue-200/60 dark:border-blue-800/50">

        <h1 className="text-3xl font-extrabold mb-8 flex items-center border-b border-blue-300/50 pb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          <Play className="mr-3 text-blue-500" size={30} />
          Honeymoon Testimonials
        </h1>

        {isFetching ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
          </div>
        ) : testimonials.length === 0 ? (
          <div className="text-center py-20">
            <Play size={52} className="mx-auto mb-4 text-blue-400" />
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              No honeymoon testimonials yet
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {testimonials.map((t) => (
              <div
                key={t._id}
                className="rounded-2xl border border-blue-200/60 dark:border-blue-800/50 overflow-hidden shadow-lg hover:shadow-blue-300/40 transition-all duration-300 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md"
              >
                {/* VIDEO */}
                <div className="relative group bg-black">
                  <video
                    src={t.video_url}
                    className="w-full h-48 object-cover"
                    muted
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition duration-300">
                    <Play className="text-white scale-90 group-hover:scale-110 transition-transform duration-300" size={50} />
                  </div>
                </div>

                {/* CONTENT */}
                <div className="p-5">
                  <h3 className="font-bold text-blue-700 dark:text-blue-300 truncate mb-2 text-lg">
                    {t.title}
                  </h3>

                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-4">
                    <MapPin size={14} />
                    {t.location}
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold mb-4 ${
                      t.visibility === "Public"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400"
                        : "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-400"
                    }`}
                  >
                    <Eye size={12} />
                    {t.visibility}
                  </span>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
                    Uploaded: {new Date(t.createdAt).toLocaleDateString()}
                  </p>

                  <button
                    onClick={() => handleDeleteTestimonial(t._id)}
                    disabled={deletingId === t._id}
                    className="w-full bg-gradient-to-r from-red-500 to-rose-600 hover:opacity-90 text-white py-2.5 rounded-xl font-semibold transition-all duration-300 disabled:opacity-60"
                  >
                    {deletingId === t._id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TestimonialListPage;
