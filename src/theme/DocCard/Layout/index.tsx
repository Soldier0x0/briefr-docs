import React, {type ReactNode} from 'react';
import Link from '@docusaurus/Link';
import {ThemeClassNames} from '@docusaurus/theme-common';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {cn} from '@/lib/utils';
import type {Props} from '@theme/DocCard/Layout';

export default function DocCardLayout({
  className,
  href,
  icon,
  title,
  description,
}: Props): ReactNode {
  return (
    <Link
      href={href}
      className={cn(
        'no-underline hover:no-underline',
        ThemeClassNames.docs.docCard.container,
        className,
      )}>
      <Card className="h-full rounded-md border-border bg-card py-0 shadow-none transition-transform hover:-translate-y-0.5">
        <CardHeader className="gap-1.5 px-6 py-5">
          <CardTitle
            className={cn(
              ThemeClassNames.docs.docCard.heading,
              'flex items-baseline gap-2 text-lg font-semibold text-secondary-foreground',
            )}>
            {icon && (
              <span className="text-base leading-none" aria-hidden="true">
                {icon}
              </span>
            )}
            <span>{title}</span>
          </CardTitle>
          {description && (
            <CardDescription
              className={cn(
                ThemeClassNames.docs.docCard.description,
                'line-clamp-3 text-muted-foreground',
              )}
              title={description}>
              {description}
            </CardDescription>
          )}
        </CardHeader>
      </Card>
    </Link>
  );
}
