import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.core.config import (
    NOTIFICATION_EMAIL,
    SMTP_FROM,
    SMTP_HOST,
    SMTP_PASSWORD,
    SMTP_PORT,
    SMTP_USER,
)

logger = logging.getLogger(__name__)


def _send_email(subject: str, body: str, to_email: str | None = None) -> None:
    """
    Internal helper — sends one plain-text email.

    ``to_email`` is the recipient; when omitted it falls back to the operations
    inbox (NOTIFICATION_EMAIL) for internal notifications. Raises on any SMTP
    failure so the public wrapper functions can catch it. Does nothing and logs
    a warning if no recipient can be resolved or SMTP is not configured.
    """
    recipient = to_email or NOTIFICATION_EMAIL
    if not recipient:
        logger.warning(
            "No recipient resolved — skipping email with subject: %s", subject
        )
        return
    if not SMTP_HOST:
        logger.warning(
            "SMTP_HOST not set — skipping email with subject: %s", subject
        )
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = SMTP_FROM
    msg["To"] = recipient
    msg.attach(MIMEText(body, "plain"))

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=5) as server:
        server.ehlo()
        server.starttls()
        if SMTP_USER:
            server.login(SMTP_USER, SMTP_PASSWORD)
        server.sendmail(SMTP_FROM, [recipient], msg.as_string())
        logger.info("Email sent: %s → %s", subject, recipient)


def notify_job_submitted(
    job_id: int,
    customer_name: str,
    address: str,
    description: str,
) -> None:
    """
    Send notification to the operations inbox when a new job is submitted.
    Called from job_service.create_job_request — must never raise.
    """
    try:
        _send_email(
            subject=f"[FieldRoute] New Job #{job_id} Submitted",
            body=(
                f"A new service request has been submitted.\n\n"
                f"Job ID:   {job_id}\n"
                f"Customer: {customer_name}\n"
                f"Address:  {address}\n"
                f"Problem:  {description}\n\n"
                f"Log in to FieldRoute to classify and assign this job."
            ),
        )
    except Exception as exc:  # noqa: BLE001
        logger.error(
            "Failed to send job-submitted notification for job %s: %s", job_id, exc
        )


def notify_job_assigned(
    job_id: int,
    customer_name: str,
    technician_name: str,
    eta_message: str | None,
    technician_email: str | None = None,
) -> None:
    """
    Notify the assigned technician that a job has been assigned to them.
    Falls back to the operations inbox if no technician email is available.
    Called from assignment_service.assign_job — must never raise.
    """
    try:
        _send_email(
            subject=f"[FieldRoute] You have been assigned Job #{job_id}",
            body=(
                f"Hi {technician_name},\n\n"
                f"A new job has been assigned to you.\n\n"
                f"Job ID:   {job_id}\n"
                f"Customer: {customer_name}\n"
                f"ETA:      {eta_message or 'Not specified'}\n\n"
                f"Log in to FieldRoute to view the job details and update its status."
            ),
            to_email=technician_email,
        )
    except Exception as exc:  # noqa: BLE001
        logger.error(
            "Failed to send job-assigned notification for job %s: %s", job_id, exc
        )


def notify_job_completed(
    job_id: int,
    customer_name: str,
    technician_name: str,
) -> None:
    """
    Notify the operations inbox when a technician marks a job as done.
    Called from technician_jobs.update_technician_job_status — must never raise.
    """
    try:
        _send_email(
            subject=f"[FieldRoute] Job #{job_id} Completed",
            body=(
                f"A job has been completed.\n\n"
                f"Job ID:     {job_id}\n"
                f"Customer:   {customer_name}\n"
                f"Technician: {technician_name}\n\n"
                f"The job is now closed. Thank you for using FieldRoute."
            ),
        )
    except Exception as exc:  # noqa: BLE001
        logger.error(
            "Failed to send job-completed notification for job %s: %s", job_id, exc
        )


def notify_application_received(applicant_email: str, applicant_name: str) -> None:
    """
    Confirm to a technician applicant that their application was received and is
    under review. Called right after a successful application — must never raise.
    """
    try:
        _send_email(
            subject="[FieldRoute] We received your application",
            body=(
                f"Hi {applicant_name},\n\n"
                f"Thank you for applying to join FieldRoute as a technician. "
                f"Your application and CV are now under review. We will email you "
                f"as soon as a decision has been made.\n\n"
                f"You can log in at any time to check your application status.\n\n"
                f"— The FieldRoute Team"
            ),
            to_email=applicant_email,
        )
    except Exception as exc:  # noqa: BLE001
        logger.error("Failed to send application-received email to %s: %s", applicant_email, exc)


def notify_application_accepted(applicant_email: str, applicant_name: str) -> None:
    """
    Tell an applicant their technician application was accepted.
    Called when an admin approves — must never raise.
    """
    try:
        _send_email(
            subject="[FieldRoute] Your application has been accepted",
            body=(
                f"Hi {applicant_name},\n\n"
                f"Great news — your application to join FieldRoute as a technician "
                f"has been accepted! You now have full access to your technician "
                f"dashboard. Log in to see your assigned jobs.\n\n"
                f"Welcome aboard,\n"
                f"— The FieldRoute Team"
            ),
            to_email=applicant_email,
        )
    except Exception as exc:  # noqa: BLE001
        logger.error("Failed to send application-accepted email to %s: %s", applicant_email, exc)


def notify_application_declined(applicant_email: str, applicant_name: str) -> None:
    """
    Tell an applicant their technician application was declined.
    Called when an admin declines — must never raise.
    """
    try:
        _send_email(
            subject="[FieldRoute] Update on your application",
            body=(
                f"Hi {applicant_name},\n\n"
                f"Thank you for your interest in joining FieldRoute. After careful "
                f"review, we are unable to move forward with your application at "
                f"this time. We wish you the best and encourage you to apply again "
                f"in the future.\n\n"
                f"— The FieldRoute Team"
            ),
            to_email=applicant_email,
        )
    except Exception as exc:  # noqa: BLE001
        logger.error("Failed to send application-declined email to %s: %s", applicant_email, exc)


def send_password_reset(to_email: str, reset_url: str) -> None:
    """
    Send a password-reset link. Raises on failure so the caller can decide how
    to respond (the auth route swallows it to avoid leaking account existence).
    """
    _send_email(
        subject="[FieldRoute] Reset your password",
        body=(
            f"We received a request to reset your FieldRoute password.\n\n"
            f"Click the link below to choose a new password. This link expires "
            f"in 1 hour and can be used once:\n\n"
            f"{reset_url}\n\n"
            f"If you did not request this, you can safely ignore this email.\n\n"
            f"— The FieldRoute Team"
        ),
        to_email=to_email,
    )
