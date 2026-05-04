# Clerk email templates — Green Life Cannabis (Wenatchee)

Six branded HTML templates for the Clerk dashboard. Each is a complete copy-paste — table-based layout, inline CSS only (Clerk sandboxes `<style>` tags), Wenatchee green palette matching `lib/order-confirmation-email.ts` and the public site.

**Where to paste each:**

1. Sign in to [dashboard.clerk.com](https://dashboard.clerk.com).
2. Pick the **Wenatchee** instance.
3. Sidebar → **Customization → Emails**.
4. Click the matching template name.
5. Switch to **Custom HTML** mode.
6. Paste the block. Save.

**Companion files:** standalone `.html` versions of templates 1, 2, and 6 already live in `docs/clerk-emails/` from a prior pass. The blocks below are the canonical, complete set for all six — paste from here.

**Merge variables.** Clerk's variable names vary slightly by template type. The blocks below use the names Clerk's docs publish for each (`{{otp_code}}`, `{{user.first_name}}`, `{{login_attempt.ip_address}}`, `{{invite.public_url}}`, `{{magic_link}}`, `{{app.name}}`). If a variable name doesn't render in the live preview, the surrounding copy still works — just swap the variable.

**Empty-name fallback.** Clerk renders `{{user.first_name}}` as an empty string when the user hasn't supplied a first name yet (common on the verification-code email — the user is *creating* the account at that moment). The greetings below all read fine as "Hey there" if the variable comes back empty; greetings that need a name use `{{user.first_name|"there"}}` Handlebars fallback syntax where Clerk supports it.

---

### 1. Email verification code (sign-up)

**Fires:** when a new visitor enters their email at `/sign-up` and Clerk needs to confirm they own it. The OTP unlocks account creation.

**Subject:** `Your Green Life verification code: {{otp_code}}`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Verify your email · Green Life Cannabis</title>
  </head>
  <body style="margin:0;padding:0;background:#f5f5f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f5f4;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#ffffff;border:1px solid #e7e5e4;border-radius:14px;overflow:hidden;">
            <tr>
              <td style="background:linear-gradient(135deg,#14532d 0%,#166534 50%,#15803d 100%);padding:24px 28px;">
                <p style="margin:0;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#86efac;font-weight:700;">Green Life Cannabis</p>
                <p style="margin:6px 0 0;font-size:20px;font-weight:700;color:#ffffff;line-height:1.3;">Verify your email</p>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 28px 8px;">
                <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#1c1917;">
                  Almost there. Use the code below to finish setting up your Green Life account — it's good for ten minutes.
                </p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 20px;">
                  <tr>
                    <td align="center" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:24px;">
                      <p style="margin:0 0 6px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.16em;color:#15803d;">Your code</p>
                      <p style="margin:0;font-size:36px;font-weight:800;letter-spacing:8px;color:#14532d;font-variant-numeric:tabular-nums;font-family:'SF Mono','Monaco','Consolas',monospace;">{{otp_code}}</p>
                    </td>
                  </tr>
                </table>
                <p style="margin:0 0 6px;font-size:13px;color:#78716c;line-height:1.6;">
                  Didn't request this? Ignore the email — no account will be created.
                </p>
                <p style="margin:14px 0 0;font-size:13px;color:#78716c;line-height:1.6;">
                  Need a hand? Reply here or call <a href="tel:+15096639980" style="color:#15803d;text-decoration:none;font-weight:600;">(509) 663-9980</a>.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px 22px;border-top:1px solid #e7e5e4;background:#f5f5f4;">
                <p style="margin:0;font-size:11px;color:#78716c;line-height:1.6;">
                  Green Life Cannabis · 3012 Center Road Ste A, Wenatchee, WA 98801<br />
                  Founded 2014 · The Valley's best cannabis staff · WSLCB License 414755 · 21+ with valid ID
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
```

**Paste:** dashboard.clerk.com → Wenatchee → Emails → **Verification code** → Custom HTML mode → paste.

---

### 2. Password reset code

**Fires:** when a user clicks "Forgot password" at `/sign-in` and requests a code.

**Subject:** `Your Green Life password reset code: {{otp_code}}`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Reset your password · Green Life Cannabis</title>
  </head>
  <body style="margin:0;padding:0;background:#f5f5f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f5f4;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#ffffff;border:1px solid #e7e5e4;border-radius:14px;overflow:hidden;">
            <tr>
              <td style="background:linear-gradient(135deg,#14532d 0%,#166534 50%,#15803d 100%);padding:24px 28px;">
                <p style="margin:0;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#86efac;font-weight:700;">Green Life Cannabis</p>
                <p style="margin:6px 0 0;font-size:20px;font-weight:700;color:#ffffff;line-height:1.3;">Reset your password</p>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 28px 8px;">
                <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#1c1917;">
                  Hey {{user.first_name}} — here's the code to reset your password. It's good for ten minutes.
                </p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 20px;">
                  <tr>
                    <td align="center" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:24px;">
                      <p style="margin:0 0 6px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.16em;color:#15803d;">Reset code</p>
                      <p style="margin:0;font-size:36px;font-weight:800;letter-spacing:8px;color:#14532d;font-variant-numeric:tabular-nums;font-family:'SF Mono','Monaco','Consolas',monospace;">{{otp_code}}</p>
                    </td>
                  </tr>
                </table>
                <p style="margin:0 0 6px;font-size:13px;color:#78716c;line-height:1.6;">
                  Didn't ask to reset? Ignore this — your password stays the same.
                </p>
                <p style="margin:14px 0 0;font-size:13px;color:#78716c;line-height:1.6;">
                  Locked out and need a person? Reply here or call <a href="tel:+15096639980" style="color:#15803d;text-decoration:none;font-weight:600;">(509) 663-9980</a>.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px 22px;border-top:1px solid #e7e5e4;background:#f5f5f4;">
                <p style="margin:0;font-size:11px;color:#78716c;line-height:1.6;">
                  Green Life Cannabis · 3012 Center Road Ste A, Wenatchee, WA 98801<br />
                  Founded 2014 · The Valley's best cannabis staff · WSLCB License 414755 · 21+ with valid ID
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
```

**Paste:** dashboard.clerk.com → Wenatchee → Emails → **Reset password code** → Custom HTML mode → paste.

---

### 3. Magic link sign-in

**Fires:** when a returning user requests a magic link at `/sign-in` instead of typing their password. Email includes both the link (one-tap) and the OTP fallback (paste manually).

**Subject:** `Your Green Life sign-in link`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Sign in to Green Life Cannabis</title>
  </head>
  <body style="margin:0;padding:0;background:#f5f5f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f5f4;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#ffffff;border:1px solid #e7e5e4;border-radius:14px;overflow:hidden;">
            <tr>
              <td style="background:linear-gradient(135deg,#14532d 0%,#166534 50%,#15803d 100%);padding:24px 28px;">
                <p style="margin:0;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#86efac;font-weight:700;">Green Life Cannabis</p>
                <p style="margin:6px 0 0;font-size:20px;font-weight:700;color:#ffffff;line-height:1.3;">One tap, you're in</p>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 28px 8px;">
                <p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#1c1917;">
                  Hey {{user.first_name}} — tap the button to sign in. The link is good for ten minutes and works once.
                </p>
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 22px;">
                  <tr>
                    <td style="background:#15803d;border-radius:10px;">
                      <a href="{{magic_link}}" style="display:inline-block;padding:13px 28px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;letter-spacing:0.02em;">Sign in to Green Life</a>
                    </td>
                  </tr>
                </table>
                <div style="border-top:1px solid #e7e5e4;padding-top:18px;">
                  <p style="margin:0 0 8px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#78716c;">Or paste this code</p>
                  <p style="margin:0 0 4px;font-size:24px;font-weight:800;letter-spacing:6px;color:#14532d;font-variant-numeric:tabular-nums;font-family:'SF Mono','Monaco','Consolas',monospace;">{{otp_code}}</p>
                  <p style="margin:6px 0 0;font-size:12px;color:#78716c;line-height:1.5;">Use this if the button doesn't work.</p>
                </div>
                <p style="margin:18px 0 0;font-size:13px;color:#78716c;line-height:1.6;">
                  Didn't ask to sign in? Ignore this email and your account stays locked.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px 22px;border-top:1px solid #e7e5e4;background:#f5f5f4;">
                <p style="margin:0;font-size:11px;color:#78716c;line-height:1.6;">
                  Green Life Cannabis · 3012 Center Road Ste A, Wenatchee, WA 98801<br />
                  Founded 2014 · The Valley's best cannabis staff · WSLCB License 414755 · 21+ with valid ID
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
```

**Paste:** dashboard.clerk.com → Wenatchee → Emails → **Magic link** → Custom HTML mode → paste.

---

### 4. Verify email change (existing account)

**Fires:** when a logged-in user changes their email address in `/account` and Clerk confirms ownership of the new address.

**Subject:** `Confirm your new email — Green Life`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Confirm your new email · Green Life Cannabis</title>
  </head>
  <body style="margin:0;padding:0;background:#f5f5f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f5f4;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#ffffff;border:1px solid #e7e5e4;border-radius:14px;overflow:hidden;">
            <tr>
              <td style="background:linear-gradient(135deg,#14532d 0%,#166534 50%,#15803d 100%);padding:24px 28px;">
                <p style="margin:0;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#86efac;font-weight:700;">Green Life Cannabis</p>
                <p style="margin:6px 0 0;font-size:20px;font-weight:700;color:#ffffff;line-height:1.3;">Confirm your new email</p>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 28px 8px;">
                <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#1c1917;">
                  Hey {{user.first_name}} — you asked to update the email on your Green Life account. Drop in the code below to confirm. Good for ten minutes.
                </p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 20px;">
                  <tr>
                    <td align="center" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:24px;">
                      <p style="margin:0 0 6px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.16em;color:#15803d;">Confirmation code</p>
                      <p style="margin:0;font-size:36px;font-weight:800;letter-spacing:8px;color:#14532d;font-variant-numeric:tabular-nums;font-family:'SF Mono','Monaco','Consolas',monospace;">{{otp_code}}</p>
                    </td>
                  </tr>
                </table>
                <p style="margin:0 0 6px;font-size:13px;color:#78716c;line-height:1.6;">
                  Didn't make this change? Ignore the email — nothing updates until the code is entered. If you suspect someone else is in your account, reset your password right away.
                </p>
                <p style="margin:14px 0 0;font-size:13px;color:#78716c;line-height:1.6;">
                  Questions? Reply here or call <a href="tel:+15096639980" style="color:#15803d;text-decoration:none;font-weight:600;">(509) 663-9980</a>.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px 22px;border-top:1px solid #e7e5e4;background:#f5f5f4;">
                <p style="margin:0;font-size:11px;color:#78716c;line-height:1.6;">
                  Green Life Cannabis · 3012 Center Road Ste A, Wenatchee, WA 98801<br />
                  Founded 2014 · The Valley's best cannabis staff · WSLCB License 414755 · 21+ with valid ID
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
```

**Paste:** dashboard.clerk.com → Wenatchee → Emails → **Verification code (email)** or **Verify email address change** → Custom HTML mode → paste.

---

### 5. New device / sign-in alert

**Fires:** when Clerk's risk engine flags a sign-in from an unfamiliar device, IP, or location. Account holder gets notified — heads-up, not a block.

**Subject:** `New sign-in to your Green Life account`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>New sign-in · Green Life Cannabis</title>
  </head>
  <body style="margin:0;padding:0;background:#f5f5f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f5f4;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#ffffff;border:1px solid #e7e5e4;border-radius:14px;overflow:hidden;">
            <tr>
              <td style="background:linear-gradient(135deg,#14532d 0%,#166534 50%,#15803d 100%);padding:24px 28px;">
                <p style="margin:0;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#86efac;font-weight:700;">Green Life Cannabis</p>
                <p style="margin:6px 0 0;font-size:20px;font-weight:700;color:#ffffff;line-height:1.3;">New sign-in on your account</p>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 28px 8px;">
                <p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#1c1917;">
                  Hey {{user.first_name}} — heads-up. Someone just signed in to your Green Life account from a new device.
                </p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fafaf9;border:1px solid #e7e5e4;border-radius:10px;margin:0 0 20px;">
                  <tr>
                    <td style="padding:16px 18px;">
                      <p style="margin:0 0 6px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#78716c;">Device</p>
                      <p style="margin:0 0 14px;font-size:14px;color:#1c1917;">{{login_attempt.device}}</p>
                      <p style="margin:0 0 6px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#78716c;">Location</p>
                      <p style="margin:0 0 14px;font-size:14px;color:#1c1917;">{{login_attempt.location}}</p>
                      <p style="margin:0 0 6px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#78716c;">IP address</p>
                      <p style="margin:0;font-size:14px;color:#1c1917;font-family:'SF Mono','Monaco','Consolas',monospace;">{{login_attempt.ip_address}}</p>
                    </td>
                  </tr>
                </table>
                <p style="margin:0 0 8px;font-size:14px;color:#1c1917;line-height:1.6;">
                  <strong>That was you?</strong> Nothing to do — carry on.
                </p>
                <p style="margin:0;font-size:14px;color:#1c1917;line-height:1.6;">
                  <strong>Doesn't look right?</strong> Reset your password at <a href="https://greenlifecannabis.com/sign-in" style="color:#15803d;text-decoration:underline;font-weight:600;">greenlifecannabis.com/sign-in</a> and we'll lock the other session out.
                </p>
                <p style="margin:18px 0 0;font-size:13px;color:#78716c;line-height:1.6;">
                  Need a person? Reply here or call <a href="tel:+15096639980" style="color:#15803d;text-decoration:none;font-weight:600;">(509) 663-9980</a>.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px 22px;border-top:1px solid #e7e5e4;background:#f5f5f4;">
                <p style="margin:0;font-size:11px;color:#78716c;line-height:1.6;">
                  Green Life Cannabis · 3012 Center Road Ste A, Wenatchee, WA 98801<br />
                  Founded 2014 · The Valley's best cannabis staff · WSLCB License 414755 · 21+ with valid ID
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
```

**Paste:** dashboard.clerk.com → Wenatchee → Emails → **New device sign-in** (or **Sign-in alert**) → Custom HTML mode → paste.

---

### 6. Invitation

**Fires:** when an admin invites someone via Clerk's invitation API — typically for staff portal access (manager, lead, inventory). The link in the email lets the invitee accept and create their account.

**Subject:** `You're invited to {{app.name}}`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>You're invited · Green Life Cannabis</title>
  </head>
  <body style="margin:0;padding:0;background:#f5f5f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f5f4;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#ffffff;border:1px solid #e7e5e4;border-radius:14px;overflow:hidden;">
            <tr>
              <td style="background:linear-gradient(135deg,#14532d 0%,#166534 50%,#15803d 100%);padding:24px 28px;">
                <p style="margin:0;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#86efac;font-weight:700;">Green Life Cannabis</p>
                <p style="margin:6px 0 0;font-size:20px;font-weight:700;color:#ffffff;line-height:1.3;">You're invited</p>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 28px 8px;">
                <p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#1c1917;">
                  Welcome aboard. We've set up an account for you on the Green Life portal — tap the button below to finish creating it. The link works once and is good for seven days.
                </p>
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 22px;">
                  <tr>
                    <td style="background:#15803d;border-radius:10px;">
                      <a href="{{invite.public_url}}" style="display:inline-block;padding:13px 28px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;letter-spacing:0.02em;">Accept your invite</a>
                    </td>
                  </tr>
                </table>
                <p style="margin:0 0 6px;font-size:13px;color:#78716c;line-height:1.6;">
                  Button not working? Paste this URL into your browser:
                </p>
                <p style="margin:0 0 18px;font-size:13px;color:#15803d;line-height:1.5;word-break:break-all;font-family:'SF Mono','Monaco','Consolas',monospace;">{{invite.public_url}}</p>
                <p style="margin:0;font-size:13px;color:#78716c;line-height:1.6;">
                  Wasn't expecting this? Ignore the email — accounts only get created when the link is opened.
                </p>
                <p style="margin:14px 0 0;font-size:13px;color:#78716c;line-height:1.6;">
                  Questions? Reply here or call <a href="tel:+15096639980" style="color:#15803d;text-decoration:none;font-weight:600;">(509) 663-9980</a>.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px 22px;border-top:1px solid #e7e5e4;background:#f5f5f4;">
                <p style="margin:0;font-size:11px;color:#78716c;line-height:1.6;">
                  Green Life Cannabis · 3012 Center Road Ste A, Wenatchee, WA 98801<br />
                  Founded 2014 · The Valley's best cannabis staff · WSLCB License 414755 · 21+ with valid ID
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
```

**Paste:** dashboard.clerk.com → Wenatchee → Emails → **Invitation** → Custom HTML mode → paste.

---

## Quick reference — what's where in Clerk

| # | Template | Clerk dashboard label | Subject line to set |
|---|---|---|---|
| 1 | Email verification (sign-up) | Verification code | `Your Green Life verification code: {{otp_code}}` |
| 2 | Password reset | Reset password code | `Your Green Life password reset code: {{otp_code}}` |
| 3 | Magic link sign-in | Magic link | `Your Green Life sign-in link` |
| 4 | Verify email change | Verify email address change | `Confirm your new email — Green Life` |
| 5 | New device alert | New device sign-in / Sign-in alert | `New sign-in to your Green Life account` |
| 6 | Invitation | Invitation | `You're invited to {{app.name}}` |

## After pasting all six

Send a test email from Clerk's dashboard to your own address to confirm rendering before launch. Clerk's preview in the dashboard is reliable but doesn't catch every email-client quirk — the test send to a real Gmail / Outlook / Apple Mail inbox is worth thirty seconds.
