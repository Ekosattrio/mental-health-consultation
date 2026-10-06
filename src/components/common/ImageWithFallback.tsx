import React, { useEffect, useState } from 'react';
import type { ImgHTMLAttributes, ReactNode } from 'react';

interface ImageWithFallbackProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallback: ReactNode;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  fallback,
  src,
  onError,
  ...imageProps
}) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) return <>{fallback}</>;

  return (
    <img
      {...imageProps}
      src={src}
      onError={event => {
        setFailed(true);
        onError?.(event);
      }}
    />
  );
};
