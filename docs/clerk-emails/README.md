# Clerk email templates — Green Life Cannabis (Wenatchee)

Each `.html` file in this folder is a brand-styled email template for one Clerk email type. Paste the body into the Clerk dashboard for the **Wenatchee** instance.

## Where they go in Clerk

1. https://dashboard.clerk.com → select the **Wenatchee** instance
   (verify Frontend API host = `clerk.greenlifecannabis.com` BEFORE clicking anything)
2. **Customization** → **Emails** → pick the template
3. Switch to "HTML" mode (not Markdown)
4. Paste the file body
5. Save

## Template ↔ Clerk template name

| File | Clerk template name |
|---|---|
| `verification-code-signup.html` | "Verification code" (used at sign-up) |
| `reset-password-code.html` | "Reset password code" |
| `welcome.html` | "Welcome" (optional — toggle on if you want it) |

## Variables used

These match Clerk's default template variables — leave the `{{...}}` syntax intact, Clerk fills them in at send time.

- `{{otp_code}}` — the 6-digit code
- `{{user.first_name}}` — first name from sign-up form (falls back gracefully if absent)
- `{{app.name}}` — app name configured in Clerk (set this to "Green Life Cannabis" in Clerk dashboard if not already)

## Why HTML and not Markdown

Markdown mode in Clerk strips most styling. Cross-client email rendering (Gmail · Outlook · Apple Mail · iOS Mail) needs table-based HTML with inline styles. These templates use that pattern.

## Brand voice notes

- "We" not "I" for any product/offering language (per `feedback_staff_voice_we_not_i`).
- Green Life Wenatchee positioning leads with **best staff + tenure**, not "locally owned" (per `project_wenatchee_positioning_best_staff`).
- All copy was reviewed for WAC 314-55-077 (no health/medical claims) and WAC 314-55-155 (no advertising-style content in transactional emails).

## Sister docs

Seattle Cannabis Co. has its own templates at `seattle-cannabis-web/docs/clerk-emails/` — same shape, indigo/violet palette, Seattle copy.
