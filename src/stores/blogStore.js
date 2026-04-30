import { create } from 'zustand';
import { apiClient } from './authStores'; // Assuming your apiClient is here
import { toast } from 'react-toastify';
export const useBlogStore = create((set, get) => ({
  blogs: [],
  blogToEdit: null,
  isLoading: false,
  isFetchingDetails: false,

  // --- ACTIONS ---

  // Fetch all blogs for the list page
  fetchBlogs: async () => {
    set({ isLoading: true });
    try {
      const res = await apiClient.get("/admin/blog");
      const blogData = res?.data?.blogData || [];
      set({ blogs: blogData, isLoading: false });
    } catch (error) {
      console.error("Error fetching blogs:", error);
      toast.error("Failed to load blogs.");
      set({ isLoading: false });
    }
  },

  // Fetch a single blog's details for the edit page
  fetchBlogById: async (id) => {
    set({ isFetchingDetails: true, blogToEdit: null }); // Reset previous one
    try {
      const res = await apiClient.get(`/admin/blog/${id}`);
      if (res.data.success) {
        set({ blogToEdit: res.data.blogData, isFetchingDetails: false });
      } else {
        toast.error(res.data.msg || "Failed to fetch blog details.");
        set({ isFetchingDetails: false });
      }
    } catch (error) {
      console.error("Error fetching blog by ID:", error);
      toast.error("An error occurred while fetching blog details.");
      set({ isFetchingDetails: false });
    }
  },

  // Create a new blog post
  createBlog: async (payload, navigate) => {
    set({ isLoading: true });
    try {
      const res = await apiClient.post('/admin/blog', payload);
      if (res.data.success) {
        // Refresh the blog list so it shows up when user visits the list
        get().fetchBlogs();
      }
      // return the server response so caller can show toast or handle errors
      return res.data;
    } catch (error) {
      console.error('Error creating blog:', error);
      return { success: false, msg: 'An unexpected error occurred.' };
    } finally {
      set({ isLoading: false });
    }
  },

  // Update an existing blog post
  updateBlog: async (id, payload, navigate) => {
    set({ isLoading: true });
    try {
      const res = await apiClient.patch(`/admin/blog/${id}`, payload);
      if (res.data.success) {
        // Refresh the blog list so it shows updated data when visiting the list
        get().fetchBlogs();
      }
      // return the response so caller can show toast
      return res.data;
    } catch (error) {
      console.error('Error updating blog:', error);
      return { success: false, msg: 'An unexpected error occurred.' };
    } finally {
      set({ isLoading: false });
    }
  },

  // Delete a blog post
  deleteBlog: async (id) => {
    try {
      await apiClient.delete(`/admin/blog/${id}`);
      toast.success("Blog deleted successfully.");
      // Optimistically update UI by removing the blog from the local state
      set((state) => ({
        blogs: state.blogs.filter((blog) => blog._id !== id),
      }));
    } catch (error) {
      console.error("Error deleting blog:", error);
      toast.error("Failed to delete blog.");
    }
  },

  // Clear blogToEdit when leaving the create/edit page
  clearBlogToEdit: () => {
    set({ blogToEdit: null });
  }
}));