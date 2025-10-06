import { FC } from 'react'
import classNames from 'classnames'

const BlankArea: FC = () => {
  return (
    <div className={classNames('w-full h-full absolute flex justify-center items-center z-10')} />
  )
}

export default BlankArea
