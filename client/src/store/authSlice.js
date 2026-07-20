import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

// Retrieve values from LocalStorage
const savedToken = localStorage.getItem('gb_token');
const savedUser = localStorage.getItem('gb_user') ? JSON.parse(localStorage.getItem('gb_user')) : null;

const initialState = {
  token: savedToken,
  user: savedUser,
  loading: false,
  error: null
};

export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    const data = await response.json();
    if (!response.ok) return rejectWithValue(data.message || 'Login failed');
    
    // Save to LocalStorage
    localStorage.setItem('gb_token', data.token);
    localStorage.setItem('gb_user', JSON.stringify(data.user));
    return data;
  } catch (err) {
    return rejectWithValue(err.message || 'Network error');
  }
});

export const registerUser = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const data = await response.json();
    if (!response.ok) return rejectWithValue(data.message || 'Registration failed');

    // Save to LocalStorage
    localStorage.setItem('gb_token', data.token);
    localStorage.setItem('gb_user', JSON.stringify(data.user));
    return data;
  } catch (err) {
    return rejectWithValue(err.message || 'Network error');
  }
});

export const saveAddress = createAsyncThunk('auth/saveAddress', async (address, { getState, rejectWithValue }) => {
  try {
    const { token } = getState().auth;
    const response = await fetch(`${API_URL}/users/address`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ address })
    });
    const data = await response.json();
    if (!response.ok) return rejectWithValue(data.message || 'Failed to save address');
    
    // Update local storage user record
    const user = getState().auth.user;
    const updatedUser = { ...user, addresses: data.addresses };
    localStorage.setItem('gb_user', JSON.stringify(updatedUser));
    
    return data.addresses;
  } catch (err) {
    return rejectWithValue(err.message || 'Network error');
  }
});

export const deleteAddress = createAsyncThunk('auth/deleteAddress', async (addressId, { getState, rejectWithValue }) => {
  try {
    const { token } = getState().auth;
    const response = await fetch(`${API_URL}/users/address/${addressId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) return rejectWithValue(data.message || 'Failed to delete address');

    const user = getState().auth.user;
    const updatedUser = { ...user, addresses: data.addresses };
    localStorage.setItem('gb_user', JSON.stringify(updatedUser));

    return data.addresses;
  } catch (err) {
    return rejectWithValue(err.message || 'Network error');
  }
});

export const syncWishlistOnServer = createAsyncThunk('auth/syncWishlist', async (wishlist, { getState, rejectWithValue }) => {
  try {
    const { token } = getState().auth;
    if (!token) return wishlist;
    const response = await fetch(`${API_URL}/users/wishlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ wishlist })
    });
    const data = await response.json();
    if (!response.ok) return rejectWithValue(data.message || 'Failed to sync wishlist');
    return data.wishlist;
  } catch (err) {
    return wishlist;
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.error = null;
      localStorage.removeItem('gb_token');
      localStorage.removeItem('gb_user');
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Address Save
      .addCase(saveAddress.fulfilled, (state, action) => {
        if (state.user) {
          state.user.addresses = action.payload;
        }
      })
      // Address Delete
      .addCase(deleteAddress.fulfilled, (state, action) => {
        if (state.user) {
          state.user.addresses = action.payload;
        }
      })
      // Sync Wishlist
      .addCase(syncWishlistOnServer.fulfilled, (state, action) => {
        if (state.user) {
          state.user.wishlist = action.payload;
        }
      });
  }
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
