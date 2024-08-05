import { ReactElement, useRef, useState, ImgHTMLAttributes, CSSProperties } from 'react'
import { SwitchTransition, CSSTransition } from 'react-transition-group'
import styling from './Image.module.scss'

type ImageProps = {
  placeholderSrc?: string
  placeholderClassName?: string
  placeholderStyle?: CSSProperties
  lazy?: boolean
  svg?: boolean
} & Partial<ImgHTMLAttributes<HTMLImageElement>>

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
}: ImageProps): ReactElement => {
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
      ref: placeholderRef
    }

    const lazyImageProps = {
      ...props,
      style,
      src,
      className,
      alt
    }

    const loadingProps = {
      src,
      style: { display: 'none' },
      onLoad: (): void => setIsLoading(0)
    }

    const addEndListener = (node: HTMLElement, done: () => void): void => {
      node.addEventListener('transitionend', done, false)
    }

    return (
      <>
        <SwitchTransition mode="out-in">
          <CSSTransition
            key={isLoading}
            addEndListener={addEndListener}
            classNames={{
              enter: styling.enter,
              exit: styling.exit,
              enterActive: styling.enterActive,
              exitActive: styling.exitActive
            }}
          >
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
