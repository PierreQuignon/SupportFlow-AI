import { Chip } from '@mui/material';
import type { EmailStatus, Priority, Category } from '../types';

interface StatusBadgeProps {
  status: EmailStatus;
}

interface PriorityBadgeProps {
  priority: Priority;
}

interface CategoryBadgeProps {
  category: Category;
}

const STATUS_LABELS: Record<EmailStatus, string> = {
  PENDING: 'Pending',
  AWAITING_VALIDATION: 'Awaiting validation',
  PROCESSED: 'Processed',
};

const STATUS_COLORS: Record<EmailStatus, 'default' | 'warning' | 'success'> = {
  PENDING: 'default',
  AWAITING_VALIDATION: 'warning',
  PROCESSED: 'success',
};

const PRIORITY_LABELS: Record<Priority, string> = {
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
};

const PRIORITY_COLORS: Record<Priority, 'error' | 'warning' | 'success'> = {
  HIGH: 'error',
  MEDIUM: 'warning',
  LOW: 'success',
};

const CATEGORY_LABELS: Record<Category, string> = {
  REFUND: 'Refund',
  DELIVERY_ISSUE: 'Delivery',
  TECHNICAL: 'Technical',
  BILLING: 'Billing',
  OTHER: 'Other',
};

export const StatusBadge = ({ status }: StatusBadgeProps) => (
  <Chip
    label={STATUS_LABELS[status]}
    color={STATUS_COLORS[status]}
    size="small"
    variant="outlined"
  />
);

export const PriorityBadge = ({ priority }: PriorityBadgeProps) => (
  <Chip
    label={PRIORITY_LABELS[priority]}
    color={PRIORITY_COLORS[priority]}
    size="small"
  />
);

export const CategoryBadge = ({ category }: CategoryBadgeProps) => (
  <Chip label={CATEGORY_LABELS[category]} size="small" variant="outlined" />
);
