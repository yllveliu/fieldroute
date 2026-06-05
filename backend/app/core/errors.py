from enum import Enum


class AssignmentConflictReason(str, Enum):
    technician_unavailable = "technician_unavailable"
    insufficient_stock = "insufficient_stock"
    invalid_assignment_request = "invalid_assignment_request"
    job_not_found = "job_not_found"
    technician_skill_mismatch = "technician_skill_mismatch"


ASSIGNMENT_CONFLICT_ERROR = "assignment_conflict"


DEFAULT_CONFLICT_MESSAGES = {
    AssignmentConflictReason.technician_unavailable: "The selected technician is not available.",
    AssignmentConflictReason.insufficient_stock: "There is not enough stock to complete the assignment.",
    AssignmentConflictReason.invalid_assignment_request: "The assignment request is invalid.",
    AssignmentConflictReason.job_not_found: "The requested job could not be found.",
    AssignmentConflictReason.technician_skill_mismatch: "The technician does not have the required skills for this job.",
}
