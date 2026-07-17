import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = 'http://localhost:5000/api';

const initialState = {
  sarees: [],
  categories: [],
  reviews: [],
  currentSaree: null,
  pagination: { page: 1, limit: 12, total: 0, totalPages: 1 },
  loading: false,
  categoriesLoading: false,
  reviewsLoading: false,
  error: null
};

export const fetchSarees = createAsyncThunk('products/fetchSarees', async (filters = {}, { rejectWithValue }) => {
  try {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        if (Array.isArray(filters[key])) {
          filters[key].forEach(val => params.append(key, val));
        } else {
          params.append(key, filters[key]);
        }
      }
    });

    const response = await fetch(`${API_URL}/sarees?${params.toString()}`);
    const data = await response.json();
    if (!response.ok) return rejectWithValue(data.message || 'Failed to fetch sarees');
    return data;
  } catch (err) {
    return rejectWithValue(err.message || 'Network error');
  }
});

export const fetchCategories = createAsyncThunk('products/fetchCategories', async (_, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_URL}/categories`);
    const data = await response.json();
    if (!response.ok) return rejectWithValue(data.message || 'Failed to fetch categories');
    return data;
  } catch (err) {
    return rejectWithValue(err.message || 'Network error');
  }
});

export const fetchSareeById = createAsyncThunk('products/fetchSareeById', async (id, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_URL}/sarees/${id}`);
    const data = await response.json();
    if (!response.ok) return rejectWithValue(data.message || 'Failed to fetch saree details');
    return data;
  } catch (err) {
    return rejectWithValue(err.message || 'Network error');
  }
});

export const fetchReviews = createAsyncThunk('products/fetchReviews', async (_, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_URL}/reviews`);
    const data = await response.json();
    if (!response.ok) return rejectWithValue(data.message || 'Failed to fetch reviews');
    return data;
  } catch (err) {
    return rejectWithValue(err.message || 'Network error');
  }
});

export const submitReview = createAsyncThunk('products/submitReview', async (reviewData, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_URL}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewData)
    });
    const data = await response.json();
    if (!response.ok) return rejectWithValue(data.message || 'Failed to submit review');
    return data;
  } catch (err) {
    return rejectWithValue(err.message || 'Network error');
  }
});

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearCurrentSaree: (state) => {
      state.currentSaree = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Sarees
      .addCase(fetchSarees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSarees.fulfilled, (state, action) => {
        state.loading = false;
        state.sarees = action.payload.sarees;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchSarees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Categories
      .addCase(fetchCategories.pending, (state) => {
        state.categoriesLoading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categoriesLoading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state) => {
        state.categoriesLoading = false;
      })
      // Fetch Saree By ID
      .addCase(fetchSareeById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSareeById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSaree = action.payload;
      })
      .addCase(fetchSareeById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Reviews
      .addCase(fetchReviews.pending, (state) => {
        state.reviewsLoading = true;
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.reviewsLoading = false;
        state.reviews = action.payload;
      })
      .addCase(fetchReviews.rejected, (state) => {
        state.reviewsLoading = false;
      })
      // Submit Review
      .addCase(submitReview.fulfilled, (state, action) => {
        state.reviews.unshift(action.payload);
      });
  }
});

export const { clearCurrentSaree } = productSlice.actions;
export default productSlice.reducer;
