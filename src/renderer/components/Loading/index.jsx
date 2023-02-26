import { useSelector } from "react-redux"
import Cover from "components/Cover"
import Image from "components/Image"

import imgLoading from './assets/loading.gif'

const Loading = () => {
  const loading = useSelector(state => state.loading)
  return (
    <Cover visible={loading} index="999">
      <Image pure src={ imgLoading } alt="" />
    </Cover>
  )
}

export default Loading