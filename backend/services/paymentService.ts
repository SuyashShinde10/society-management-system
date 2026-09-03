import Stripe from 'stripe';
import logger from '../utils/logger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key', {
  apiVersion: '2023-10-16' as any,
});

export const createCheckoutSession = async (bill: any, user: any): Promise<string | null> => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: bill.title,
              description: bill.description || 'Maintenance Bill',
            },
            unit_amount: bill.amount * 100,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard/bills?payment_success=true&bill_id=${bill._id}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard/bills?payment_canceled=true`,
      client_reference_id: bill._id.toString(),
      customer_email: user.email,
      metadata: {
        billId: bill._id.toString(),
        userId: user._id.toString(),
        societyId: bill.societyId.toString()
      }
    });

    return session.url;
  } catch (error) {
    logger.error('Error creating Stripe checkout session:', error);
    throw new Error('Failed to initiate payment gateway');
  }
};

export const verifyPayment = async (sessionId: string) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return {
      isPaid: session.payment_status === 'paid',
      billId: session.metadata?.billId,
      amount: session.amount_total ? session.amount_total / 100 : 0
    };
  } catch (error) {
    logger.error('Error verifying Stripe payment:', error);
    return { isPaid: false };
  }
};
