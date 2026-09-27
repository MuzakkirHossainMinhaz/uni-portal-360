import { App, Button } from 'antd';
import { useState } from 'react';
import type { FeeReceipt } from './FeeReceipt';
export const DownloadReceipt = ({ fee }: { fee: FeeReceipt }) => {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const download = async () => {
    setLoading(true);
    try {
      const { downloadFeeReceipt } = await import('./FeeReceipt');
      await downloadFeeReceipt(fee);
    } catch {
      message.error('Could not generate receipt. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <Button size="small" loading={loading} onClick={download}>
      Download receipt
    </Button>
  );
};
