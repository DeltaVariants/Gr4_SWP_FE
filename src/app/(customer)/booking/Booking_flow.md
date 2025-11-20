# Booking Flow Specification (Copilot-Friendly)

## Entry Point

1. User must be logged in.
2. User selects: `Book battery swap`.
3. System loads user profile and checks: `hasActiveSubscription`.

---

## Main Logic

### Rule 1 — User already has active subscription

IF `hasActiveSubscription = true`  
THEN:

- CALL `confirmBooking()`
- RETURN `BookingSuccess`

---

### Rule 2 — User does NOT have active subscription

IF `hasActiveSubscription = false`  
THEN:

- SHOW `SubscriptionPlanOptions` (list of plans)
- ASK user: **Choose Subscription OR PayPerSwap**

---

## Branch A: User chooses SUBSCRIPTION

### A1 — Redirect to Subscription Page

- SAVE `bookingContext` (location, time, station, etc.)
- ROUTE → `/subscription`

### A2 — Payment Flow for Subscription

- CALL `startPayment(subscriptionPlan)`
- WAIT for `paymentStatus`

#### A2.1 — Subscription Payment Success

IF `paymentStatus = success`  
THEN:

- ACTIVATE subscription
- RESTORE `bookingContext`
- CALL `confirmBooking()`
- RETURN `BookingSuccess`

#### A2.2 — Subscription Payment Failed

IF `paymentStatus = failed`  
THEN:

- ASK user: **RetrySubscription OR SwitchToPayPerSwap**

##### RetrySubscription

- GOTO step A2 (Payment again)

##### SwitchToPayPerSwap

- GOTO Branch B

---

## Branch B: User chooses PAY-PER-SWAP

### B1 — Payment Flow for Pay-Per-Swap

- CALL `startPayment(payPerSwapFee)`
- WAIT for `paymentStatus`

#### B1.1 — Pay-per-swap Payment Success

IF `paymentStatus = success`  
THEN:

- CALL `confirmBooking()`
- RETURN `BookingSuccess`

#### B1.2 — Pay-per-swap Payment Failed

IF `paymentStatus = failed`  
THEN:

- SHOW error message
- ALLOW retry
- LOOP back to B1

---

## End State

WHEN booking confirmed:

- RETURN `BookingSuccess`
- DISPLAY booking summary and confirmation UI

---

## Summary (For Developers)

- Subscription user → skip payment → confirm booking.
- Non-subscription user:
  - Choose subscription → subscription payment → confirm booking.
  - Choose pay-per-swap → one-time payment → confirm booking.
- Any failed payment:
  - Allows retry.
  - Subscription flow allows fallback to pay-per-swap.
