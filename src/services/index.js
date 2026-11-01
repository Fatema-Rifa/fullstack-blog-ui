import api from "../lib/api";

export const postService = {
  getAll:      (params) => api.get("/posts", { params }).then((r) => r.data),
  getBySlug:   (slug)   => api.get(`/posts/${slug}`).then((r) => r.data),
  getByAuthor: (userId, params) => api.get(`/posts/by-author/${userId}`, { params }).then((r) => r.data),

  create: (formData) =>
    api.post("/posts", formData, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data),

  update: (id, formData) =>
    api.put(`/posts/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data),

  delete:     (id)  => api.delete(`/posts/${id}`).then((r) => r.data),
  toggleLike: (id)  => api.post(`/posts/${id}/like`).then((r) => r.data),
};

export const commentService = {
  getByPost:    (postId, params) => api.get(`/posts/${postId}/comments`, { params }).then((r) => r.data),
  getReplies:   (commentId, params) => api.get(`/comments/${commentId}/replies`, { params }).then((r) => r.data),
  create:       (postId, body)  => api.post(`/posts/${postId}/comments`, body).then((r) => r.data),
  update:       (id, body)      => api.put(`/comments/${id}`, body).then((r) => r.data),
  delete:       (id)            => api.delete(`/comments/${id}`).then((r) => r.data),
  toggleLike:   (id)            => api.post(`/comments/${id}/like`).then((r) => r.data),
};

export const categoryService = {
  getAll:  ()      => api.get("/categories").then((r) => r.data),
  create:  (body)  => api.post("/categories", body).then((r) => r.data),
  update:  (id, b) => api.put(`/categories/${id}`, b).then((r) => r.data),
  delete:  (id)    => api.delete(`/categories/${id}`).then((r) => r.data),
};

export const tagService = {
  getAll:     (params) => api.get("/tags", { params }).then((r) => r.data),
  getBySlug:  (slug)   => api.get(`/tags/${slug}`).then((r) => r.data),
};

export const userService = {
  getProfile: (username) => api.get(`/auth/users/${username}`).then((r) => r.data),
  updateProfile: (formData) =>
    api.put("/auth/update-profile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data),
  changePassword: (body) => api.put("/auth/change-password", body).then((r) => r.data),
  follow:         (id)   => api.post(`/auth/users/${id}/follow`).then((r) => r.data),
};
