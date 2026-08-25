// Loads Razorpay's Checkout script on demand and wraps the widget in a promise-based API.

let scriptPromise = null;

export function loadCheckoutScript() {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && window.Razorpay) return resolve();
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error("Could not load the Razorpay checkout widget. Please check your internet connection."));
    };
    document.body.appendChild(script);
  });
  return scriptPromise;
}

/**
 * Opens the Razorpay Checkout popup modal.
 * @param {Object} order - { orderId, amount, currency, keyId, itemLabel } from backend POST /api/payments/create-order
 * @param {Object} user - { name, email, phone } current logged in user
 * @param {Object} options - { name, description, themeColor, notes }
 * @returns {Promise<{ razorpay_order_id: string, razorpay_payment_id: string, razorpay_signature: string }>}
 */
export async function openRazorpayCheckout(order, user, options = {}) {
  await loadCheckoutScript();

  const key = order.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_TTWeyie2qe80Hx";

  return new Promise((resolve, reject) => {
    if (!window.Razorpay) {
      return reject(new Error("Razorpay SDK is not available on this page."));
    }

    const rzp = new window.Razorpay({
      key,
      amount: order.amount,
      currency: order.currency || "INR",
      order_id: order.orderId,
      name: options.name || "Pathward Career Universe",
      description: options.description || order.itemLabel || "Course & Career Access",
      image: options.image || "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=128&q=80",
      prefill: {
        name: user?.name || "",
        email: user?.email || "",
        contact: user?.phone || "",
      },
      notes: {
        orderId: order.orderId,
        ...(options.notes || {}),
      },
      theme: {
        color: options.themeColor || "#0f766e", // Pathward Teal brand color
        backdrop_color: "rgba(15, 23, 42, 0.7)",
      },
      handler: (response) => {
        if (!response || !response.razorpay_payment_id) {
          return reject(new Error("No payment details received from Razorpay."));
        }
        resolve(response);
      },
      modal: {
        ondismiss: () => {
          reject(new Error("Payment was cancelled by user."));
        },
        escape: true,
        backdropclose: false,
      },
    });

    rzp.on("payment.failed", (resp) => {
      const msg = resp.error?.description || resp.error?.reason || "Payment transaction failed.";
      reject(new Error(msg));
    });

    try {
      rzp.open();
    } catch (err) {
      reject(new Error(err.message || "Failed to open Razorpay checkout dialog."));
    }
  });
}
