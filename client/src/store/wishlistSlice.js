import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = `${import.meta.env.VITE_API_URL}/api/users`;

const getAuthHeaders = (getState) => {
  const { token } = getState().auth;
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Legacy dummy thunk to prevent component compile breaks
export const syncWishlistOnServer = createAsyncThunk(
  'wishlist/syncDummy',
  async () => {
    return null;
  }
);

// Async Thunks
export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (_, { getState, rejectWithValue }) => {
    try {
      const headers = getAuthHeaders(getState);
      if (!headers.Authorization) {
        const saved = localStorage.getItem('gb_wishlist');
        const items = saved ? JSON.parse(saved) : [];
        return { populatedItems: [], items };
      }
      const response = await fetch(`${API_URL}/wishlist`, { headers });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || 'Failed to fetch wishlist');
      const populatedItems = data.data || [];
      const items = populatedItems.map(p => p.id || p._id?.toString() || p);
      return { populatedItems, items };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const toggleWishlist = createAsyncThunk(
  'wishlist/toggleWishlist',
  async (productId, { getState, dispatch, rejectWithValue }) => {
    const { items: currentItems } = getState().wishlist;
    const headers = getAuthHeaders(getState);
    const isWishlisted = currentItems.includes(productId);

    if (!headers.Authorization) {
      // Guest toggle
      dispatch(toggleWishlistLocal(productId));
      return { guest: true };
    }

    try {
      let response;
      if (isWishlisted) {
        response = await fetch(`${API_URL}/wishlist/${productId}`, {
          method: 'DELETE',
          headers
        });
      } else {
        response = await fetch(`${API_URL}/wishlist`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...headers
          },
          body: JSON.stringify({ productId })
        });
      }
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || 'Failed to toggle wishlist');
      const populatedItems = data.data || [];
      const items = populatedItems.map(p => p.id || p._id?.toString() || p);
      return { populatedItems, items };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const moveToCart = createAsyncThunk(
  'wishlist/moveToCart',
  async (productId, { getState, rejectWithValue }) => {
    try {
      const headers = getAuthHeaders(getState);
      if (!headers.Authorization) {
        return { populatedItems: [], items: [] };
      }
      const response = await fetch(`${API_URL}/wishlist/move-to-cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify({ productId })
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || 'Failed to move to cart');
      const populatedItems = data.data || [];
      const items = populatedItems.map(p => p.id || p._id?.toString() || p);
      return { populatedItems, items };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const clearWishlist = createAsyncThunk(
  'wishlist/clearWishlist',
  async (_, { getState, rejectWithValue }) => {
    try {
      const headers = getAuthHeaders(getState);
      if (!headers.Authorization) {
        localStorage.removeItem('gb_wishlist');
        return { populatedItems: [], items: [] };
      }
      const response = await fetch(`${API_URL}/wishlist/clear`, {
        method: 'DELETE',
        headers
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || 'Failed to clear wishlist');
      return { populatedItems: [], items: [] };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const getInitialIds = () => {
  try {
    const savedUser = localStorage.getItem('gb_user');
    let list = [];
    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (user.wishlist) list = user.wishlist;
    } else {
      const saved = localStorage.getItem('gb_wishlist');
      list = saved ? JSON.parse(saved) : [];
    }
    return list.filter(id => typeof id === 'string' && id.match(/^[0-9a-fA-F]{24}$/));
  } catch (error) {
    return [];
  }
};

const initialState = {
  items: getInitialIds(),
  populatedItems: [],
  loading: false,
  error: null
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    toggleWishlistLocal: (state, action) => {
      const productId = action.payload;
      const index = state.items.indexOf(productId);
      if (index > -1) {
        state.items.splice(index, 1);
        state.populatedItems = state.populatedItems.filter(item => item.id !== productId);
      } else {
        state.items.push(productId);
      }
      localStorage.setItem('gb_wishlist', JSON.stringify(state.items));
    },
    populateGuestItems: (state, action) => {
      const allSarees = action.payload || [];
      state.populatedItems = allSarees.filter(s => state.items.includes(s.id));
    }
  },
  extraReducers: (builder) => {
    // Fetch
    builder.addCase(fetchWishlist.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchWishlist.fulfilled, (state, action) => {
      state.loading = false;
      state.populatedItems = action.payload.populatedItems;
      state.items = action.payload.items;
    });
    builder.addCase(fetchWishlist.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Toggle
    builder.addCase(toggleWishlist.fulfilled, (state, action) => {
      if (action.payload && !action.payload.guest) {
        state.populatedItems = action.payload.populatedItems;
        state.items = action.payload.items;
      }
    });

    // Move to Cart
    builder.addCase(moveToCart.fulfilled, (state, action) => {
      state.populatedItems = action.payload.populatedItems;
      state.items = action.payload.items;
    });

    // Clear
    builder.addCase(clearWishlist.fulfilled, (state) => {
      state.populatedItems = [];
      state.items = [];
    });
  }
});

export const { toggleWishlistLocal, populateGuestItems } = wishlistSlice.actions;
export default wishlistSlice.reducer;
