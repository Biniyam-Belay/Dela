import apiClient from './apiClient';

// Create a new order
export const createOrderApi = async (orderData) => {
    // orderData should include { orderItems: [{ productId, quantity }], shippingAddress: {...} }
    try {
        const response = await apiClient.post('/orders', orderData);
        // Backend sends { success: true, message: '...', data: order }
        return response.data;
    } catch (error) {
        console.error("Error creating order:", error.response?.data || error.message);
        // Re-throw the specific error structure from the backend if possible
        throw error.response?.data || new Error('Failed to create order');
    }
};

// Fetch user's orders (Add this for the profile page later)
export const fetchMyOrdersApi = async () => {
    try {
        const response = await apiClient.get('/orders/myorders');
        // Backend sends { success: true, count: num, data: orders[] }
        return response.data;
    } catch (error) {
        console.error("Error fetching orders:", error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to fetch orders');
    }
};

 // Fetch a single order by ID (Add this for order detail page later)
export const fetchOrderByIdApi = async (orderId) => {
    try {
        const response = await apiClient.get(`/orders/${orderId}`);
        // Backend sends { success: true, data: order }
        return response.data;
    } catch (error) {
         console.error(`Error fetching order ${orderId}:`, error.response?.data || error.message);
         throw error.response?.data || new Error(`Failed to fetch order ${orderId}`);
    }
 };