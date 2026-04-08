// src/utils/auth.ts

export const saveToken = (token: string) => {
  localStorage.setItem("token", token);
};

export const getToken = () => {
  return localStorage.getItem("token");
};

export const isAdminLoggedIn = () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  return Boolean(token && (role === "MESS_ADMIN" || role === "PLATFORM_ADMIN"));
};


export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("role");
  localStorage.removeItem("adminLoggedIn");
};
