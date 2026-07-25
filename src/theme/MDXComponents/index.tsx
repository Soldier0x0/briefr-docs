import type {ComponentProps} from 'react';
import MDXComponents from '@theme-original/MDXComponents';
import ZoomableImage from '@site/src/components/ZoomableImage';
import LearnDisclaimer from '@site/src/components/learn/LearnDisclaimer';

function Img(props: ComponentProps<'img'>) {
  const {src} = props;
  if (!src || src.endsWith('.svg')) {
    return <img {...props} />;
  }
  return <ZoomableImage {...props} />;
}

export default {
  ...MDXComponents,
  img: Img,
  LearnDisclaimer,
};
