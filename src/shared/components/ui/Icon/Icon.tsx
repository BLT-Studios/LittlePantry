import { forwardRef } from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import { icons, type IconName, type IconAsset } from './IconMap';
import { cn } from '@shared/utils/cn';

type Common = {
  name: IconName;
  size?: number | string;
  title?: string;
  className?: string;
  'aria-label'?: string;
};

type SvgNativeProps = Omit<ComponentPropsWithoutRef<'svg'>, 'children'>;
type ImgNativeProps = Omit<ComponentPropsWithoutRef<'img'>, 'children'>;

type Props = Common & (SvgNativeProps | ImgNativeProps);

export const Icon = forwardRef<SVGSVGElement | HTMLImageElement, Props>(
  function Icon(
    { name, size = 20, className, title, 'aria-label': ariaLabel, ...rest },
    ref
  ) {
    const asset: IconAsset = icons[name];
    const isSvgComponent =
      typeof asset === 'function' || typeof asset === 'object';

    if (isSvgComponent) {
      const Svg = asset as React.ComponentType<React.SVGProps<SVGSVGElement>>;

      const svgProps = rest as SvgNativeProps;

      return (
        <Svg
          ref={ref as React.Ref<SVGSVGElement>}
          width={size}
          height={size}
          className={cn('inline-block align-middle', className)}
          role={ariaLabel ? 'img' : 'presentation'}
          aria-label={ariaLabel}
          aria-hidden={ariaLabel ? undefined : true}
          focusable="false"
          {...svgProps}
        >
          {title ? <title>{title}</title> : null}
        </Svg>
      );
    }

    const imgSrc = asset as string;

    const imgProps = rest as ImgNativeProps;

    return (
      <img
        ref={ref as React.Ref<HTMLImageElement>}
        src={imgSrc}
        width={size as number}
        height={size as number}
        alt={ariaLabel ?? title ?? name}
        className={cn('inline-block align-middle', className)}
        {...(title ? { title } : {})}
        {...imgProps}
      />
    );
  }
);
