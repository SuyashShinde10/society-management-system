# Project Progress & Task Tracker

## Date: August 18, 2026

### Completed Tasks
- **Split Payment UI & Receipt Integration:** Added a detailed payment form allowing members to split a single bill payment across multiple modes (e.g., UPI, Cash, Net Banking). Updated the PDF generator to clearly list the exact `Payment Mode` breakdown (e.g., `UPI (₹4000) + Cash (₹2000)`).
- **Invoice Download Security & PDF Stamp Fix:** Restricted the invoice download button for members so it only appears when the payment is fully verified (`Paid`). Updated the generated PDF to correctly show a `PAYMENT UNDER VERIFICATION` stamp (in orange) when a payment is awaiting admin approval, instead of displaying `PAYMENT PENDING`.
- **Admin Maintenance Bills Batching View:** Overhauled the Admin dashboard view for `MaintenanceBills` to group individual member bills into large "Master Batch" cards. Added real-time progress bars representing collection status (Total Amount, Paid, Verifying, Pending) and an expandable detailed list for individual bill verification. Standard member views remain unaffected.
- **Global 'NEW' Badge Integration:** Designed and implemented a `NEW` visual badge that highlights records created within the last 48 hours. Applied this helper across all major modules: `NoticeBoard`, `Meetings`, `MaintenanceBills`, `ComplaintBox`, and `ExpenseTracker`.
