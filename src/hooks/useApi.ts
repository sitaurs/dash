import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

// API client with interceptors
const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Custom hooks for API operations
export const useBlogs = () => {
  return useQuery({
    queryKey: ['blogs'],
    queryFn: async () => {
      const response = await apiClient.get('/blogs');
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const usePosts = (params = {}) => {
  return useQuery({
    queryKey: ['posts', params],
    queryFn: async () => {
      const response = await apiClient.get('/posts', { params });
      return response.data.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const usePost = (postId: string) => {
  return useQuery({
    queryKey: ['post', postId],
    queryFn: async () => {
      const response = await apiClient.get(`/posts/${postId}`);
      return response.data.data;
    },
    enabled: !!postId,
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (postData: any) => {
      const response = await apiClient.post('/posts', postData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ postId, postData }: { postId: string; postData: any }) => {
      const response = await apiClient.put(`/posts/${postId}`, postData);
      return response.data.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', variables.postId] });
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (postId: string) => {
      const response = await apiClient.delete(`/posts/${postId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

export const usePages = () => {
  return useQuery({
    queryKey: ['pages'],
    queryFn: async () => {
      const response = await apiClient.get('/pages');
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreatePage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (pageData: any) => {
      const response = await apiClient.post('/pages', pageData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
    },
  });
};

export const useUpdatePage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ pageId, pageData }: { pageId: string; pageData: any }) => {
      const response = await apiClient.put(`/pages/${pageId}`, pageData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
    },
  });
};

export const useDeletePage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (pageId: string) => {
      const response = await apiClient.delete(`/pages/${pageId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
    },
  });
};

export const useComments = (params = {}) => {
  return useQuery({
    queryKey: ['comments', params],
    queryFn: async () => {
      const response = await apiClient.get('/comments', { params });
      return response.data.data;
    },
    staleTime: 60 * 1000, // 1 minute
  });
};

export const useUpdateCommentStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ commentId, status, blogId, postId }: any) => {
      const response = await apiClient.put(`/comments/${commentId}`, {
        status,
        blogId,
        postId
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ commentId, blogId, postId }: any) => {
      const response = await apiClient.delete(`/comments/${commentId}`, {
        params: { blogId, postId }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });
};

export const useStats = (period: string) => {
  return useQuery({
    queryKey: ['stats', period],
    queryFn: async () => {
      const response = await apiClient.get(`/stats/${period}`);
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useOverallStats = () => {
  return useQuery({
    queryKey: ['stats', 'overall'],
    queryFn: async () => {
      const response = await apiClient.get('/stats/overall');
      return response.data.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useContent = (params = {}) => {
  return useQuery({
    queryKey: ['content', params],
    queryFn: async () => {
      const response = await apiClient.get('/content', { params });
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUploadContent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiClient.post('/content/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
    },
  });
};

export const useDeleteContent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (contentId: string) => {
      const response = await apiClient.delete(`/content/${contentId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
    },
  });
};

export default apiClient;