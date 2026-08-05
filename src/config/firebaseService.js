// ============================================================
// Firebase Realtime Database Service
// Handles: User Profiles, Shipments, Bookings, Notifications
// ============================================================

import { db, auth } from '../config/firebase';
import {
  ref, set, get, push, update, remove, onValue, off,
} from 'firebase/database';
import { onAuthStateChanged } from 'firebase/auth';

// ─── Helper: get current user ID ────────────────────────────
const uid = () => auth.currentUser?.uid;

// ─── Wait for auth to be ready ──────────────────────────────
const waitForAuth = () => new Promise((resolve, reject) => {
  if (auth.currentUser) {
    resolve(auth.currentUser);
    return;
  }
  const unsub = onAuthStateChanged(auth, user => {
    unsub();
    if (user) resolve(user);
    else reject(new Error('Not logged in. Please login again.'));
  });
  // Timeout after 5 seconds
  setTimeout(() => {
    unsub();
    reject(new Error('Auth timeout. Please login again.'));
  }, 5000);
});

// ============================================================
// USER PROFILE
// ============================================================

export async function saveUserProfile(data) {
  const user = await waitForAuth();
  await update(ref(db, `users/${user.uid}/profile`), {
    ...data,
    updatedAt: Date.now(),
  });
}

export async function getUserProfile() {
  const user = await waitForAuth();
  return new Promise((resolve) => {
    const r = ref(db, `users/${user.uid}/profile`);
    onValue(r, snap => {
      off(r);
      resolve(snap.exists() ? snap.val() : null);
    }, { onlyOnce: true });
  });
}

export function listenUserProfile(callback) {
  if (!uid()) return () => {};
  const r = ref(db, `users/${uid()}/profile`);
  onValue(r, snap => callback(snap.exists() ? snap.val() : null));
  return () => off(r);
}

// ============================================================
// SHIPMENTS
// ============================================================

export async function createShipment(data) {
  const user = await waitForAuth();
  const newRef = push(ref(db, `users/${user.uid}/shipments`));
  const shipment = {
    id: newRef.key,
    ...data,
    status: 'Booked',
    progress: 0,
    createdAt: Date.now(),
    date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
  };
  await set(newRef, shipment);
  return shipment;
}

export async function getShipments() {
  const user = await waitForAuth();
  const snap = await get(ref(db, `users/${user.uid}/shipments`));
  if (!snap.exists()) return [];
  return Object.values(snap.val()).sort((a, b) => b.createdAt - a.createdAt);
}

export function listenShipments(callback) {
  // Wait for auth then listen
  const unsub = onAuthStateChanged(auth, user => {
    if (!user) {
      callback([]);
      return;
    }
    const r = ref(db, `users/${user.uid}/shipments`);
    onValue(r, snap => {
      if (!snap.exists()) { callback([]); return; }
      const list = Object.values(snap.val()).sort((a, b) => b.createdAt - a.createdAt);
      callback(list);
    });
  });
  return unsub;
}

export async function updateShipmentStatus(shipmentId, status, progress) {
  const user = await waitForAuth();
  await update(ref(db, `users/${user.uid}/shipments/${shipmentId}`), {
    status,
    progress,
    updatedAt: Date.now(),
  });
}

export async function deleteShipment(shipmentId) {
  const user = await waitForAuth();
  await remove(ref(db, `users/${user.uid}/shipments/${shipmentId}`));
}

// ============================================================
// BOOKINGS
// ============================================================

export async function createBooking(data) {
  const user = await waitForAuth();
  const newRef = push(ref(db, `users/${user.uid}/bookings`));
  const booking = {
    id: newRef.key,
    ...data,
    status: 'Confirmed',
    createdAt: Date.now(),
    date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
  };
  await set(newRef, booking);
  return booking;
}

export async function getBookings() {
  const user = await waitForAuth();
  const snap = await get(ref(db, `users/${user.uid}/bookings`));
  if (!snap.exists()) return [];
  return Object.values(snap.val()).sort((a, b) => b.createdAt - a.createdAt);
}

export function listenBookings(callback) {
  const unsub = onAuthStateChanged(auth, user => {
    if (!user) { callback([]); return; }
    const r = ref(db, `users/${user.uid}/bookings`);
    onValue(r, snap => {
      if (!snap.exists()) { callback([]); return; }
      const list = Object.values(snap.val()).sort((a, b) => b.createdAt - a.createdAt);
      callback(list);
    });
  });
  return unsub;
}

export async function updateBookingStatus(bookingId, status) {
  const user = await waitForAuth();
  await update(ref(db, `users/${user.uid}/bookings/${bookingId}`), {
    status,
    updatedAt: Date.now(),
  });
}

// ============================================================
// HISTORY
// ============================================================

export async function getHistory() {
  const [shipments, bookings] = await Promise.all([getShipments(), getBookings()]);
  return [
    ...shipments.map(s => ({ ...s, type: 'shipment' })),
    ...bookings.map(b => ({ ...b, type: 'booking' })),
  ].sort((a, b) => b.createdAt - a.createdAt);
}

// ============================================================
// NOTIFICATIONS
// ============================================================

export async function addNotification(data) {
  const user = await waitForAuth();
  const newRef = push(ref(db, `users/${user.uid}/notifications`));
  await set(newRef, {
    id: newRef.key,
    ...data,
    time: 'Just now',
    unread: true,
    createdAt: Date.now(),
  });
}

export function listenNotifications(callback) {
  const unsub = onAuthStateChanged(auth, user => {
    if (!user) { callback([]); return; }
    const r = ref(db, `users/${user.uid}/notifications`);
    onValue(r, snap => {
      if (!snap.exists()) { callback([]); return; }
      const list = Object.values(snap.val()).sort((a, b) => b.createdAt - a.createdAt);
      callback(list);
    });
  });
  return unsub;
}

export async function markNotificationRead(notificationId) {
  const user = await waitForAuth();
  await update(ref(db, `users/${user.uid}/notifications/${notificationId}`), { unread: false });
}

export async function markAllNotificationsRead() {
  const user = await waitForAuth();
  const snap = await get(ref(db, `users/${user.uid}/notifications`));
  if (!snap.exists()) return;
  const updates = {};
  Object.keys(snap.val()).forEach(id => { updates[`${id}/unread`] = false; });
  await update(ref(db, `users/${user.uid}/notifications`), updates);
}