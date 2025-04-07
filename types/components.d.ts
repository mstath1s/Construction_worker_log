import { FC } from 'react';
import { IWorkLog } from '../lib/models/WorkLog';

export interface WorkLogFormProps {
  onSubmit?: (data: Omit<IWorkLog, '_id' | 'createdAt' | 'updatedAt'>) => void;
}

export const WorkLogForm: FC<WorkLogFormProps>; 