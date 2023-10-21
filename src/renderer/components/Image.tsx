import { CSSProperties, ImgHTMLAttributes } from 'react'
import { SimpleImg } from 'react-simple-img'

interface Image extends ImgHTMLAttributes<unknown> {
  placeholder?: string
  pure?: boolean
  svg?: boolean
}

const Image = ({ placeholder, pure, src, svg, ...props }: Partial<Image>): JSX.Element => {
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
  } as CSSProperties

  if (src)
    return (
      <Comp
        key={src}
        placeholder={placeholder || (!pure ? false : '')}
        src={src}
        style={svg ? iconStyle : undefined}
        {...props}
      />
    )
  return <></>
}

export default Image
