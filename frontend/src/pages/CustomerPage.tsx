import React, { useState } from "react";
import { submitJobRequest } from "../services/jobsApi";

interface FormState {
  name: string;
  phone: string;
  address: string;
  description: string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

const EMPTY_FORM: FormState = {
  name: "",
  phone: "",
  address: "",
  description: "",
};

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!form.name.trim()) errors.name = "Name is required.";
  if (!form.phone.trim()) errors.phone = "Phone is required.";
  if (!form.address.trim()) errors.address = "Address is required.";
  if (!form.description.trim())
    errors.description = "Please describe the problem.";
  return errors;
}

export default function CustomerPage(): React.ReactElement {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear the field-level error as the user fixes it.
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setSuccessMsg(null);
    setSubmitError(null);

    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitJobRequest({
        customer_name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        raw_description: form.description.trim(),
      });
      setSuccessMsg(
        `${result.message} (Request #${result.job_id}, status: ${result.status})`
      );
      setForm(EMPTY_FORM);
      setErrors({});
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-container">
      <div className="page-card">
        <h1>Customer Request</h1>
        <p className="subtitle">Submit a new service request.</p>

        <div className="flow-panel">
          <span className="flow-step">Submit request</span>
          <span className="flow-arrow">&rarr;</span>
          <span className="flow-step">Dispatcher reviews</span>
          <span className="flow-arrow">&rarr;</span>
          <span className="flow-step">Technician assigned</span>
          <span className="flow-arrow">&rarr;</span>
          <span className="flow-step">Customer tracks status</span>
        </div>

        {successMsg && (
          <div className="form-alert form-alert--success" role="status">
            {successMsg}
          </div>
        )}
        {submitError && (
          <div className="form-alert form-alert--error" role="alert">
            Could not submit your request: {submitError}
          </div>
        )}

        <form className="job-form" onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              disabled={submitting}
              aria-invalid={Boolean(errors.name)}
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="phone">Phone</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              disabled={submitting}
              aria-invalid={Boolean(errors.phone)}
            />
            {errors.phone && <span className="field-error">{errors.phone}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="address">Address</label>
            <input
              id="address"
              name="address"
              type="text"
              value={form.address}
              onChange={handleChange}
              disabled={submitting}
              aria-invalid={Boolean(errors.address)}
            />
            {errors.address && (
              <span className="field-error">{errors.address}</span>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="description">Problem description</label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={form.description}
              onChange={handleChange}
              disabled={submitting}
              aria-invalid={Boolean(errors.description)}
            />
            {errors.description && (
              <span className="field-error">{errors.description}</span>
            )}
          </div>

          <button type="submit" className="button" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit request"}
          </button>
        </form>
      </div>
    </div>
  );
}
