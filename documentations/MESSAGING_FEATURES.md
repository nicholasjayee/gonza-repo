# Messaging Module - Feature Documentation

This document summarizes the core features and technical implementations for the **Messaging** module within the Client application of the Gonza Systems monorepo.

---

## 1. WhatsApp Integration & Session Management
We have implemented a robust, unofficial WhatsApp integration that allows users to link their personal or business numbers.

*   **Connection Methods**:
    *   **QR Code**: Standard scan-to-link functionality.
    *   **Pairing Code**: Alternative linking method using a generated code.
*   **Real-Time Status Monitoring**:
    *   The application polls the connection status in the background (every 30s usually, 5s when connecting) to maintain an accurate "Connected/Disconnected" state in the UI.
    *   Status is visualized globally via the `MessagingLayout` top bar.
*   **Strict Instance Selection**:
    *   To prevent cross-talk or accidental sending from the wrong number, the system strictly enforces usage of the specific `whatsappInstance` linked to the user's account for all outgoing messages.

---

## 2. Smart Campaign Management
The messaging engine supports multi-channel distribution for marketing campaigns.

*   **Channels**:
    *   **SMS**: Traditional text messaging.
    *   **WhatsApp**: Rich media messaging via the linked instance.
    *   **Both**: Hybrid delivery to maximize reach.
*   **Batch Processing**:
    *   Campaigns are processed efficiently, with messages tracked individually for status (Pending -> Sent -> Delivered/Failed).

---

## 3. Wallet & Payments (PesaPal V3)
A complete internal wallet system allows users to purchase credits for messaging.

*   **Provider**: **PesaPal V3** (Enterprise-grade payments).
*   **Flow**:
    1.  User initiates a Top Up request.
    2.  System generates a PesaPal order and redirects user to secure payment page.
    3.  IPN (Instant Payment Notification) callback verifies the transaction.
    4.  Wallet balance is automatically credited upon success.

---

## 4. Technical Architecture
The module follows a strict **Controller-Service-Storage** pattern for separation of concerns and testability.

| Layer | File | Responsibility |
| :--- | :--- | :--- |
| **Controller** | `api/controller.ts` | Handles HTTP requests, input validation, and route logic. |
| **Service** | `api/service.ts` | Contains business logic, external API calls (e.g., to WhatsApp/PesaPal), and orchestration. |
| **Storage** | `api/storage.ts` | Handles all database interactions via Prisma. |

---

## 5. UI/UX Features
*   **Dynamic Navigation**: Context-aware sub-navigation for Compose, History, Connection, and Top Up.
*   **Visual Feedback**:
    *   Animated pulses for connection status.
    *   Real-time balance display.
