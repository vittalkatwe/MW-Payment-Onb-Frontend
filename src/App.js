import React, { useState } from 'react';
import { CheckCircle, XCircle, Loader, Shield, Clock, Wallet, RefreshCw, Zap } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const RAZORPAY_KEY_ID = process.env.REACT_APP_RAZORPAY_KEY_ID;

function App() {
  const [currentPage, setCurrentPage] = useState('checkout');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [nextBillingDate, setNextBillingDate] = useState(null);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const redirectToOrderConfirm = () => {
    setTimeout(() => {
      window.location.href = "https://www.paisaalert.in/orderconfirm";
    }, 2000);
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubscriptionPayment = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      alert('Please fill all the fields');
      return;
    }

    setLoading(true);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert('Razorpay SDK failed to load. Please check your internet connection.');
        setLoading(false);
        return;
      }

      // Create subscription with upfront payment
      const response = await fetch(`${BACKEND_URL}/api/create-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        })
      });

      const data = await response.json();

      if (!data.success) {
        alert('Failed to create subscription. Please try again.');
        setLoading(false);
        return;
      }

      console.log('✅ Subscription created:', data.subscriptionId);

      // Open Razorpay subscription checkout
      const options = {
        key: RAZORPAY_KEY_ID,
        subscription_id: data.subscriptionId,
        name: 'PaisaAlert',
        description: '₹199 Today + ₹199/month Auto-Pay',
        handler: async function (response) {
          console.log('✅ Payment successful!', response);
          
          setPaymentStatus('success');
          
          // Calculate next billing (1 month from now)
          const nextDate = new Date();
          nextDate.setMonth(nextDate.getMonth() + 1);
          setNextBillingDate(nextDate.toLocaleDateString('en-IN', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }));
          
          // Webhook will handle email sending
          redirectToOrderConfirm();
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone
        },
        notes: {
          payment_type: 'subscription_with_upfront'
        },
        theme: {
          color: '#4C5FD5'
        },
        modal: {
          ondismiss: function() {
            console.log('⚠️ Payment modal dismissed');
            setPaymentStatus('failed');
            setLoading(false);
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
      setLoading(false);

    } catch (error) {
      console.error('Payment error:', error);
      alert('Failed to initiate payment. Please try again.');
      setLoading(false);
    }
  };

  if (currentPage === 'checkout' && !paymentStatus) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#F5F5F5',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #4C5FD5 0%, #5B6FE8 100%)',
          padding: '60px 20px',
          textAlign: 'center',
          color: 'white'
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '600',
            margin: '0 0 10px 0',
            lineHeight: '1.3'
          }}>
            Congrats! You are just one step away from Smart<br />Business Bookkeeping Sheet
          </h1>
          <p style={{
            fontSize: '14px',
            margin: '20px 0',
            opacity: '0.95'
          }}>
            36,856 sales | Excellent 4.9 of 5 | Recently Updated
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            marginTop: '25px',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
              <Shield size={18} />
              <span>Secured Checkout</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
              <Clock size={18} />
              <span>24/7 Support Available</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
              <Wallet size={18} />
              <span>Instant Access</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{
          maxWidth: '800px',
          margin: '-30px auto 40px',
          padding: '0 20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '8px',
            padding: '40px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            {/* Pricing Banner */}
            
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              margin: '0 0 30px 0',
              color: '#333'
            }}>
              Billing details
            </h2>

            <div style={{ marginBottom: '30px' }}>
              <div style={{ marginBottom: '20px' }}>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Name *"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '4px',
                    fontSize: '15px',
                    boxSizing: 'border-box',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#4C5FD5'}
                  onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Phone *"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '4px',
                    fontSize: '15px',
                    boxSizing: 'border-box',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#4C5FD5'}
                  onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
                />
              </div>

              <div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email address *"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '4px',
                    fontSize: '15px',
                    boxSizing: 'border-box',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#4C5FD5'}
                  onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
                />
              </div>
            </div>

            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              margin: '40px 0 20px 0',
              color: '#333'
            }}>
              Order summary
            </h2>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '15px 0',
              borderBottom: '1px solid #E5E7EB',
              fontWeight: '600',
              fontSize: '15px',
              color: '#333'
            }}>
              <span>Product</span>
              <span>Price</span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px 0',
              borderBottom: '1px solid #E5E7EB'
            }}>
              <div>
                <span style={{ fontSize: '15px', color: '#333' }}>
                  Smart Business Bookkeeping Sheet
                </span>
              </div>
              <span style={{ fontSize: '15px', color: '#333', fontWeight: '500' }}>₹199</span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '20px 0',
              fontSize: '18px',
              fontWeight: '700',
              color: '#333'
            }}>
              <span>Amount Charged</span>
              <span style={{ color: '#4C5FD5' }}>₹199</span>
            </div>

            <button
              onClick={handleSubscriptionPayment}
              disabled={loading}
              style={{
                width: '100%',
                padding: '16px',
                background: 'linear-gradient(135deg, #4C5FD5 0%, #5B6FE8 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!loading) e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
              }}
            >
              {loading ? (
                <>
                  <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} />
                  Processing...
                </>
              ) : (
                <>
                  <Zap size={20} />
                  Pay ₹199
                </>
              )}
            </button>

            <div style={{
              textAlign: 'center',
              fontSize: '6px',
              color: '#9CA3AF',
              marginTop: '15px',
              lineHeight: '1.5'
            }}>
              By proceeding, you authorize ₹199 charge today and monthly auto-debit of ₹199.
              <br />Cancel subscription anytime. Secured by Razorpay.
            </div>
          </div>
        </div>

        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          @media (max-width: 768px) {
            h1 {
              font-size: 24px !important;
            }
          }
        `}</style>
      </div>
    );
  }

  if (paymentStatus) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#F5F5F5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          maxWidth: '500px',
          width: '100%',
          background: 'white',
          borderRadius: '12px',
          padding: '50px 40px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          {paymentStatus === 'success' ? (
            <>
              <div style={{
                width: '80px',
                height: '80px',
                background: '#DEF7EC',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 25px'
              }}>
                <CheckCircle size={45} style={{ color: '#0E9F6E' }} />
              </div>
              <h2 style={{
                fontSize: '28px',
                fontWeight: '600',
                margin: '0 0 15px 0',
                color: '#333'
              }}>
                Payment Successful!
              </h2>
              <p style={{
                fontSize: '15px',
                color: '#6B7280',
                margin: '0 0 25px 0',
                lineHeight: '1.6'
              }}>
                ₹199 charged successfully. Auto-pay mandate of ₹199/month is now active.
              </p>
              
              <div style={{
                background: '#F0F4FF',
                border: '2px solid #4C5FD5',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '20px',
                textAlign: 'left'
              }}>
                <div style={{ marginBottom: '15px' }}>
                  <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '5px' }}>
                    ✓ Today's payment
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#333' }}>
                    ₹199 charged
                  </div>
                </div>
                
                <div>
                  <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '5px' }}>
                    ⟳ Next auto-debit
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#FF9800' }}>
                    {nextBillingDate || 'Next month'}
                  </div>
                </div>
              </div>

              <div style={{
                background: '#F9FAFB',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                padding: '15px',
                marginBottom: '25px',
                textAlign: 'left'
              }}>
                <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 5px 0' }}>
                  File sent to:
                </p>
                <p style={{ fontSize: '15px', fontWeight: '600', color: '#333', margin: 0 }}>
                  {formData.email}
                </p>
              </div>
            </>
          ) : (
            <>
              <div style={{
                width: '80px',
                height: '80px',
                background: '#FEE2E2',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 25px'
              }}>
                <XCircle size={45} style={{ color: '#DC2626' }} />
              </div>
              <h2 style={{
                fontSize: '28px',
                fontWeight: '600',
                margin: '0 0 15px 0',
                color: '#333'
              }}>
                Payment Failed
              </h2>
              <p style={{
                fontSize: '15px',
                color: '#6B7280',
                margin: '0 0 30px 0',
                lineHeight: '1.6'
              }}>
                Your payment could not be processed. Please try again.
              </p>
            </>
          )}

          <button
            onClick={() => {
              setCurrentPage('checkout');
              setPaymentStatus(null);
              setFormData({ name: '', email: '', phone: '' });
            }}
            style={{
              width: '100%',
              padding: '14px',
              background: 'linear-gradient(135deg, #4C5FD5 0%, #5B6FE8 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }
}

export default App;