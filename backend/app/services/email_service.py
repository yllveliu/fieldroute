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


def _send_email(subject: str, body: str) -> None:
    """
    Internal helper — sends one plain-text email to NOTIFICATION_EMAIL.
    Raises on any SMTP failure so the public wrapper functions can catch it.
    Does nothing and logs a warning if NOTIFICATION_EMAIL is not configured.
    """
    if not NOTIFICATION_EMAIL:
        logger.warning(
            "NOTIFICATION_EMAIL not set — skipping email with subject: %s", subject
        )
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = SMTP_FROM
    msg["To"] = NOTIFICATION_EMAIL
    msg.attach(MIMEText(body, "plain"))

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=5) as server:
        server.ehlo()
        server.starttls()
        if SMTP_USER:
            server.login(SMTP_USER, SMTP_PASSWORD)
        server.sendmail(SMTP_FROM, [NOTIFICATION_EMAIL], msg.as_string())
        logger.info("Email sent: %s → %s", subject, NOTIFICATION_EMAIL)


def notify_job_submitted(
    job_id: int,
    customer_name: str,
    address: str,
    description: str,
) -> None:
    """
    Send notification when a new job is submitted by a customer.
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
) -> None:
    """
    Send notification when a dispatcher assigns a technician to a job.
    Called from assignment_service.assign_job — must never raise.
    """
    try:
        _send_email(
            subject=f"[FieldRoute] Job #{job_id} Assigned to {technician_name}",
            body=(
                f"A job has been assigned.\n\n"
                f"Job ID:     {job_id}\n"
                f"Customer:   {customer_name}\n"
                f"Technician: {technician_name}\n"
                f"ETA:        {eta_message or 'Not specified'}\n\n"
                f"The technician will be heading to the customer shortly."
            ),
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
    Send notification when a technician marks a job as done.
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
