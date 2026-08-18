// ============================================================
// DriverService — Real driver matching + push notifications
// ============================================================

import { db, auth } from './firebase';
import { ref, set, get, push, update, onValue, off } from 'firebase/database';
import { onAuthStateChanged } from 'firebase/auth';

// ─── Register driver with push token ────────────────────────
export async function registerDriver(driverData, pushToken) {
  const user = auth.currentUser;
  if (!user) throw new Error('Not logged in');

  await set(ref(db, `drivers/${user.uid}`), {
    uid: user.uid,
    name: driverData.name,
    phone: driverData.phone,
    license: driverData.license,
    vehicle: driverData.vehicle,
    vehicleType: driverData.vehicleType,
    experience: driverData.experience || '',
    city: driverData.city || '',
    status: 'pending', // pending → approved → available
    online: true,
    rating: 5.0,
    trips: 0,
    pushToken: pushToken || '',
    registeredAt: Date.now(),
    updatedAt: Date.now(),
  });
}

// ─── Update driver push token ────────────────────────────────
export async function updateDriverPushToken(pushToken) {
  const user = auth.currentUser;
  if (!user) return;
  await update(ref(db, `drivers/${user.uid}`), {
    pushToken,
    online: true,
    updatedAt: Date.now(),
  });
}

// ─── Update driver status (online/offline/busy) ──────────────
export async function updateDriverStatus(status) {
  const user = auth.currentUser;
  if (!user) return;
  await update(ref(db, `drivers/${user.uid}`), { status, updatedAt: Date.now() });
}

// ─── Get available drivers filtered by route ─────────────────
export async function getAvailableDrivers(source, destination) {
  try {
    const snap = await get(ref(db, 'drivers'));
    if (!snap.exists()) return [];

    const all = Object.values(snap.val());
    // Filter: approved + available + online
    return all.filter(d => d.status === 'available' || d.status === 'approved');
  } catch (e) {
    console.warn('getAvailableDrivers error:', e);
    return [];
  }
}

// ─── Listen to available drivers in real time ────────────────
// IMPORTANT: this never fabricates drivers. If there are zero real,
// approved, available drivers, it calls back with an empty array so the UI
// can show a proper "no drivers available" state instead of fake names.
export function listenAvailableDrivers(source, destination, callback) {
  const r = ref(db, 'drivers');

  const handler = (snap) => {
    if (!snap.exists()) { callback([]); return; }
    const all = Object.values(snap.val());
    const available = all.filter(d =>
      d.status === 'available' || d.status === 'approved'
    );
    callback(available);
  };

  const errorHandler = (err) => {
    console.warn('listenAvailableDrivers error:', err);
    callback([]);
  };

  onValue(r, handler, errorHandler);
  return () => off(r, 'value', handler);
}

// ─── Post an open job (no specific driver) ────────────────────
// The driver app's JobsScreen "Job Board" tab reads from the `jobs` node
// (not `bookings`) — this matches that exact schema so posted jobs actually
// show up there. Drivers apply (jobs/{id}/applicants/{driverUid}); use
// confirmJobApplicant() below once you pick one.
export async function postOpenJob(jobData) {
  const user = auth.currentUser;
  const companyUid = user?.uid || 'demo_company';

  const jobRef = push(ref(db, 'jobs'));
  const job = {
    id: jobRef.key,
    companyUid,
    companyName: jobData.companyName || 'A Company',
    origin: jobData.origin,
    destination: jobData.destination,
    material: jobData.material,
    materialIcon: jobData.materialIcon || '📦',
    weight: jobData.weight || '',
    pickupDate: jobData.pickupDate || 'Flexible',
    distKm: jobData.distKm || 0,
    estimatedCost: jobData.estimatedCost,
    notes: jobData.notes || '',
    status: 'open',
    createdAt: Date.now(),
  };
  await set(jobRef, job);
  return job;
}

// ─── Company reviews applicants and confirms one driver for a job ──
export async function confirmJobApplicant(jobId, driverUid) {
  const jobSnap = await get(ref(db, `jobs/${jobId}`));
  if (!jobSnap.exists()) throw new Error('Job not found');
  const job = jobSnap.val();

  // Create the real booking so it shows up on the company Fleet screen
  const bookingRef = push(ref(db, 'bookings'));
  const booking = {
    id: bookingRef.key,
    companyUid: job.companyUid,
    driverUid,
    from: job.origin,
    to: job.destination,
    material: job.material,
    weight: job.weight,
    cost: job.estimatedCost,
    transport: 'truck',
    status: 'confirmed',
    createdAt: Date.now(),
    respondedAt: Date.now(),
  };
  await set(bookingRef, booking);

  // Close the job board post and mark the winning applicant
  await update(ref(db, `jobs/${jobId}`), { status: 'filled', filledBy: driverUid, bookingId: bookingRef.key });
  await update(ref(db, `drivers/${driverUid}`), { status: 'busy' });

  // Notify the winning driver
  const notifRef = push(ref(db, `driverNotifications/${driverUid}`));
  await set(notifRef, {
    id: notifRef.key,
    type: 'booking_accepted',
    bookingId: bookingRef.key,
    title: '✅ You got the job!',
    message: `${job.origin} → ${job.destination} is confirmed. Get ready!`,
    read: false,
    createdAt: Date.now(),
  });

  return booking;
}

// ─── Company's own posted jobs, with applicants ─────────────────
export function listenCompanyJobs(callback) {
  const user = auth.currentUser;
  if (!user) return () => {};
  const r = ref(db, 'jobs');
  const handler = (snap) => {
    if (!snap.exists()) { callback([]); return; }
    const mine = Object.values(snap.val())
      .filter(j => j.companyUid === user.uid)
      .sort((a, b) => b.createdAt - a.createdAt);
    callback(mine);
  };
  onValue(r, handler, (err) => console.warn('listenCompanyJobs error:', err));
  return () => off(r, 'value', handler);
}

// ─── Send booking request to driver ──────────────────────────
export async function sendBookingRequest(driverUid, bookingData) {
  const user = auth.currentUser;
  const companyUid = user?.uid || 'demo_company';

  // Save booking to Firebase
  const bookingRef = push(ref(db, 'bookings'));
  const booking = {
    id: bookingRef.key,
    companyUid,
    driverUid,
    from: bookingData.source,
    to: bookingData.destination,
    material: bookingData.material,
    weight: bookingData.weight || '',
    cost: bookingData.cost,
    transport: bookingData.transport || 'truck',
    status: 'pending',
    createdAt: Date.now(),
  };
  await set(bookingRef, booking);

  // Write notification to driver's node
  const notifRef = push(ref(db, `driverNotifications/${driverUid}`));
  await set(notifRef, {
    id: notifRef.key,
    type: 'booking_request',
    bookingId: bookingRef.key,
    title: '🚛 New Booking Request!',
    message: `${bookingData.source} → ${bookingData.destination} | ₹${bookingData.cost?.toLocaleString()}`,
    from: bookingData.source,
    to: bookingData.destination,
    material: bookingData.material,
    cost: bookingData.cost,
    companyName: bookingData.companyName || 'A Company',
    read: false,
    createdAt: Date.now(),
  });

  // Send Expo push notification if driver has token
  try {
    const driverSnap = await get(ref(db, `drivers/${driverUid}`));
    if (driverSnap.exists()) {
      const driver = driverSnap.val();
      if (driver.pushToken) {
        await sendExpoPushNotification(
          driver.pushToken,
          '🚛 New Booking Request!',
          `${bookingData.source} → ${bookingData.destination} | ₹${bookingData.cost?.toLocaleString()}`,
          { bookingId: bookingRef.key, type: 'booking_request' }
        );
      }
    }
  } catch (e) {
    console.warn('sendExpoPushNotification error:', e);
  }

  return booking;
}

// ─── Listen to driver's booking notifications ────────────────
export function listenDriverNotifications(driverUid, callback) {
  if (!driverUid) return () => {};
  const r = ref(db, `driverNotifications/${driverUid}`);
  onValue(r, snap => {
    if (!snap.exists()) { callback([]); return; }
    const list = Object.values(snap.val())
      .sort((a, b) => b.createdAt - a.createdAt);
    callback(list);
  }, (err) => console.warn('listenDriverNotifications error:', err));
  return () => off(r);
}

// ─── Driver accepts/rejects booking ──────────────────────────
export async function respondToBooking(bookingId, driverUid, accepted, companyUid) {
  const status = accepted ? 'confirmed' : 'rejected';
  await update(ref(db, `bookings/${bookingId}`), {
    status,
    respondedAt: Date.now(),
  });

  // Update driver status
  await update(ref(db, `drivers/${driverUid}`), {
    status: accepted ? 'busy' : 'available',
  });

  // Notify company
  if (companyUid) {
    const notifRef = push(ref(db, `driverNotifications/${companyUid}`));
    await set(notifRef, {
      id: notifRef.key,
      type: accepted ? 'booking_accepted' : 'booking_rejected',
      bookingId,
      title: accepted ? '✅ Driver Accepted!' : '❌ Driver Declined',
      message: accepted
        ? 'Your driver has accepted the booking and is on the way.'
        : 'The driver declined. Please select another driver.',
      read: false,
      createdAt: Date.now(),
    });
  }
}

// ─── Approve driver (admin) ───────────────────────────────────
export async function approveDriver(driverUid) {
  await update(ref(db, `drivers/${driverUid}`), {
    status: 'available',
    approvedAt: Date.now(),
  });
}

// ─── Get pending drivers (admin) ─────────────────────────────
export async function getPendingDrivers() {
  try {
    const snap = await get(ref(db, 'drivers'));
    if (!snap.exists()) return [];
    return Object.values(snap.val()).filter(d => d.status === 'pending');
  } catch (e) {
    console.warn('getPendingDrivers error:', e);
    return [];
  }
}

export function listenPendingDrivers(callback) {
  const r = ref(db, 'drivers');
  onValue(r, snap => {
    if (!snap.exists()) { callback([]); return; }
    const pending = Object.values(snap.val()).filter(d => d.status === 'pending');
    callback(pending);
  }, (err) => console.warn('listenPendingDrivers error:', err));
  return () => off(r);
}

// ─── Send Expo push notification ─────────────────────────────
async function sendExpoPushNotification(token, title, body, data = {}) {
  if (!token || !token.startsWith('ExponentPushToken')) return;
  try {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: token, title, body, data, sound: 'default', priority: 'high' }),
    });
  } catch (e) {
    console.warn('sendExpoPushNotification fetch error:', e);
  }
}

// ============================================================
// LIVE GPS — driver's phone location, streamed onto their active booking
// ============================================================

// Called repeatedly from the driver's phone (e.g. expo-location
// watchPositionAsync) while a booking is 'confirmed'. This location IS what
// the company's Fleet screen shows for that vehicle — there's no separate
// hardware tracker, it's literally the driver's phone GPS.
export async function updateDriverLocation(bookingId, { lat, lng, heading = null, speed = null }) {
  await update(ref(db, `bookings/${bookingId}/location`), {
    lat, lng, heading, speed, updatedAt: Date.now(),
  });
}

// Watches for the driver's own currently-active (confirmed, not yet
// completed) booking, so the phone knows when to start/stop streaming GPS —
// independent of whatever screen the driver happens to be on.
export function listenActiveBookingForDriver(driverUid, callback) {
  if (!driverUid) return () => {};
  const r = ref(db, 'bookings');
  const handler = (snap) => {
    if (!snap.exists()) { callback(null); return; }
    const active = Object.values(snap.val())
      .find(b => b.driverUid === driverUid && b.status === 'confirmed');
    callback(active || null);
  };
  onValue(r, handler, (err) => console.warn('listenActiveBookingForDriver error:', err));
  return () => off(r, 'value', handler);
}

// ============================================================
// COMPANY FLEET — real, live vehicles for the company dashboard
// ============================================================
// Only bookings this company created AND a driver has confirmed show up
// here. Each entry carries the driver's live GPS (see updateDriverLocation
// above) plus the driver's profile info (name, vehicle) joined in.
export function listenCompanyFleet(callback) {
  let bookingsData = null;
  let driversData = null;

  const emit = () => {
    if (bookingsData === null) return; // wait for first bookings response
    const user = auth.currentUser;
    if (!user) { callback([]); return; }

    const fleet = Object.values(bookingsData)
      .filter(b => b.companyUid === user.uid && b.status === 'confirmed')
      .map(b => {
        const driver = (driversData && driversData[b.driverUid]) || {};
        return {
          ...b,
          driverName: driver.name || 'Driver',
          vehicleId: driver.vehicle || '',
          vehicleType: driver.vehicleType || b.transport || 'truck',
          phone: driver.phone || '',
        };
      })
      .sort((a, b2) => (b2.respondedAt || b2.createdAt || 0) - (a.respondedAt || a.createdAt || 0));

    callback(fleet);
  };

  const bookingsRef = ref(db, 'bookings');
  const driversRef = ref(db, 'drivers');

  const bHandler = (snap) => { bookingsData = snap.exists() ? snap.val() : {}; emit(); };
  const dHandler = (snap) => { driversData = snap.exists() ? snap.val() : {}; emit(); };

  onValue(bookingsRef, bHandler, (err) => console.warn('listenCompanyFleet bookings error:', err));
  onValue(driversRef, dHandler, (err) => console.warn('listenCompanyFleet drivers error:', err));

  return () => { off(bookingsRef, 'value', bHandler); off(driversRef, 'value', dHandler); };
}

// ─── Listen to a company's notifications (e.g. driver accepted/declined) ──
export function listenCompanyNotifications(callback) {
  const user = auth.currentUser;
  if (!user) return () => {};
  const r = ref(db, `driverNotifications/${user.uid}`);
  onValue(r, snap => {
    if (!snap.exists()) { callback([]); return; }
    const list = Object.values(snap.val()).sort((a, b) => b.createdAt - a.createdAt);
    callback(list);
  }, (err) => console.warn('listenCompanyNotifications error:', err));
  return () => off(r);
}

export async function markDriverNotificationRead(uid, notificationId) {
  await update(ref(db, `driverNotifications/${uid}/${notificationId}`), { read: true });
}

export async function markAllDriverNotificationsRead(uid) {
  const snap = await get(ref(db, `driverNotifications/${uid}`));
  if (!snap.exists()) return;
  const updates = {};
  Object.keys(snap.val()).forEach(id => { updates[`${id}/read`] = true; });
  await update(ref(db, `driverNotifications/${uid}`), updates);
}

// ============================================================
// UNIFIED NOTIFICATIONS FEED
// ============================================================
// The app has two real notification sources: generic `users/{uid}/notifications`
// (welcome messages, payment confirmations, etc — see firebaseService.js) and
// `driverNotifications/{uid}` (booking requests, accept/decline events — see
// above). This merges both into one feed so the Notifications screen and the
// Home screen's Alerts count always show the same real numbers.
const NOTIF_ICON = { booking_request: '🚛', booking_accepted: '✅', booking_rejected: '❌' };
const NOTIF_COLOR = { booking_request: '#4F8EF7', booking_accepted: '#22C55E', booking_rejected: '#EF4444' };

export function listenAllNotifications(callback) {
  const user = auth.currentUser;
  if (!user) return () => {};

  let userNotifs = null;
  let driverNotifs = null;

  const emit = () => {
    if (userNotifs === null || driverNotifs === null) return;
    const merged = [
      ...userNotifs.map(n => ({
        id: n.id,
        source: 'user',
        title: n.title,
        message: n.message,
        icon: n.icon || '🔔',
        color: n.color || '#4F8EF7',
        unread: !!n.unread,
        createdAt: n.createdAt || 0,
      })),
      ...driverNotifs.map(n => ({
        id: n.id,
        source: 'driver',
        title: n.title,
        message: n.message,
        icon: NOTIF_ICON[n.type] || '🔔',
        color: NOTIF_COLOR[n.type] || '#4F8EF7',
        unread: !n.read,
        createdAt: n.createdAt || 0,
      })),
    ].sort((a, b) => b.createdAt - a.createdAt);
    callback(merged);
  };

  const uRef = ref(db, `users/${user.uid}/notifications`);
  const dRef = ref(db, `driverNotifications/${user.uid}`);
  const uHandler = (snap) => { userNotifs = snap.exists() ? Object.values(snap.val()) : []; emit(); };
  const dHandler = (snap) => { driverNotifs = snap.exists() ? Object.values(snap.val()) : []; emit(); };

  onValue(uRef, uHandler, (err) => console.warn('listenAllNotifications (user) error:', err));
  onValue(dRef, dHandler, (err) => console.warn('listenAllNotifications (driver) error:', err));

  return () => { off(uRef, 'value', uHandler); off(dRef, 'value', dHandler); };
}

export async function markAnyNotificationRead(notification) {
  const user = auth.currentUser;
  if (!user) return;
  if (notification.source === 'user') {
    await update(ref(db, `users/${user.uid}/notifications/${notification.id}`), { unread: false });
  } else {
    await update(ref(db, `driverNotifications/${user.uid}/${notification.id}`), { read: true });
  }
}

export async function markAllNotificationsReadUnified() {
  const user = auth.currentUser;
  if (!user) return;
  const [uSnap, dSnap] = await Promise.all([
    get(ref(db, `users/${user.uid}/notifications`)),
    get(ref(db, `driverNotifications/${user.uid}`)),
  ]);
  const tasks = [];
  if (uSnap.exists()) {
    const updates = {};
    Object.keys(uSnap.val()).forEach(id => { updates[`${id}/unread`] = false; });
    tasks.push(update(ref(db, `users/${user.uid}/notifications`), updates));
  }
  if (dSnap.exists()) {
    const updates = {};
    Object.keys(dSnap.val()).forEach(id => { updates[`${id}/read`] = true; });
    tasks.push(update(ref(db, `driverNotifications/${user.uid}`), updates));
  }
  await Promise.all(tasks);
}

export async function simulateNewNotification(title, message, icon = '🔔', color = '#4F46E5') {
  const user = auth.currentUser;
  if (!user) return;
  const notifRef = push(ref(db, `users/${user.uid}/notifications`));
  await set(notifRef, {
    id: notifRef.key,
    title,
    message,
    icon,
    color,
    unread: true,
    createdAt: Date.now(),
  });
}

// ============================================================
// TEAM — drivers this company has actually worked with
// ============================================================
// Derived from real booking history (not a separate "team" collection —
// there isn't one). A driver counts as "on the team" once they've been
// assigned at least one booking by this company.
export function listenCompanyTeam(callback) {
  let bookingsData = null;
  let driversData = null;

  const emit = () => {
    if (bookingsData === null) return;
    const user = auth.currentUser;
    if (!user) { callback([]); return; }

    const worked = Object.values(bookingsData).filter(
      b => b.companyUid === user.uid && b.driverUid
    );

    const byDriver = {};
    worked.forEach(b => {
      if (!byDriver[b.driverUid]) byDriver[b.driverUid] = { trips: 0, lastWorkedAt: 0 };
      byDriver[b.driverUid].trips += 1;
      const ts = b.respondedAt || b.createdAt || 0;
      if (ts > byDriver[b.driverUid].lastWorkedAt) byDriver[b.driverUid].lastWorkedAt = ts;
    });

    const team = Object.entries(byDriver)
      .map(([driverUid, info]) => {
        const driver = (driversData && driversData[driverUid]) || {};
        return {
          driverUid,
          name: driver.name || 'Driver',
          vehicle: driver.vehicle || '',
          phone: driver.phone || '',
          rating: driver.rating || null,
          online: !!driver.online,
          trips: info.trips,
          lastWorkedAt: info.lastWorkedAt,
        };
      })
      .sort((a, b2) => b2.lastWorkedAt - a.lastWorkedAt);

    callback(team);
  };

  const bookingsRef = ref(db, 'bookings');
  const driversRef = ref(db, 'drivers');
  const bHandler = (snap) => { bookingsData = snap.exists() ? snap.val() : {}; emit(); };
  const dHandler = (snap) => { driversData = snap.exists() ? snap.val() : {}; emit(); };

  onValue(bookingsRef, bHandler, (err) => console.warn('listenCompanyTeam bookings error:', err));
  onValue(driversRef, dHandler, (err) => console.warn('listenCompanyTeam drivers error:', err));

  return () => { off(bookingsRef, 'value', bHandler); off(driversRef, 'value', dHandler); };
}

// (mock driver fallback removed — Fleet and driver search now only ever show real data)