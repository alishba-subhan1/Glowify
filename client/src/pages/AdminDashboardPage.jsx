import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../lib/api";
import { formatAppointmentDate, storageDateCaption } from "../lib/bookingDate";
import { showToast } from "../lib/toast";
import MotionSurface from "../components/MotionSurface";

const tabs = ["Overview", "Services", "Categories", "Bookings", "Payments", "Database", "Chat", "Notifications", "Settings"];

const initialService = {
  name: "",
  category: "",
  description: "",
  durationMinutes: 45,
  price: 1000
};

const initialCategory = {
  name: "",
  description: ""
};

export default function AdminDashboardPage({ token, admin, onLogout }) {
  const [activeTab, setActiveTab] = useState("Overview");
  const [services, setServices] = useState([]);
  const [serviceForm, setServiceForm] = useState(initialService);
  const [editingServiceId, setEditingServiceId] = useState("");
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [payments, setPayments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryForm, setCategoryForm] = useState(initialCategory);
  const [settings, setSettings] = useState({
    adminOnline: false,
    timeSlots: [],
    adminNotificationEmail: ""
  });
  const [newSlot, setNewSlot] = useState("");
  const [conversations, setConversations] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState("");
  const [messages, setMessages] = useState([]);
  const [chatText, setChatText] = useState("");
  const [loading, setLoading] = useState(false);
  /** Data browser */
  const [dbCollections, setDbCollections] = useState([]);
  const [dbCollection, setDbCollection] = useState("");
  const [dbPage, setDbPage] = useState(1);
  const [dbLimit] = useState(25);
  const [dbItems, setDbItems] = useState([]);
  const [dbTotal, setDbTotal] = useState(0);
  const [dbDocJson, setDbDocJson] = useState("");
  const [dbSelectedId, setDbSelectedId] = useState(null);
  const [dbLoadingBrowser, setDbLoadingBrowser] = useState(false);

  function handleError(err) {
    showToast(err?.message || "Something went wrong", "error");
  }

  const loadAll = useCallback(async () => {
    if (!token) return;
    setLoading(true);

    async function run(label, fn) {
      try {
        return { ok: true, value: await fn() };
      } catch (e) {
        return { ok: false, label, message: e?.message || String(e) };
      }
    }

    const [
      r0,
      r1,
      r2,
      r3,
      r4,
      r5,
      r6
    ] = await Promise.all([
      run("Services", () => apiFetch("/services/all", {}, token)),
      run("Bookings", () => apiFetch("/bookings", {}, token)),
      run("Notifications", () => apiFetch("/notifications/admin", {}, token)),
      run("Settings", () => apiFetch("/settings")),
      run("Chat", () => apiFetch("/chat/admin/conversations/list", {}, token)),
      run("Payments", () => apiFetch("/payments", {}, token)),
      run("Categories", () => apiFetch("/categories"))
    ]);

    const failures = [r0, r1, r2, r3, r4, r5, r6].filter((r) => !r.ok);

    if (r0.ok) setServices(r0.value);
    else setServices([]);

    if (r1.ok) {
      const b = r1.value;
      setBookings(Array.isArray(b) ? b : b?.items || []);
    } else setBookings([]);

    if (r2.ok) setNotifications(r2.value);
    else setNotifications([]);

    if (r3.ok) setSettings(r3.value || { adminOnline: false, timeSlots: [], adminNotificationEmail: "" });
    else setSettings({ adminOnline: false, timeSlots: [], adminNotificationEmail: "" });

    if (r4.ok) {
      setConversations(r4.value);
      setSelectedEmail((prev) => {
        if (prev) return prev;
        const list = r4.value;
        return list?.[0]?._id || "";
      });
    } else {
      setConversations([]);
    }

    if (r5.ok) {
      const p = r5.value;
      setPayments(Array.isArray(p) ? p : p?.items || []);
    } else setPayments([]);

    if (r6.ok) {
      const c = r6.value;
      setCategories(Array.isArray(c) ? c : c?.items || []);
    } else setCategories([]);

    if (failures.length) {
      const summary = failures.map((f) => `${f.label}: ${f.message}`).join(" · ");
      showToast(summary.length > 160 ? `${summary.slice(0, 157)}…` : summary, "error");
    }

    setLoading(false);
  }, [token]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  async function loadMessages(email = selectedEmail) {
    if (!email) return;
    try {
      const messageData = await apiFetch(`/chat/${encodeURIComponent(email)}`);
      setMessages(messageData);
    } catch (err) {
      handleError(err);
    }
  }

  useEffect(() => {
    if (activeTab !== "Database") return;
    loadDbCollections();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "Database" || !dbCollection) return;
    loadDbDocuments(dbCollection, dbPage);
  }, [activeTab, dbCollection, dbPage]);

  useEffect(() => {
    if (!selectedEmail) return;
    loadMessages();
    const timer = setInterval(() => loadMessages(), 5000);
    return () => clearInterval(timer);
  }, [selectedEmail]);

  const pendingBookings = useMemo(() => bookings.filter((item) => item.status === "pending").length, [bookings]);
  const todayBookings = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return bookings.filter((item) => item.date === today).length;
  }, [bookings]);
  const unreadNotifications = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications]
  );

  async function handleServiceSubmit(event) {
    event.preventDefault();
    const method = editingServiceId ? "PUT" : "POST";
    const path = editingServiceId ? `/services/${editingServiceId}` : "/services";
    try {
      await apiFetch(path, { method, body: JSON.stringify(serviceForm) }, token);
      setServiceForm(initialService);
      setEditingServiceId("");
      loadAll();
      showToast(editingServiceId ? "Service updated" : "Service created", "success");
    } catch (err) {
      handleError(err);
    }
  }

  async function updateBookingStatus(id, status) {
    try {
      await apiFetch(`/bookings/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }, token);
      loadAll();
      showToast(`Booking ${status}`, "success");
    } catch (err) {
      handleError(err);
    }
  }

  async function deleteBooking(id) {
    try {
      await apiFetch(`/bookings/${id}`, { method: "DELETE" }, token);
      loadAll();
      showToast("Booking deleted", "success");
    } catch (err) {
      handleError(err);
    }
  }

  async function deleteService(id) {
    try {
      await apiFetch(`/services/${id}`, { method: "DELETE" }, token);
      loadAll();
      showToast("Service deleted", "success");
    } catch (err) {
      handleError(err);
    }
  }

  async function sendAdminMessage(event) {
    event.preventDefault();
    if (!selectedEmail || !chatText.trim()) return;
    try {
      await apiFetch(
        "/chat/admin",
        { method: "POST", body: JSON.stringify({ customerEmail: selectedEmail, text: chatText }) },
        token
      );
      setChatText("");
      loadMessages(selectedEmail);
      loadAll();
      showToast("Message sent", "success");
    } catch (err) {
      handleError(err);
    }
  }

  async function createCategory(event) {
    event.preventDefault();
    if (!categoryForm.name.trim()) return;
    try {
      await apiFetch("/categories", { method: "POST", body: JSON.stringify(categoryForm) }, token);
      setCategoryForm(initialCategory);
      loadAll();
      showToast("Category created", "success");
    } catch (err) {
      handleError(err);
    }
  }

  async function deleteCategory(id) {
    try {
      await apiFetch(`/categories/${id}`, { method: "DELETE" }, token);
      loadAll();
      showToast("Category deleted", "success");
    } catch (err) {
      handleError(err);
    }
  }

  async function loadDbCollections() {
    try {
      setDbLoadingBrowser(true);
      const data = await apiFetch("/admin/data/collections", {}, token);
      setDbCollections(Array.isArray(data) ? data : []);
    } catch (err) {
      handleError(err);
    } finally {
      setDbLoadingBrowser(false);
    }
  }

  async function loadDbDocuments(coll, pageNum = dbPage) {
    try {
      setDbLoadingBrowser(true);
      const data = await apiFetch(
        `/admin/data/documents/${encodeURIComponent(coll)}?page=${pageNum}&limit=${dbLimit}`,
        {},
        token
      );
      setDbItems(data.items || []);
      setDbTotal(data.total ?? 0);
    } catch (err) {
      handleError(err);
    } finally {
      setDbLoadingBrowser(false);
    }
  }

  async function loadOneDocument(coll, id) {
    try {
      setDbLoadingBrowser(true);
      const doc = await apiFetch(`/admin/data/documents/${encodeURIComponent(coll)}/${id}`, {}, token);
      setDbSelectedId(id);
      setDbDocJson(JSON.stringify(doc, null, 2));
    } catch (err) {
      handleError(err);
    } finally {
      setDbLoadingBrowser(false);
    }
  }

  async function saveExplorerDocument(forceInsert = false) {
    if (!dbCollection) return;
    if (!forceInsert && !dbSelectedId) {
      showToast("Pick a row with Open first, or use Insert as new", "error");
      return;
    }
    let parsed;
    try {
      parsed = JSON.parse(dbDocJson);
    } catch (e) {
      showToast("Invalid JSON — fix syntax before saving", "error");
      return;
    }
    try {
      setDbLoadingBrowser(true);
      if (forceInsert || !dbSelectedId) {
        const created = await apiFetch(`/admin/data/documents/${encodeURIComponent(dbCollection)}`, {
          method: "POST",
          body: JSON.stringify({ document: parsed })
        }, token);
        setDbSelectedId(String(created._id));
        setDbDocJson(JSON.stringify(created, null, 2));
        showToast("Document inserted", "success");
      } else {
        const saved = await apiFetch(
          `/admin/data/documents/${encodeURIComponent(dbCollection)}/${dbSelectedId}`,
          { method: "PUT", body: JSON.stringify({ document: parsed }) },
          token
        );
        setDbDocJson(JSON.stringify(saved, null, 2));
        showToast("Document saved", "success");
      }
      loadDbDocuments(dbCollection, dbPage);
      loadDbCollections();
    } catch (err) {
      handleError(err);
    } finally {
      setDbLoadingBrowser(false);
    }
  }

  async function deleteExplorerDocument() {
    if (!dbCollection || !dbSelectedId) return;
    if (!confirm(`Delete document ${dbSelectedId}? This cannot be undone.`)) return;
    try {
      setDbLoadingBrowser(true);
      await apiFetch(
        `/admin/data/documents/${encodeURIComponent(dbCollection)}/${dbSelectedId}`,
        { method: "DELETE" },
        token
      );
      setDbSelectedId(null);
      setDbDocJson("{}");
      showToast("Document deleted", "success");
      loadDbDocuments(dbCollection, dbPage);
      loadDbCollections();
    } catch (err) {
      handleError(err);
    } finally {
      setDbLoadingBrowser(false);
    }
  }

  function summarizeDocRow(doc) {
    const pick =
      doc.name ||
      doc.title ||
      doc.customerEmail ||
      doc.email ||
      doc.key ||
      doc.recipientId ||
      doc.transactionId ||
      "";
    return String(pick).slice(0, 72);
  }

  async function saveSettings(nextSettings) {
    try {
      const data = await apiFetch("/settings", { method: "PATCH", body: JSON.stringify(nextSettings) }, token);
      setSettings(data);
      showToast("Settings saved", "success");
    } catch (err) {
      handleError(err);
    }
  }

  async function markAdminNotificationRead(notificationId) {
    try {
      const updated = await apiFetch(`/notifications/${notificationId}/read`, { method: "PATCH" }, token);
      setNotifications((prev) =>
        prev.map((item) => (item._id === updated._id ? { ...item, isRead: true } : item))
      );
    } catch (err) {
      handleError(err);
    }
  }

  async function deleteAdminNotification(notificationId) {
    if (!window.confirm("Delete this notification?")) return;
    try {
      await apiFetch(`/notifications/${notificationId}`, { method: "DELETE" }, token);
      setNotifications((prev) =>
        prev.filter((item) => String(item._id) !== String(notificationId))
      );
      showToast("Notification deleted", "success");
    } catch (err) {
      handleError(err);
    }
  }

  return (
    <section className="page-shell">
      <MotionSurface className="mb-6 flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-5" hoverLift={false}>
        <div>
          <h1 className="text-3xl font-bold">Glowify Admin</h1>
          <p className="text-sm text-zinc-600">Signed in as {admin?.email}</p>
          <p className="mt-2 text-xs text-zinc-600">
            Notification / alert email:{" "}
            <span className="font-mono font-medium text-zinc-900">
              {settings?.adminNotificationEmail || "(not set)"}
            </span>
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            In-app notices: <strong>Notifications</strong> tab. Actual email forwarding needs SMTP vars in{" "}
            <code className="rounded bg-zinc-100 px-1">server/.env</code> (SMTP_HOST, SMTP_USER, SMTP_PASS…).
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            Live chat status:{" "}
            <span className={settings?.adminOnline ? "font-medium text-emerald-600" : "font-medium text-amber-700"}>
              {settings?.adminOnline ? "Online" : "Offline"}
            </span>{" "}
            (toggle in Settings)
          </p>
        </div>
        <button className="btn-secondary" type="button" onClick={onLogout}>
          Logout
        </button>
      </MotionSurface>

      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <MotionSurface as="article" className="card p-4" delay={0} hoverLift={false}>
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Operations</p>
            <p className="mt-1 text-sm text-zinc-600">Manage bookings and service updates in real-time.</p>
        </MotionSurface>
        <MotionSurface as="article" className="card p-4" delay={0.03} hoverLift={false}>
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Engagement</p>
            <p className="mt-1 text-sm text-zinc-600">Respond to customer chats and maintain quick support.</p>
        </MotionSurface>
        <MotionSurface as="article" className="card p-4" delay={0.06} hoverLift={false}>
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Growth</p>
            <p className="mt-1 text-sm text-zinc-600">Use insights and notifications to improve retention.</p>
        </MotionSurface>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            type="button"
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-lg px-3 py-2 text-sm transition ${
              activeTab === tab ? "bg-glowifyRed text-white" : "border border-zinc-300 bg-white text-zinc-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Overview" && (
        <section className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <MotionSurface as="article" className="card">
              <h3 className="text-sm text-zinc-400">Pending Bookings</h3>
              <p className="text-3xl font-bold">{pendingBookings}</p>
            </MotionSurface>
            <MotionSurface as="article" className="card" delay={0.03}>
              <h3 className="text-sm text-zinc-400">Unread Notifications</h3>
              <p className="text-3xl font-bold">{unreadNotifications}</p>
            </MotionSurface>
            <MotionSurface as="article" className="card" delay={0.06}>
              <h3 className="text-sm text-zinc-400">Today Bookings</h3>
              <p className="text-3xl font-bold">{todayBookings}</p>
            </MotionSurface>
          </div>

          <MotionSurface className="card" hoverLift={false}>
            <h3 className="mb-3 text-lg font-semibold">Recent notifications</h3>
            <div className="space-y-2">
              {notifications.slice(0, 12).map((item, index) => (
                <MotionSurface
                  as="article"
                  key={item._id}
                  className={`rounded-lg border p-3 text-sm ${item.isRead ? "border-zinc-200 bg-zinc-50" : "border-glowifyRed/40 bg-white"}`}
                  delay={index * 0.02}
                  hoverLift={false}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-zinc-900">{item.title}</p>
                      <p className="text-zinc-700">{item.message}</p>
                      <p className="mt-1 text-xs text-zinc-500">{new Date(item.createdAt).toLocaleString()}</p>
                    </div>
                    <button
                      type="button"
                      className="shrink-0 rounded border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-100"
                      onClick={() => deleteAdminNotification(item._id)}
                    >
                      Delete
                    </button>
                  </div>
                </MotionSurface>
              ))}
              {notifications.length === 0 && <p className="text-sm text-zinc-500">No notifications yet.</p>}
            </div>
            <button type="button" className="btn-secondary mt-3 text-xs" onClick={() => setActiveTab("Notifications")}>
              Open all notifications →
            </button>
          </MotionSurface>
        </section>
      )}

      {activeTab === "Services" && (
        <section className="grid gap-4 lg:grid-cols-2">
          <MotionSurface as="form" onSubmit={handleServiceSubmit} className="card space-y-3" hoverLift={false}>
            <h3 className="text-lg font-semibold">{editingServiceId ? "Edit Service" : "Add New Service"}</h3>
            <input
              required
              value={serviceForm.name}
              onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
              className="input"
              placeholder="Name"
            />
            <input
              required
              value={serviceForm.category}
              onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
              className="input"
              placeholder="Category"
            />
            <textarea
              required
              value={serviceForm.description}
              onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
              className="input"
              placeholder="Description"
            />
            <div className="grid gap-3 md:grid-cols-2">
              <input
                required
                type="number"
                value={serviceForm.durationMinutes}
                onChange={(e) => setServiceForm({ ...serviceForm, durationMinutes: Number(e.target.value) })}
                className="input"
                placeholder="Duration"
              />
              <input
                required
                type="number"
                value={serviceForm.price}
                onChange={(e) => setServiceForm({ ...serviceForm, price: Number(e.target.value) })}
                className="input"
                placeholder="Price"
              />
            </div>
            <button className="btn-primary" type="submit">
              {editingServiceId ? "Update Service" : "Create Service"}
            </button>
          </MotionSurface>

          <div className="space-y-3">
            {services.map((service, index) => (
              <MotionSurface as="article" key={service._id} className="card" delay={index * 0.025}>
                <h4 className="text-lg font-semibold">{service.name}</h4>
                <p className="text-sm text-zinc-600">
                  {service.category} - {service.durationMinutes} mins - PKR {service.price}
                </p>
                <p className="my-2 text-zinc-700">{service.description}</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="btn-secondary py-1"
                    onClick={() => {
                      setServiceForm({
                        name: service.name,
                        category: service.category,
                        description: service.description,
                        durationMinutes: service.durationMinutes,
                        price: service.price
                      });
                      setEditingServiceId(service._id);
                    }}
                  >
                    Edit
                  </button>
                  <button type="button" className="btn-primary py-1" onClick={() => deleteService(service._id)}>
                    Delete
                  </button>
                </div>
              </MotionSurface>
            ))}
          </div>
        </section>
      )}

      {activeTab === "Categories" && (
        <section className="grid gap-4 lg:grid-cols-2">
          <MotionSurface as="form" className="card space-y-3" onSubmit={createCategory} hoverLift={false}>
            <h3 className="text-lg font-semibold">Add Category</h3>
            <input
              className="input"
              placeholder="Category name"
              value={categoryForm.name}
              onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
              required
            />
            <textarea
              className="input"
              placeholder="Category description"
              value={categoryForm.description}
              onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
            />
            <button className="btn-primary" type="submit">
              Save Category
            </button>
          </MotionSurface>
          <div className="space-y-3">
            {categories.map((category, index) => (
              <MotionSurface as="article" key={category._id} className="card" delay={index * 0.025}>
                <h4 className="text-lg font-semibold">{category.name}</h4>
                <p className="text-sm text-zinc-600">{category.description || "No description"}</p>
                <button className="btn-secondary mt-3 py-1" type="button" onClick={() => deleteCategory(category._id)}>
                  Delete
                </button>
              </MotionSurface>
            ))}
          </div>
        </section>
      )}

      {activeTab === "Bookings" && (
        <section className="space-y-3">
          {bookings.map((booking, index) => (
            <MotionSurface as="article" key={booking._id} className="card" delay={index * 0.02}>
              <h4 className="text-lg font-semibold">
                {booking.service?.title || booking.service?.name || booking.serviceId?.title || booking.serviceId?.name}
              </h4>
              <p className="text-sm text-zinc-600">
                {booking.customerName} ({booking.customerEmail})
              </p>
              <p className="text-sm font-medium text-zinc-800">
                {formatAppointmentDate(booking.date)} · {booking.time || booking.slot}
              </p>
              <p className="text-xs text-zinc-500">{storageDateCaption(booking.date)}</p>
              <p className="mt-1 text-sm">
                Status: <span className="capitalize text-glowifyRed">{booking.status}</span>
              </p>
              <p className="mt-1 text-xs text-zinc-600">
                Payment: <span className="capitalize font-medium">{booking.paymentId?.status || "pending"}</span>
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button className="btn-primary" type="button" onClick={() => updateBookingStatus(booking._id, "approved")}>
                  Approve
                </button>
                <button className="btn-secondary" type="button" onClick={() => updateBookingStatus(booking._id, "rejected")}>
                  Reject
                </button>
                <button className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-800 transition hover:bg-red-200" type="button" onClick={() => deleteBooking(booking._id)}>
                  Delete
                </button>
              </div>
            </MotionSurface>
          ))}
        </section>
      )}

      {activeTab === "Payments" && (
        <section className="grid gap-3 md:grid-cols-2">
          {payments.map((payment, index) => (
            <MotionSurface as="article" key={payment._id} className="card" delay={index * 0.025}>
              <p className="text-sm text-zinc-500">Booking: {payment.bookingId?._id || "N/A"}</p>
              <p className="text-lg font-semibold">PKR {Number(payment.amount || 0).toLocaleString()}</p>
              <p className="text-sm capitalize text-zinc-700">
                {payment.paymentMethod} / {payment.status}
              </p>
              <p className="text-xs text-zinc-500">{payment.transactionId || "No transaction id"}</p>
            </MotionSurface>
          ))}
          {payments.length === 0 && (
            <MotionSurface as="article" className="card text-sm text-zinc-600" hoverLift={false}>
              No payments found yet.
            </MotionSurface>
          )}
        </section>
      )}

      {activeTab === "Database" && (
        <section className="space-y-4">
          <MotionSurface as="article" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950" hoverLift={false}>
            <strong className="font-semibold">Full database browser.</strong> Inspect and edit raw MongoDB documents. Wrong JSON can break bookings and auth — keep
            Compass backups for production data.
          </MotionSurface>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,260px)_1fr]">
            <MotionSurface className="card flex max-h-[72vh] flex-col" hoverLift={false}>
              <h3 className="mb-2 font-semibold">Collections</h3>
              <div className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
                {dbCollections.map((row) => (
                  <button
                    key={row.name}
                    type="button"
                    onClick={() => {
                      setDbCollection(row.name);
                      setDbPage(1);
                      setDbSelectedId(null);
                      setDbDocJson("{}");
                    }}
                    className={`w-full rounded-lg border px-2 py-2 text-left text-sm ${
                      dbCollection === row.name ? "border-glowifyRed bg-glowifyRed text-white" : "border-zinc-200 bg-white"
                    }`}
                  >
                    <span className="font-medium">{row.name}</span>
                    <span className="ml-2 text-xs opacity-90">({row.count})</span>
                  </button>
                ))}
              </div>
              <button type="button" className="btn-secondary mt-3 text-xs" onClick={() => loadDbCollections()}>
                Refresh counts
              </button>
              {dbLoadingBrowser && dbCollections.length === 0 && (
                <p className="mt-2 text-xs text-zinc-500">Loading…</p>
              )}
            </MotionSurface>

            <div className="flex min-h-[72vh] flex-col gap-4">
              {!dbCollection && (
                <MotionSurface as="p" className="card text-sm text-zinc-600" hoverLift={false}>
                  Choose a collection on the left to list documents.
                </MotionSurface>
              )}
              {dbCollection && (
                <>
                  <MotionSurface className="card overflow-x-auto" hoverLift={false}>
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-semibold">
                        Documents in{" "}
                        <span className="font-mono text-glowifyRed">{dbCollection}</span>
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="btn-secondary text-xs"
                          disabled={dbPage <= 1}
                          onClick={() => setDbPage((p) => Math.max(1, p - 1))}
                        >
                          Prev
                        </button>
                        <span className="flex items-center text-xs text-zinc-600">
                          Page {dbPage} of {Math.max(1, Math.ceil(dbTotal / dbLimit))}
                        </span>
                        <button
                          type="button"
                          className="btn-secondary text-xs"
                          disabled={dbPage >= Math.max(1, Math.ceil(dbTotal / dbLimit))}
                          onClick={() => setDbPage((p) => p + 1)}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                    <table className="min-w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-zinc-200 text-zinc-500">
                          <th className="p-2 font-medium">id</th>
                          <th className="p-2 font-medium">preview</th>
                          <th className="p-2" />
                        </tr>
                      </thead>
                      <tbody>
                        {dbItems.map((row) => (
                          <tr key={String(row._id)} className="border-b border-zinc-100">
                            <td className="max-w-[120px] truncate p-2 font-mono">{String(row._id)}</td>
                            <td className="max-w-[240px] truncate p-2 text-zinc-600">{summarizeDocRow(row)}</td>
                            <td className="p-2">
                              <button
                                type="button"
                                className="text-glowifyRed underline"
                                onClick={() => loadOneDocument(dbCollection, String(row._id))}
                              >
                                Open
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {!dbLoadingBrowser && dbItems.length === 0 && (
                      <p className="mt-4 text-sm text-zinc-500">No documents in this collection.</p>
                    )}
                  </MotionSurface>

                  <MotionSurface className="card flex min-h-[320px] flex-1 flex-col" hoverLift={false}>
                    <div className="mb-2 flex flex-wrap gap-2">
                      <button type="button" className="btn-primary py-2 text-xs" onClick={() => saveExplorerDocument(false)}>
                        Save (replace existing)
                      </button>
                      <button type="button" className="btn-secondary py-2 text-xs" onClick={() => saveExplorerDocument(true)}>
                        Insert as new
                      </button>
                      <button
                        type="button"
                        className="rounded-lg bg-red-100 px-3 py-2 text-xs text-red-800"
                        onClick={() => deleteExplorerDocument()}
                        disabled={!dbSelectedId}
                      >
                        Delete this document
                      </button>
                      <button
                        type="button"
                        className="btn-secondary py-2 text-xs"
                        onClick={() => {
                          setDbSelectedId(null);
                          setDbDocJson("{}");
                        }}
                      >
                        New blank JSON
                      </button>
                    </div>
                    {dbSelectedId ? (
                      <p className="mb-2 font-mono text-xs text-zinc-500">Editing id: {dbSelectedId}</p>
                    ) : (
                      <p className="mb-2 text-xs text-zinc-500">No row loaded — paste JSON or open a row, or use Insert as new.</p>
                    )}
                    <textarea
                      className="input min-h-[260px] flex-1 resize-y font-mono text-xs"
                      spellCheck={false}
                      value={dbDocJson}
                      onChange={(e) => setDbDocJson(e.target.value)}
                    />
                  </MotionSurface>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {activeTab === "Chat" && (
        <section className="grid gap-4 md:grid-cols-[280px_1fr]">
          <MotionSurface className="card space-y-2" hoverLift={false}>
            <h3 className="text-lg font-semibold">Conversations</h3>
            {conversations.map((item) => (
              <button
                type="button"
                key={item._id}
                className={`w-full rounded-lg px-2 py-2 text-left text-sm ${
                  selectedEmail === item._id ? "bg-glowifyRed text-white" : "border border-zinc-300 bg-white text-zinc-700"
                }`}
                onClick={() => setSelectedEmail(item._id)}
              >
                <p className="font-medium">{item._id}</p>
                <p className="truncate text-xs">{item.lastMessage}</p>
              </button>
            ))}
          </MotionSurface>
          <MotionSurface className="card" hoverLift={false}>
            <h3 className="mb-2 text-lg font-semibold">{selectedEmail || "Select a conversation"}</h3>
            <div className="mb-3 h-72 space-y-2 overflow-y-auto rounded-lg border border-zinc-200 bg-zinc-50 p-2">
              {messages.map((msg) => (
                <p key={msg._id} className={msg.sender === "admin" ? "text-right" : "text-left"}>
                  <span className="inline-block rounded-lg border border-zinc-200 bg-white px-2 py-1 text-sm">
                    <strong className="capitalize">{msg.sender}: </strong>
                    {msg.text}
                  </span>
                </p>
              ))}
            </div>
            <form onSubmit={sendAdminMessage} className="flex gap-2">
              <input
                value={chatText}
                onChange={(e) => setChatText(e.target.value)}
                className="input"
                placeholder="Type reply..."
              />
              <button className="btn-primary" type="submit">
                Send
              </button>
            </form>
          </MotionSurface>
        </section>
      )}

      {activeTab === "Notifications" && (
        <section className="space-y-3">
          {notifications.map((item, index) => (
            <MotionSurface as="article" key={item._id} className="card" delay={index * 0.02}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-zinc-700">{item.message}</p>
                  <p className="mt-1 text-xs text-zinc-500">{new Date(item.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex shrink-0 flex-col gap-1 sm:flex-row sm:items-center">
                  {!item.isRead && (
                    <button
                      type="button"
                      className="btn-secondary py-1 text-xs"
                      onClick={() => markAdminNotificationRead(item._id)}
                    >
                      Mark read
                    </button>
                  )}
                  <button
                    type="button"
                    className="border border-red-200 bg-white py-1 text-xs text-red-700 hover:bg-red-50"
                    onClick={() => deleteAdminNotification(item._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </MotionSurface>
          ))}
          {notifications.length === 0 && (
            <p className="text-sm text-zinc-500">No notifications yet.</p>
          )}
        </section>
      )}

      {activeTab === "Settings" && (
        <section className="grid gap-4 lg:grid-cols-2">
          <MotionSurface as="article" className="card">
            <h3 className="mb-3 text-lg font-semibold">Alert email</h3>
            <p className="mb-3 text-xs text-zinc-600">
              Glowify saves admin notices in the database first. Optional: configure SMTP in <code className="rounded bg-zinc-100 px-1">server/.env</code> to also
              deliver copies here.
            </p>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-zinc-500">Email</label>
            <input
              type="email"
              className="input mb-3"
              value={settings.adminNotificationEmail || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  adminNotificationEmail: e.target.value.trim().toLowerCase()
                })
              }
            />
            <button
              type="button"
              className="btn-primary"
              onClick={() =>
                saveSettings({
                  adminNotificationEmail: String(settings.adminNotificationEmail || "").trim().toLowerCase()
                })
              }
            >
              Save alert email
            </button>
          </MotionSurface>

          <MotionSurface as="article" className="card" delay={0.03}>
            <h3 className="mb-3 text-lg font-semibold">Chat Availability</h3>
            <button
              type="button"
              className="btn-primary"
              onClick={() => saveSettings({ adminOnline: !settings.adminOnline })}
            >
              Set {settings.adminOnline ? "Offline" : "Online"}
            </button>
            <p className="mt-2 text-sm text-zinc-700">
              Current status: {settings.adminOnline ? "Online (live chat)" : "Offline (chatbot mode)"}
            </p>
          </MotionSurface>
          <MotionSurface as="article" className="card" delay={0.06}>
            <h3 className="mb-3 text-lg font-semibold">Time Slots</h3>
            <div className="mb-2 flex flex-wrap gap-2">
              {(settings.timeSlots || []).map((slot) => (
                <span key={slot} className="rounded-lg border border-zinc-300 bg-white px-2 py-1 text-sm">
                  {slot}
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={newSlot}
                onChange={(e) => setNewSlot(e.target.value)}
                className="input"
                placeholder="e.g. 5:00 PM"
              />
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  if (!newSlot.trim()) return;
                  const updated = [...(settings.timeSlots || []), newSlot.trim()];
                  setNewSlot("");
                  saveSettings({ timeSlots: updated });
                }}
              >
                Add
              </button>
            </div>
          </MotionSurface>
        </section>
      )}

      {loading && <p className="mt-4 text-sm text-zinc-500">Refreshing dashboard...</p>}
    </section>
  );
}
