import axios from 'axios';

import { showAlert } from './alert';
/* eslint-disable*/

const stripe = Stripe('pk_live_51QyIrJCZaY6vcesNs6XyDHCjXizHOlfyTwxNJ2B2bx3rg8fOUpmNhzqLtEMKj2jbQo1tbOvGPTEwDgUD83rZPnWj00wHKSexFY');

export const bookTour = async (tourId) => {
  const stripe = Stripe('pk_live_51QyIrJCZaY6vcesNs6XyDHCjXizHOlfyTwxNJ2B2bx3rg8fOUpmNhzqLtEMKj2jbQo1tbOvGPTEwDgUD83rZPnWj00wHKSexFY');

  try {
    // 1) Get checkout session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);

    console.log(session);
    // 2) Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
