// app/lib/cart.ts
import { supabase } from "./supabase";

// ============================================
// TYPES
// ============================================

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  minimum_order: number;
  maximum_discount: number | null;
  start_date: string;
  end_date: string | null;
  usage_limit: number | null;
  used_count: number;
  per_user_limit: number;
  is_active: boolean;
  applicable_products: string[] | null;
  applicable_categories: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface Cart {
  id: string;
  user_id: string;
  coupon_id: string | null;
  discount_amount: number;
  shipping_fee: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  selected_size: string | null;
  selected_color: string | null;
  selected_color_name: string | null;
  price_at_add: number;
  discount_percent: number;
  discount_amount: number;
  created_at: string;
  updated_at: string;
}

export interface CartItemWithProduct extends CartItem {
  product: {
    id: string;
    name: string;
    price: number;
    original_price: number;
    image_url: string | null;
    stock: number;
    status: string;
  };
}

export interface CartWithDetails extends Cart {
  items: CartItemWithProduct[];
  coupon: Coupon | null;
  subtotal: number;
  total: number;
  itemCount: number;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

// Calculate cart subtotal
const calculateSubtotal = (items: CartItemWithProduct[]): number => {
  return items.reduce((sum, item) => {
    const itemTotal = item.quantity * item.price_at_add;
    const itemDiscount = (itemTotal * (item.discount_percent || 0)) / 100 + (item.discount_amount || 0);
    return sum + (itemTotal - itemDiscount);
  }, 0);
};

// Calculate total with discounts and shipping
const calculateTotal = (subtotal: number, discountAmount: number, shippingFee: number): number => {
  return Math.max(0, subtotal - discountAmount + shippingFee);
};

// Calculate item count
const calculateItemCount = (items: CartItemWithProduct[]): number => {
  return items.reduce((sum, item) => sum + item.quantity, 0);
};

// ============================================
// CART OPERATIONS
// ============================================

// Get or create cart for user
export const getOrCreateCart = async (userId: string): Promise<Cart> => {
  // Check if cart exists
  const { data: existingCart, error: fetchError } = await supabase
    .from('carts')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (existingCart) return existingCart;

  // Create new cart
  const { data: newCart, error: createError } = await supabase
    .from('carts')
    .insert({ user_id: userId })
    .select()
    .single();

  if (createError) throw new Error(`Failed to create cart: ${createError.message}`);
  return newCart;
};

// Get cart with all items, product details, and coupon
export const getCartWithDetails = async (userId: string): Promise<CartWithDetails | null> => {
  try {
    // Get or create cart
    const cart = await getOrCreateCart(userId);

    // Get cart items with product details
    const { data: items, error: itemsError } = await supabase
      .from('cart_items')
      .select(`
        *,
        product:product_id (
          id,
          name,
          price,
          original_price,
          image_url,
          stock,
          status
        )
      `)
      .eq('cart_id', cart.id);

    if (itemsError) throw itemsError;

    // Get coupon if applied
    let coupon = null;
    if (cart.coupon_id) {
      const { data: couponData, error: couponError } = await supabase
        .from('coupons')
        .select('*')
        .eq('id', cart.coupon_id)
        .single();
      
      if (!couponError && couponData) {
        coupon = couponData;
      }
    }

    const itemsWithProduct = items as CartItemWithProduct[];
    const subtotal = calculateSubtotal(itemsWithProduct);
    const total = calculateTotal(subtotal, cart.discount_amount, cart.shipping_fee);
    const itemCount = calculateItemCount(itemsWithProduct);

    return {
      ...cart,
      items: itemsWithProduct,
      coupon,
      subtotal,
      total,
      itemCount,
    };
  } catch (error) {
    console.error('Error getting cart details:', error);
    return null;
  }
};

// Add item to cart
export const addToCart = async (
  userId: string,
  productId: string,
  quantity: number,
  price: number,
  size?: string,
  color?: string,
  colorName?: string
): Promise<{ success: boolean; message: string; cart?: CartWithDetails }> => {
  try {
    // Validate quantity
    if (quantity <= 0) {
      return { success: false, message: 'Quantity must be greater than 0' };
    }

    // Get cart
    const cart = await getOrCreateCart(userId);

    // Check if item already exists with same options
    const { data: existingItem, error: checkError } = await supabase
      .from('cart_items')
      .select('*')
      .eq('cart_id', cart.id)
      .eq('product_id', productId)
      .eq('selected_size', size || null)
      .eq('selected_color', color || null)
      .single();

    if (existingItem) {
      // Update quantity
      const { error: updateError } = await supabase
        .from('cart_items')
        .update({ quantity: existingItem.quantity + quantity })
        .eq('id', existingItem.id);

      if (updateError) throw updateError;
    } else {
      // Add new item
      const { error: insertError } = await supabase
        .from('cart_items')
        .insert({
          cart_id: cart.id,
          product_id: productId,
          quantity,
          selected_size: size || null,
          selected_color: color || null,
          selected_color_name: colorName || null,
          price_at_add: price,
        });

      if (insertError) throw insertError;
    }

    // Get updated cart
    const updatedCart = await getCartWithDetails(userId);
    return { success: true, message: 'Item added to cart', cart: updatedCart || undefined };
  } catch (error: any) {
    console.error('Error adding to cart:', error);
    return { success: false, message: error.message || 'Failed to add item to cart' };
  }
};

// Update cart item quantity
export const updateCartItemQuantity = async (
  userId: string,
  itemId: string,
  quantity: number
): Promise<{ success: boolean; message: string; cart?: CartWithDetails }> => {
  try {
    if (quantity < 0) {
      return { success: false, message: 'Invalid quantity' };
    }

    if (quantity === 0) {
      // Remove item if quantity is 0
      return await removeCartItem(userId, itemId);
    }

    const cart = await getOrCreateCart(userId);

    const { error: updateError } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', itemId)
      .eq('cart_id', cart.id);

    if (updateError) throw updateError;

    const updatedCart = await getCartWithDetails(userId);
    return { success: true, message: 'Quantity updated', cart: updatedCart || undefined };
  } catch (error: any) {
    console.error('Error updating quantity:', error);
    return { success: false, message: error.message || 'Failed to update quantity' };
  }
};

// Remove item from cart
export const removeCartItem = async (
  userId: string,
  itemId: string
): Promise<{ success: boolean; message: string; cart?: CartWithDetails }> => {
  try {
    const cart = await getOrCreateCart(userId);

    const { error: deleteError } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId)
      .eq('cart_id', cart.id);

    if (deleteError) throw deleteError;

    const updatedCart = await getCartWithDetails(userId);
    return { success: true, message: 'Item removed from cart', cart: updatedCart || undefined };
  } catch (error: any) {
    console.error('Error removing item:', error);
    return { success: false, message: error.message || 'Failed to remove item' };
  }
};

// Clear entire cart
export const clearCart = async (userId: string): Promise<{ success: boolean; message: string }> => {
  try {
    const cart = await getOrCreateCart(userId);

    const { error: deleteError } = await supabase
      .from('cart_items')
      .delete()
      .eq('cart_id', cart.id);

    if (deleteError) throw deleteError;

    // Remove coupon as well
    await supabase
      .from('carts')
      .update({ coupon_id: null, discount_amount: 0 })
      .eq('id', cart.id);

    return { success: true, message: 'Cart cleared' };
  } catch (error: any) {
    console.error('Error clearing cart:', error);
    return { success: false, message: error.message || 'Failed to clear cart' };
  }
};

// ============================================
// COUPON OPERATIONS
// ============================================

// Validate coupon
export const validateCoupon = async (
  couponCode: string,
  subtotal: number
): Promise<{ valid: boolean; message: string; coupon?: Coupon; discountAmount?: number }> => {
  try {
    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', couponCode.toUpperCase())
      .eq('is_active', true)
      .single();

    if (error || !coupon) {
      return { valid: false, message: 'Invalid coupon code' };
    }

    // Check if coupon is expired
    const now = new Date();
    const startDate = new Date(coupon.start_date);
    const endDate = coupon.end_date ? new Date(coupon.end_date) : null;

    if (now < startDate) {
      return { valid: false, message: 'Coupon not yet active' };
    }

    if (endDate && now > endDate) {
      return { valid: false, message: 'Coupon has expired' };
    }

    // Check usage limit
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return { valid: false, message: 'Coupon usage limit reached' };
    }

    // Check minimum order
    if (subtotal < coupon.minimum_order) {
      return {
        valid: false,
        message: `Minimum order of ₱${coupon.minimum_order.toLocaleString()} required`,
      };
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (coupon.discount_type === 'percentage') {
      discountAmount = (subtotal * coupon.discount_value) / 100;
      if (coupon.maximum_discount) {
        discountAmount = Math.min(discountAmount, coupon.maximum_discount);
      }
    } else {
      discountAmount = coupon.discount_value;
      if (coupon.maximum_discount) {
        discountAmount = Math.min(discountAmount, coupon.maximum_discount);
      }
    }

    return {
      valid: true,
      message: `Coupon valid! You'll save ₱${discountAmount.toLocaleString()}`,
      coupon,
      discountAmount,
    };
  } catch (error) {
    console.error('Error validating coupon:', error);
    return { valid: false, message: 'Failed to validate coupon' };
  }
};

// Apply coupon to cart
export const applyCouponToCart = async (
  userId: string,
  couponCode: string
): Promise<{ success: boolean; message: string; cart?: CartWithDetails }> => {
  try {
    // Get cart details first
    const cart = await getCartWithDetails(userId);
    if (!cart) {
      return { success: false, message: 'Cart not found' };
    }

    if (cart.items.length === 0) {
      return { success: false, message: 'Your cart is empty' };
    }

    // Validate coupon
    const validation = await validateCoupon(couponCode, cart.subtotal);
    if (!validation.valid) {
      return { success: false, message: validation.message };
    }

    // Check if user has already used this coupon
    const { data: userUsage, error: usageError } = await supabase
      .from('user_coupons')
      .select('*')
      .eq('user_id', userId)
      .eq('coupon_id', validation.coupon!.id);

    if (userUsage && userUsage.length >= validation.coupon!.per_user_limit) {
      return { success: false, message: 'You have already used this coupon' };
    }

    // Update cart with coupon
    const { error: updateError } = await supabase
      .from('carts')
      .update({
        coupon_id: validation.coupon!.id,
        discount_amount: validation.discountAmount,
      })
      .eq('user_id', userId);

    if (updateError) throw updateError;

    // Get updated cart
    const updatedCart = await getCartWithDetails(userId);
    return {
      success: true,
      message: `Coupon applied! You saved ₱${validation.discountAmount!.toLocaleString()}`,
      cart: updatedCart || undefined,
    };
  } catch (error: any) {
    console.error('Error applying coupon:', error);
    return { success: false, message: error.message || 'Failed to apply coupon' };
  }
};

// Remove coupon from cart
export const removeCouponFromCart = async (
  userId: string
): Promise<{ success: boolean; message: string; cart?: CartWithDetails }> => {
  try {
    const { error: updateError } = await supabase
      .from('carts')
      .update({ coupon_id: null, discount_amount: 0 })
      .eq('user_id', userId);

    if (updateError) throw updateError;

    const updatedCart = await getCartWithDetails(userId);
    return {
      success: true,
      message: 'Coupon removed',
      cart: updatedCart || undefined,
    };
  } catch (error: any) {
    console.error('Error removing coupon:', error);
    return { success: false, message: error.message || 'Failed to remove coupon' };
  }
};

// Record coupon usage after successful order
export const recordCouponUsage = async (
  userId: string,
  couponId: string
): Promise<void> => {
  try {
    // Record user coupon usage
    await supabase
      .from('user_coupons')
      .insert({ user_id: userId, coupon_id: couponId });

    // Increment coupon usage count
    await supabase.rpc('increment_coupon_usage', { coupon_id: couponId });
  } catch (error) {
    console.error('Error recording coupon usage:', error);
  }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Get cart item count (for cart badge)
export const getCartItemCount = async (userId: string): Promise<number> => {
  try {
    const cart = await getCartWithDetails(userId);
    return cart?.itemCount || 0;
  } catch (error) {
    return 0;
  }
};

// Merge guest cart with user cart (after login)
export const mergeCarts = async (
  userId: string,
  guestCartItems: { productId: string; quantity: number; size?: string; color?: string; colorName?: string; price: number }[]
): Promise<{ success: boolean; message: string }> => {
  try {
    for (const item of guestCartItems) {
      await addToCart(
        userId,
        item.productId,
        item.quantity,
        item.price,
        item.size,
        item.color,
        item.colorName
      );
    }
    return { success: true, message: 'Carts merged successfully' };
  } catch (error: any) {
    console.error('Error merging carts:', error);
    return { success: false, message: error.message || 'Failed to merge carts' };
  }
};