import {
  useRef,
  useState,
  ImgHTMLAttributes,
  CSSProperties,
  FC,
  SVGProps,
  HTMLAttributeReferrerPolicy
} from 'react'
import { SwitchTransition, CSSTransition } from 'react-transition-group'
import useEnvironment from 'hooks/useEnvironment'

const getProxiedImageUrl = (originalUrl: string, isWebUI: boolean): string => {
  if (isWebUI && (originalUrl.startsWith('http://') || originalUrl.startsWith('https://'))) {
    const proxiedUrl = `/api/proxy-image?url=${encodeURIComponent(originalUrl)}`
    return proxiedUrl
  }
  return originalUrl
}

interface ImageProps extends Partial<ImgHTMLAttributes<HTMLImageElement>> {
  placeholderSrc?: string
  placeholderClassName?: string
  placeholderStyle?: CSSProperties
  lazy?: boolean
  svg?: boolean
  svgColor?: string
  svgSize?: number | string
  SvgComponent?: FC<SVGProps<SVGSVGElement>>
}

const Image: FC<ImageProps> = ({
  placeholderSrc,
  placeholderClassName,
  placeholderStyle,
  src,
  alt,
  style,
  className,
  lazy,
  svg,
  svgColor,
  svgSize,
  SvgComponent,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(1)
  const [hasError, setHasError] = useState(false)
  const nodeRef = useRef(null)
  const { isWebUI } = useEnvironment()

  // If no src is provided, show placeholder
  if (!src || src.trim() === '') {
    return (
      <div
        className={`${className} flex items-center justify-center bg-gray-200 text-gray-500`}
        style={style}
        title="No image available"
      >
        <span className="text-xs">No image</span>
      </div>
    )
  }

  const pureImgProps = {
    className,
    src: getProxiedImageUrl(src, isWebUI),
    alt,
    style,
    referrerPolicy: 'no-referrer' as HTMLAttributeReferrerPolicy,
    onError: () => setHasError(true),
    onLoad: () => setHasError(false),
    ...props
  }

  if (svg) {
    const iconSize = svgSize || style?.width || style?.height || 24
    const iconStyle: CSSProperties = {
      width: iconSize,
      height: iconSize,
      color: svgColor || style?.color || 'currentColor',
      fill: 'currentColor',
      ...style
    }

    // If SvgComponent is provided, use it directly
    if (SvgComponent) {
      return (
        <SvgComponent className={className} style={iconStyle} aria-label={alt} aria-hidden={!alt} />
      )
    }

    // Fallback to the original mask approach for string paths
    if (src) {
      const svgImgProps = {
        ...pureImgProps,
        style: {
          ...style,
          WebkitMaskImage: `url(${src})`,
          WebkitMaskSize: 'contain',
          WebkitMaskPosition: 'center',
          WebkitMaskRepeat: 'no-repeat',
          WebkitMaskOrigin: 'content-box'
        }
      }
      return <div {...svgImgProps} />
    }
  }

  if (lazy) {
    const placeHolderProps = {
      ...props,
      src: placeholderSrc,
      alt: 'Image Placeholder',
      className: placeholderClassName,
      style: placeholderStyle,
      ref: nodeRef,
      referrerPolicy: 'no-referrer' as HTMLAttributeReferrerPolicy
    }

    const lazyImageProps = {
      ...props,
      referrerPolicy: 'no-referrer' as HTMLAttributeReferrerPolicy,
      style,
      src: getProxiedImageUrl(src, isWebUI),
      className,
      alt,
      ref: nodeRef,
      onError: () => setHasError(true),
      onLoad: () => setHasError(false)
    }

    const loadingProps = {
      src: getProxiedImageUrl(src, isWebUI),
      style: { display: 'none' },
      referrerPolicy: 'no-referrer' as HTMLAttributeReferrerPolicy,
      onLoad: (): void => setIsLoading(0),
      onError: (): void => {
        setHasError(true)
        setIsLoading(0)
      }
    }

    const transitionStyles = {
      enter: 'opacity-0',
      enterActive: 'transition-opacity duration-200 opacity-100',
      exit: 'opacity-100',
      exitActive: 'transition-opacity duration-200 opacity-0'
    }

    return (
      <>
        <SwitchTransition mode="out-in">
          <CSSTransition
            nodeRef={nodeRef}
            key={isLoading}
            timeout={100}
            classNames={transitionStyles}
          >
            {isLoading ? <img {...placeHolderProps} /> : <img {...lazyImageProps} />}
          </CSSTransition>
        </SwitchTransition>
        <img {...loadingProps} />
      </>
    )
  }

  // If there's an error loading the image, show a placeholder
  if (hasError) {
    return (
      <div
        className={`${className} flex items-center justify-center bg-gray-200 text-gray-500`}
        style={style}
        title={`Failed to load image: ${alt || src}`}
      >
        <span className="text-xs">Image unavailable</span>
      </div>
    )
  }

  return <img {...pureImgProps} />
}

export default Image
