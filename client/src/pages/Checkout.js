import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useApp } from '../context/AppContext';
import { toast } from 'react-toastify';
import './Checkout.css';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_key_here');

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [cartData, setCartData] = useState({ items: [], totalAmount: 0 });
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    loadCartAndCreatePaymentIntent();
  }, []);

  const loadCartAndCreatePaymentIntent = async () => {
    try {
      // Load cart data
      const cartResponse = await fetch('/api/payments/cart', {
        credentials: 'include'
      });

      if (!cartResponse.ok) {
        throw new Error('Failed to load cart');
      }

      const cartData = await cartResponse.json();
      setCartData(cartData);

      if (cartData.items.length === 0) {
        navigate('/cart');
        return;
      }

      // Create payment intent
      const paymentResponse = await fetch('/api/payments/create-payment-intent', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!paymentResponse.ok) {
        throw new Error('Failed to create payment intent');
      }

      const paymentData = await paymentResponse.json();
      setClientSecret(paymentData.clientSecret);
    } catch (error) {
      console.error('Checkout initialization error:', error);
      toast.error('Failed to initialize checkout');
      navigate('/cart');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);

    const cardElement = elements.getElement(CardElement);

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
        },
      },
    });

    if (error) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Payment failed');
      setLoading(false);
    } else if (paymentIntent.status === 'succeeded') {
      try {
        // Confirm payment on backend
        const response = await fetch('/api/payments/confirm-payment', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id
          })
        });

        if (response.ok) {
          const data = await response.json();
          toast.success('Payment successful! Your music has been added to your library.');
          navigate('/library');
        } else {
          throw new Error('Failed to confirm payment');
        }
      } catch (error) {
        console.error('Payment confirmation error:', error);
        toast.error('Payment processed but confirmation failed. Please contact support.');
      }
    }

    setLoading(false);
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <div className="checkout">
      <div className="container">
        <div className="checkout-content">
          <div className="order-summary">
            <h2>Order Summary</h2>
            <div className="order-items">
              {cartData.items.map((item) => (
                <div key={item.track._id} className="order-item">
                  <div className="item-artwork">
                    {item.track.artwork ? (
                      <img src={`/uploads/artwork/${item.track.artwork}`} alt={item.track.title} />
                    ) : (
                      <div className="artwork-placeholder">🎵</div>
                    )}
                  </div>
                  <div className="item-info">
                    <div className="item-title">{item.track.title}</div>
                    <div className="item-artist">{item.track.artist}</div>
                  </div>
                  <div className="item-price">${item.track.price.toFixed(2)}</div>
                </div>
              ))}
            </div>
            <div className="order-total">
              <div className="total-row">
                <span>Total ({cartData.items.length} items)</span>
                <span>${cartData.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="payment-section">
            <h2>Payment Information</h2>
            <form onSubmit={handleSubmit} className="payment-form">
              <div className="billing-info">
                <h3>Billing Details</h3>
                <div className="billing-fields">
                  <div className="field-row">
                    <div className="field">
                      <label>First Name</label>
                      <input type="text" value={user.firstName} readOnly />
                    </div>
                    <div className="field">
                      <label>Last Name</label>
                      <input type="text" value={user.lastName} readOnly />
                    </div>
                  </div>
                  <div className="field">
                    <label>Email</label>
                    <input type="email" value={user.email} readOnly />
                  </div>
                </div>
              </div>

              <div className="card-section">
                <h3>Card Information</h3>
                <div className="card-element-container">
                  <CardElement options={cardElementOptions} />
                </div>
              </div>

              <div className="security-notice">
                <p>🔒 Your payment information is secure and encrypted</p>
                <p>💳 Powered by Stripe - Industry standard security</p>
              </div>

              <button
                type="submit"
                disabled={!stripe || loading}
                className="btn btn-primary pay-btn"
              >
                {loading ? 'Processing...' : `Pay $${cartData.totalAmount.toFixed(2)}`}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const Checkout = () => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
};

export default Checkout;
