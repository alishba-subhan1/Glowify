# Glowify — Har Line Detail (Viva Copy)

Roman Urdu + English. Pehle chhoti files 100% line-by-line.

---

## FILE A: `client/index.html` (Website ki pehli file browser mein)

| Line | Code | Detail |
|------|------|--------|
| 1 | `<!doctype html>` | Browser ko batata hai ye modern HTML5 page hai |
| 2 | `<html lang="en">` | Page ki language English |
| 3 | `<head>` | Meta info — user ko screen par nahi dikhta |
| 4 | `charset=UTF-8` | Urdu/English special characters sahi dikhein |
| 5 | `viewport` | Mobile par zoom/layout theek |
| 6 | `<title>Glowify...` | Browser tab par naam |
| 7-8 | `preconnect fonts` | Google fonts fast load |
| 9-12 | Inter + Cormorant fonts | Body text Inter, headings stylish font |
| 14 | `<body class="bg-black">` | Body default black (React app apna color cover karegi) |
| 15 | `<div id="root">` | **KHALI box** — React YAHAN chipkegi |
| 16 | `src="/src/main.jsx"` | Ye script chale → `main.jsx` load → poori app start |

**Viva:** "index.html sirf shell hai — ek root div + main.jsx script."

---

## FILE B: `client/src/main.jsx` — HAR LINE (22 lines)

### Line 1
```js
import React from "react";
```
- **import** = doosri file se code lao
- **React** = library jo UI banane mein help karti hai
- **from "react"** = node_modules se package
- **Kyun:** Bina React ke JSX (HTML jaisa code) kaam nahi karta
- **Agar hatao:** App compile fail

---

### Line 2
```js
import ReactDOM from "react-dom/client";
```
- **ReactDOM** = React ko **browser screen** par dikhane wala part
- **/client** = naya React 18 method (createRoot)
- **Kyun:** Virtual code ko asli HTML mein convert karta hai
- **Viva:** "ReactDOM browser bridge hai"

---

### Line 3
```js
import { BrowserRouter } from "react-router-dom";
```
- **BrowserRouter** = URL change handle karta hai
- Example: user `/book` type kare → Booking page
- **Bina iske:** Har URL par same page — routing nahi
- **{ }** = named import — sirf BrowserRouter lao, poora package nahi

---

### Line 4
```js
import App from "./App";
```
- **./App** = same folder ki `App.jsx`
- **default export** = App file ka main component
- **Kyun:** Saari routing App.jsx mein hai — yahan sirf start karo

---

### Line 5
```js
import { I18nProvider } from "./lib/i18n";
```
- **I18n** = Internationalization (languages)
- **Provider** = React Context — neeche saari app ko language deta hai
- **Kyun:** Urdu/English text switch (`t("booking.title")` waghera)
- **Agar hatao:** i18n wale pages error de sakte hain

---

### Line 6
```js
import "./index.css";
```
- **Side effect import** — koi variable nahi, sirf CSS load
- **index.css** = global styles: `.btn-primary`, `.input`, slider, body font
- **Kyun:** Har page same button/input design

---

### Line 7
*(khali line — readability)*

---

### Lines 8-21 — POORA BLOCK
```js
ReactDOM.createRoot(document.getElementById("root")).render(
```

**Har word:**

| Part | Matlab |
|------|--------|
| `ReactDOM.createRoot` | React 18 ka naya root banane ka tareeqa |
| `document` | Browser ki poori page |
| `getElementById("root")` | index.html wala `<div id="root">` dhundo |
| `.render(` | Us div ke andar UI chipkao |
| `)` | render ke andar JSX tree |

---

### Line 9
```js
<React.StrictMode>
```
- **StrictMode** = development mein extra warnings
- Double render karke bugs pakadta hai
- **Production** par user ko farq nahi dikhta
- **Kyun:** Better code quality dev time par

---

### Lines 10-14
```js
<BrowserRouter
  future={{
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }}
>
```
- **BrowserRouter** wrap = andar sab routes URL se kaam karein
- **future** = React Router v7 ke naye features pehle se on
- **v7_startTransition** = page change smooth (React transition)
- **v7_relativeSplatPath** = nested routes theek resolve
- **Viva:** "Router future flags compatibility ke liye"

---

### Lines 16-18
```js
<I18nProvider>
  <App />
</I18nProvider>
```
- **I18nProvider** = language context on
- **<App />** = self-closing — App component render
- **Order:** Router → Language → App (andar se bahar wrap)

---

### Line 19
```js
</BrowserRouter>
```
- Router wrap band

---

### Line 20
```js
</React.StrictMode>
```
- StrictMode band

---

### Line 21
```js
);
```
- `render()` function call khatam

---

### Line 22
*(file end)*

**Poora flow ek sentence:**
> Browser `main.jsx` chalata hai → root div milta hai → Router + i18n + App render → user ko website dikhti hai.

---

## FILE C: `client/src/App.jsx` — HAR LINE (90 lines)

### Lines 1-18: IMPORTS

| Line | Import | Kyun chahiye |
|------|--------|--------------|
| 1 | `Link, Navigate, Route, Routes, useLocation` | Routing — links, redirect, current URL |
| 2 | `useMemo, useState` | React hooks — memory + optimized read |
| 3 | `motion, useReducedMotion` | Animations + accessibility |
| 4 | `Navbar` | Top menu har page |
| 5 | `PublicPageTransition` | Customer pages fade animation |
| 6 | `AdminPageTransition` | Admin pages animation |
| 7 | `ChatWidget` | Live chat bubble |
| 8-13 | Pages | Home, About, Services, Book, Payment return, Contact |
| 14 | `ToastStack` | Success/error popups |
| 15-16 | Admin pages | Login + Dashboard |
| 17 | `clearAdminSession, getAdminSession` | Admin token read/delete |
| 18 | `SiteFooter` | Page footer |

**Line 1 detail:**
- **Link** = `<a>` jaisa lekin bina full page reload (`<Link to="/book">`)
- **Navigate** = code se redirect (`<Navigate to="/admin/login" />`)
- **Route** = ek URL rule
- **Routes** = saari Route rules ka container
- **useLocation** = hook — abhi pathname kya hai (`/book`, `/admin`)

---

### Line 20
```js
const MotionBookLink = motion.create(Link);
```
- **motion.create(Link)** = normal React Router Link ko animated banao
- **Kyun:** "Book Now" button hover par scale animation
- **Framer Motion** library ka pattern
- **Viva:** "motion.create se Link animated component ban jata hai"

---

### Line 22
```js
export default function App() {
```
- **export default** = doosri files `import App from "./App"` kar saken
- **function App()** = React **functional component** — ek function jo JSX return karta hai
- **Kyun:** Poori app ka layout yahan

---

### Line 23
```js
const [sessionVersion, setSessionVersion] = useState(0);
```
- **useState(0)** = React state — shuru mein `0`
- **sessionVersion** = abhi value read karo
- **setSessionVersion** = value badlo
- **Kyun login/logout:** Token localStorage mein change hota hai lekin React ko pata nahi — number badalne se **force re-render**
- **Example:** Login → `setSessionVersion(1)` → line 24 dubara chale → token mile

**Viva jawab:**
> "useState sessionVersion is liye ke jab admin login ya logout ho, getAdminSession dubara run ho aur UI update ho."

---

### Line 24
```js
const { token, admin } = useMemo(() => getAdminSession(), [sessionVersion]);
```
- **getAdminSession()** = localStorage se token + admin profile
- **useMemo** = expensive repeat na ho — sirf jab `sessionVersion` change tab dubara call
- **{ token, admin }** = destructuring — object se 2 cheezein nikalo
- **token** = JWT string ya `null`
- **admin** = `{ email, name }` ya `null`
- **[sessionVersion]** = dependency — ye badle tab refresh

---

### Line 25
```js
const location = useLocation();
```
- **location** object = `{ pathname, search, hash }`
- **pathname** = `/book`, `/admin`, `/`
- **Kyun lines 73, 74, 85:** Admin par chat/footer hide, book page par floating button hide

---

### Line 26
```js
const reduceMotion = useReducedMotion();
```
- **OS setting** check — user ne "reduce motion" on ki?
- **true** ho to animations band (accessibility)
- **Lines 78-79:** `reduceMotion ? undefined : { scale: 1.05 }`

---

### Lines 28-31: handleLogout
```js
function handleLogout() {
  clearAdminSession();           // localStorage token delete
  setSessionVersion((prev) => prev + 1);  // UI refresh trigger
}
```
- **prev => prev + 1** = functional update — purani value + 1
- **AdminDashboard** se logout button ye call karta hai

---

### Lines 33-35: refreshSession
```js
function refreshSession() {
  setSessionVersion((prev) => prev + 1);
}
```
- **Sirf refresh** — token delete nahi
- **AdminLoginPage** login success par `onLoggedIn={refreshSession}` call karta hai
- Taake App.jsx token read karke `/admin` dikha sake

---

### Line 37
```js
return (
```
- Component ka **JSX output** shuru — jo screen par dikhega

---

### Line 38
```js
<div className="min-h-screen bg-[#f8f6f3] text-zinc-900">
```
| Class | Detail |
|-------|--------|
| `min-h-screen` | Kam az kam poori viewport height — choti screen par bhi stretch |
| `bg-[#f8f6f3]` | Custom cream color background (Tailwind arbitrary value) |
| `text-zinc-900` | Default text almost black grey |

---

### Lines 39-42: Background decoration
```js
<div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
```
- **pointer-events-none** = mouse click is par kaam na kare — neeche buttons clickable
- **fixed inset-0** = screen par chipka poora cover
- **z-0** = sab se peeche layer

```js
<div className="animate-float ... bg-glowifyRed/10 blur-3xl" />
```
- **animate-float** = index.css/CSS keyframes — halka float
- **bg-glowifyRed/10** = brand red 10% opacity
- **blur-3xl** = soft glow circle — decoration only
- **Do circles** = left + right aesthetic

---

### Line 43
```js
<div className="relative z-10">
```
- **relative z-10** = asli content glow circles ke **UPAR**
- Navbar, pages, footer iske andar

---

### Line 44
```js
<Navbar />
```
- Self-closing component — top menu render
- Koi props nahi — Navbar khud `useLocation` use karta hai

---

### Lines 45-71: ROUTING (sab se important viva)

```js
<Routes>
```
- Saari URL rules yahan

```js
<Route element={<PublicPageTransition />}>
```
- **Parent route** — andar ki routes wrap
- **PublicPageTransition** = page change par fade animation outlet

**Child routes (47-52):**

| path | element | User kya dekhe |
|------|---------|----------------|
| `/` | HomePage | Landing |
| `/about` | AboutPage | About us |
| `/services` | ServicesPage | Services list |
| `/book` | BookingPage | Booking form |
| `/book/payment-return` | BookingPaymentReturnPage | Stripe wapas |
| `/contact` | ContactPage | Contact form |

```js
<Route element={<AdminPageTransition />}>
```
- Admin pages alag animation wrapper

**Line 55-58 — Admin login route:**
```jsx
path="/admin/login"
element={token ? <Navigate to="/admin" /> : <AdminLoginPage onLoggedIn={refreshSession} />}
```
- **Ternary operator** `condition ? A : B`
- **Agar token hai:** already logged in → seedha dashboard (`Navigate`)
- **Agar token nahi:** login form dikhao
- **onLoggedIn={refreshSession}** = login ke baad parent ko batao token read karo

**Lines 59-68 — Admin dashboard route:**
```jsx
path="/admin"
element={ token ? <AdminDashboardPage token={token} admin={admin} onLogout={handleLogout} /> : <Navigate to="/admin/login" /> }
```
- **token hai:** Dashboard + token/admin/logout **props** pass
- **token nahi:** login page redirect — **route guard frontend par**

**Line 70:**
```jsx
<Route path="*" element={<Navigate to="/" />} />
```
- **`*`** = koi bhi unknown URL (`/xyz`)
- Home redirect — 404 page nahi, friendly redirect

---

### Line 72
```js
<ToastStack />
```
- Global toast container — `showToast()` se messages yahan dikhte

---

### Line 73
```js
{!location.pathname.startsWith("/admin") && <ChatWidget />}
```
- **Conditional render** — JS expression `{ }` ke andar
- **!startsWith("/admin")** = URL `/admin` se shuru NA ho
- **&&** = agar true ho to right side render
- **Matlab:** Admin pages par chat widget NAHI

---

### Lines 74-84: Floating Book Now button
```js
{!token && location.pathname !== "/book" && (
```
- **3 conditions:** admin logged in NAHI + book page par NAHI

```js
<MotionBookLink to="/book" className="fixed bottom-5 left-5 z-[95] ...">
```
| Class | Matlab |
|-------|--------|
| `fixed` | Screen par chipka scroll par bhi |
| `bottom-5 left-5` | Neeche left corner |
| `z-[95]` | Sab se upar (chat se neeche ho sakta) |
| `rounded-full` | Gol pill button |
| `bg-glowifyRed` | Brand red |
| `shadow-xl` | Shadow depth |

```js
whileHover={{ scale: 1.05 }}
whileTap={{ scale: 0.98 }}
```
- Mouse par 5% bada, click par thora chota — tactile feel

```js
Book Now
```
- Button text

---

### Line 85
```js
{!location.pathname.startsWith("/admin") && <SiteFooter />}
```
- Footer sirf customer pages par

---

### Lines 86-89: Closing divs + function
- `</div>` — z-10 wrapper band
- `</div>` — min-h-screen wrapper band
- `);` — return end
- `}` — function App band

---

## FILE D: `api.js` — HAR LINE (31 lines)

### Line 1
```js
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
```
- **export const** = doosri files import kar saken
- **import.meta.env** = Vite ka env system — `client/.env` se
- **VITE_API_URL** = deploy/local server address
- **||** = agar env khali ho to default localhost
- **Kyun:** Code mein hardcode nahi — production par sirf .env change

---

### Line 3
```js
export async function apiFetch(path, options = {}, token) {
```
- **async** = function andar `await` use kar sakti hai
- **path** = `/bookings`, `/auth/login` — API end
- **options = {}** = default empty — method, body optional
- **token** = optional admin JWT

---

### Line 4
```js
const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};
```
- **Ternary:** token ho to header object, nahi to khali `{}`
- **Bearer** = JWT standard prefix
- **Template string** `` `Bearer ${token}` `` = token insert

---

### Line 5
```js
let response;
```
- Variable declare — abhi value nahi, try block mein milegi

---

### Lines 6-14: fetch call
```js
try {
  response = await fetch(`${API_URL}${path}`, {
```
- **try** = error aaye to catch
- **await fetch** = browser network request — wait until response
- **URL** = `http://localhost:5000/api` + `/bookings` = full URL

```js
headers: {
  "Content-Type": "application/json",
  ...authHeaders,
  ...(options.headers || {})
},
```
- **Content-Type** = body JSON hai
- **...spread** = authHeaders merge — extra headers add
- **options.headers** = caller custom headers

```js
...options
```
- **method: "POST"**, **body: JSON.stringify(...)** caller se aata hai

---

### Lines 15-23: Network error
```js
} catch (err) {
```
- Server band / wrong URL / no internet

```js
if (msg === "Failed to fetch" ...)
```
- Browser ka generic network error

```js
throw new Error(`Cannot reach API at ${API_URL}...`)
```
- User-friendly message — "server start karo"

---

### Line 24
```js
const data = await response.json().catch(() => ({}));
```
- Body JSON parse — agar parse fail to `{}` empty
- **Kyun catch:** kuch errors HTML/plain text ho sakte hain

---

### Lines 25-28: HTTP error status
```js
if (!response.ok) {
```
- **ok** = status 200-299 — warna false (400, 401, 500)

```js
const parts = [data.message, data.error].filter(Boolean);
```
- Server message + error join — jo khali na ho

```js
throw new Error(detail);
```
- Frontend catch karke `showToast` dikhata hai

---

### Line 30
```js
return data;
```
- Success — parsed JSON caller ko wapas (booking object, array, etc.)

---

## FILE E: `adminSession.js` — HAR LINE (22 lines)

### Lines 1-2
```js
const ADMIN_TOKEN_KEY = "glowifyAdminToken";
const ADMIN_PROFILE_KEY = "glowifyAdminProfile";
```
- **Constants** = localStorage keys fixed — typo nahi
- **Token** = JWT string alag key
- **Profile** = admin name/email JSON alag key

---

### Lines 4-11: getAdminSession
```js
export function getAdminSession() {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
```
- **localStorage** = browser permanent storage (tab band ho to bhi rehta)

```js
const profileRaw = localStorage.getItem(ADMIN_PROFILE_KEY);
```
- Profile string form mein — `{"email":"...","name":"..."}`

```js
return {
  token,
  admin: profileRaw ? JSON.parse(profileRaw) : null
};
```
- **JSON.parse** = string → JavaScript object
- **profileRaw falsy** ho to `admin: null`

---

### Lines 13-16: saveAdminSession
```js
localStorage.setItem(ADMIN_TOKEN_KEY, token);
localStorage.setItem(ADMIN_PROFILE_KEY, JSON.stringify(admin));
```
- Login success par save
- **JSON.stringify** = object → string storage ke liye

---

### Lines 18-21: clearAdminSession
```js
localStorage.removeItem(ADMIN_TOKEN_KEY);
localStorage.removeItem(ADMIN_PROFILE_KEY);
```
- Logout — dono keys delete

---

## CSS className — Detail example (App.jsx line 77)

```
fixed bottom-5 left-5 z-[95] rounded-full bg-glowifyRed px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-red-900/30
```

| Piece | CSS property | Visual |
|-------|--------------|--------|
| fixed | position: fixed | Scroll par bhi same jagah |
| bottom-5 | bottom: 1.25rem | Neeche se gap |
| left-5 | left: 1.25rem | Left se gap |
| z-[95] | z-index: 95 | Layer order |
| rounded-full | border-radius: 9999px | Pill shape |
| bg-glowifyRed | background brand color | Red fill |
| px-5 | padding-left/right | Wide button |
| py-3 | padding-top/bottom | Height |
| text-sm | font-size small | Text size |
| font-semibold | font-weight 600 | Semi bold |
| text-white | color white | White text |
| shadow-xl | box-shadow large | Depth |
| shadow-red-900/30 | colored shadow 30% | Red glow under button |

---

## Agli files (Part 2 — alag message / is file mein add hoga)

- BookingPage.jsx (full)
- AdminLoginPage.jsx (full)
- server/index.js (full)
- bookings.routes.js (full)
- auth.js middleware (full)

---

*End Part 1 — main.jsx, App.jsx, api.js, adminSession.js, index.html*
