export const sendOtpEmail = async (email: string, name: string, otp: string) => {
  const serviceId = process.env.EXPO_PUBLIC_EMAILJS_SERVICE_ID;
  const templateId = process.env.EXPO_PUBLIC_EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.EXPO_PUBLIC_EMAILJS_PUBLIC_KEY;

  // Fallback for development if keys aren't set yet
  if (!serviceId || !templateId || !publicKey) {
    console.log('\n=============================================');
    console.log(`📧 MOCK EMAIL SENT TO: ${email}`);
    console.log(`🔑 OTP CODE: ${otp}`);
    console.log('⚠️ Please set up EmailJS to send real emails.');
    console.log('=============================================\n');
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    return true; 
  }

  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        template_params: {
          to_email: email,
          to_name: name || 'Customer',
          otp: otp,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to send email via EmailJS');
    }

    return true;
  } catch (error) {
    console.error('EmailJS Error:', error);
    throw new Error('Could not send OTP email. Please try again later.');
  }
};

export const sendOrderConfirmationEmail = async (
  email: string,
  name: string,
  orderId: string,
  cartItems: any[],
  cost: { shipping: number, tax: number, total: number }
) => {
  const serviceId = process.env.EXPO_PUBLIC_EMAILJS_SERVICE_ID;
  const templateId = process.env.EXPO_PUBLIC_EMAILJS_ORDER_TEMPLATE_ID;
  const publicKey = process.env.EXPO_PUBLIC_EMAILJS_PUBLIC_KEY;

  if (!serviceId || !templateId || !publicKey) {
    console.log('\n=== MOCK ORDER EMAIL ===');
    console.log('To: ' + email);
    console.log('Order ID: ' + orderId);
    return true; 
  }

  try {
    const formattedOrders = cartItems.map(item => ({
      name: item.title,
      units: item.quantity,
      price: item.price.toLocaleString('en-IN'),
      image_url: item.image || 'https://raw.githubusercontent.com/nullbhaskar/internship-project---easybuy/main/easybuy_logo.png'
    }));

    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        template_params: {
          to_email: email,
          to_name: name || 'Customer',
          order_id: orderId,
          orders: formattedOrders,
          cost: {
            shipping: cost.shipping.toLocaleString('en-IN'),
            tax: cost.tax.toLocaleString('en-IN'),
            total: cost.total.toLocaleString('en-IN')
          }
        },
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to send order email via EmailJS');
    }
    return true;
  } catch (err) {
    console.error('EmailJS Order Error:', err);
    return false;
  }
};

