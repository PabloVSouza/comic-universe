import { SimpleImg } from 'react-simple-img'

interface Image {
  placeholder: string
  pure: boolean
  src: string
  svg: boolean
}

const Image = ({ placeholder, pure, src, svg, ...props }: Image): JSX.Element | void => {
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
      <Comp
        key={src}
        placeholder={placeholder || (!pure ? false : '')}
        src={src}
        style={svg ? iconStyle : {}}
        {...props}
      />
    )
}

export default Image
