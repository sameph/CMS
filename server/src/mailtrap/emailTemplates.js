const VERIFICATION_EMAIL_TEMPLATE = ` 
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>You're Invited to Tede GG</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
  <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin: 30px auto;">
    <tr style="background: linear-gradient(to right, #2e7d32, #43a047);">
      <td style="padding: 30px; text-align: center;">
        <h1 style="margin: 0; color: #ffffff; font-size: 24px;">Tede GG Admin Invitation</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 30px;">
        <p style="font-size: 16px; color: #333;">Hello,</p>

        <p style="font-size: 16px; color: #333;">
          You have been invited to join <strong>Tede GG</strong> as an <strong>Admin</strong>.
        </p>

        <p style="font-size: 16px; color: #333;">
          Please use the verification code below or click the button to complete your registration:
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <span style="display: inline-block; background-color: #e8f5e9; color: #2e7d32; padding: 15px 30px; font-size: 32px; font-weight: bold; letter-spacing: 5px; border-radius: 6px;">
            {verificationCode}
          </span>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="{verificationLink}" style="background-color: #2e7d32; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Verify My Email
          </a>
        </div>

        <p style="font-size: 16px; color: #333;">
          For your initial login, use the default password below:
        </p>

        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 6px; text-align: center; font-size: 18px; font-weight: bold; color: #d84315; margin: 20px 0;">
          Default Password: <span style="color: #d84315;">{temporaryPassword}</span>
        </div>

        <p style="font-size: 15px; color: #333;">
          We strongly recommend changing your password after logging in for the first time.
        </p>

        <p style="font-size: 16px; color: #333;">This code will expire in <strong>24 hours</strong>. Please do not share it with anyone.</p>

        <p style="font-size: 16px; color: #333;">
          If you didn’t expect this email or didn’t request to be added as an admin, you can safely ignore this message.
        </p>

        <p style="font-size: 16px; color: #333;">
          Questions? Contact us at <a href="mailto:support@tedegg.com" style="color: #2e7d32;">support@tedegg.com</a>.
        </p>

        <p style="font-size: 16px; color: #333;">Best regards,<br/>The Tede GG Team</p>
      </td>
    </tr>
    <tr>
      <td style="background-color: #f1f1f1; padding: 20px; text-align: center; font-size: 12px; color: #888;">
        <p style="margin: 0;">© {year} Tede GG. All rights reserved.</p>
        <p style="margin: 5px 0;">This is an automated email — please do not reply.</p>
      </td>
    </tr>
  </table>
</body>
</html>
`;


const WELCOME_EMAIL_TEMPLATE = ` 
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to Tede GG</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
  <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin: 30px auto;">
    <tr style="background: linear-gradient(to right, #2e7d32, #43a047);">
      <td style="padding: 30px; text-align: center;">
        <h1 style="margin: 0; color: #ffffff; font-size: 24px;">Welcome to Tede GG</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 30px;">
        <p style="font-size: 16px; color: #333;">Hello {name},</p>

        <p style="font-size: 16px; color: #333;">
          Welcome to <strong>Tede GG</strong>! We’re excited to have you on board as an <strong>Admin</strong>.
        </p>

        <p style="font-size: 16px; color: #333;">
          As an admin, you'll be helping us manage content, users, and keep the platform running smoothly.
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="{dashboardLink}" style="background-color: #2e7d32; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Go to Admin Dashboard
          </a>
        </div>

        <p style="font-size: 16px; color: #333;">Here are a few tips to get started:</p>
        <ul style="font-size: 16px; color: #333; padding-left: 20px;">
          <li>Log in with your email and password.</li>
          <li>Visit the dashboard to view and manage users.</li>
          <li>Explore the settings to update your profile or change your password.</li>
        </ul>

        <p style="font-size: 16px; color: #333;">
          If you need help or have questions, don’t hesitate to contact us at <a href="mailto:support@tedegg.com" style="color: #2e7d32;">support@tedegg.com</a>.
        </p>

        <p style="font-size: 16px; color: #333;">We’re glad to have you with us.<br/>Cheers, <br/>The Tede GG Team</p>
      </td>
    </tr>
    <tr>
      <td style="background-color: #f1f1f1; padding: 20px; text-align: center; font-size: 12px; color: #888;">
        <p style="margin: 0;">© {year} Tede GG. All rights reserved.</p>
        <p style="margin: 5px 0;">This is an automated message — please do not reply directly.</p>
      </td>
    </tr>
  </table>
</body>
</html>
`;
const PASSWORD_RESET_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Your Temporary Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
  <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin: 30px auto;">
    <tr style="background: linear-gradient(to right, #2e7d32, #43a047);">
      <td style="padding: 30px; text-align: center;">
        <h1 style="margin: 0; color: #ffffff; font-size: 24px;">Tede GG Password Reset</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 30px;">
        <p style="font-size: 16px; color: #333;">Hello,</p>

        <p style="font-size: 16px; color: #333;">
          Your password has been reset. Please use the following temporary password to log in:
        </p>

        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 6px; text-align: center; font-size: 18px; font-weight: bold; color: #d84315; margin: 20px 0;">
          Temporary Password: <span style="color: #d84315;">{temporaryPassword}</span>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="{verificationLink}" style="background-color: #2e7d32; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Login Now
          </a>
        </div>

        <p style="font-size: 15px; color: #333;">
          <strong>Important:</strong> You must change this temporary password immediately after logging in.
        </p>

        <p style="font-size: 16px; color: #333;">
          This is an automated password reset. If you didn't request this change, please contact us immediately.
        </p>

        <p style="font-size: 16px; color: #333;">
          For security reasons:
          <ul style="font-size: 15px; color: #333; padding-left: 20px;">
            <li>Do not share this password with anyone</li>
            <li>Change your password immediately after login</li>
            <li>Use a strong, unique password</li>
          </ul>
        </p>

        <p style="font-size: 16px; color: #333;">
          Questions? Contact us at <a href="mailto:support@tedegg.com" style="color: #2e7d32;">support@tedegg.com</a>.
        </p>

        <p style="font-size: 16px; color: #333;">Best regards,<br/>The Tede GG Security Team</p>
      </td>
    </tr>
    <tr>
      <td style="background-color: #f1f1f1; padding: 20px; text-align: center; font-size: 12px; color: #888;">
        <p style="margin: 0;">© {year} Tede GG. All rights reserved.</p>
        <p style="margin: 5px 0;">This is an automated email — please do not reply.</p>
      </td>
    </tr>
  </table>
</body>
</html>
`;
const PASSWORD_RESET_SUCCESS_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Successful</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Password Reset Successful</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello,</p>
    <p>We're writing to confirm that your password has been successfully reset.</p>
    <div style="text-align: center; margin: 30px 0;">
      <div style="background-color: #4CAF50; color: white; width: 50px; height: 50px; line-height: 50px; border-radius: 50%; display: inline-block; font-size: 30px;">
        ✓
      </div>
    </div>
    <p>If you did not initiate this password reset, please contact our support team immediately.</p>
    <p>For security reasons, we recommend that you:</p>
    <ul>
      <li>Use a strong, unique password</li>
      <li>Enable two-factor authentication if available</li>
      <li>Avoid using the same password across multiple sites</li>
    </ul>
    <p>Thank you for helping us keep your account secure.</p>
    <p>Best regards,<br>Your App Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;

module.exports = {
  VERIFICATION_EMAIL_TEMPLATE,
  WELCOME_EMAIL_TEMPLATE,
  PASSWORD_RESET_EMAIL_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
};
