
export interface QAItem {
  id: string | number;
  question: string;
  answer: string;
}

export interface QADataStructure {
  items: QAItem[];
}

export interface UploadError {
  message: string;
  details?: string;
}
