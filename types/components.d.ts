import { FC } from 'react';
import { IWorkLog } from './models';

export interface WorkLogFormProps {
  onSubmit?: (data: Omit<IWorkLog, '_id' | 'createdAt' | 'updatedAt'>) => void;
}

export const WorkLogForm: FC<WorkLogFormProps>; 