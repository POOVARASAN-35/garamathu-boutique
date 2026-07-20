import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = `${import.meta.env.VITE_API_URL}/api/users`;

const getAuthHeaders = (getState) => {
  const { token } = getState().auth;
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Async Thunks
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { getState, dispatch, rejectWithValue }) => {
    try {
      const headers = getAuthHeaders(getState);
      if (!headers.Authorization) {
        // Guest local load
        const { sarees } = getState().products;
        if (sarees && sarees.length > 0) {
          dispatch(populateGuestCartItems(sarees));
        }
        return { guest: true };
      }

      const response = await fetch(`${API_URL}/cart`, { headers });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || 'Failed to fetch cart');
      return data.data; // populated cart data
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ product, quantity = 1 }, { getState, dispatch, rejectWithValue }) => {
    const headers = getAuthHeaders(getState);
    const productId = product.id || product._id;

    if (!headers.Authorization) {
      // Guest execution
      dispatch(addToCartLocal({ productId, quantity }));
      const { sarees } = getState().products;
      if (sarees && sarees.length > 0) {
        dispatch(populateGuestCartItems(sarees));
      }
      return { guest: true };
    }

    try {
      const response = await fetch(`${API_URL}/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify({ productId, quantity })
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || 'Failed to add item to cart');
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateQuantity = createAsyncThunk(
  'cart/updateQuantity',
  async ({ productId, quantity }, { getState, dispatch, rejectWithValue }) => {
    const headers = getAuthHeaders(getState);

    if (!headers.Authorization) {
      // Guest execution
      dispatch(updateQuantityLocal({ productId, quantity }));
      const { sarees } = getState().products;
      if (sarees && sarees.length > 0) {
        dispatch(populateGuestCartItems(sarees));
      }
      return { guest: true };
    }

    try {
      const response = await fetch(`${API_URL}/cart/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify({ quantity })
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || 'Failed to update quantity');
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (productId, { getState, dispatch, rejectWithValue }) => {
    const headers = getAuthHeaders(getState);

    if (!headers.Authorization) {
      // Guest execution
      dispatch(removeFromCartLocal(productId));
      const { sarees } = getState().products;
      if (sarees && sarees.length > 0) {
        dispatch(populateGuestCartItems(sarees));
      }
      return { guest: true };
    }

    try {
      const response = await fetch(`${API_URL}/cart/${productId}`, {
        method: 'DELETE',
        headers
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || 'Failed to remove from cart');
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { getState, dispatch, rejectWithValue }) => {
    const headers = getAuthHeaders(getState);

    if (!headers.Authorization) {
      dispatch(clearCartLocal());
      return { guest: true };
    }

    try {
      const response = await fetch(`${API_URL}/cart/clear`, {
        method: 'DELETE',
        headers
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || 'Failed to clear cart');
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const applyCoupon = createAsyncThunk(
  'cart/applyCoupon',
  async (code, { getState, rejectWithValue }) => {
    const headers = getAuthHeaders(getState);

    if (!headers.Authorization) {
      // Guest Coupon Logic
      if (code.toUpperCase().trim() === 'WELCOME10') {
        return { coupon: { code: 'WELCOME10', discountPercent: 10 } };
      } else {
        return rejectWithValue('❌ Invalid Coupon Code');
      }
    }

    try {
      const response = await fetch(`${API_URL}/cart/apply-coupon`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify({ code })
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || 'Failed to apply coupon');
      return data; // Returns coupon object
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const moveToWishlist = createAsyncThunk(
  'cart/moveToWishlist',
  async (productId, { getState, dispatch, rejectWithValue }) => {
    const headers = getAuthHeaders(getState);

    if (!headers.Authorization) {
      // Move local
      dispatch(removeFromCartLocal(productId));
      const { sarees } = getState().products;
      if (sarees && sarees.length > 0) {
        dispatch(populateGuestCartItems(sarees));
      }
      return { guest: true };
    }

    try {
      const response = await fetch(`${API_URL}/cart/move-to-wishlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify({ productId })
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || 'Failed to move to wishlist');
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial State
const initialState = {
  items: [], // [{ productId, product, quantity }]
  shippingDistrict: 'Erode',
  shippingCharge: 0,
  coupon: null,
  loading: false,
  error: null
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setShippingDistrict: (state, action) => {
      state.shippingDistrict = action.payload;
    },
    setShippingCharge: (state, action) => {
      state.shippingCharge = Number(action.payload);
    },
    removeCoupon: (state) => {
      state.coupon = null;
    },
    // Local mutations for guest operations
    addToCartLocal: (state, action) => {
      const { productId, quantity } = action.payload;
      const guestItems = JSON.parse(localStorage.getItem('gb_cart') || '[]');
      const existing = guestItems.find(item => item.productId === productId);
      if (existing) {
        existing.quantity += quantity;
      } else {
        guestItems.push({ productId, quantity });
      }
      localStorage.setItem('gb_cart', JSON.stringify(guestItems));
    },
    removeFromCartLocal: (state, action) => {
      const productId = action.payload;
      const guestItems = JSON.parse(localStorage.getItem('gb_cart') || '[]');
      const filtered = guestItems.filter(item => item.productId !== productId);
      localStorage.setItem('gb_cart', JSON.stringify(filtered));
    },
    updateQuantityLocal: (state, action) => {
      const { productId, quantity } = action.payload;
      const guestItems = JSON.parse(localStorage.getItem('gb_cart') || '[]');
      const item = guestItems.find(item => item.productId === productId);
      if (item) {
        item.quantity = Math.max(1, quantity);
      }
      localStorage.setItem('gb_cart', JSON.stringify(guestItems));
    },
    clearCartLocal: (state) => {
      localStorage.removeItem('gb_cart');
      state.items = [];
      state.coupon = null;
    },
    populateGuestCartItems: (state, action) => {
      const products = action.payload;
      const guestItems = JSON.parse(localStorage.getItem('gb_cart') || '[]');
      state.items = guestItems.map(item => {
        const match = products.find(p => p.id === item.productId || p._id === item.productId);
        return {
          productId: item.productId,
          quantity: item.quantity,
          product: match || null
        };
      }).filter(item => item.product !== null);
    }
  },
  extraReducers: (builder) => {
    // fetchCart
    builder.addCase(fetchCart.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCart.fulfilled, (state, action) => {
      state.loading = false;
      if (action.payload && !action.payload.guest) {
        state.items = (action.payload.items || []).map(item => ({
          productId: item.productId?._id || item.productId?.id || item.productId,
          product: item.productId,
          quantity: item.quantity
        }));
      }
    });
    builder.addCase(fetchCart.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // addToCart
    builder.addCase(addToCart.fulfilled, (state, action) => {
      if (action.payload && !action.payload.guest) {
        state.items = (action.payload.items || []).map(item => ({
          productId: item.productId?._id || item.productId?.id || item.productId,
          product: item.productId,
          quantity: item.quantity
        }));
      }
    });

    // updateQuantity
    builder.addCase(updateQuantity.fulfilled, (state, action) => {
      if (action.payload && !action.payload.guest) {
        state.items = (action.payload.items || []).map(item => ({
          productId: item.productId?._id || item.productId?.id || item.productId,
          product: item.productId,
          quantity: item.quantity
        }));
      }
    });

    // removeFromCart
    builder.addCase(removeFromCart.fulfilled, (state, action) => {
      if (action.payload && !action.payload.guest) {
        state.items = (action.payload.items || []).map(item => ({
          productId: item.productId?._id || item.productId?.id || item.productId,
          product: item.productId,
          quantity: item.quantity
        }));
      }
    });

    // clearCart
    builder.addCase(clearCart.fulfilled, (state, action) => {
      if (action.payload && !action.payload.guest) {
        state.items = [];
        state.coupon = null;
      }
    });

    // applyCoupon
    builder.addCase(applyCoupon.fulfilled, (state, action) => {
      state.coupon = action.payload.coupon;
    });

    // moveToWishlist
    builder.addCase(moveToWishlist.fulfilled, (state, action) => {
      if (action.payload && !action.payload.guest) {
        state.items = (action.payload.items || []).map(item => ({
          productId: item.productId?._id || item.productId?.id || item.productId,
          product: item.productId,
          quantity: item.quantity
        }));
      }
    });
  }
});

export const {
  setShippingDistrict,
  setShippingCharge,
  removeCoupon,
  addToCartLocal,
  removeFromCartLocal,
  updateQuantityLocal,
  clearCartLocal,
  populateGuestCartItems
} = cartSlice.actions;

export default cartSlice.reducer;
