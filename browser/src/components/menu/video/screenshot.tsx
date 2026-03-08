import { useState } from 'react';
import { Button, message } from 'antd';
import { Camera } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { captureScreenshot } from '@/libs/screenshot';

export const Screenshot = () => {
  const { t } = useTranslation();
  const [isCapturing, setIsCapturing] = useState(false);

  const handleScreenshot = async () => {
    setIsCapturing(true);
    try {
      const success = captureScreenshot('video', { timestamp: true });
      if (success) {
        message.success(t('screenshot.success') || 'Screenshot saved!');
      } else {
        message.error(t('screenshot.failed') || 'Failed to capture screenshot');
      }
    } catch (error) {
      console.error('Screenshot error:', error);
      message.error(t('screenshot.error') || 'An error occurred during screenshot capture');
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <Button
      block
      size="small"
      type="primary"
      icon={<Camera size={16} />}
      loading={isCapturing}
      onClick={handleScreenshot}
      disabled={isCapturing}
    >
      {t('screenshot.button') || 'Screenshot'}
    </Button>
  );
};
