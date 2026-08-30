import api from "../../../shared/services/api";

const buildPowderUrl = (url) => {
  if (!url) {
    return "/api/powder";
  }

  if (url.startsWith("/api/powder")) {
    return url;
  }

  if (url.startsWith("/")) {
    return `/api/powder${url}`;
  }

  return `/api/powder/${url}`;
};

const apiClient = {
  get(url, config = {}) {
    return api.get(buildPowderUrl(url), config);
  },

  post(url, data = {}, config = {}) {
    return api.post(buildPowderUrl(url), data, config);
  },

  put(url, data = {}, config = {}) {
    return api.put(buildPowderUrl(url), data, config);
  },

  patch(url, data = {}, config = {}) {
    return api.patch(buildPowderUrl(url), data, config);
  },

  delete(url, config = {}) {
    return api.delete(buildPowderUrl(url), config);
  },
};

export default apiClient;
