import { ReactElement, ImgHTMLAttributes } from 'react'
import { SimpleImg, Props } from 'react-simple-img'

type TImageComponent = {
  src: string
  pure?: boolean
  svg?: boolean
  className?: string
}

type TImageProps =
  | (TImageComponent & ImgHTMLAttributes<HTMLImageElement>)
  | (TImageComponent & Props)

const Image = ({ pure, src, svg, className, ...props }: Partial<TImageProps>): ReactElement => {
  let Comp: typeof SimpleImg | string

  Comp = SimpleImg
  if (pure) Comp = 'img'
  if (svg) Comp = 'div'

  const iconStyle = {
    WebkitMaskImage: `url(${src})`,
    WebkitMaskSize: 'contain',
    WebkitMaskPosition: 'center',
    WebkitMaskRepeat: 'no-repeat',
    WebkitMaskOrigin: 'content-box'
  }

  if (src)
    return (
      <div className={className} {...props}>
        <Comp src={src} style={svg ? iconStyle : undefined} />
      </div>
    )
  return <></>
}

export default Image
