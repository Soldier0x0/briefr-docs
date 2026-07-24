import React, {type ReactNode} from 'react';
import clsx from 'clsx';
import Layout from '@theme-original/DocCard/Layout';
import type {Props} from '@theme/DocCard/Layout';

import styles from './styles.module.css';

export default function DocCardLayout(props: Props): ReactNode {
  return <Layout {...props} className={clsx(props.className, styles.briefrCard)} />;
}
