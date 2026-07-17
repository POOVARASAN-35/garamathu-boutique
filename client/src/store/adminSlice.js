import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = 'http://localhost:5000/api';

const savedAdminToken = localStorage.getItem('admin_token');
const savedAdminUser = localStorage.getItem('admin_user') 
  ? JSON.parse(localStorage.getItem('admin_user')) 
  : null;

const initialState = {
  adminToken: savedAdminToken,
  currentAdmin: savedAdminUser,
  orders: [],
  customers: [],
  settings: null,
  dashboardStats: null,
  loading: false,
  error: null,
  adminLoading: false,
  adminError: null
};

// Admin Auth Thunks
export const loginAdminThunk = createAsyncThunk('admin/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    const data = await response.json();
    if (!response.ok) return rejectWithValue(data.message || 'Admin authorization failed');

    localStorage.setItem('admin_token', data.token);
    localStorage.setItem('admin_user', JSON.stringify(data.admin));
    return data;
  } catch (err) {
    return rejectWithValue(err.message || 'Network error');
  }
});

export const logoutAdminThunk = createAsyncThunk('admin/logout', async (_, { rejectWithValue }) => {
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_user');
  return true;
});

// Admin Dashboard Thunks
export const fetchAdminOrders = createAsyncThunk('admin/fetchOrders', async (_, { getState, rejectWithValue }) => {
  try {
    const token = getState().admin.adminToken || getState().auth.token;
    const response = await fetch(`${API_URL}/orders`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) return rejectWithValue(data.message || 'Failed to fetch admin orders');
    return data;
  } catch (err) {
    return rejectWithValue(err.message || 'Network error');
  }
});

export const updateOrderStatus = createAsyncThunk('admin/updateOrderStatus', async ({ id, status }, { getState, rejectWithValue }) => {
  try {
    const token = getState().admin.adminToken || getState().auth.token;
    const response = await fetch(`${API_URL}/orders/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });
    const data = await response.json();
    if (!response.ok) return rejectWithValue(data.message || 'Failed to update order status');
    return data;
  } catch (err) {
    return rejectWithValue(err.message || 'Network error');
  }
});

export const fetchAdminCustomers = createAsyncThunk('admin/fetchCustomers', async (_, { getState, rejectWithValue }) => {
  try {
    const token = getState().admin.adminToken || getState().auth.token;
    const response = await fetch(`${API_URL}/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) return rejectWithValue(data.message || 'Failed to fetch admin customers');
    return data;
  } catch (err) {
    return rejectWithValue(err.message || 'Network error');
  }
});

export const fetchAdminSettings = createAsyncThunk('admin/fetchSettings', async (_, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_URL}/settings`);
    const data = await response.json();
    if (!response.ok) return rejectWithValue(data.message || 'Failed to fetch settings');
    return data;
  } catch (err) {
    return rejectWithValue(err.message || 'Network error');
  }
});

export const updateAdminSettings = createAsyncThunk('admin/updateSettings', async (settingsData, { getState, rejectWithValue }) => {
  try {
    const token = getState().admin.adminToken || getState().auth.token;
    const response = await fetch(`${API_URL}/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(settingsData)
    });
    const data = await response.json();
    if (!response.ok) return rejectWithValue(data.message || 'Failed to update settings');
    return data;
  } catch (err) {
    return rejectWithValue(err.message || 'Network error');
  }
});

// Saree CRUD operations
export const addSareeAdmin = createAsyncThunk('admin/addSaree', async (sareeData, { getState, rejectWithValue }) => {
  try {
    const token = getState().admin.adminToken || getState().auth.token;
    const response = await fetch(`${API_URL}/sarees`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(sareeData)
    });
    const data = await response.json();
    if (!response.ok) return rejectWithValue(data.message || 'Failed to add saree');
    return data;
  } catch (err) {
    return rejectWithValue(err.message || 'Network error');
  }
});

export const updateSareeAdmin = createAsyncThunk('admin/updateSaree', async ({ id, sareeData }, { getState, rejectWithValue }) => {
  try {
    const token = getState().admin.adminToken || getState().auth.token;
    const response = await fetch(`${API_URL}/sarees/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(sareeData)
    });
    const data = await response.json();
    if (!response.ok) return rejectWithValue(data.message || 'Failed to update saree');
    return data;
  } catch (err) {
    return rejectWithValue(err.message || 'Network error');
  }
});

export const deleteSareeAdmin = createAsyncThunk('admin/deleteSaree', async (id, { getState, rejectWithValue }) => {
  try {
    const token = getState().admin.adminToken || getState().auth.token;
    const response = await fetch(`${API_URL}/sarees/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
      const data = await response.json();
      return rejectWithValue(data.message || 'Failed to delete saree');
    }
    return id;
  } catch (err) {
    return rejectWithValue(err.message || 'Network error');
  }
});

export const duplicateSareeAdmin = createAsyncThunk('admin/duplicateSaree', async (id, { getState, rejectWithValue }) => {
  try {
    const token = getState().admin.adminToken || getState().auth.token;
    const response = await fetch(`${API_URL}/sarees/${id}/duplicate`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) return rejectWithValue(data.message || 'Failed to duplicate saree');
    return data;
  } catch (err) {
    return rejectWithValue(err.message || 'Network error');
  }
});

// Category CRUD
export const addCategoryAdmin = createAsyncThunk('admin/addCategory', async (catData, { getState, rejectWithValue }) => {
  try {
    const token = getState().admin.adminToken || getState().auth.token;
    const response = await fetch(`${API_URL}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(catData)
    });
    const data = await response.json();
    if (!response.ok) return rejectWithValue(data.message || 'Failed to create category');
    return data;
  } catch (err) {
    return rejectWithValue(err.message || 'Network error');
  }
});

export const updateCategoryAdmin = createAsyncThunk('admin/updateCategory', async ({ id, catData }, { getState, rejectWithValue }) => {
  try {
    const token = getState().admin.adminToken || getState().auth.token;
    const response = await fetch(`${API_URL}/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(catData)
    });
    const data = await response.json();
    if (!response.ok) return rejectWithValue(data.message || 'Failed to update category');
    return data;
  } catch (err) {
    return rejectWithValue(err.message || 'Network error');
  }
});

export const deleteCategoryAdmin = createAsyncThunk('admin/deleteCategory', async (id, { getState, rejectWithValue }) => {
  try {
    const token = getState().admin.adminToken || getState().auth.token;
    const response = await fetch(`${API_URL}/categories/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
      const data = await response.json();
      return rejectWithValue(data.message || 'Failed to delete category');
    }
    return id;
  } catch (err) {
    return rejectWithValue(err.message || 'Network error');
  }
});

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Admin Login
      .addCase(loginAdminThunk.pending, (state) => {
        state.adminLoading = true;
        state.adminError = null;
      })
      .addCase(loginAdminThunk.fulfilled, (state, action) => {
        state.adminLoading = false;
        state.adminToken = action.payload.token;
        state.currentAdmin = action.payload.admin;
      })
      .addCase(loginAdminThunk.rejected, (state, action) => {
        state.adminLoading = false;
        state.adminError = action.payload;
      })
      // Admin Logout
      .addCase(logoutAdminThunk.fulfilled, (state) => {
        state.adminToken = null;
        state.currentAdmin = null;
        state.orders = [];
        state.customers = [];
      })
      // Fetch Orders
      .addCase(fetchAdminOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdminOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchAdminOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Status
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.orders = state.orders.map(order => 
          order.id === action.payload.id ? action.payload : order
        );
      })
      // Customers
      .addCase(fetchAdminCustomers.fulfilled, (state, action) => {
        state.customers = action.payload;
      })
      // Settings
      .addCase(fetchAdminSettings.fulfilled, (state, action) => {
        state.settings = action.payload;
      })
      .addCase(updateAdminSettings.fulfilled, (state, action) => {
        state.settings = action.payload;
      });
  }
});

export default adminSlice.reducer;
