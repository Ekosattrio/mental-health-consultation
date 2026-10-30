import React, { useEffect, useState } from 'react';
import type { ImgHTMLAttributes, ReactNode } from 'react';

interface ImageWithFallbackProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallback: ReactNode;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  fallback,
  src,
  onError,
  decoding = 'async',
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
      decoding={decoding}
      onError={event => {
        setFailed(true);
        onError?.(event);
      }}
    />
  );
};
