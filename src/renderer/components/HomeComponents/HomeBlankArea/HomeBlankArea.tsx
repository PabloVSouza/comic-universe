import classNames from 'classnames'

const HomeBlankArea = ({ active }: { active?: boolean }) => {
  return (
    <div
      className={classNames(
        'w-full h-full absolute flex justify-center items-center',
        active ? 'bg-default' : ''
      )}
    />
  )
}

export default HomeBlankArea
