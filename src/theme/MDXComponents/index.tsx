import type {ComponentProps} from 'react';
import MDXComponents from '@theme-original/MDXComponents';
import ZoomableImage from '@site/src/components/ZoomableImage';
import LearnDisclaimer from '@site/src/components/learn/LearnDisclaimer';
import {isSvgImageSrc} from '@site/src/utils/imageSrc';

function Img(props: ComponentProps<'img'>) {
  const {src} = props;
  if (!src || isSvgImageSrc(src)) {
    return <img {...props} />;
  }
  return <ZoomableImage {...props} />;
}

export default {
  ...MDXComponents,
  img: Img,
  LearnDisclaimer,
};
