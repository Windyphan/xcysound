import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';
import { FiTrash2, FiShoppingCart } from 'react-icons/fi';
import { toast } from 'react-toastify';
import './Cart.css';

const Cart = () => {
  const { cart, removeFromCart, user } = useApp();
  const [loading, setLoading] = useState(false);
  const [cartData, setCartData] = useState({ items: [], totalAmount: 0, itemCount: 0 });

  useEffect(() => {
    loadCartData();
  }, []);

  const loadCartData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/payments/cart', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setCartData(data);
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromCart = async (trackId) => {
    const result = await removeFromCart(trackId);
    if (result.success) {
      toast.success('Track removed from cart');
      loadCartData(); // Reload cart data
    } else {
      toast.error(result.message);
    }
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Loading cart...</p>
      </div>
    );
  }

  return (
    <div className="cart">
      <div className="container">
        <div className="cart-header">
          <h1>
            <FiShoppingCart /> Shopping Cart
          </h1>
          <p>{cartData.itemCount} item{cartData.itemCount !== 1 ? 's' : ''} in your cart</p>
        </div>

        {cartData.items.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-cart-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Discover amazing music and add tracks to your cart</p>
            <Link to="/browse" className="btn btn-primary">
              Browse Music
            </Link>
          </div>
        ) : (
          <div className="cart-content">
            <div className="cart-items">
              {cartData.items.map((item, index) => (
                <div key={item.track._id} className="cart-item">
                  <div className="item-artwork">
                    {item.track.artwork ? (
                      <img
                        src={`/uploads/artwork/${item.track.artwork}`}
                        alt={item.track.title}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      className="artwork-placeholder"
                      style={{display: item.track.artwork ? 'none' : 'flex'}}
                    >
                      🎵
                    </div>
                  </div>

                  <div className="item-details">
                    <h3 className="item-title">{item.track.title}</h3>
                    <p className="item-artist">{item.track.artist}</p>
                    {item.track.album && (
                      <p className="item-album">{item.track.album}</p>
                    )}
                    <div className="item-meta">
                      <span className="item-genre">{item.track.genre}</span>
                      <span className="item-duration">
                        {formatDuration(item.track.duration)}
                      </span>
                    </div>
                  </div>

                  <div className="item-price">
                    ${item.track.price.toFixed(2)}
                  </div>

                  <div className="item-actions">
                    <button
                      onClick={() => handleRemoveFromCart(item.track._id)}
                      className="remove-btn"
                      title="Remove from cart"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <div className="summary-card">
                <h2>Order Summary</h2>

                <div className="summary-details">
                  <div className="summary-row">
                    <span>Items ({cartData.itemCount})</span>
                    <span>${cartData.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="summary-row total">
                    <span>Total</span>
                    <span>${cartData.totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <Link to="/checkout" className="btn btn-primary checkout-btn">
                  Proceed to Checkout
                </Link>

                <div className="payment-info">
                  <p>🔒 Secure payment with Stripe</p>
                  <p>💳 All major credit cards accepted</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
