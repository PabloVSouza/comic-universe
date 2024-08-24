import { ReactElement, useRef, useState, ImgHTMLAttributes, CSSProperties } from 'react'
import { SwitchTransition, CSSTransition } from 'react-transition-group'

interface IImageProps extends Partial<ImgHTMLAttributes<HTMLImageElement>> {
  placeholderSrc?: string
  placeholderClassName?: string
  placeholderStyle?: CSSProperties
  lazy?: boolean
  svg?: boolean
}

const Image = ({
  placeholderSrc,
  placeholderClassName,
  placeholderStyle,
  src,
  alt,
  style,
  className,
  lazy,
  svg,
  ...props
}: IImageProps): ReactElement => {
  const [isLoading, setIsLoading] = useState(1)
  const placeholderRef = useRef(null)

  const pureImgProps = {
    className,
    src,
    alt,
    style,
    referrerPolicy: 'no-referrer' as React.HTMLAttributeReferrerPolicy,
    ...props
  }

  if (svg) {
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

  if (lazy) {
    const placeHolderProps = {
      ...props,
      src: placeholderSrc,
      alt: 'Image Placeholder',
      className: placeholderClassName,
      style: placeholderStyle,
      ref: placeholderRef,
      referrerPolicy: 'no-referrer' as React.HTMLAttributeReferrerPolicy
    }

    const lazyImageProps = {
      ...props,
      referrerPolicy: 'no-referrer' as React.HTMLAttributeReferrerPolicy,
      style,
      src,
      className,
      alt
    }

    const loadingProps = {
      src,
      style: { display: 'none' },
      referrerPolicy: 'no-referrer' as React.HTMLAttributeReferrerPolicy,
      onLoad: (): void => setIsLoading(0)
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
          <CSSTransition key={isLoading} timeout={100} classNames={transitionStyles}>
            {!!isLoading ? <img {...placeHolderProps} /> : <img {...lazyImageProps} />}
          </CSSTransition>
        </SwitchTransition>
        <img {...loadingProps} />
      </>
    )
  }
  return <img {...pureImgProps} />
}

export default Image
