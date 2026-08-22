// Loads Razorpay's Checkout script on demand (only when a user actually
// opens the payment flow, so it's not a dead-weight script tag on every
// page load) and wraps the widget in a promise-based API.

let scriptPromise = null;

function loadCheckoutScript() {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load the payment widget. Check your connection."));
    document.body.appendChild(script);
  });
  return scriptPromise;
}

// order: { orderId, amount, currency, keyId } from POST /api/payments/create-order
// user: { name, email } to prefill the checkout form
// Resolves with { razorpay_order_id, razorpay_payment_id, razorpay_signature }
// on success; rejects (with a benign message) if the user closes the modal.
export async function openRazorpayCheckout(order, user, { name = "Pathward Pro", description = "" } = {}) {
  await loadCheckoutScript();

  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      order_id: order.orderId,
      name,
      description,
      prefill: { name: user?.name, email: user?.email },
      theme: { color: "#2a9d8f" }, // matches --teal design token
      handler: (response) => resolve(response),
      modal: {
        ondismiss: () => reject(new Error("Payment cancelled")),
      },
    });
    rzp.on("payment.failed", (resp) => {
      reject(new Error(resp.error?.description || "Payment failed"));
    });
    rzp.open();
  });
}
