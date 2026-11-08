| Tanggal | Alat AI | Perintah / Prompt Ringkas | Bagian yang Digunakan / Diubah | Cara Pemeriksaan Mandiri |
|---|---|---|---|---|
| 11 Oktober 2026 | gemini | Bisakah anda membantu saya dalam pembuatan threat model STRIDE dan risk untuk website surat kematian | pada folder security | memverifikasikan sesuai dengan elemen dfd |
| 11 Oktober 2026 | gemini | Bisakah anda membantu saya dalam pembuatan module crypto untuk enkripsi tanda tangan RT/RW pada layanan surat kematian digital saya?  | pada folder kripto | memverifikasikan sesuai dengan enkripsi |
| 12 Oktober 2026 | gravity | I am developing the initial web interface (v0.1 Milestone 1) for my project "WebSurkem" (Digital Death Certificate Application / Aplikasi Surat Kematian Digital).

Please note my project root directory structure:
All Next.js App Router files are located inside: `pengembanganweb/surkem/`

Please generate a complete, clean, modular, and fully accessible codebase inside `pengembanganweb/surkem/` that strictly follows the system workflow and satisfies all assignment requirements listed below.

---

### 1. System Workflow Overview (Mocked for Milestone 1 Frontend)
1. **Reporter Auth & Submission**:
   - The reporter accesses the web application and authenticates via WhatsApp / Email (simulated OTP/magic link UI).
   - The reporter fills out the deceased's details (Name, NIK, Date of Death, Address, Cause of Death) and uploads supporting document placeholders (KTP, KK, Hospital Certificate).
   - **Crypto Integration Visual Indicator**: Display a UI indicator showing that sensitive data (e.g., NIK and uploaded document payloads) is encrypted client-side using AES-256-GCM before saving/submitting.
   - **Automated RT/RW Routing**: Based on the inputted address (RT/RW/Kelurahan), the system automatically detects and displays the assigned RT/RW officer's contact details (WhatsApp/Email notification target).

2. **RT/RW Approval & Digital Signature**:
   - The RT/RW officer receives a notification and logs into the RT/RW Dashboard.
   - The RT/RW reviews the draft submission details.
   - Upon clicking "Approve Draft", the UI displays a confirmation showing that an Ed25519 Private Key was used to digitally sign and lock the draft approval.

3. **Dukcapil Processing & Issuance**:
   - The approved draft automatically moves to the Dukcapil / Civil Registry officer view.
   - Dukcapil verifies document completeness and issues the official Death Certificate.

4. **Reporter Download with Credential**:
   - The reporter receives a notification that the official document is ready.
   - When attempting to download the final certificate, the system prompts for a PIN / password (e.g., the last 4 digits of the deceased's NIK).
   - Once validated, a preview of the issued certificate with a verified QR code is displayed along with a download action.

---

### 2. Exact Target File Paths & Deliverables

#### **A. Reusable Components (`pengembanganweb/surkem/components/`) - At least 5 Components:**
1. `pengembanganweb/surkem/components/Navbar.tsx`: Semantic `<header>` and `<nav>` with brand logo and navigation links (Home/Form, RT/RW Dashboard, Dukcapil Panel, Download Certificate), mobile menu toggle included.
2. `pengembanganweb/surkem/components/Footer.tsx`: Semantic `<footer>` containing official copyright, emergency contacts, and accessibility information.
3. `pengembanganweb/surkem/components/BadgeStatus.tsx`: Visual badge indicating report workflow stage ("Draft Encrypted", "Awaiting RT/RW Approval", "Ed25519 Signed", "Processing at Dukcapil", "Certificate Issued").
4. `pengembanganweb/surkem/components/CardInfo.tsx`: Card component for displaying statistical summaries or individual draft application details on dashboards.
5. `pengembanganweb/surkem/components/Button.tsx`: Reusable button component supporting `primary`, `secondary`, and `danger` variants with accessible focus indicators (`focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700`).
6. `pengembanganweb/surkem/components/ModalAuthPin.tsx` (Bonus): Modal pop-up requiring the 4-digit NIK PIN to simulate password hashing (PBKDF2) before downloading the certificate.

#### **B. Types & Mock Data:**
- `pengembanganweb/surkem/types/index.ts`: Strongly typed TypeScript interfaces for `DeathReport`, `Reporter`, `RTRWOfficer`, and `CertificateStatus`.
- `pengembanganweb/surkem/lib/mockData.ts`: Synthetic mock array (`mockReports`) covering various workflow states (e.g., 1 pending RT/RW verification, 1 in Dukcapil review, 1 issued certificate).

#### **C. Main Pages (`pengembanganweb/surkem/app/` using App Router) - At least 3 Main Pages:**
1. **Reporter Submission Page (`pengembanganweb/surkem/app/page.tsx`)**:
   - Includes simulated WhatsApp/Email authentication step.
   - Controlled Form for inputting deceased and reporter information.
   - Automated RT/RW detection badge based on selected address.
   - **Client-Side Validation**: Deceased NIK MUST be exactly 16 numeric digits, Reporter Name and Deceased Name cannot be blank.
   - Accessible error handling per field using `aria-invalid` and `aria-describedby` linked to readable error text (`<p id="nik-error" role="alert">`).
   - Encryption status notice ("🔒 Sensitive fields encrypted using AES-256-GCM").

2. **RT/RW & Dukcapil Verification Dashboard (`pengembanganweb/surkem/app/dashboard/page.tsx`)**:
   - Tabbed or filterable view for RT/RW officers and Dukcapil staff.
   - List/Grid of submitted applications from `mockReports`.
   - Action buttons for RT/RW approval with a "Signing with Ed25519 Digital Signature..." feedback indicator.

3. **Certificate Download & Search Page (`pengembanganweb/surkem/app/unduh/page.tsx`)**:
   - Input form to search by Registration ID / NIK.
   - Prompts for the 4-digit NIK PIN password.
   - Displays a clean preview card of the issued certificate with a QR code placeholder and a simulated PDF download button.

---

### 3. Accessibility (WCAG 2.2) & Mobile-First Requirements
- **Semantic HTML**: Use explicit `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, and `<footer>` elements with proper ARIA landmark roles.
- **Form Accessibility**: EVERY `<input>`, `<select>`, and `<textarea>` must have an explicitly connected `<label htmlFor="...">` matching the input `id`. Placeholder text MUST NOT replace labels.
- **Keyboard Navigation**: All interactive elements (`<button>`, `<a>`, `<input>`) must be focusable via Tab, operable via Enter/Space, and exhibit visible focus rings (`focus-visible:outline-*`).
- **Heading Hierarchy**: Exactly one `<h1>` per page, followed by sequential `<h2>` and `<h3>` tags without skipping levels.
- **Mobile-First Responsive Design**: Use Tailwind CSS utility classes without prefixes for base mobile views (360px) and apply breakpoint prefixes (`sm:`, `md:`, `lg:`) for tablets (768px) and desktop (1024px+). Ensure no horizontal scrolling occurs.
- **High Color Contrast**: Ensure text-to-background contrast ratio meets or exceeds 4.5:1 (dark text on light backgrounds) to comfortably achieve a Google Lighthouse Accessibility score ≥ 85. | pada folder pengembangan web | membantu membuat website surat kematian atau surat kematian  |